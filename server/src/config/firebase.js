import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      db = admin.firestore();
      return db;
    }

    let credential;
    let useEnvVars = false;
    
    // Check if we have environment variables (for production/Render)
    const hasEnvVars = process.env.FIREBASE_PROJECT_ID && 
                       process.env.FIREBASE_CLIENT_EMAIL && 
                       process.env.FIREBASE_PRIVATE_KEY;
    
    if (hasEnvVars) {
      // Use environment variables (PRODUCTION MODE)
      // eslint-disable-next-line no-console
      console.log('📝 Using Firebase credentials from environment variables');
      
      // Handle private key formatting - replace literal \n with actual newlines
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // If the key doesn't start with -----, it might be base64 or malformed
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        // eslint-disable-next-line no-console
        console.warn('⚠️  FIREBASE_PRIVATE_KEY appears malformed - should include BEGIN/END markers');
      }
      
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      });
      
      useEnvVars = true;
    } else {
      // Try to load service account from file (for local development)
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                                  join(__dirname, '../../firebase-service-account.json');
      
      // eslint-disable-next-line no-console
      console.log('📝 Attempting to load Firebase credentials from file:', serviceAccountPath);
      
      // Check if file exists before trying to read
      if (!existsSync(serviceAccountPath)) {
        throw new Error(
          '❌ Firebase credentials not found!\n\n' +
          'You must provide credentials via ONE of these methods:\n\n' +
          '1. ENVIRONMENT VARIABLES (for Production/Render):\n' +
          '   - FIREBASE_PROJECT_ID\n' +
          '   - FIREBASE_CLIENT_EMAIL\n' +
          '   - FIREBASE_PRIVATE_KEY\n\n' +
          '2. SERVICE ACCOUNT FILE (for Local Development):\n' +
          '   - Place firebase-service-account.json in server/ directory\n' +
          '   - Or set FIREBASE_SERVICE_ACCOUNT_PATH env variable\n\n' +
          `Current status:\n` +
          `  - Environment variables set: NO\n` +
          `  - Service account file exists: NO (checked: ${serviceAccountPath})\n\n` +
          'For Render deployment, set the environment variables in Render Dashboard.\n' +
          'Run "npm run render-helper" locally to get the values to set.'
        );
      }
      
      try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        credential = admin.credential.cert(serviceAccount);
      } catch (fileError) {
        throw new Error(
          `Failed to load Firebase service account file: ${fileError.message}\n` +
          'Make sure the file is valid JSON and not corrupted.'
        );
      }
    }

    // Initialize Firebase Admin
    const config = {
      credential,
    };
    
    // Only add databaseURL if provided (it's optional for Firestore-only apps)
    if (process.env.FIREBASE_DATABASE_URL) {
      config.databaseURL = process.env.FIREBASE_DATABASE_URL;
    }

    admin.initializeApp(config);

    db = admin.firestore();
    
    // Configure Firestore settings
    db.settings({
      ignoreUndefinedProperties: true,
    });

    // eslint-disable-next-line no-console
    console.log(`✓ Firebase initialized successfully ${useEnvVars ? '(using environment variables)' : '(using service account file)'}`);
    
    return db;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to initialize Firebase:', error.message);
    
    // Only show stack trace if it's not our custom error message
    if (!error.message.includes('Firebase credentials not found')) {
      // eslint-disable-next-line no-console
      console.error('Stack trace:', error.stack);
    }
    
    throw error;
  }
};

export const getFirestore = () => {
  if (!db) {
    db = initializeFirebase();
  }
  return db;
};

export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

export default { initializeFirebase, getFirestore, FieldValue, Timestamp };
