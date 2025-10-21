const rootDir = require('../util/path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const users = [
    {
        id: 1,
        username: 'user1',
        password: '$2a$10$I1k7ygOd1pv3zQy3Bz9mO0R6qAZ8Vs35Irm6mkvq2NesocTBqzL6C' // hashed 'password123'
    }
];


// Dashboard
exports.Dashboard = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', '/Services/Dashboard.html'));
    // res.end()
};

// regeister user
exports.registerUser = (async (req, res,next) => {
    res.sendFile(path.join(rootDir, 'views', '/Services/UserProfile.ejs'))
});