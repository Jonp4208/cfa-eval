#!/bin/bash

# Heroku PDF Generation Fix Deployment Script
# This script helps deploy the PDF generation fix to Heroku

set -e  # Exit on any error

echo "🚀 Starting Heroku PDF Generation Fix Deployment"
echo "================================================"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first."
    echo "   Visit: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Get app name from user
read -p "Enter your Heroku app name: " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "❌ App name is required"
    exit 1
fi

echo "📱 Using Heroku app: $APP_NAME"

# Verify app exists
if ! heroku apps:info $APP_NAME &> /dev/null; then
    echo "❌ App '$APP_NAME' not found or you don't have access to it"
    exit 1
fi

echo "✅ App verified"

# Step 1: Update buildpacks
echo ""
echo "🔧 Step 1: Updating buildpacks..."

# Remove old buildpack if it exists
echo "   Removing old Puppeteer buildpack (if exists)..."
heroku buildpacks:remove https://github.com/jontewks/puppeteer-heroku-buildpack --app $APP_NAME 2>/dev/null || true

# Get current buildpacks
BUILDPACKS=$(heroku buildpacks --app $APP_NAME)

# Check if Node.js buildpack exists
if echo "$BUILDPACKS" | grep -q "heroku/nodejs"; then
    echo "   ✅ Node.js buildpack already exists"
else
    echo "   Adding Node.js buildpack..."
    heroku buildpacks:add heroku/nodejs --app $APP_NAME
fi

# Check if Puppeteer buildpack exists
if echo "$BUILDPACKS" | grep -q "puppeteer/heroku-buildpack-puppeteer"; then
    echo "   ✅ Puppeteer buildpack already exists"
else
    echo "   Adding Puppeteer buildpack..."
    heroku buildpacks:add https://github.com/puppeteer/heroku-buildpack-puppeteer --app $APP_NAME
fi

echo "   Current buildpacks:"
heroku buildpacks --app $APP_NAME

# Step 2: Set environment variables
echo ""
echo "🔧 Step 2: Setting environment variables..."

heroku config:set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true --app $APP_NAME
echo "   ✅ Set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true"

# Step 3: Deploy code
echo ""
echo "🔧 Step 3: Deploying code..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "   📝 Uncommitted changes detected. Committing..."
    git add .
    git commit -m "Fix PDF generation for production environment - $(date)"
else
    echo "   ✅ No uncommitted changes"
fi

# Deploy to Heroku
echo "   🚀 Pushing to Heroku..."
git push heroku master

# Step 4: Test deployment
echo ""
echo "🔧 Step 4: Testing PDF generation..."

sleep 10  # Wait for deployment to complete

echo "   Testing PDF generation endpoint..."
RESPONSE=$(curl -s "https://$APP_NAME.herokuapp.com/api/test-pdf" || echo "ERROR")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ PDF generation test PASSED"
    echo "   Response: $RESPONSE"
else
    echo "   ❌ PDF generation test FAILED"
    echo "   Response: $RESPONSE"
    echo ""
    echo "   📋 Troubleshooting steps:"
    echo "   1. Check logs: heroku logs --tail --app $APP_NAME"
    echo "   2. Verify buildpacks: heroku buildpacks --app $APP_NAME"
    echo "   3. Check environment variables: heroku config --app $APP_NAME"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test playbook PDF generation in your app"
echo "   2. Monitor logs: heroku logs --tail --app $APP_NAME"
echo "   3. If issues persist, check the troubleshooting guide in deploy-to-heroku.md"
echo ""
echo "🔗 Your app: https://$APP_NAME.herokuapp.com"
echo "🔗 Test endpoint: https://$APP_NAME.herokuapp.com/api/test-pdf"
