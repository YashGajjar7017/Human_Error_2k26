const express = require('express');
const classroomController = require('../controller/classroomApi.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Original routes (backward compatibility)
router.post('/api/Account/classroom', classroomController.classID);
router.post('/api/Account/classroom/:Token', classroomController.classID);

// RESTful classroom endpoints
router.get('/api/classrooms', classroomController.getAllClassrooms);
router.get('/api/classrooms/:id', classroomController.getClassroomById);
router.post('/api/classrooms', classroomController.createClassroom);
router.put('/api/classrooms/:id', classroomController.updateClassroom);
router.delete('/api/classrooms/:id', classroomController.deleteClassroom);

// Classroom member management
router.post('/api/classrooms/add-student', classroomController.addStudentToClassroom);
router.post('/api/classrooms/remove-student', classroomController.removeStudentFromClassroom);

// User-specific classroom endpoints
router.get('/api/classrooms/instructor/:instructorId', classroomController.getInstructorClassrooms);
router.get('/api/classrooms/student/:studentId', classroomController.getStudentClassrooms);

// Share and join endpoints
router.get('/api/classrooms/:id/share', classroomController.getShareLink);
router.post('/api/classrooms/join/:code', authMiddleware, classroomController.joinClassroom);

module.exports = router;
