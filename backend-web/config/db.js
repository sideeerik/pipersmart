const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        // Check if DB_URI is set
        if (!process.env.DB_URI) {
            throw new Error('❌ DB_URI is not defined in environment variables');
        }

        console.log('🔄 Attempting to connect to MongoDB...');
        console.log('📍 DB_URI:', process.env.DB_URI.substring(0, 30) + '...');

        await mongoose.connect(process.env.DB_URI, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout for connection
            socketTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            retryWrites: false
        });

        console.log(`✅ MongoDB connected with HOST: ${mongoose.connection.host}`);
        console.log(`📊 Database: ${mongoose.connection.name}`);
        return true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('Details:', error);
        
        // Exit process on connection failure
        process.exit(1);
    }
};

module.exports = connectDatabase;