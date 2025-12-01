const http = require('http');

const BASE_URL = 'http://localhost:8000';

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: response });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testSignupFlow() {
    console.log('Testing Signup Flow...\n');

    try {
        // Test 1: Signup initiation
        console.log('1. Testing signup initiation...');
        const signupData = {
            username: 'testuser123',
            email: 'testuser123@example.com',
            password: 'TestPass123!',
            confirmPassword: 'TestPass123!'
        };

        const signupOptions = {
            hostname: 'localhost',
            port: 8000,
            path: '/api/signup',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const signupResponse = await makeRequest(signupOptions, signupData);
        console.log('Signup Response:', signupResponse.data);

        if (signupResponse.data.success) {
            console.log('✅ Signup initiation successful\n');

            // Test 2: Send OTP
            console.log('2. Testing OTP sending...');
            const otpOptions = {
                hostname: 'localhost',
                port: 8000,
                path: '/api/signup/otp',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const otpResponse = await makeRequest(otpOptions, { email: signupData.email });
            console.log('OTP Response:', otpResponse.data);

            if (otpResponse.data.success) {
                console.log('✅ OTP sent successfully\n');

                // For testing purposes, we'll need to manually check the OTP
                // In a real test, we'd need to capture the OTP from email or database
                console.log('3. Manual OTP verification needed - check email/database for OTP');
                console.log('Then test: POST /api/signup/verify-otp with email and OTP');
            } else {
                console.log('❌ OTP sending failed');
            }
        } else {
            console.log('❌ Signup initiation failed:', signupResponse.data.error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Test error cases
async function testErrorCases() {
    console.log('\nTesting Error Cases...\n');

    // Test duplicate signup
    try {
        console.log('1. Testing duplicate signup...');
        const duplicateOptions = {
            hostname: 'localhost',
            port: 8000,
            path: '/api/signup',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const duplicateResponse = await makeRequest(duplicateOptions, {
            username: 'testuser123',
            email: 'testuser123@example.com',
            password: 'TestPass123!',
            confirmPassword: 'TestPass123!'
        });
        console.log('Duplicate signup response:', duplicateResponse.data);
        if (!duplicateResponse.data.success && duplicateResponse.data.error.includes('already initiated')) {
            console.log('✅ Duplicate signup properly rejected');
        }
    } catch (error) {
        console.log('❌ Duplicate signup test failed:', error.message);
    }

    // Test invalid email
    try {
        console.log('2. Testing invalid email...');
        const invalidEmailOptions = {
            hostname: 'localhost',
            port: 8000,
            path: '/api/signup',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const invalidEmailResponse = await makeRequest(invalidEmailOptions, {
            username: 'testuser2',
            email: 'invalid-email',
            password: 'TestPass123!',
            confirmPassword: 'TestPass123!'
        });
        console.log('Invalid email response:', invalidEmailResponse.data);
        if (!invalidEmailResponse.data.success && invalidEmailResponse.data.error.includes('valid email')) {
            console.log('✅ Invalid email properly rejected');
        }
    } catch (error) {
        console.log('❌ Invalid email test failed:', error.message);
    }

    // Test weak password
    try {
        console.log('3. Testing weak password...');
        const weakPasswordOptions = {
            hostname: 'localhost',
            port: 8000,
            path: '/api/signup',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const weakPasswordResponse = await makeRequest(weakPasswordOptions, {
            username: 'testuser3',
            email: 'testuser3@example.com',
            password: 'weak',
            confirmPassword: 'weak'
        });
        console.log('Weak password response:', weakPasswordResponse.data);
        if (!weakPasswordResponse.data.success && weakPasswordResponse.data.error.includes('Password must')) {
            console.log('✅ Weak password properly rejected');
        }
    } catch (error) {
        console.log('❌ Weak password test failed:', error.message);
    }
}

async function runTests() {
    await testSignupFlow();
    await testErrorCases();
    console.log('\nTest completed.');
}

runTests();
