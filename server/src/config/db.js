import { initializeFirebase } from './firebase.js';

export const connectDB = async () => {
  try {
    await initializeFirebase();
    // eslint-disable-next-line no-console
    console.log('✓ Firestore connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Firestore connection error:', err);
    process.exit(1);
  }
};
