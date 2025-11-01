const express = require('express');
const signUpController = require('../controller/signup.controller');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());

// express.json import
router.use(express.json());

// SignUP handler - aligned with backend routes
router.get('/Signup', signUpController.SignUpToken);
router.get('/Signup/:SignUpToken', signUpController.signUp);
router.post('/Signup', signUpController.postSignUp);
router.post('/Signup/Verify/:SignUpToken')

// OTP Handler - aligned with backend routes
router.get('/sendOTP', signUpController.OTP);
router.post('/verifyOTP', signUpController.PostOTP);

module.exports = router;
