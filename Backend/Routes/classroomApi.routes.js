const express = require('express');
const classroomController = require('../controller/classroomApi.controller');
const { auth, authorize, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Original routes (backward compatibility)
router.post('/api/Account/classroom', classroomController.classID);
router.post('/api/Account/classroom/:Token', classroomController.classID);

// RESTful classroom endpoints

// Classroom CRUD (admin only)
router.get('/api/classrooms', optionalAuth, classroomController.getAllClassrooms);
router.get('/api/classrooms/:id', optionalAuth, classroomController.getClassroomById);
router.post('/api/classrooms', auth, authorize('admin'), classroomController.createClassroom);
router.put('/api/classrooms/:id', auth, authorize('admin'), classroomController.updateClassroom);
router.delete('/api/classrooms/:id', auth, authorize('admin'), classroomController.deleteClassroom);

// Classroom member management (admin only)
router.post('/api/classrooms/add-student', auth, authorize('admin'), classroomController.addStudentToClassroom);
router.post('/api/classrooms/remove-student', auth, authorize('admin'), classroomController.removeStudentFromClassroom);

// User-specific classroom endpoints (require authentication for personalized data)
router.get('/api/classrooms/instructor/:instructorId', auth, classroomController.getInstructorClassrooms);
router.get('/api/classrooms/student/:studentId', auth, classroomController.getStudentClassrooms);

// Share and join endpoints (share link can be viewed without auth, joining works with or without auth)
router.get('/api/classrooms/:id/share', optionalAuth, classroomController.getShareLink);
router.post('/api/classrooms/join/:code', optionalAuth, classroomController.joinClassroom);

module.exports = router;
