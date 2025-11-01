const mongoose = require('mongoose');
const User = require('./Backend/models/User.model.js');

// Connect to MongoDB (adjust the connection string as needed)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb', {
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
