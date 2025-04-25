// Script to generate self-signed SSL certificates for local development
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create SSL directory if it doesn't exist
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

console.log('Generating self-signed SSL certificates for local development...');

try {
  // Generate SSL certificates using OpenSSL
  // Note: This requires OpenSSL to be installed on your system
  execSync(
    'openssl req -x509 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/CN=localhost"',
    { stdio: 'inherit', cwd: __dirname }
  );
  
  console.log('\nSSL certificates generated successfully!');
  console.log('\nIMPORTANT: These are self-signed certificates for local development only.');
  console.log('Your browser will show a security warning when you access the site.');
  console.log('You will need to accept the certificate in your browser to proceed.');
} catch (error) {
  console.error('Failed to generate SSL certificates:', error.message);
  console.log('\nAlternative method:');
  console.log('1. Install OpenSSL if not already installed');
  console.log('2. Run the following commands manually:');
  console.log('   cd client');
  console.log('   mkdir -p ssl');
  console.log('   openssl req -x509 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/CN=localhost"');
}
