const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Schema - user SignUP
const userSignUp = new mongoose.Schema({
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
        unique: true
    },
    password: {
        type: String,
        unique: false,
        required: true
    },
    confirmPassword: {
        type: String,
        unique: false,
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
},
    {
        timestamps: true
    });

// Pre-Hook (middleware):
userSignUp.pre("save", async function (next) {
    // to check if modiefied or not
    if (!this.isModified("password")) { return next() }

    this.password = await bcrypt.hash(this.password, 10);
    // Don't store confirmPassword in database - it's just for validation
    this.confirmPassword = undefined;
    next()
});

// making custom user method 
userSignUp.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// generate access Token
userSignUp.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};

// generate refresh token
userSignUp.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

const SignUP = mongoose.model('userSignUp', userSignUp);
module.exports = SignUP;