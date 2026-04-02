const { getStore } = require('@netlify/blobs');

// Helper to send JSON response
const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  try {
    const invoicesStore = getStore('invoices');

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (err) {
      return respond(400, { error: 'Invalid JSON body' });
    }

    const { invoiceId, status } = body;

    // Validate required fields
    if (!invoiceId) {
      return respond(400, { error: 'Missing required field: invoiceId' });
    }

    if (!status || !['paid', 'unpaid', 'overdue'].includes(status)) {
      return respond(400, { error: 'Invalid status. Must be: paid, unpaid, or overdue' });
    }

    // Get existing invoices
    let invoices = [];
    try {
      const data = await invoicesStore.get('data', { type: 'json' });
      invoices = data || [];
    } catch (err) {
      return respond(404, { error: 'No invoices found' });
    }

    // Find invoice by ID
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);

    if (invoiceIndex === -1) {
      return respond(404, { error: 'Invoice not found', invoiceId });
    }

    // Update invoice status
    invoices[invoiceIndex].status = status;
    invoices[invoiceIndex].lastUpdated = new Date().toISOString();

    // If marking as paid, add payment date
    if (status === 'paid') {
      invoices[invoiceIndex].paidDate = new Date().toISOString().split('T')[0];
    } else {
      delete invoices[invoiceIndex].paidDate;
    }

    // Save updated invoices
    await invoicesStore.set('data', JSON.stringify(invoices));

    return respond(200, {
      success: true,
      invoice: invoices[invoiceIndex],
      message: `Invoice ${invoiceId} marked as ${status}`,
    });

  } catch (error) {
    console.error('Mark Paid Error:', error);
    return respond(500, {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
