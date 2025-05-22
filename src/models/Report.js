const mongoose = require('mongoose');

const DynamicFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'date', 'boolean', 'object', 'array'],
    default: 'string'
  }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['transaction', 'sale', 'lead', 'payment'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  dateRange: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filters: {
    type: Object,
    default: {}
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  summary: {
    type: Object,
    default: {}
  },
  dynamicFields: [DynamicFieldSchema],
  status: {
    type: String,
    enum: ['pending', 'completed', 'error'],
    default: 'pending'
  },
}, { timestamps: true });

// Indexes for faster querying
ReportSchema.index({ type: 1, createdAt: -1 });
ReportSchema.index({ createdBy: 1, createdAt: -1 });
ReportSchema.index({ 'dateRange.startDate': 1, 'dateRange.endDate': 1 });

module.exports = mongoose.model('Report', ReportSchema); 