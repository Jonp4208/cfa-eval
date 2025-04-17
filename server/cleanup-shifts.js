// This script runs the cleanup for duplicate days in shift setups
import { exec } from 'child_process';

console.log('Running cleanup script for duplicate days in shift setups...');

// Run the cleanup script
exec('node --experimental-modules src/scripts/cleanupDuplicateDays.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
