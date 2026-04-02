# Invoice Integration - Quick Reference

## Overview

The CTRC Dashboard now integrates with Microsoft Outlook to automatically fetch and manage parts purchase invoices.

## Features

- Automatic email fetching from Outlook inbox
- Invoice data parsing (vendor, amount, date, invoice number)
- Manual status tracking (paid/unpaid/overdue)
- Filtering by vendor, date range, and status
- One-click sync with Outlook

## Architecture

```
Frontend (purchases-invoices.html)
    ↓
Netlify Serverless Functions
    ├── outlook-auth.js       - OAuth flow & token management
    ├── invoices-sync.js      - Fetch & parse emails
    ├── invoices-get.js       - Read invoices with filters
    └── invoice-mark-paid.js  - Update invoice status
    ↓
Data Storage
    ├── Netlify Blobs (invoices)  - Invoice data
    └── Netlify Blobs (auth)      - Access tokens
    ↓
Microsoft Graph API
    └── Outlook Mail API
```

## Quick Setup

1. **Azure App Registration**
   - Register app in Azure Portal
   - Get Client ID, Client Secret, Tenant ID
   - Add redirect URI: `https://YOUR_SITE.netlify.app/.netlify/functions/outlook-auth`
   - Grant permissions: `Mail.Read`, `Mail.ReadBasic`

2. **Netlify Environment Variables**
   ```
   MICROSOFT_CLIENT_ID=your_id
   MICROSOFT_CLIENT_SECRET=your_secret
   MICROSOFT_TENANT_ID=your_tenant_id
   MICROSOFT_REDIRECT_URI=https://YOUR_SITE.netlify.app/.netlify/functions/outlook-auth
   ```

3. **First Use**
   - Navigate to Invoices page
   - Click "Sync Outlook"
   - Sign in with Microsoft account
   - Accept permissions
   - Invoices will sync automatically

See [OUTLOOK_SETUP.md](./OUTLOOK_SETUP.md) for detailed setup instructions.

## Supported Vendors

Out of the box, the system recognizes invoices from:
- VEX Robotics
- AndyMark
- West Coast Products
- REV Robotics
- McMaster-Carr

Add more vendors by editing `netlify/functions/invoices-sync.js`.

## Data Flow

### Sync Process

1. User clicks "Sync Outlook" button
2. Frontend calls `POST /invoices-sync`
3. Function fetches emails from last 90 days via Microsoft Graph
4. Filters emails by:
   - Subject keywords (invoice, receipt, order confirmation)
   - Known vendor email domains
5. Parses each email:
   - Extracts invoice number (regex patterns)
   - Extracts amount (dollar patterns)
   - Extracts date (email received date)
   - Generates description from subject
6. Stores parsed invoices in Netlify Blobs
7. Returns invoice count to frontend
8. Frontend refreshes invoice list

### Mark Paid Process

1. User clicks "Mark Paid" on an invoice
2. Frontend calls `POST /invoice-mark-paid` with invoice ID
3. Function updates invoice status in storage
4. Adds `paidDate` field
5. Returns updated invoice
6. Frontend updates UI

## API Endpoints

### `GET /.netlify/functions/outlook-auth`
Initiates OAuth flow, redirects to Microsoft login.

### `GET /.netlify/functions/outlook-auth?code=...`
OAuth callback, exchanges code for tokens, stores securely.

### `POST /.netlify/functions/outlook-auth`
Returns current access token (refreshes if expired).

### `POST /.netlify/functions/invoices-sync`
Fetches and parses invoice emails from Outlook.

**Response:**
```json
{
  "success": true,
  "total": 25,
  "new": 3,
  "lastSync": "2026-04-02T12:34:56Z",
  "invoices": [...]
}
```

### `GET /.netlify/functions/invoices-get`
Retrieves stored invoices with optional filters.

**Query Parameters:**
- `vendor` - Filter by vendor name
- `status` - paid, unpaid, overdue
- `startDate` - YYYY-MM-DD
- `endDate` - YYYY-MM-DD

**Response:**
```json
{
  "invoices": [...],
  "stats": {
    "total": 25,
    "filtered": 15,
    "totalAmount": 5432.10,
    "unpaid": 3,
    "paid": 12,
    "vendors": ["VEX Robotics", "AndyMark"]
  },
  "lastSync": "2026-04-02T12:34:56Z"
}
```

### `POST /.netlify/functions/invoice-mark-paid`
Updates invoice status.

**Request Body:**
```json
{
  "invoiceId": "vex-robotics-INV-12345",
  "status": "paid"
}
```

**Response:**
```json
{
  "success": true,
  "invoice": {...},
  "message": "Invoice marked as paid"
}
```

## Invoice Data Structure

```javascript
{
  id: "vex-robotics-INV-12345",          // Unique identifier
  invoiceNumber: "INV-12345",            // Parsed from email
  date: "2026-03-28",                    // YYYY-MM-DD
  vendor: "VEX Robotics",                // Matched vendor
  description: "V5 Motors and cables",   // From email subject
  amount: 487.50,                        // Parsed from email body
  status: "unpaid",                      // paid | unpaid | overdue
  emailId: "AAMk...",                    // Microsoft Graph email ID
  emailSubject: "Invoice #12345...",     // Original subject
  emailBody: "Thank you for...",         // Email preview (500 chars)
  hasAttachments: true,                  // Email has attachments
  synced: "2026-04-02T12:34:56Z",       // When synced
  paidDate: "2026-04-05",               // Added when marked paid
  lastUpdated: "2026-04-05T10:15:00Z"   // Last status change
}
```

## Security

- Access tokens stored in Netlify Blobs (not in frontend)
- Tokens auto-refresh when expired
- OAuth flow uses PKCE for security
- Frontend never sees Microsoft credentials
- All API calls proxied through serverless functions

## Token Management

- Access tokens expire after ~1 hour
- Refresh tokens valid for 90 days
- System auto-refreshes before making API calls
- If refresh fails, user must re-authorize

## Error Handling

### Frontend
- Loading states during sync
- Error toasts for failed operations
- Auth redirect if tokens expired

### Backend
- 401: Not authenticated → redirect to auth flow
- 500: Server error → log and return error details
- Rate limiting: Microsoft Graph limits apply

## Customization

### Change Sync Date Range

Edit `netlify/functions/invoices-sync.js`:
```javascript
// Default: 90 days
startDate.setDate(startDate.getDate() - 90);
```

### Add Vendor Keywords

Edit `netlify/functions/invoices-sync.js`:
```javascript
const VENDOR_KEYWORDS = {
  'Your Vendor': ['keyword1', 'email-domain.com'],
};
```

### Adjust Invoice Parsing

Edit parsing logic in `invoices-sync.js`:
```javascript
function parseInvoiceData(email) {
  // Customize regex patterns here
  const invoiceRegex = /...your pattern.../;
  const amountRegex = /...your pattern.../;
}
```

## Testing

### Test Sync Manually
```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/invoices-sync
```

### Test Get Invoices
```bash
curl https://YOUR_SITE.netlify.app/.netlify/functions/invoices-get?vendor=VEX%20Robotics
```

### Test Mark Paid
```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/invoice-mark-paid \
  -H "Content-Type: application/json" \
  -d '{"invoiceId":"vex-robotics-INV-12345","status":"paid"}'
```

## Monitoring

Check Netlify function logs:
1. Go to Netlify dashboard
2. Select your site
3. Navigate to Functions tab
4. Click on function name
5. View real-time logs

## Future Enhancements

Potential improvements:
- PDF attachment parsing
- Automatic payment detection (read sent items)
- Email categorization with AI
- Scheduled auto-sync (cron job)
- Export to accounting software
- Invoice reminders for overdue items
- Multi-account support
- Gmail integration option

## Troubleshooting

See [OUTLOOK_SETUP.md - Troubleshooting](./OUTLOOK_SETUP.md#troubleshooting) for common issues and solutions.

---

*Created: April 2026*
*For: CTRC Dashboard Invoice Management*
