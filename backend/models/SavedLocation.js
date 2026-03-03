const mongoose = require('mongoose');

const savedLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Farm/Location Details
  farm: {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: [true, 'Farm name is required']
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    address: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      default: ''
    }
  },

  // User's Custom Data
  userNotes: {
    type: String,
    default: '',
    maxLength: [500, 'Notes cannot exceed 500 characters']
  },

  tags: {
    type: [String],
    default: []
  },

  isFavorite: {
    type: Boolean,
    default: false,
    index: true
  },

  visitCount: {
    type: Number,
    default: 0
  },

  lastVisited: {
    type: Date,
    default: null
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },

  // Accessibility rating (1-5 how easy to reach)
  accessibilityRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },

  // Timestamps
  savedAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for quick queries
savedLocationSchema.index({ userId: 1, createdAt: -1 });
savedLocationSchema.index({ userId: 1, isFavorite: -1 });

// Update timestamps before saving
savedLocationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SavedLocation', savedLocationSchema);
