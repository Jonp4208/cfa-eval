#!/usr/bin/env node

/**
 * Playbook Announcement Email Campaign Runner
 * 
 * This script sends the new playbook feature announcement to all Directors and Leaders.
 * 
 * Usage:
 *   npm run send-playbook-announcement
 *   
 * Or directly:
 *   node scripts/runPlaybookAnnouncement.js
 * 
 * Safety Features:
 * - Requires SEND_EMAILS=true environment variable to actually send
 * - Shows preview of recipients before sending
 * - Rate limiting between emails
 * - Comprehensive error handling and reporting
 */

import sendPlaybookAnnouncement from './sendPlaybookAnnouncement.js';

console.log('🚀 PLAYBOOK ANNOUNCEMENT EMAIL CAMPAIGN');
console.log('=====================================');
console.log('');
console.log('This script will send the new playbook feature announcement');
console.log('to all users with leadership positions (Directors, Leaders, Managers, etc.)');
console.log('');

sendPlaybookAnnouncement();
