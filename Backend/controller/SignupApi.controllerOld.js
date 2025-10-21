const axios = require('axios');
const SignUPModel = require('../models/UserSignUp.models');
const querySearch = require('qs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const queryString = require('querystring');
const fs = require('fs')

// User Profile for Signup to export
var userProfile = {
    'username': null,
    'password': null,
    'hashedPassword': null,
    'confirmPassword': null,
    'hashedConfirmPassword': null,
    'email': null,
    'statusCode': 200,
    'premium': false,
    'authentication': false,
    'token': null,
    'OTP': null
};

// Number Generator
function NumberGenerator(length) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);  // Random number between 0 and 9
    }
    return otp;
};

// encrypt Password
async function PasswordEncrypt(password, round) {
    bcrypt.hash(password, round, function (err, hashedPassword) {
        if (err) {
            userProfile['hashedPassword'] = null;
            console.error('Error hashing password', err);
        }
        else {
            userProfile['hashedPassword'] = hashedPassword;
            console.log('hashed password', hashedPassword);
        }
    })
}

// Decrypt Password
async function PasswordDecrypt(password, HashedPassword) {
    bcrypt.compare(password, HashedPassword, function (err, isMatch) {
        if (err) {
            console.error('Error comparing password', err);
        }
        else if (isMatch) {
            return userProfile['authentication'] = true;
        }
        else {
            console.log('password does not match');
            userProfile['authentication', 'statusCode'] = false, 404;
        }
    })
}

// Send Mail
function sendMail(Email, DATA) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        port: 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: Email,
        subject: 'Your OTP',
        text: `Your OTP is: ${userProfile['OTP']} - ${DATA} \n This data is very confidential, So, Don't share this OTP your 
        releative or frineds `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Singup Handler
exports.signUP = async (req, res, next) => {
    let body = req.body;
    console.log(body);

    if (body.username && body.email && body.password && body.confirmPassword) {
        userProfile['username'] = body.username;
        userProfile['email'] = body.email;
        userProfile['password'] = body.password;
        userProfile['confirmPassword'] = body.confirmPassword;
        userProfile['hashedPassword'] = await PasswordEncrypt(body.password, 10);

        console.log(userProfile);
        try {
            SignUPModel.create({
                username: userProfile['username'],
                email: userProfile['email'],
                password: userProfile['password'],
                confirmPassword: userProfile['confirmPassword']
            })
                .then(() => console.log('User data saved!'))
                .catch((error) => console.error('Error:', error));
        } catch (err) {
            console.error('Error:', err);
            return res.status(500).json({ err: "Database save failed" });
        }
        // return res.status(200).json(userProfile['username']);
        return res.status(200).json({ message: "User registered", username: userProfile.username });
    }
    else {
        res.send('your Data is not matched or duplicate data found');
        // return res.status(404).send('your Data is not matched or duplicate data found');
    }
    // res.json('we are sending data to server').status(200)

    // writing a file
    // fs.writeFile('./temp/user.json', userProfile, (err) => {
    //     if (err) throw err;
    //     console.log("File written successfully");
    // });
};

// Sending OTP to Email
exports.sendOtp = (req, res, next) => {
    const Genotp = NumberGenerator(6);
    userProfile['OTP'] = Genotp;
    console.log(Genotp);

    // Sending Mail
    // sendMail(userProfile['email'], 'Valid only for 10 mins.');
    sendMail('yashgajjar2222@gmail', 'Valid only for 10 mins.');
    res.status(200).json({ success: true, OTP: Genotp });
};

// Verify OTP from incomming
exports.verifyOtp = (req, res, next) => {
    const data = req.body;
    console.log(data);

    // res.json(data);
    if (userProfile['OTP'] === data.OTPvar) {
        console.log('your OTP was correct');
        // res.redirect('/complier')
        return res.status(200).json({ success: true, message: 'OTP verified' });
        // return true
    } else if (!userProfile['OTP']) {
        return res.status(200).json({ success: 'maybe', message: 'OTP maybe verified' });
    } else {
        console.log('your OTP was wrong');
        // res.redirect('/404/OTP=Null');
        console.log('Invalid OTP');
        return res.status(500).json({ success: false, message: 'Invalid OTP' });
        // return false
    }
};