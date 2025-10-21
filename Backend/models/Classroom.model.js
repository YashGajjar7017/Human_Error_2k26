const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Classroom name is required'],
        trim: true,
        maxlength: [100, 'Classroom name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSignUp',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSignUp'
    }],
    capacity: {
        type: Number,
        required: true,
        min: [1, 'Capacity must be at least 1'],
        max: [100, 'Capacity cannot exceed 100']
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

// Update the updatedAt field before saving
classroomSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
