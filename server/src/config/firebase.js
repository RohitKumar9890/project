import admin from 'firebase-admin';
import { readFileSync } from 'fs';
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
    
    // First, try environment variables (for production/Render)
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_CLIENT_EMAIL && 
        process.env.FIREBASE_PRIVATE_KEY) {
      
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
      
      try {
        // eslint-disable-next-line no-console
        console.log('📝 Attempting to load Firebase credentials from file:', serviceAccountPath);
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        credential = admin.credential.cert(serviceAccount);
      } catch (fileError) {
        throw new Error(
          'Firebase credentials not found. Please provide either:\n' +
          '1. Environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY\n' +
          '2. File: firebase-service-account.json in server directory\n' +
          `\nFile error: ${fileError.message}`
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
    // eslint-disable-next-line no-console
    console.error('Stack trace:', error.stack);
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
