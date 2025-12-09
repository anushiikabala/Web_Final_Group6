const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testName: String,
  value: mongoose.Schema.Types.Mixed,
  unit: String,
  referenceRange: String,
  status: {
    type: String,
    enum: ['normal', 'abnormal', 'critical'],
    default: 'normal'
  }
}, { _id: false });

const aiSummarySchema = new mongoose.Schema({
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  summary: String,
  recommendations: [String],
  keyFindings: [String]
}, { _id: false });

const reportSchema = new mongoose.Schema({
  file_id: {
    type: String,
    required: true,
    unique: true
  },
  user_email: {
    type: String,
    required: true,
    index: true
  },
  file_name: {
    type: String,
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  embedding_path: {
    type: String,
    default: ''
  },
  ai_summary: {
    type: aiSummarySchema,
    default: {}
  },
  testResults: {
    type: [testResultSchema],
    default: []
  },
  uploaded_at: {
    type: String,
    default: () => new Date().toISOString()
  }
});

module.exports = mongoose.model('Report', reportSchema);
