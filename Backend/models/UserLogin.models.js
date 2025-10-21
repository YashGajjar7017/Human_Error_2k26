const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// User schema
const userLogin = new mongoose.Schema(
  {
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
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    refreshToken: {
      type: String
    },
    lastLogin: {
      type: Date,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Find user from DB
userLogin.methods.Find = function(data){
  return userLogin.find(data);
}

// making custom user method 
userLogin.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}

// generate access Token
userLogin.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      email: this.email,
      username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
};

// generate refresh token
userLogin.methods.generateRefreshToken = function () {
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

// Hash the password before saving it
userLogin.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare the password
userLogin.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Login = mongoose.model('userLogin', userLogin);
module.exports = Login;