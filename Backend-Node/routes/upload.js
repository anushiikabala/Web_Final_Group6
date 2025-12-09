const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Report = require('../models/Report');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Sanitize filename and keep original name
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, sanitized);
  }
});

// File filter for PDF/images
const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @swagger
 * /upload-report:
 *   post:
 *     summary: Upload a lab report file
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - email
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF or image file to upload
 *               email:
 *                 type: string
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Upload successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report_id:
 *                   type: string
 *                 ai_summary:
 *                   type: object
 *                 testResults:
 *                   type: array
 *       400:
 *         description: No file uploaded or email missing
 */
router.post('/upload-report', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userEmail = req.body.email;
    if (!userEmail) {
      return res.status(400).json({ error: 'Email missing' });
    }

    const originalName = req.file.filename;
    const savedPath = req.file.path;
    const fileId = uuidv4();

    // Call Python AI microservice
    let aiSummary = {};
    let testResults = [];
    let embeddingPath = '';

    try {
      const aiResponse = await axios.post(process.env.AI_SERVICE_URL || 'http://localhost:5001/analyze', {
        file_path: path.resolve(savedPath)
      }, {
        timeout: 60000 // 60 second timeout for AI processing
      });

      aiSummary = aiResponse.data.ai_summary || {};
      testResults = aiResponse.data.testResults || [];
      embeddingPath = aiResponse.data.embedding_path || '';
    } catch (aiError) {
      console.error('AI service error:', aiError.message);
      // Continue without AI analysis if service is unavailable
      aiSummary = { severity: 'low', summary: 'AI analysis unavailable' };
    }

    // Create report document
    const reportDoc = {
      file_id: fileId,
      user_email: userEmail,
      file_name: originalName,
      file_path: savedPath,
      embedding_path: embeddingPath,
      ai_summary: aiSummary,
      testResults: testResults,
      uploaded_at: new Date().toISOString()
    };

    await Report.create(reportDoc);

    res.status(200).json({
      message: 'Upload Successful',
      report_id: fileId,
      ai_summary: aiSummary,
      testResults: testResults
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports for a user (summary view)
 *     tags: [Upload]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email address
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *       400:
 *         description: Email query param required
 */
router.get('/reports', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email query param required' });
    }

    const docs = await Report.find(
      { user_email: email },
      { file_id: 1, file_name: 1, uploaded_at: 1, 'ai_summary.severity': 1, _id: 0 }
    );

    res.status(200).json({ reports: docs });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error fetching reports' });
  }
});

/**
 * @swagger
 * /report/{report_id}:
 *   get:
 *     summary: Get a single report by ID
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report file ID
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *       404:
 *         description: Report not found
 */
router.get('/report/:report_id', async (req, res) => {
  try {
    const { report_id } = req.params;

    const doc = await Report.findOne(
      { file_id: report_id },
      { _id: 0 }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json(doc);
  } catch (error) {
    console.error('Get single report error:', error);
    res.status(500).json({ error: 'Server error fetching report' });
  }
});

/**
 * @swagger
 * /delete-report/{file_id}:
 *   delete:
 *     summary: Delete a report by file ID
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report file ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 */
router.delete('/delete-report/:file_id', async (req, res) => {
  try {
    const { file_id } = req.params;

    const deleted = await Report.deleteOne({ file_id });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Server error deleting report' });
  }
});

/**
 * @swagger
 * /all-reports:
 *   get:
 *     summary: Get all reports for a user (full details)
 *     tags: [Upload]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email address
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
router.get('/all-reports', async (req, res) => {
  try {
    const { email } = req.query;

    const docs = await Report.find(
      { user_email: email },
      { _id: 0 }
    );

    res.status(200).json({ reports: docs });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ error: 'Server error fetching reports' });
  }
});

module.exports = router;
