const mongoose = require('mongoose');

const bungaAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  results: {
    // Ripeness: "Ripe", "Unripe", "Rotten"
    ripeness: {
      type: String,
      enum: ['Ripe', 'Unripe', 'Rotten'],
      required: true
    },
    ripeness_percentage: {
      type: Number,
      default: 0
    },

    // Health Class: "a", "b", "c", "d"
    health_class: {
      type: String,
      enum: ['a', 'b', 'c', 'd', null],
      default: null
    },
    health_percentage: {
      type: Number,
      default: 0
    },

    // Detection Confidence: 0-100
    confidence: {
      type: Number,
      default: 0
    },

    // Market Grade Calculation (Stored for easy reporting)
    market_grade: {
      type: String,
      enum: ['Premium', 'Standard', 'Commercial', 'Reject', 'Unknown'],
      default: 'Unknown'
    }
  },
  processingTime: {
    type: Number, // in ms
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BungaAnalysis', bungaAnalysisSchema);
