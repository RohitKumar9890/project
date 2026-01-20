import dotenv from 'dotenv';
import { User, USER_ROLES } from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import { initializeFirebase } from '../config/firebase.js';

dotenv.config();

const run = async () => {
  try {
    // Initialize Firebase
    await initializeFirebase();
    // eslint-disable-next-line no-console
    console.log('✓ Connected to Firestore');

    const email = (process.env.SEED_ADMIN_EMAIL || 'admin@edueval.local').toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
    const name = process.env.SEED_ADMIN_NAME || 'EduEval Admin';

    const existing = await User.findOne({ email });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log('✓ Admin already exists:', email);
      process.exit(0);
    }

    const passwordHash = await hashPassword(password);
    await User.create({ name, email, passwordHash, role: USER_ROLES.ADMIN });

    // eslint-disable-next-line no-console
    console.log('✓ Admin user created successfully!');
    // eslint-disable-next-line no-console
    console.log('  Email:', email);
    // eslint-disable-next-line no-console
    console.log('  Password:', password);
    
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

run();
