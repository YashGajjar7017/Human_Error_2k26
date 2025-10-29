const Classroom = require('../models/Classroom.model');
const UserSignUp = require('../models/User.model');

// Create new classroom
exports.createClassroom = async (req, res) => {
    try {
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

        res.status(200).json({
            success: true,
            classrooms
        });
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get classroom by ID
exports.getClassroomById = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findById(id)
            .populate('instructor', 'username email')
            .populate('students', 'username email');

        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        res.status(200).json({
            success: true,
            classroom
        });
    } catch (error) {
        console.error('Error fetching classroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update classroom
exports.updateClassroom = async (req, res) => {
    try {
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

// Delete classroom
exports.deleteClassroom = async (req, res) => {
    try {
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

// Add student to classroom
exports.addStudentToClassroom = async (req, res) => {
    try {
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

// Remove student from classroom
exports.removeStudentFromClassroom = async (req, res) => {
    try {
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

// Original classID function (keeping for backward compatibility)
exports.classID = (req, res, next) => {
    console.log('hello classworker');
    res.status(200).json({ message: 'Classroom API is working' });
};
