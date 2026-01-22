/**
 * Environment Variables Checker
 * Helps diagnose missing or incorrectly set environment variables
 */

export const checkRequiredEnvVars = () => {
  console.log('\n========================================');
  console.log('🔍 ENVIRONMENT VARIABLES CHECK');
  console.log('========================================\n');

  const requiredVars = {
    'JWT Configuration': [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'JWT_EXPIRE',
      'JWT_REFRESH_EXPIRE',
    ],
    'Firebase Configuration': [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
    ],
  };

  const optionalVars = {
    'Firebase Optional': ['FIREBASE_DATABASE_URL'],
    'CORS Configuration': ['CORS_ORIGIN', 'CLIENT_URL'],
    'Email Configuration': ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'],
  };

  let allRequiredPresent = true;
  let missingRequired = [];

  // Check required variables
  Object.entries(requiredVars).forEach(([category, vars]) => {
    console.log(`📋 ${category}:`);
    vars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        // Show limited preview for security
        let preview = '';
        if (varName.includes('SECRET') || varName.includes('KEY')) {
          preview = ' [SET - length: ' + value.length + ' chars]';
        } else if (varName.includes('EXPIRE')) {
          preview = ` = ${value}`;
        } else {
          preview = ' = ' + value.substring(0, 30) + (value.length > 30 ? '...' : '');
        }
        console.log(`   ✅ ${varName}${preview}`);
      } else {
        console.log(`   ❌ ${varName} - NOT SET`);
        allRequiredPresent = false;
        missingRequired.push(varName);
      }
    });
    console.log('');
  });

  // Check optional variables
  console.log('📋 Optional Variables:');
  Object.entries(optionalVars).forEach(([category, vars]) => {
    vars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        let preview = '';
        if (varName.includes('PASS') || varName.includes('SECRET')) {
          preview = ' [SET]';
        } else {
          preview = ' = ' + value.substring(0, 40) + (value.length > 40 ? '...' : '');
        }
        console.log(`   ✅ ${varName}${preview}`);
      } else {
        console.log(`   ⚪ ${varName} - not set (optional)`);
      }
    });
  });

  console.log('\n========================================');
  
  if (allRequiredPresent) {
    console.log('✅ ALL REQUIRED VARIABLES ARE SET');
    console.log('========================================\n');
    return true;
  } else {
    console.log('❌ MISSING REQUIRED VARIABLES');
    console.log('========================================\n');
    console.log('⚠️  Missing variables:');
    missingRequired.forEach(varName => {
      console.log(`   • ${varName}`);
    });
    console.log('\n📝 Action Required:');
    console.log('   1. Go to Render Dashboard → Your Service → Environment');
    console.log('   2. Add the missing variables listed above');
    console.log('   3. Save changes');
    console.log('   4. Redeploy your service\n');
    console.log('   For credentials, run locally: npm run render-helper\n');
    return false;
  }
};

export default checkRequiredEnvVars;
