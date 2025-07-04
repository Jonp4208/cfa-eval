// Script to send welcome emails to specific users
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/index.js';
import { sendEmail, verifyEmailConfig } from '../utils/email.js';
import emailTemplates from '../utils/emailTemplates.js';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (relative to script location)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

// List of email addresses that need welcome emails
const emails = [
  'kapdrippy@gmail.com',
  'kmaciol@hotmail.com',
  'cardonasteven71@gmail.com',
  'react2000.ac@gmail.com',
  'alnardojoselopez672@gmail.com',
  'dprada1988@gmail.com',
  'sotoander598@gmail.com',
  'rafaeleduardo.Fm@gmail.com',
  'gr604841@gmail.com',
  'mariangelesqsp@gmail.com',
  'natalysolanoayala@gmail.com',
  'tannersecor@icloud.com',
  'kirlynmarquez03@gmail.com',
  'adrianamoreno.compucell@gmail.com',
  'aidansdsingh06@gmail.com',
  'dreycoyt@gmail.com',
  'colloraandrew2@gmail.com',
  'catiefelt22@gmail.com',
  'dblowers268@gmail.com',
  'emelieviera27@gmail.com',
  'estebend11@gmail.com',
  'ethanquail@icloud.com',
  'ginastefanimarquez@gmail.com',
  'Ilonasaxon125@gmail.com',
  'jackie.martinez@cfanorthgreenbush.com',
  'javar_jenkins@yahoo.com',
  'whitaker.jeremy99@gmail.com',
  'jarvisj707@gmail.com',
  'juandavidpatinosanchez25@gmail.com',
  'kindlonkassy16@gmail.com',
  'lukeymaso05@gmail.com',
  'rumenappm@gmail.com',
  'megclaban@yahoo.com',
  'michaelavangorder@gmail.com',
  'morgan.magierski@gmail.com',
  'universal50005@gmail.com',
  'sallykaliku6@gmail.com',
  'dannaselena7u7@gmail.com',
  'skylarmerritt27@gmail.com',
  'orianabella.1532000@gmail.com',
  'williamkpotts@gmail.com',
  'mayrune50@gmail.com',
  'braydengalk@gmail.com',
  'cfisher66061@gmail.com',
  'cpogue06@gmail.com',
  'cbailey2301@gmail.com',
  'orologiod6@gmail.com',
  'esmith.gymnast@gmail.com',
  'emmaariel07@gmail.com',
  'hailey.hummel@gmail.com',
  'jeanserginhol@gmail.com',
  'joshtrop@icloud.com',
  'josiahurrutia@gmail.com',
  'katebrodzinski31@gmail.com',
  'katherineconley05@icloud.com',
  'kendralosee26@gmail.com',
  'robinsonlatifa43@yahoo.com',
  'latifahsabur45@gmail.com',
  'madival326@gmail.com',
  'madisonbenitezj@gmail.com',
  'malloryprespare1@gmail.com',
  'michaelagy17@gmail.com',
  'mikeybaseball8yt@gmail.com',
  'molars912@gmail.com',
  '08natalie.garcia08@gmail.com',
  'bexxehrlich@gmail.com',
  'slase12345@aol.com',
  'shekaijenyce@gmail.com'
];

// Email template function - now uses the centralized template
const createWelcomeEmail = (user, password, storeName) => {
  return emailTemplates.welcomeNewUser(user, password, storeName);
};

// Main function to send emails
const sendWelcomeEmails = async () => {
  await connectDB();
  
  // Verify email config is working
  const emailConfigValid = await verifyEmailConfig();
  if (!emailConfigValid) {
    console.error('Email configuration is invalid. Cannot send welcome emails.');
    process.exit(1);
  }
  
  console.log('Starting to send welcome emails...');
  
  // Get store information - first find a user from our list
  console.log('Finding store information...');
  const firstUser = await User.findOne({ email: { $in: emails } }).populate('store', 'name');
  
  if (!firstUser) {
    console.error('No matching users found in the database. Check email addresses.');
    process.exit(1);
  }
  
  const storeId = firstUser.store._id;
  const storeName = firstUser.store.name || 'your store';
  
  console.log(`Found store: ${storeName} (ID: ${storeId})`);
  
  // For each user
  let successCount = 0;
  let errorCount = 0;
  
  for (const email of emails) {
    try {
      // Find the user
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log(`User with email ${email} not found, skipping...`);
        continue;
      }
      
      // Generate a new temporary password
      const newPassword = User.generateRandomPassword();
      
      // Update the user's password
      user.password = newPassword;
      await user.save();
      
      // Send welcome email
      const emailData = createWelcomeEmail(user, newPassword, storeName);
      await sendEmail(emailData);
      
      console.log(`Welcome email sent to ${email}`);
      successCount++;
      
      // Add a small delay to prevent overwhelming the email server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error sending welcome email to ${email}:`, error);
      errorCount++;
    }
  }
  
  console.log(`Completed sending welcome emails.`);
  console.log(`Success: ${successCount}, Failed: ${errorCount}`);
  
  process.exit(0);
};

// Run the script
sendWelcomeEmails().catch(err => {
  console.error('Error in script execution:', err);
  process.exit(1);
}); 