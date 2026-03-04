#!/bin/bash
# Simple deploy script for CTRC dashboard to Netlify

echo "🚀 Deploying CTRC dashboard to production..."
netlify deploy --prod --dir=.

echo "✅ Deployment complete!"
echo "🌐 Live at: https://ctrc-v5-manager.netlify.app/"
