#!/usr/bin/env node

/**
 * Render Deployment Helper Script
 * Helps you prepare and verify your Render deployment setup
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Render Deployment Helper\n');
console.log('=' .repeat(60));

// Check if firebase service account exists
const firebaseServiceAccountPath = join(__dirname, '../server/firebase-service-account.json');
let firebaseCredentials = null;

if (existsSync(firebaseServiceAccountPath)) {
  console.log('✓ Found firebase-service-account.json\n');
  
  try {
    firebaseCredentials = JSON.parse(readFileSync(firebaseServiceAccountPath, 'utf8'));
    
    console.log('📋 Firebase Credentials to Set in Render:\n');
    console.log('FIREBASE_PROJECT_ID=' + firebaseCredentials.project_id);
    console.log('FIREBASE_CLIENT_EMAIL=' + firebaseCredentials.client_email);
    console.log('\nFIREBASE_PRIVATE_KEY=');
    console.log('"' + firebaseCredentials.private_key + '"');
    console.log('\n⚠️  IMPORTANT: Copy the ENTIRE private key including the quotes and \\n characters');
    console.log('   Paste it exactly as shown in Render dashboard\n');
    
    if (firebaseCredentials.project_id) {
      console.log('Optional FIREBASE_DATABASE_URL:');
      console.log(`https://${firebaseCredentials.project_id}.firebaseio.com`);
      console.log('(This is optional for Firestore-only apps)\n');
    }
  } catch (error) {
    console.error('✗ Error reading firebase-service-account.json:', error.message);
  }
} else {
  console.log('⚠️  firebase-service-account.json not found');
  console.log('   Location expected: server/firebase-service-account.json\n');
  console.log('   You must set Firebase credentials manually in Render dashboard\n');
}

console.log('=' .repeat(60));
console.log('\n📝 Next Steps:\n');
console.log('1. Run: npm run generate-secrets');
console.log('   (Copy JWT_SECRET and JWT_REFRESH_SECRET values)\n');
console.log('2. Go to Render Dashboard → Your Service → Environment\n');
console.log('3. Set the following variables:');
console.log('   - JWT_SECRET (from generate-secrets output)');
console.log('   - JWT_REFRESH_SECRET (from generate-secrets output)');
console.log('   - FIREBASE_PROJECT_ID (from above)');
console.log('   - FIREBASE_CLIENT_EMAIL (from above)');
console.log('   - FIREBASE_PRIVATE_KEY (from above - copy exactly!)\n');
console.log('4. Push your code: git push origin main\n');
console.log('5. In Render: Manual Deploy → Clear build cache & deploy\n');
console.log('6. Watch logs for: "✓ Firebase initialized successfully"\n');
console.log('=' .repeat(60));
console.log('\n📚 For detailed help, see:');
console.log('   - RENDER_QUICK_FIX.md (quick start)');
console.log('   - RENDER_TROUBLESHOOTING.md (error solutions)');
console.log('   - DEPLOYMENT_GUIDE.md (complete guide)\n');
