const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

// Signup Schema for temporary signup data before verification
const signupSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Pre-save middleware for password hashing
signupSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    // Skip hashing if password is already hashed
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Instance methods
signupSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

signupSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Signup = mongoose.model('Signup', signupSchema);
module.exports = Signup;
