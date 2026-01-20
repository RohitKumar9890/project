// Quick test to check login functionality
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('Testing login functionality...\n');
  
  const testCredentials = [
    { email: 'admin@edueval.local', password: 'Admin@12345', name: 'Admin' },
    { email: 'student@test.com', password: 'Student@123', name: 'Student' },
    { email: 'faculty@test.com', password: 'Faculty@123', name: 'Faculty' }
  ];

  for (const cred of testCredentials) {
    console.log(`Testing login for ${cred.name}...`);
    try {
      const startTime = Date.now();
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: cred.email,
        password: cred.password
      });
      const duration = Date.now() - startTime;
      
      if (response.data && response.data.accessToken) {
        console.log(`✓ ${cred.name} login successful (${duration}ms)`);
        console.log(`  User: ${response.data.user.name} (${response.data.user.role})`);
      }
    } catch (error) {
      console.log(`✗ ${cred.name} login failed:`);
      if (error.response) {
        console.log(`  Status: ${error.response.status}`);
        console.log(`  Message: ${error.response.data.message || error.response.data}`);
      } else if (error.request) {
        console.log(`  No response received - server might be down`);
      } else {
        console.log(`  Error: ${error.message}`);
      }
    }
    console.log('');
  }
  
  // Test multiple rapid logins
  console.log('Testing rapid login requests (checking rate limiting)...');
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      axios.post(`${API_URL}/auth/login`, {
        email: 'admin@edueval.local',
        password: 'Admin@12345'
      }).catch(err => ({ error: err }))
    );
  }
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  console.log(`Rapid requests: ${successful} successful, ${failed} failed`);
  
  if (failed > 0) {
    console.log('Failed requests details:');
    results.forEach((r, i) => {
      if (r.error) {
        console.log(`  Request ${i + 1}: ${r.error.response?.status || 'No response'} - ${r.error.response?.data?.message || r.error.message}`);
      }
    });
  }
}

testLogin().catch(console.error);
