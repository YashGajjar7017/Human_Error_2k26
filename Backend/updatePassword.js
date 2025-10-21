const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserLogin = require('./models/UserLogin.models.js');
require('dotenv').config();

async function updatePassword() {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/node_compiler_db');

        // Find user
        const user = await UserLogin.findOne({ username: 'test' });
        if (!user) {
            console.log('User not found');
            return;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash('test', 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        console.log('Password updated successfully');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

updatePassword();
