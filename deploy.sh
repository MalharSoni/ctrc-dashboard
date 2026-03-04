#!/bin/bash
# Simple deploy script for CTRC dashboard to GitHub and Netlify

echo "📦 Pushing to GitHub..."
git add .
git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main

echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=.

echo "✅ Deployment complete!"
echo "📁 GitHub: https://github.com/MalharSoni/ctrc-dashboard"
echo "🌐 Live at: https://ctrc-v5-manager.netlify.app/"
