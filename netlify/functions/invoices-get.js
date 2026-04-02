const { getStore } = require('@netlify/blobs');

// Helper to send JSON response
const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  if (event.httpMethod !== 'GET') {
    return respond(405, { error: 'Method not allowed' });
  }

  try {
    const invoicesStore = getStore('invoices');

    // Get invoices from storage
    let invoices = [];
    let lastSync = null;

    try {
      const data = await invoicesStore.get('data', { type: 'json' });
      invoices = data || [];
      lastSync = await invoicesStore.get('last_sync');
    } catch (err) {
      console.log('No invoices found in storage');
    }

    // Parse query parameters for filtering
    const params = event.queryStringParameters || {};
    const { vendor, status, startDate, endDate } = params;

    // Apply filters
    let filteredInvoices = [...invoices];

    if (vendor) {
      filteredInvoices = filteredInvoices.filter(inv =>
        inv.vendor.toLowerCase() === vendor.toLowerCase()
      );
    }

    if (status) {
      filteredInvoices = filteredInvoices.filter(inv =>
        inv.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (startDate) {
      filteredInvoices = filteredInvoices.filter(inv =>
        new Date(inv.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredInvoices = filteredInvoices.filter(inv =>
        new Date(inv.date) <= new Date(endDate)
      );
    }

    // Calculate stats
    const stats = {
      total: invoices.length,
      filtered: filteredInvoices.length,
      totalAmount: filteredInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      unpaid: filteredInvoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue').length,
      paid: filteredInvoices.filter(inv => inv.status === 'paid').length,
      vendors: [...new Set(invoices.map(inv => inv.vendor))],
    };

    return respond(200, {
      invoices: filteredInvoices,
      stats,
      lastSync,
      filters: {
        vendor: vendor || null,
        status: status || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });

  } catch (error) {
    console.error('Get Invoices Error:', error);
    return respond(500, {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
