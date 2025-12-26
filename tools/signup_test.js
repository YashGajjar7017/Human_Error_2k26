/*
 * signup_test.js
 * Simple integration test to verify signup -> user creation when DISABLE_SIGNUP_OTP=true
 * Usage: DISABLE_SIGNUP_OTP=true node tools/signup_test.js
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'Backend', '.env') });

const User = require('../Backend/models/User.model');

async function main() {
  const backendBase = process.env.BACKEND_URL || 'http://localhost:8000';
  const username = `testuser_${Date.now()}`;
  const email = `${username}@example.com`;
  const password = 'Aa1!testpass';

  console.log('Starting signup test for', email);

  try {
    // POST signup
    const resp = await axios.post(`${backendBase}/api/signup`, { username, email, password, confirmPassword: password });
    console.log('Signup response status:', resp.status);
    console.log('Response data:', resp.data);

    // Wait a moment for DB writes
    await new Promise(r => setTimeout(r, 1000));

    // Connect to DB and check user exists
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'node_compiler_db';
    const connString = `${mongoUrl}/${dbName}`;
    await mongoose.connect(mongoUrl, { dbName, useNewUrlParser: true, useUnifiedTopology: true });

    const found = await User.findOne({ email });
    if (found) {
      console.log('User found in DB:', found._id.toString());
      console.log('Test PASSED');
    } else {
      console.error('User not found in DB. Test FAILED');
      process.exitCode = 2;
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Signup test failed:', err.response ? err.response.data : err.message);
    process.exitCode = 1;
  }
}

main();
