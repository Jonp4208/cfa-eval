# Heroku Deployment Guide for PDF Generation Fix

## Overview
This guide outlines the steps to deploy the PDF generation fix to Heroku. The main issue was that Puppeteer (used by html-pdf-node) requires Chrome to be available in the production environment.

## Changes Made

### 1. Updated Buildpack Configuration
- Changed from `jontewks/puppeteer-heroku-buildpack` to the official `puppeteer/heroku-buildpack-puppeteer`
- Added `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` environment variable

### 2. Enhanced PDF Generation
- Added production-specific Chrome launch arguments for Heroku
- Improved error handling and logging
- Created a dedicated PDF generator utility
- Added support for multiple Chrome executable paths

### 3. Added Test Endpoint
- Created `/api/test-pdf` endpoint to verify PDF generation works

## Deployment Steps

### Step 1: Update Heroku Buildpacks
```bash
# Remove old buildpack
heroku buildpacks:remove https://github.com/jontewks/puppeteer-heroku-buildpack --app your-app-name

# Add the official Puppeteer buildpack
heroku buildpacks:add https://github.com/puppeteer/heroku-buildpack-puppeteer --app your-app-name

# Verify buildpacks are in correct order
heroku buildpacks --app your-app-name
```

### Step 2: Set Environment Variables
```bash
# Set Puppeteer to skip Chromium download
heroku config:set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true --app your-app-name

# Verify environment variables
heroku config --app your-app-name
```

### Step 3: Deploy the Code
```bash
# Commit all changes
git add .
git commit -m "Fix PDF generation for production environment"

# Deploy to Heroku
git push heroku master
```

### Step 4: Test PDF Generation
After deployment, test the PDF generation:

1. Visit: `https://your-app-name.herokuapp.com/api/test-pdf`
2. Should return: `{"success": true, "message": "PDF generation is working"}`
3. Test actual playbook PDF generation in the app

## Troubleshooting

### If PDF generation still fails:

1. **Check logs:**
   ```bash
   heroku logs --tail --app your-app-name
   ```

2. **Verify Chrome executable:**
   The logs should show the Chrome executable path being used.

3. **Check buildpack order:**
   ```bash
   heroku buildpacks --app your-app-name
   ```
   Should show:
   - heroku/nodejs
   - puppeteer/heroku-buildpack-puppeteer

4. **Alternative buildpack:**
   If the official buildpack doesn't work, try:
   ```bash
   heroku buildpacks:remove https://github.com/puppeteer/heroku-buildpack-puppeteer --app your-app-name
   heroku buildpacks:add https://github.com/CoffeeAndCode/puppeteer-heroku-buildpack --app your-app-name
   ```

### Common Issues:

1. **Memory issues:** Consider upgrading to a higher dyno type if needed
2. **Timeout issues:** The timeout is set to 60 seconds, which should be sufficient
3. **Chrome not found:** Ensure the buildpack is properly installed

## Environment Variables Used

- `GOOGLE_CHROME_BIN`: Set by the Puppeteer buildpack
- `CHROME_BIN`: Alternative Chrome executable path
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: Prevents duplicate Chrome downloads
- `NODE_ENV`: Should be "production"

## Testing Locally

To test the production configuration locally:
```bash
NODE_ENV=production npm start
```

Then visit: `http://localhost:5000/api/test-pdf`
