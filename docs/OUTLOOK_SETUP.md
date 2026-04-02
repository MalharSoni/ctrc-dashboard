# Microsoft Outlook Integration Setup Guide

This guide walks you through setting up the Microsoft Outlook email integration for the CTRC Dashboard invoice management system.

## Overview

The Outlook integration allows the dashboard to:
- Fetch invoice emails automatically from your Microsoft 365/Outlook inbox
- Parse invoice data (vendor, amount, date, invoice number)
- Track invoice payment status
- Sync on-demand or automatically

---

## Prerequisites

- Microsoft 365 account or Outlook.com account
- Access to Azure Portal (free Microsoft account is sufficient)
- Admin access to your Netlify site

---

## Step 1: Register Your Application in Azure Portal

### 1.1 Access Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Navigate to **Azure Active Directory** (search for it in the top search bar)

### 1.2 Register a New Application

1. In the Azure AD sidebar, click **App registrations**
2. Click **+ New registration**
3. Fill in the registration form:
   - **Name:** `CTRC Dashboard Outlook Integration`
   - **Supported account types:** Select one of:
     - **Single tenant** (if only your organization uses this)
     - **Multitenant** (if multiple organizations will use it)
     - **Personal accounts** (if using personal Outlook.com account)
   - **Redirect URI:**
     - Select **Web**
     - Enter: `https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/outlook-auth`
     - Replace `YOUR_NETLIFY_SITE` with your actual Netlify site name
4. Click **Register**

### 1.3 Copy Application IDs

After registration, you'll see the app overview page. **Copy these values:**

- **Application (client) ID** - you'll need this as `MICROSOFT_CLIENT_ID`
- **Directory (tenant) ID** - you'll need this as `MICROSOFT_TENANT_ID`

---

## Step 2: Create Client Secret

### 2.1 Generate Secret

1. In your app's sidebar, click **Certificates & secrets**
2. Click **+ New client secret**
3. Enter a description: `CTRC Dashboard Secret`
4. Select expiration: Choose **24 months** (or your preferred duration)
5. Click **Add**

### 2.2 Copy Secret Value

**IMPORTANT:** Copy the secret **Value** immediately - it will only be shown once!

- Copy the **Value** field (not the Secret ID)
- Store this securely - you'll need it as `MICROSOFT_CLIENT_SECRET`

---

## Step 3: Configure API Permissions

### 3.1 Add Required Permissions

1. In your app's sidebar, click **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Search for and add these permissions:
   - `Mail.Read` - Read user mail
   - `Mail.ReadBasic` - Read basic mail properties
6. Click **Add permissions**

### 3.2 Grant Admin Consent (Optional)

If you're setting this up for an organization:

1. Click **Grant admin consent for [Your Organization]**
2. Confirm the prompt

**Note:** If you don't have admin rights, you can skip this - users will consent individually.

---

## Step 4: Configure Netlify Environment Variables

### 4.1 Access Netlify Site Settings

1. Log in to [Netlify](https://app.netlify.com)
2. Select your CTRC Dashboard site
3. Go to **Site settings** > **Environment variables**

### 4.2 Add Environment Variables

Click **Add a variable** and add each of these:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `MICROSOFT_CLIENT_ID` | `your_application_id` | Application (client) ID from Azure |
| `MICROSOFT_CLIENT_SECRET` | `your_client_secret_value` | Client secret value from Azure |
| `MICROSOFT_TENANT_ID` | `your_tenant_id` | Directory (tenant) ID from Azure |
| `MICROSOFT_REDIRECT_URI` | `https://YOUR_SITE.netlify.app/.netlify/functions/outlook-auth` | OAuth callback URL |

**Important:** After adding all variables, **redeploy your site** for changes to take effect.

### 4.3 Verify Configuration

To verify, you can check the Netlify function logs after deployment.

---

## Step 5: Authorize Your Outlook Account

### 5.1 Initial Authorization

1. Open your CTRC Dashboard in a browser: `https://YOUR_SITE.netlify.app`
2. Navigate to **Invoices** page
3. Click the **Sync Outlook** button
4. You'll be redirected to Microsoft login
5. Sign in with the Outlook account you want to sync invoices from
6. Review and accept the permissions:
   - Read your email
   - Maintain access to data you've given it access to
7. Click **Accept**

### 5.2 Success Confirmation

After authorization, you'll see a success page with:
- Green checkmark
- Your email address
- "Go to Invoices" button

Click the button to return to the dashboard.

---

## Step 6: Sync Invoices

### 6.1 First Sync

1. On the Invoices page, click **Sync Outlook** button
2. The sync process will:
   - Fetch emails from the last 90 days
   - Filter for invoice-related emails (subject contains: "invoice", "receipt", "order confirmation")
   - Filter by known vendors:
     - VEX Robotics
     - AndyMark
     - West Coast Products
     - REV Robotics
     - McMaster-Carr
   - Parse invoice data automatically
   - Store in Netlify Blobs

3. You'll see a toast notification: "Synced successfully! Found X new invoices"

### 6.2 Subsequent Syncs

- Click **Sync Outlook** anytime to refresh
- Only new invoices will be added (no duplicates)
- Existing invoice statuses are preserved

---

## Troubleshooting

### Error: "Not authenticated"

**Solution:** You need to authorize first. Click **Sync Outlook** and complete the Microsoft login flow.

### Error: "Missing Microsoft OAuth configuration"

**Cause:** Environment variables not set correctly.

**Solution:**
1. Verify all 4 environment variables are set in Netlify
2. Check for typos in variable names
3. Redeploy your site after adding/changing variables

### Error: "Redirect URI mismatch"

**Cause:** The redirect URI in Azure doesn't match your Netlify function URL.

**Solution:**
1. Go to Azure Portal > Your App > **Authentication**
2. Under **Redirect URIs**, ensure you have:
   ```
   https://YOUR_ACTUAL_SITE.netlify.app/.netlify/functions/outlook-auth
   ```
3. Save changes

### No invoices found after sync

**Possible causes:**
1. No invoice emails in the last 90 days
2. Emails don't match filter keywords
3. Emails not from recognized vendors

**Solution:**
- Check your inbox for emails with subjects containing:
  - "invoice"
  - "receipt"
  - "order confirmation"
- Check if sender matches known vendors
- If needed, customize vendor keywords in `invoices-sync.js`

### Token expired error

**Cause:** Access token expired (tokens last ~1 hour).

**Solution:** The system auto-refreshes tokens. If this fails:
1. Re-authorize by visiting: `/.netlify/functions/outlook-auth`
2. Complete the login flow again

---

## Security Notes

### Token Storage

- Access tokens and refresh tokens are stored in **Netlify Blobs** (serverless key-value storage)
- Tokens are never exposed to the frontend
- All API calls are made from serverless functions

### Permissions Scope

The app only requests:
- `Mail.Read` - Read emails
- `Mail.ReadBasic` - Read basic email metadata

The app **CANNOT**:
- Send emails
- Delete emails
- Modify emails
- Access other Microsoft services (Calendar, OneDrive, etc.)

### Revoking Access

To revoke access:

1. Go to [Microsoft Account Permissions](https://account.live.com/consent/Manage)
2. Find "CTRC Dashboard Outlook Integration"
3. Click **Remove these permissions**

Or:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure AD** > **Enterprise applications**
3. Find your app and delete it

---

## Customization

### Adding More Vendors

Edit `/netlify/functions/invoices-sync.js`:

```javascript
const VENDOR_KEYWORDS = {
  'VEX Robotics': ['vexrobotics', 'vex robotics', 'robotevents'],
  'AndyMark': ['andymark', 'andy mark'],
  'West Coast Products': ['west coast products', 'wcproducts', 'wcp'],
  'REV Robotics': ['rev robotics', 'revrobotics'],
  'McMaster-Carr': ['mcmaster', 'mcmaster-carr'],
  // Add your vendor:
  'Your Vendor Name': ['keyword1', 'keyword2', 'email-domain.com'],
};
```

### Changing Sync Date Range

By default, the system fetches emails from the last 90 days. To change:

Edit `/netlify/functions/invoices-sync.js`:

```javascript
// Change 90 to your desired number of days
const startDate = new Date();
startDate.setDate(startDate.getDate() - 90); // Change this number
```

---

## Testing

### Test Authorization Flow

1. Visit: `https://YOUR_SITE.netlify.app/.netlify/functions/outlook-auth`
2. Complete Microsoft login
3. Verify success page appears
4. Check Netlify function logs for any errors

### Test Invoice Sync

1. Send a test email to your Outlook account with:
   - Subject: "Test Invoice #12345"
   - Body: "Total: $123.45"
   - From: your email (add to vendor keywords first)
2. Click **Sync Outlook** in dashboard
3. Verify test invoice appears in the list

---

## Production Checklist

Before going live, ensure:

- [ ] All environment variables are set in Netlify
- [ ] Redirect URI in Azure matches your production domain
- [ ] Tested authorization flow end-to-end
- [ ] Tested invoice sync with real emails
- [ ] Verified "Mark Paid" functionality works
- [ ] Set up monitoring for failed syncs (check Netlify function logs)

---

## Support

For issues or questions:

1. Check Netlify function logs: **Site > Functions > [function name] > Logs**
2. Review Azure AD sign-in logs: **Azure Portal > Azure AD > Sign-in logs**
3. Check browser console for client-side errors

---

## API Reference

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/.netlify/functions/outlook-auth` | GET | Initiate OAuth flow |
| `/.netlify/functions/outlook-auth` | GET (callback) | Handle OAuth callback |
| `/.netlify/functions/outlook-auth` | POST | Get/refresh access token |
| `/.netlify/functions/invoices-sync` | POST | Sync invoices from Outlook |
| `/.netlify/functions/invoices-get` | GET | Get all invoices (with filters) |
| `/.netlify/functions/invoice-mark-paid` | POST | Update invoice status |

### Query Parameters for `invoices-get`

- `vendor` - Filter by vendor name
- `status` - Filter by status (paid/unpaid/overdue)
- `startDate` - Filter by start date (YYYY-MM-DD)
- `endDate` - Filter by end date (YYYY-MM-DD)

Example:
```
GET /.netlify/functions/invoices-get?vendor=VEX%20Robotics&status=unpaid
```

---

*Last Updated: April 2026*
*For CTRC Dashboard v5*
