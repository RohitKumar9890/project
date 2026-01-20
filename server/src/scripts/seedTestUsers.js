import dotenv from 'dotenv';
import { User, USER_ROLES } from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import { initializeFirebase } from '../config/firebase.js';

dotenv.config();

const testUsers = [
  {
    name: 'Rohit Kumar',
    email: 'rk8766323@gmail.com',
    password: 'Rohit@4850',
    role: USER_ROLES.ADMIN,
  },
  {
    name: 'Dr. John Smith',
    email: 'faculty@test.com',
    password: 'Faculty@123',
    role: USER_ROLES.FACULTY,
  },
  {
    name: 'Alice Student',
    email: 'student@test.com',
    password: 'Student@123',
    role: USER_ROLES.STUDENT,
  },
];

const run = async () => {
  try {
    await initializeFirebase();
    // eslint-disable-next-line no-console
    console.log('✓ Connected to Firestore');

    for (const userData of testUsers) {
      const existing = await User.findOne({ email: userData.email.toLowerCase() });
      
      if (existing) {
        // eslint-disable-next-line no-console
        console.log(`⚠ User already exists: ${userData.email}`);
        continue;
      }

      const passwordHash = await hashPassword(userData.password);
      await User.create({
        name: userData.name,
        email: userData.email.toLowerCase(),
        passwordHash,
        role: userData.role,
        isActive: true,
      });

      // eslint-disable-next-line no-console
      console.log(`✓ Created ${userData.role}: ${userData.email}`);
    }

    // eslint-disable-next-line no-console
    console.log('\n✅ All test users created successfully!');
    // eslint-disable-next-line no-console
    console.log('\n📋 LOGIN CREDENTIALS:');
    // eslint-disable-next-line no-console
    console.log('\n👨‍💼 ADMIN:');
    // eslint-disable-next-line no-console
    console.log('   Email: rk8766323@gmail.com');
    // eslint-disable-next-line no-console
    console.log('   Password: Rohit@4850');
    // eslint-disable-next-line no-console
    console.log('\n👨‍🏫 FACULTY:');
    // eslint-disable-next-line no-console
    console.log('   Email: faculty@test.com');
    // eslint-disable-next-line no-console
    console.log('   Password: Faculty@123');
    // eslint-disable-next-line no-console
    console.log('\n🎓 STUDENT:');
    // eslint-disable-next-line no-console
    console.log('   Email: student@test.com');
    // eslint-disable-next-line no-console
    console.log('   Password: Student@123\n');

    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating test users:', error.message);
    process.exit(1);
  }
};

run();
