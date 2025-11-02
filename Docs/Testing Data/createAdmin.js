const mongoose = require('mongoose');
const User = require('./models/User.model');
const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, 'Backend', '.env') });

// Connect to MongoDB (using same config as server)
const MONGODB_URL = process.env.MONGODB_URL_Cloud || 'mongodb+srv://yashacker:Iamyash@reactdb.d04du.mongodb.net/?retryWrites=true&w=majority&appName=ReactDB';
const DB_NAME = process.env.DB_NAME || "ReactDB";

mongoose.connect(MONGODB_URL, {
    dbName: DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
        console.log('Admin user already exists');
        mongoose.connection.close();
        return;
    }

    // Create admin user
    const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully');
    mongoose.connection.close();
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});
