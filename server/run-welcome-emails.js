// Simple script to execute the welcome emails script
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll get the store ID from the first user in the database with one of these emails
console.log(`Starting welcome email script - will determine store ID from users`);

// Run the script with Node.js
const emailProcess = spawn('node', [
  path.join(__dirname, 'src', 'scripts', 'sendSpecificWelcomeEmails.js')
]);

// Forward stdout
emailProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

// Forward stderr
emailProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Handle process exit
emailProcess.on('close', (code) => {
  console.log(`Email script exited with code ${code}`);
}); 