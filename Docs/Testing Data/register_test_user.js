const axios = require('axios');

async function registerTestUser() {
    try {
        console.log('Registering test user...');

        const registerResponse = await axios.post('http://localhost:8000/api/auth/register', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpass',
            confirmPassword: 'testpass'
        });

        if (registerResponse.data.success) {
            console.log('Test user registered successfully!');
            console.log('User details:', registerResponse.data.data);

            // Now try to login
            console.log('Attempting to login...');
            const loginResponse = await axios.post('http://localhost:8000/api/auth/login', {
                username: 'testuser',
                password: 'testpass'
            });

            if (loginResponse.data.success) {
                console.log('Login successful!');
                console.log('Token:', loginResponse.data.token);
                console.log('User:', loginResponse.data.user);
                return loginResponse.data;
            } else {
                console.log('Login failed:', loginResponse.data.message);
            }
        } else {
            console.log('Registration failed:', registerResponse.data.message);
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

registerTestUser();
