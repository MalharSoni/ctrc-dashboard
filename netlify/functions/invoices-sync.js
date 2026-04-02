const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const { getStore } = require('@netlify/blobs');

// Vendor keywords for filtering
const VENDOR_KEYWORDS = {
  'VEX Robotics': ['vexrobotics', 'vex robotics', 'robotevents'],
  'AndyMark': ['andymark', 'andy mark'],
  'West Coast Products': ['west coast products', 'wcproducts', 'wcp'],
  'REV Robotics': ['rev robotics', 'revrobotics'],
  'McMaster-Carr': ['mcmaster', 'mcmaster-carr'],
};

// Invoice keywords for email filtering
const INVOICE_KEYWORDS = [
  'invoice',
  'receipt',
  'order confirmation',
  'order summary',
  'payment confirmation',
  'purchase order',
];

// Helper to send JSON response
const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  },
  body: JSON.stringify(body),
});

// Parse invoice data from email content
function parseInvoiceData(email) {
  const subject = email.subject || '';
  const body = email.bodyPreview || email.body?.content || '';
  const from = email.from?.emailAddress?.address || '';
  const fromName = email.from?.emailAddress?.name || '';

  // Detect vendor
  let vendor = 'Unknown Vendor';
  for (const [vendorName, keywords] of Object.entries(VENDOR_KEYWORDS)) {
    if (keywords.some(kw =>
      from.toLowerCase().includes(kw.toLowerCase()) ||
      fromName.toLowerCase().includes(kw.toLowerCase()) ||
      subject.toLowerCase().includes(kw.toLowerCase())
    )) {
      vendor = vendorName;
      break;
    }
  }

  // Extract invoice number (common patterns)
  const invoiceRegex = /(?:invoice|order|receipt)[\s#:]*([A-Z0-9-]+)/i;
  const invoiceMatch = subject.match(invoiceRegex) || body.match(invoiceRegex);
  const invoiceNumber = invoiceMatch ? invoiceMatch[1] : `INV-${Date.now().toString(36).toUpperCase()}`;

  // Extract amount (common patterns: $123.45, USD 123.45, 123.45 USD)
  const amountRegex = /(?:\$|USD|CAD)?\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|CAD)?/;
  const amountMatch = body.match(amountRegex);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;

  // Extract date
  const date = new Date(email.receivedDateTime || email.createdDateTime).toISOString().split('T')[0];

  // Generate description from subject and body preview
  const description = subject.replace(/^(Re:|Fwd:)\s*/i, '').substring(0, 150);

  // Determine status (all start as unpaid)
  const status = 'unpaid';

  return {
    id: `${vendor.replace(/\s+/g, '-').toLowerCase()}-${invoiceNumber}`,
    invoiceNumber,
    date,
    vendor,
    description,
    amount: amount || 0,
    status,
    emailId: email.id,
    emailSubject: subject,
    emailBody: body.substring(0, 500), // Store preview
    hasAttachments: email.hasAttachments || false,
    synced: new Date().toISOString(),
  };
}

// Get access token
async function getAccessToken() {
  const authStore = getStore('outlook-auth');
  const accessToken = await authStore.get('access_token');

  if (!accessToken) {
    throw new Error('Not authenticated. Please authorize Outlook access.');
  }

  return accessToken;
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  try {
    // Get access token
    const accessToken = await getAccessToken();

    // Initialize Microsoft Graph client
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    console.log('Fetching emails from Outlook...');

    // Build search query for invoice emails
    const searchQuery = INVOICE_KEYWORDS.map(kw => `subject:${kw}`).join(' OR ');

    // Fetch emails from the last 90 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const filterDate = startDate.toISOString();

    // Query emails
    const messages = await client
      .api('/me/messages')
      .filter(`receivedDateTime ge ${filterDate}`)
      .search(searchQuery)
      .top(100)
      .select('id,subject,bodyPreview,receivedDateTime,from,hasAttachments,body')
      .get();

    console.log(`Found ${messages.value.length} potential invoice emails`);

    // Parse invoice data from emails
    const invoices = messages.value
      .filter(email => {
        // Additional filtering: check if from known vendors or has invoice keywords
        const subject = (email.subject || '').toLowerCase();
        const from = (email.from?.emailAddress?.address || '').toLowerCase();
        const fromName = (email.from?.emailAddress?.name || '').toLowerCase();

        const hasInvoiceKeyword = INVOICE_KEYWORDS.some(kw => subject.includes(kw.toLowerCase()));
        const fromVendor = Object.values(VENDOR_KEYWORDS).flat().some(kw =>
          from.includes(kw.toLowerCase()) || fromName.includes(kw.toLowerCase())
        );

        return hasInvoiceKeyword || fromVendor;
      })
      .map(parseInvoiceData);

    console.log(`Parsed ${invoices.length} invoices`);

    // Store invoices in Netlify Blobs
    const invoicesStore = getStore('invoices');

    // Get existing invoices
    let existingInvoices = [];
    try {
      const existing = await invoicesStore.get('data', { type: 'json' });
      existingInvoices = existing || [];
    } catch (err) {
      console.log('No existing invoices found, starting fresh');
    }

    // Merge with existing (avoid duplicates by email ID)
    const existingEmailIds = new Set(existingInvoices.map(inv => inv.emailId));
    const newInvoices = invoices.filter(inv => !existingEmailIds.has(inv.emailId));

    const mergedInvoices = [...existingInvoices, ...newInvoices];

    // Sort by date descending
    mergedInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Store updated invoices
    await invoicesStore.set('data', JSON.stringify(mergedInvoices));
    await invoicesStore.set('last_sync', new Date().toISOString());

    return respond(200, {
      success: true,
      total: mergedInvoices.length,
      new: newInvoices.length,
      lastSync: new Date().toISOString(),
      invoices: mergedInvoices,
    });

  } catch (error) {
    console.error('Invoice Sync Error:', error);

    // Handle auth errors
    if (error.message.includes('Not authenticated') || error.statusCode === 401) {
      return respond(401, {
        error: 'Authentication required',
        details: 'Please authorize Outlook access',
        authUrl: '/.netlify/functions/outlook-auth',
      });
    }

    return respond(500, {
      error: error.message,
      details: error.statusCode || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
