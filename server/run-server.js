// Simple script to run the server with a specific log level
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get log level from command line arguments or use default
const args = process.argv.slice(2);
const logLevelArg = args.find(arg => arg.startsWith('--log-level='));
const logLevel = logLevelArg ? logLevelArg.split('=')[1] : 'WARN';

// Set environment variables
const env = {
  ...process.env,
  LOG_LEVEL: logLevel
};

console.log(`Starting server with LOG_LEVEL=${logLevel}`);

// Run the server
const serverProcess = spawn('node', ['src/index.js'], {
  cwd: __dirname,
  env,
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGTERM');
});
