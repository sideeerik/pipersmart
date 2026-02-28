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
    // e.g., "Class A-a"
    full_class: {
      type: String,
      required: true
    },

    // Market Grade Calculation (Stored for easy reporting)
    market_grade: {
      type: String,
      enum: ['Premium', 'Standard', 'Commercial', 'Reject', 'Unknown'],
      default: 'Unknown'
    },

    // Ripeness (A-D)
    ripeness: {
      grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'Rotten', 'Unknown']
      }, // Big Letter
      percentage: Number, // 0-100
      confidence: Number // 0-100
    },

    // Health (a-d)
    health: {
      grade: {
        type: String,
        enum: ['a', 'b', 'c', 'd', null]
      }, // Small Letter
      percentage: Number // 0-100
    },

    // Raw Detections
    detections: [{
      class: String,
      confidence: Number,
      bbox: [Number] // [x1, y1, x2, y2]
    }],
    
    other_objects: [{
      class: String,
      confidence: Number
    }]
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
