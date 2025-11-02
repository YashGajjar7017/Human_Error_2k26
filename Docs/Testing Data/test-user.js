const mongoose = require('mongoose');
const User = require('./models/User.model');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URL_Cloud || 'mongodb+srv://yashacker:Iamyash@reactdb.d04du.mongodb.net', {
            dbName: 'node_compiler_db'
        });

        const users = await User.find({});
        console.log('Existing users:', users.length);

        if (users.length === 0) {
            // Create a test user
            const testUser = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                isVerified: true
            });
            await testUser.save();
            console.log('Test user created: testuser / password123');
            console.log('Hashed password:', testUser.password);
        } else {
            console.log('Users found:', users.map(u => ({ username: u.username, email: u.email })));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
