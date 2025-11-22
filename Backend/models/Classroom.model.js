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

// Generate share code before saving if not present
classroomSchema.pre('save', async function(next) {
    this.updatedAt = Date.now();
    if (!this.shareCode) {
        const generateShareCode = () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return code;
        };

        let code;
        let exists;
        do {
            code = generateShareCode();
            exists = await mongoose.models.Classroom.findOne({ shareCode: code });
        } while (exists);

        this.shareCode = code;
    }
    next();
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
