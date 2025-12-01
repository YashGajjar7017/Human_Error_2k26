const Classroom = require('../models/Classroom.model');
const UserSignUp = require('../models/User.model');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generate unique share code
function generateShareCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Generate classroom access token
function generateClassroomToken(classroomId, userId, role) {
    return jwt.sign(
        {
            classroomId: classroomId,
            userId: userId,
            role: role,
            type: 'classroom'
        },
        process.env.CLASSROOM_TOKEN_SECRET || process.env.JWT_SECRET,
        {
            expiresIn: process.env.CLASSROOM_TOKEN_EXPIRY || '24h'
        }
    );
}

// Create new classroom (admin only)
exports.createClassroom = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create classrooms' });
        }
        const { name, description, instructor, capacity } = req.body;
        if (!name || !instructor) {
            return res.status(400).json({ error: 'Classroom name and instructor are required' });
        }
        const classroom = new Classroom({
            name,
            description,
            instructor,
            capacity: capacity || 30,
            students: []
        });
        await classroom.save();
        res.status(201).json({
            success: true,
            message: 'Classroom created successfully',
            classroom
        });
    } catch (error) {
        console.error('Error creating classroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all classrooms
exports.getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find()
            .populate('instructor', 'username email')
            .populate('students', 'username email');

        // If user is authenticated, add user role information to each classroom
        if (req.user) {
            const classroomsWithRoles = classrooms.map(classroom => {
                const classroomObj = classroom.toObject();
                const isInstructor = classroom.instructor._id.toString() === req.user._id.toString();
                const isStudent = classroom.students.some(student => student._id.toString() === req.user._id.toString());

                classroomObj.userRole = isInstructor ? 'instructor' : (isStudent ? 'student' : null);
                return classroomObj;
            });

            res.status(200).json({
                success: true,
                classrooms: classroomsWithRoles,
                user: {
                    id: req.user._id,
                    username: req.user.username,
                    email: req.user.email,
                    role: req.user.role
                }
            });
        } else {
            res.status(200).json({
                success: true,
                classrooms,
                user: null
            });
        }
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get classroom by ID (always include shareCode)
exports.getClassroomById = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findById(id)
            .populate('instructor', 'username email')
            .populate('students', 'username email');

        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        // Ensure shareCode is present in response
        const classroomObj = classroom.toObject();
        if (!classroomObj.shareCode && classroom.shareCode) {
            classroomObj.shareCode = classroom.shareCode;
        }

        // If user is authenticated, include their role in the classroom
        if (req.user) {
            const isInstructor = classroom.instructor._id.toString() === req.user._id.toString();
            const isStudent = classroom.students.some(student => student._id.toString() === req.user._id.toString());

            classroomObj.userRole = isInstructor ? 'instructor' : (isStudent ? 'student' : null);

            res.status(200).json({
                success: true,
                classroom: classroomObj,
                user: {
                    id: req.user._id,
                    username: req.user.username,
                    email: req.user.email,
                    role: req.user.role
                }
            });
        } else {
            classroomObj.userRole = null;
            res.status(200).json({
                success: true,
                classroom: classroomObj,
                user: null
            });
        }
    } catch (error) {
        console.error('Error fetching classroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update classroom (admin only)
exports.updateClassroom = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update classrooms' });
        }
        const { id } = req.params;
        const { name, description, capacity } = req.body;
        const classroom = await Classroom.findByIdAndUpdate(
            id,
            { name, description, capacity },
            { new: true, runValidators: true }
        ).populate('instructor', 'username email')
         .populate('students', 'username email');
        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Classroom updated successfully',
            classroom
        });
    } catch (error) {
        console.error('Error updating classroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete classroom (admin only)
exports.deleteClassroom = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete classrooms' });
        }
        const { id } = req.params;
        const classroom = await Classroom.findByIdAndDelete(id);
        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Classroom deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add student to classroom (admin only)
exports.addStudentToClassroom = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can add students' });
        }
        const { classroomId, studentId } = req.body;
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }
        const student = await UserSignUp.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        if (classroom.students.includes(studentId)) {
            return res.status(400).json({ error: 'Student already enrolled in this classroom' });
        }
        if (classroom.students.length >= classroom.capacity) {
            return res.status(400).json({ error: 'Classroom is full' });
        }
        classroom.students.push(studentId);
        await classroom.save();
        res.status(200).json({
            success: true,
            message: 'Student added to classroom successfully',
            classroom
        });
    } catch (error) {
        console.error('Error adding student to classroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Remove student from classroom (admin only)
exports.removeStudentFromClassroom = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can remove students' });
        }
        const { classroomId, studentId } = req.body;
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }
        classroom.students = classroom.students.filter(
            student => student.toString() !== studentId
        );
        await classroom.save();
        res.status(200).json({
            success: true,
            message: 'Student removed from classroom successfully',
            classroom
        });
    } catch (error) {
        console.error('Error removing student from classroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get classrooms for a specific instructor
exports.getInstructorClassrooms = async (req, res) => {
    try {
        const { instructorId } = req.params;

        const classrooms = await Classroom.find({ instructor: instructorId })
            .populate('instructor', 'username email')
            .populate('students', 'username email');

        res.status(200).json({
            success: true,
            classrooms
        });
    } catch (error) {
        console.error('Error fetching instructor classrooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get student's classrooms
exports.getStudentClassrooms = async (req, res) => {
    try {
        const { studentId } = req.params;

        const classrooms = await Classroom.find({ students: studentId })
            .populate('instructor', 'username email')
            .populate('students', 'username email');

        res.status(200).json({
            success: true,
            classrooms
        });
    } catch (error) {
        console.error('Error fetching student classrooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get share link for classroom
exports.getShareLink = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findById(id);
        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        const shareUrl = `${req.protocol}://${req.get('host')}/classroom/join/${classroom.shareCode}`;

        res.status(200).json({
            success: true,
            shareUrl,
            shareCode: classroom.shareCode
        });
    } catch (error) {
        console.error('Error getting share link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Join classroom by share code (public, userId optional)
exports.joinClassroom = async (req, res) => {
    try {
        const { code } = req.params;
        let userId = null;
        let userInfo = null;

        if (req.user && (req.user.id || req.user._id)) {
            userId = req.user.id || req.user._id;
            userInfo = {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
            };
        } else if (req.body && req.body.userId) {
            userId = req.body.userId;
            // Try to fetch user info if userId is provided in body
            try {
                const user = await UserSignUp.findById(userId);
                if (user) {
                    userInfo = {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    };
                }
            } catch (userError) {
                console.warn('Could not fetch user info for userId:', userId);
            }
        }

        const classroom = await Classroom.findOne({ shareCode: code })
            .populate('instructor', 'username email')
            .populate('students', 'username email');

        if (!classroom) {
            return res.status(404).json({ error: 'Invalid share code' });
        }

        // If userId is provided, add to students
        let joined = false;
        if (userId) {
            if (classroom.students.some(student => student._id.toString() === userId.toString())) {
                // User is already a student, just return success
                joined = true;
            } else if (classroom.students.length >= classroom.capacity) {
                return res.status(400).json({ error: 'Classroom is full' });
            } else {
                classroom.students.push(userId);
                await classroom.save();
                joined = true;
            }
        }

        // Generate classroom access token
        let classroomToken = null;
        let userRole = null;
        if (userId) {
            try {
                const role = classroom.instructor._id.toString() === userId.toString() ? 'instructor' : 'student';
                userRole = role;
                classroomToken = generateClassroomToken(classroom._id, userId, role);
                console.log('Classroom token generated for user:', userId, 'role:', role);
            } catch (tokenError) {
                console.error('Failed to generate classroom token:', tokenError);
                // Return error if token generation fails
                return res.status(500).json({
                    error: 'Failed to generate access token',
                    details: 'Token generation failed'
                });
            }
        }

        // Ensure shareCode is present in response
        const classroomObj = classroom.toObject();
        if (!classroomObj.shareCode && classroom.shareCode) {
            classroomObj.shareCode = classroom.shareCode;
        }

        // Add user role to classroom object
        classroomObj.userRole = userRole;

        const response = {
            success: true,
            message: userId ? (joined ? 'Successfully joined the classroom' : 'Already a member of this classroom') : 'Classroom found',
            classroomId: classroom._id,
            classroom: classroomObj,
            classroomToken: classroomToken,
            user: userInfo
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error joining classroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Original classID function (keeping for backward compatibility)
exports.classID = (req, res, next) => {
    console.log('hello classworker');
    res.status(200).json({ message: 'Classroom API is working' });
};
