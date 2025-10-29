const express = require('express');
const signUpController = require('../controller/signup.controller');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());

// express.json import
router.use(express.json());

// SignUP handler - aligned with backend routes
router.get('/Account/Signup', signUpController.SignUpToken);
router.get('/Account/Signup/:SignUpToken', signUpController.signUp);
router.post('/Account/Signup', signUpController.postSignUp);
router.post('/Account/Signup/Verify/:SignUpToken')

// OTP Handler - aligned with backend routes
router.get('/Account/sendOTP', signUpController.OTP);
router.post('/Account/verifyOTP', signUpController.PostOTP);

module.exports = router;
