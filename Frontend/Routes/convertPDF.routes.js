const jsPDF = require('jspdf');
const express = require('express');

const app = express.Router();

app.get('/pdf', (req, res, next) => {
    const PDFData = req.body;
    const doc = new jsPDF({
        data: PDFData,
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
    });

    doc.save('test');
});

module.exports = app;