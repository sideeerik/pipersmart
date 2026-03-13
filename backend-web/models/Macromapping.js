const mongoose = require('mongoose');

const macromappingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please enter a location name'],
        maxLength: [100, 'Location name cannot exceed 100 characters']
    },
    displayName: {
        type: String,
        default: ''
    },
    locationDetails: {
        street: { type: String, default: '' },
        village: { type: String, default: '' },
        town: { type: String, default: '' },
        city: { type: String, default: '' },
        county: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        postalcode: { type: String, default: '' }
    },
    latitude: {
        type: Number,
        required: [true, 'Please enter latitude'],
        validate: {
            validator: function(v) {
                return v >= -90 && v <= 90;
            },
            message: 'Latitude must be between -90 and 90'
        }
    },
    longitude: {
        type: Number,
        required: [true, 'Please enter longitude'],
        validate: {
            validator: function(v) {
                return v >= -180 && v <= 180;
            },
            message: 'Longitude must be between -180 and 180'
        }
    },
    weather: {
        temp: { type: Number, default: 26 },
        humidity: { type: Number, default: 72 },
        rainProbability: { type: Number, default: 65 },
        windSpeed: { type: Number, default: 12 },
        condition: { type: String, default: 'Partly Cloudy' }
    },
    elevation: {
        type: Number,
        default: 100
    },
    annualRainfall: {
        type: Number,
        default: 2000
    },
    soilPH: {
        type: Number,
        default: 6.0,
        min: [0, 'Soil pH cannot be less than 0'],
        max: [14, 'Soil pH cannot be greater than 14']
    },
    score: {
        type: Number,
        required: [true, 'Please enter a suitability score'],
        min: [0, 'Score cannot be less than 0'],
        max: [100, 'Score cannot be greater than 100']
    },
    scoreFactors: {
        temperature: { type: Number, default: 0 },
        humidity: { type: Number, default: 0 },
        rainfall: { type: Number, default: 0 },
        elevation: { type: Number, default: 0 },
        soilPH: { type: Number, default: 0 },
        latitude: { type: Number, default: 0 }
    },
    rating: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Unsuitable'],
        required: [true, 'Please enter a rating']
    },
    recommendations: [
        {
            title: { type: String },
            message: { type: String },
            type: { type: String, enum: ['success', 'warning', 'danger'], default: 'warning' }
        }
    ],
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying by user and date
macromappingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Macromapping', macromappingSchema);

