const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const OTPHandler = new mongoose.Schema({
    OTPCode: {
        type: String,
    },
    OTPToken: {
        type: String,
        required: true
    },
    status: {
        type: Number,
    },
    OTPEncypt: {
        type: String,
        MaxKey: 20,
        required: true
    },
    OTPDecrypt: {
        type: String,
        MaxKey: 20,
        required: true
    }
});

exports.OTPHandler = mongoose.model('OTP', OTPHandler);