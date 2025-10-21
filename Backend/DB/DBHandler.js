const mongoose = require("mongoose");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// const MONGODB_URL_Cloud = 'mongodb+srv://yashacker:Iamyash@reactdb.d04du.mongodb.net';
const MONGODB_URL_Local = 'mongodb://localhost:27017';
const MONGODB_URL = process.env.MONGODB_URL_Cloud || 'mongodb+srv://yashacker:Iamyash@reactdb.d04du.mongodb.net';
const DB_NAME = process.env.DB_NAME || "node_compiler_db";

// Suppress Mongoose deprecation warnings
mongoose.set('strictQuery', false);

async function connectDB() {
    try {
        // Validate that we have a proper MongoDB URL
        if (!MONGODB_URL.startsWith('mongodb://') && !MONGODB_URL.startsWith('mongodb+srv://')) {
            throw new Error('Invalid MongoDB URL format. Must start with mongodb:// or mongodb+srv://');
        }

        const connectionString = `${MONGODB_URL}/${DB_NAME}`;
        console.log(`Attempting to connect to MongoDB: ${connectionString.replace(/\/\/.*@/, '//***:***@')}`);

        const connectionInstance = await mongoose.connect(MONGODB_URL, {
            dbName: DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB connected successfully!`);
        console.log(`📊 Database: ${DB_NAME}`);
        console.log(`🔗 Host: ${connectionInstance.connection.host}`);
        console.log(`📡 Port: ${connectionInstance.connection.port}`);

    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        console.error("💡 Please check your .env file and ensure MONGODB_URL is properly formatted");
        process.exit(1);
    }
}

module.exports = connectDB;