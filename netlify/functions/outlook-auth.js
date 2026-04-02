const { ConfidentialClientApplication } = require('@azure/msal-node');
const { getStore } = require('@netlify/blobs');

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}`,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
};

// Token scopes
const tokenRequest = {
  scopes: ['https://graph.microsoft.com/Mail.Read', 'https://graph.microsoft.com/Mail.ReadBasic'],
};

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

// Helper to send HTML response
const respondHtml = (statusCode, html) => ({
  statusCode,
  headers: {
    'Content-Type': 'text/html',
  },
  body: html,
});

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  const method = event.httpMethod;

  try {
    // Validate environment variables
    if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
      return respond(500, {
        error: 'Missing Microsoft OAuth configuration',
        details: 'MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET must be set in environment variables',
      });
    }

    const redirectUri = process.env.MICROSOFT_REDIRECT_URI ||
      `${event.headers.origin || 'https://ctrc-v5-manager.netlify.app'}/.netlify/functions/outlook-auth`;

    const cca = new ConfidentialClientApplication(msalConfig);

    // GET: Initiate OAuth flow
    if (method === 'GET' && !event.queryStringParameters?.code) {
      const authCodeUrlParameters = {
        scopes: tokenRequest.scopes,
        redirectUri: redirectUri,
      };

      const authCodeUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);

      // Redirect to Microsoft login
      return {
        statusCode: 302,
        headers: {
          Location: authCodeUrl,
        },
      };
    }

    // GET: Handle OAuth callback
    if (method === 'GET' && event.queryStringParameters?.code) {
      const code = event.queryStringParameters.code;

      // Exchange auth code for tokens
      const tokenResponse = await cca.acquireTokenByCode({
        code: code,
        scopes: tokenRequest.scopes,
        redirectUri: redirectUri,
      });

      // Store tokens securely in Netlify Blobs
      const store = getStore('outlook-auth');
      await store.set('access_token', tokenResponse.accessToken);
      await store.set('refresh_token', tokenResponse.refreshToken || '');
      await store.set('token_expiry', new Date(tokenResponse.expiresOn).toISOString());
      await store.set('account_info', JSON.stringify(tokenResponse.account));

      // Return success page
      return respondHtml(200, `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Outlook Connected - CTRC Dashboard</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: #F5F5F5;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: white;
              border-radius: 10px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,.1);
              max-width: 500px;
            }
            .checkmark {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: #22C55E;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 10px 0;
            }
            p {
              color: #737373;
              margin: 0 0 30px 0;
            }
            .btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: #F5D000;
              color: #171717;
              font-size: 14px;
              font-weight: 600;
              padding: 10px 20px;
              border-radius: 6px;
              text-decoration: none;
              border: none;
              cursor: pointer;
            }
            .btn:hover {
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="checkmark">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1>Outlook Connected Successfully</h1>
            <p>Your Microsoft account (${tokenResponse.account?.username || 'account'}) has been linked to CTRC Dashboard. You can now sync invoices from your Outlook inbox.</p>
            <a href="/purchases-invoices.html" class="btn">Go to Invoices</a>
          </div>
        </body>
        </html>
      `);
    }

    // POST: Get current token (refresh if expired)
    if (method === 'POST') {
      const store = getStore('outlook-auth');
      const accessToken = await store.get('access_token');
      const refreshToken = await store.get('refresh_token');
      const tokenExpiry = await store.get('token_expiry');

      if (!accessToken) {
        return respond(401, {
          error: 'Not authenticated',
          details: 'Please authorize Outlook access first',
          authUrl: `/.netlify/functions/outlook-auth`,
        });
      }

      // Check if token is expired
      const now = new Date();
      const expiry = new Date(tokenExpiry);
      const needsRefresh = expiry <= now;

      if (needsRefresh && refreshToken) {
        // Refresh the token
        const tokenResponse = await cca.acquireTokenByRefreshToken({
          refreshToken: refreshToken,
          scopes: tokenRequest.scopes,
        });

        // Update stored tokens
        await store.set('access_token', tokenResponse.accessToken);
        await store.set('refresh_token', tokenResponse.refreshToken || refreshToken);
        await store.set('token_expiry', new Date(tokenResponse.expiresOn).toISOString());

        return respond(200, {
          accessToken: tokenResponse.accessToken,
          expiresAt: tokenResponse.expiresOn,
        });
      }

      return respond(200, {
        accessToken: accessToken,
        expiresAt: tokenExpiry,
      });
    }

    return respond(405, { error: 'Method not allowed' });

  } catch (error) {
    console.error('Outlook Auth Error:', error);
    return respond(500, {
      error: error.message,
      details: error.errorCode || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
