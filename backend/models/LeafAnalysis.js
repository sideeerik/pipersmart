const mongoose = require('mongoose');

const leafAnalysisSchema = new mongoose.Schema({
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
    disease: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    detections: [{
      class: String,
      confidence: Number,
      bbox: [Number]
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

module.exports = mongoose.model('LeafAnalysis', leafAnalysisSchema);
