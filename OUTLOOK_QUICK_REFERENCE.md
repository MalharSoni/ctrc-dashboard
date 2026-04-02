# Outlook Integration Quick Reference

## For Coaches - How to Use

### Syncing Invoices

1. Go to **Purchases → Invoices** page
2. Click **"Sync Outlook"** button (yellow button, top right)
3. Wait 3-5 seconds for sync to complete
4. New invoices will appear in the table

**First Time Only:**
- You'll be redirected to Microsoft login
- Sign in with your club email account
- Click "Accept" to grant permissions
- You'll be redirected back to the dashboard

### Managing Invoices

**View Invoice Details:**
- Click any invoice row to see full details
- View email preview, extracted data, and status

**Mark as Paid:**
- Open invoice detail view
- Check "Mark as Paid" checkbox
- OR click "Mark Paid" button in the row actions

**Filter Invoices:**
- Use dropdown filters: Status, Vendor, Date Range
- Use search box to find by invoice # or vendor name

**Export to CSV:**
- Click "Export CSV" button (top right)
- Opens in Excel/Sheets for accounting

---

## For Developers - API Reference

### Endpoints

**GET** `/.netlify/functions/invoices-get`
- Fetches all stored invoices
- Optional query params: `vendor`, `status`, `startDate`, `endDate`
- Returns: `{ invoices: [], stats: {}, lastSync: string }`

**POST** `/.netlify/functions/invoices-sync`
- Syncs emails from Outlook
- Requires: Authorization (handled automatically)
- Returns: `{ success: true, total: number, new: number, invoices: [] }`

**POST** `/.netlify/functions/invoice-mark-paid`
- Updates invoice status
- Body: `{ invoiceId: string, status: 'paid'|'unpaid'|'overdue' }`
- Returns: `{ success: true, invoice: {} }`

**GET/POST** `/.netlify/functions/outlook-auth`
- OAuth flow for Microsoft authentication
- GET: Initiates OAuth (redirects to Microsoft)
- GET (with ?code): Handles callback, stores tokens
- POST: Returns current access token (refreshes if needed)

---

## Environment Variables

Required in Netlify Dashboard:

```
MICROSOFT_CLIENT_ID          - Azure app client ID
MICROSOFT_CLIENT_SECRET      - Azure app client secret
MICROSOFT_TENANT_ID          - Azure tenant ID or "common"
MICROSOFT_REDIRECT_URI       - https://YOUR_SITE.netlify.app/.netlify/functions/outlook-auth
```

---

## Data Schema

### Invoice Object
```json
{
  "id": "vex-robotics-INV-12345",
  "invoiceNumber": "INV-12345",
  "date": "2025-01-15",
  "vendor": "VEX Robotics",
  "description": "Order confirmation for competition parts",
  "amount": 234.56,
  "status": "unpaid",
  "emailId": "AAMkAGI2...",
  "emailSubject": "Order Confirmation - Invoice #INV-12345",
  "emailBody": "Thank you for your order...",
  "hasAttachments": true,
  "synced": "2025-01-15T10:30:00Z",
  "lastUpdated": "2025-01-16T14:20:00Z",
  "paidDate": "2025-01-16"
}
```

---

## Testing Locally

**Prerequisites:**
- Node.js 20+
- Netlify CLI: `npm install -g netlify-cli`

**Setup:**
```bash
# Install dependencies
npm install

# Create .env file with Azure credentials
cp .env.example .env
# Edit .env with your values

# Run Netlify Dev (starts functions + serves site)
netlify dev
```

**Test Endpoints:**
```bash
# Open in browser
http://localhost:8888/purchases-invoices.html

# Or test functions directly
curl http://localhost:8888/.netlify/functions/invoices-get
```

---

## Common Issues

### No invoices found after sync
- Check if emails exist in the last 90 days
- Verify emails are from supported vendors
- Check email subject contains "invoice" or similar keywords

### "Authentication required" error
- Click "Sync Outlook" to re-authorize
- Check environment variables are set
- Verify Azure app has Mail.Read permission

### Token expired
- System auto-refreshes tokens (1 hour lifetime)
- If refresh fails, re-authorize via "Sync Outlook"

---

## Customization

### Add New Vendor
Edit `netlify/functions/invoices-sync.js`:
```javascript
const VENDOR_KEYWORDS = {
  'VEX Robotics': ['vexrobotics', 'vex robotics'],
  'New Vendor': ['vendor-domain', 'vendor-keyword'],
  // Add more...
};
```

### Change Sync Timeframe
Edit `netlify/functions/invoices-sync.js` line 130:
```javascript
// Change from 90 days to 30 days
startDate.setDate(startDate.getDate() - 30);
```

### Add Invoice Keywords
Edit `netlify/functions/invoices-sync.js`:
```javascript
const INVOICE_KEYWORDS = [
  'invoice',
  'receipt',
  'your-custom-keyword',
  // Add more...
];
```

---

## Security Checklist

- [ ] Client secret stored ONLY in Netlify env vars
- [ ] Never commit .env to Git
- [ ] Azure app permissions limited to Mail.Read
- [ ] Redirect URI matches exactly
- [ ] Tokens stored in Netlify Blobs (not exposed)
- [ ] Access tokens expire after 1 hour
- [ ] Refresh tokens used for auto-renewal

---

## Support Resources

- **Azure Portal**: https://portal.azure.com
- **Microsoft Graph Docs**: https://learn.microsoft.com/en-us/graph/
- **Netlify Functions**: https://docs.netlify.com/functions/
- **Netlify Blobs**: https://docs.netlify.com/blobs/overview/

---

**Integration Status:** ✅ Complete and functional
**Last Updated:** January 2025
