const express = require('express');
const classroom = require('../controller/classroom.controller')

// express
const app = express.Router();

app.get('/classroom', classroom.classID)
app.get('/classroom/:classroom', classroom.classroom)
app.get('/classroom/classValidation/:classroom', classroom.classroomVerify);
app.get('/classroom/classID/:classID', classroom.Class);

module.exports = app;