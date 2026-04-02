# Outlook Email Integration Setup Guide

This guide will help you set up Microsoft Outlook email integration for automatic invoice syncing in the CTRC Dashboard.

## What This Does

The Outlook integration automatically:
- Fetches emails from your Outlook/Microsoft 365 inbox
- Filters for invoice-related emails from robotics vendors (VEX, AndyMark, West Coast Products, REV Robotics, McMaster-Carr)
- Extracts invoice data (date, amount, vendor, invoice number)
- Stores invoices in the dashboard for tracking

---

## Step 1: Create Azure Application

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com
   - Sign in with your Microsoft account (the one you want to sync emails from)

2. **Navigate to App Registrations**
   - Search for "App registrations" in the top search bar
   - Click "App registrations"
   - Click "+ New registration"

3. **Register Your Application**
   - **Name**: `CTRC Dashboard Invoice Sync`
   - **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**:
     - Platform: `Web`
     - URI: `https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/outlook-auth`
     - (Replace `YOUR_NETLIFY_SITE` with your actual Netlify site name)
   - Click "Register"

4. **Save Your Application (Client) ID**
   - After registration, you'll see the "Overview" page
   - Copy the **Application (client) ID** - you'll need this for `MICROSOFT_CLIENT_ID`
   - Copy the **Directory (tenant) ID** - you'll need this for `MICROSOFT_TENANT_ID`

---

## Step 2: Create Client Secret

1. **Navigate to Certificates & Secrets**
   - In your app registration page, click "Certificates & secrets" in the left sidebar
   - Click "+ New client secret"

2. **Add Client Secret**
   - **Description**: `CTRC Dashboard Secret`
   - **Expires**: Select "24 months" (or your preferred expiration)
   - Click "Add"

3. **Copy the Secret Value**
   - **IMPORTANT**: Copy the secret **Value** immediately (not the Secret ID)
   - You won't be able to see it again after you leave this page
   - This is your `MICROSOFT_CLIENT_SECRET`

---

## Step 3: Configure API Permissions

1. **Navigate to API Permissions**
   - Click "API permissions" in the left sidebar
   - Click "+ Add a permission"

2. **Add Microsoft Graph Permissions**
   - Click "Microsoft Graph"
   - Click "Delegated permissions"
   - Search for and select these permissions:
     - `Mail.Read` - Read user mail
     - `Mail.ReadBasic` - Read basic mail info
   - Click "Add permissions"

3. **Grant Admin Consent (Optional but Recommended)**
   - If you're an admin, click "Grant admin consent for [your organization]"
   - This will prevent users from seeing a consent prompt

---

## Step 4: Add Environment Variables to Netlify

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Select your CTRC Dashboard site

2. **Navigate to Environment Variables**
   - Click "Site configuration" in the left sidebar
   - Click "Environment variables"
   - Click "Add a variable"

3. **Add These Variables**

   Add each of these variables one by one:

   **MICROSOFT_CLIENT_ID**
   - Key: `MICROSOFT_CLIENT_ID`
   - Value: `[Your Application (client) ID from Step 1.4]`
   - Scopes: All scopes

   **MICROSOFT_CLIENT_SECRET**
   - Key: `MICROSOFT_CLIENT_SECRET`
   - Value: `[Your client secret value from Step 2.3]`
   - Scopes: All scopes

   **MICROSOFT_TENANT_ID**
   - Key: `MICROSOFT_TENANT_ID`
   - Value: `[Your Directory (tenant) ID from Step 1.4]`
   - OR use: `common` (for personal Microsoft accounts)
   - Scopes: All scopes

   **MICROSOFT_REDIRECT_URI**
   - Key: `MICROSOFT_REDIRECT_URI`
   - Value: `https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/outlook-auth`
   - (Replace `YOUR_NETLIFY_SITE` with your actual Netlify site name)
   - Scopes: All scopes

4. **Redeploy Your Site**
   - After adding environment variables, Netlify needs to redeploy
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for deployment to complete (usually 1-2 minutes)

---

## Step 5: Authorize Outlook Access

1. **Open the Invoices Page**
   - Go to: `https://YOUR_NETLIFY_SITE.netlify.app/purchases-invoices.html`

2. **Click "Sync Outlook" Button**
   - Click the yellow "Sync Outlook" button in the top right
   - You'll be redirected to Microsoft login page

3. **Sign In and Consent**
   - Sign in with your Microsoft account
   - Review the permissions (Mail.Read, Mail.ReadBasic)
   - Click "Accept" to grant permissions

4. **Verify Success**
   - You'll be redirected back to the dashboard
   - You should see a success message
   - The page will show "Outlook Connected Successfully"

5. **Test Invoice Sync**
   - Click "Go to Invoices"
   - Click the "Sync Outlook" button again
   - The system will fetch emails from the last 90 days
   - You should see invoices appear in the table

---

## Troubleshooting

### "Missing Microsoft OAuth configuration" Error
- **Problem**: Environment variables not set correctly
- **Solution**:
  - Check all 4 environment variables in Netlify
  - Make sure there are no extra spaces or quotes
  - Redeploy the site after adding variables

### "Authentication required" or 401 Error
- **Problem**: OAuth authorization not completed
- **Solution**:
  - Click "Sync Outlook" button again
  - You'll be redirected to Microsoft login
  - Complete the authorization flow

### No Invoices Found After Sync
- **Problem**: No matching emails in the last 90 days
- **Solution**:
  - Check if you have emails from these vendors: VEX Robotics, AndyMark, West Coast Products, REV Robotics, McMaster-Carr
  - Make sure emails contain keywords like "invoice", "order confirmation", "receipt"
  - Try forwarding a test invoice email to your inbox and sync again

### "Redirect URI mismatch" Error
- **Problem**: Redirect URI in Azure doesn't match your Netlify site
- **Solution**:
  - Go back to Azure Portal → App registrations → Your app
  - Click "Authentication" in the left sidebar
  - Update the Redirect URI to match your Netlify site exactly
  - Make sure `MICROSOFT_REDIRECT_URI` environment variable matches

### Token Expired
- **Problem**: Access token expired (they last 1 hour by default)
- **Solution**:
  - The system should auto-refresh tokens
  - If it doesn't work, click "Sync Outlook" again to re-authorize

---

## Testing the Integration

1. **Verify Email Fetching**
   - Go to invoices page
   - Click "Sync Outlook"
   - Check browser console (F12 → Console tab) for sync logs
   - You should see: "Fetching emails from Outlook..." and "Found X potential invoice emails"

2. **Verify Invoice Parsing**
   - After sync completes, check the invoices table
   - Each invoice should show:
     - Date (from email received date)
     - Invoice # (extracted from email subject/body)
     - Vendor (VEX, AndyMark, etc.)
     - Amount (extracted from email body)
     - Status (all start as "Unpaid")

3. **Verify Stat Cards**
   - Top stat cards should update with:
     - Total Invoices count
     - Total Spent amount
     - Unpaid Invoices count
     - This Month total
     - Average Invoice amount
     - Last Sync time

4. **Test Mark as Paid**
   - Click any invoice row to open detail view
   - Check "Mark as Paid" checkbox
   - Invoice status should change to "Paid"
   - Unpaid count should decrease

---

## How Often Does It Sync?

**Manual Sync Only**: The integration does NOT automatically sync on a schedule. Coaches must click the "Sync Outlook" button to fetch new emails.

**Recommendation**:
- Sync once a week to catch new invoices
- Sync after making large purchases
- Set a reminder to sync every Monday morning

**Future Enhancement**: We could add automatic daily syncing using Netlify Scheduled Functions if needed.

---

## Data Storage

**Where invoices are stored:**
- Invoices are stored in **Netlify Blobs** (serverless key-value store)
- Auth tokens are also stored in Netlify Blobs (separate storage area)
- No database required - everything is in Netlify's edge storage

**Data retention:**
- Invoices remain until manually deleted
- Syncing again will merge new invoices (no duplicates)
- Auth tokens are refreshed automatically (expire after 1 hour but auto-refresh)

---

## Security Notes

1. **Client Secret Protection**
   - Never commit `MICROSOFT_CLIENT_SECRET` to Git
   - Only store in Netlify environment variables
   - Rotate the secret every 6-12 months

2. **Permissions**
   - The app only requests `Mail.Read` (read-only)
   - Cannot send emails or modify mailbox
   - Only fetches emails, doesn't delete or move them

3. **Token Storage**
   - Access tokens stored in Netlify Blobs (private storage)
   - Tokens expire after 1 hour
   - Refresh tokens used to get new access tokens automatically

4. **Email Privacy**
   - Only fetches emails from the last 90 days
   - Only stores invoice-related data (date, amount, vendor, description)
   - Full email content is NOT stored (only preview text)

---

## Supported Vendors

The integration automatically detects invoices from:
- **VEX Robotics** (vexrobotics.com, robotevents.org)
- **AndyMark** (andymark.com)
- **West Coast Products** (wcproducts.com)
- **REV Robotics** (revrobotics.com)
- **McMaster-Carr** (mcmaster.com)

**Adding More Vendors:**
Edit `/netlify/functions/invoices-sync.js` and add to `VENDOR_KEYWORDS` object:
```javascript
const VENDOR_KEYWORDS = {
  'VEX Robotics': ['vexrobotics', 'vex robotics', 'robotevents'],
  'Your New Vendor': ['vendor-email-domain', 'vendor name'],
  // ...
};
```

---

## Next Steps

After setup is complete:
1. Train coaches to use the "Sync Outlook" button
2. Verify invoices are being fetched correctly
3. Use filters to view by vendor, status, or date range
4. Export CSV reports for accounting
5. Mark invoices as paid after payment is processed

---

## Support

**Issues with Azure setup:** Check [Microsoft Graph API documentation](https://learn.microsoft.com/en-us/graph/auth-v2-user)

**Issues with Netlify:** Check [Netlify Functions documentation](https://docs.netlify.com/functions/overview/)

**Issues with the integration:** Check browser console logs (F12 → Console) when clicking "Sync Outlook"

---

**Last Updated:** January 2025
**Integration Version:** 1.0
