const mongoose = require('mongoose');

const ServicesSchema = new mongoose.Schema({
    Services:{
        type:String,
    },
    premium:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        default: 1
    },
    language:{
        type:String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSignUp'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Service', ServicesSchema);
