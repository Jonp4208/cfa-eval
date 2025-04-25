# Setting Up HTTPS for Local Development

This guide explains how to set up HTTPS for local development to fix the "site not secure" warning and login issues.

## Why HTTPS is Needed

Modern browsers implement security features that restrict certain operations (like cookie storage with credentials) on non-secure connections. This can cause login functionality to fail on local development environments that use HTTP instead of HTTPS.

## Option 1: Using the Built-in Script (Recommended)

We've added a script to automatically generate self-signed SSL certificates for local development:

1. Make sure you have OpenSSL installed on your system
   - Windows: You can install it via [Chocolatey](https://chocolatey.org/): `choco install openssl`
   - Mac: Install via Homebrew: `brew install openssl`
   - Linux: Use your package manager, e.g., `apt install openssl`

2. Run the secure development server:
   ```
   npm run dev-secure
   ```

   This will:
   - Generate self-signed SSL certificates in the `ssl` directory
   - Start the Vite development server with HTTPS enabled

3. When you first access the site in your browser, you'll see a security warning because the certificate is self-signed. You'll need to:
   - Click "Advanced" or "Details"
   - Click "Proceed to localhost (unsafe)" or similar option
   - After accepting once, your browser should remember this for future sessions

## Option 2: Manual SSL Certificate Generation

If the automatic script doesn't work, you can generate the certificates manually:

1. Create an `ssl` directory in the client folder:
   ```
   mkdir -p client/ssl
   ```

2. Generate self-signed certificates:
   ```
   cd client
   openssl req -x509 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/CN=localhost"
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Troubleshooting

- **Certificate errors**: If you see certificate errors in the browser, you need to accept the self-signed certificate by clicking through the security warnings.
- **OpenSSL not found**: Make sure OpenSSL is installed and available in your PATH.
- **Permission issues**: On some systems, you might need to run the commands with administrator privileges.

## Production Environment

The production environment on Heroku automatically uses HTTPS, so these steps are only needed for local development.
