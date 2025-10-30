const User = require('./models/User.model.js');
const mongoose = require('mongoose');

async function checkUsers() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect('mongodb://localhost:27017/node-compiler');

        const users = await User.find({});
        console.log('Existing users:', users.length > 0 ? users.map(u => ({ username: u.username, email: u.email })) : 'No users found');

        if (users.length === 0) {
            console.log('No users found. Creating a test user...');

            const testUser = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpass'
            });

            await testUser.save();
            console.log('Test user created:', { username: testUser.username, email: testUser.email });
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUsers();
