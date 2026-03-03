const mongoose = require('mongoose');

const connectDatabase = async () => {
    // Check if DB_URI is set FIRST
    if (!process.env.DB_URI) {
        console.error('❌ CRITICAL: DB_URI is not defined in environment variables');
        console.error('⚠️  Set DB_URI in Render environment variables and redeploy');
        process.exit(1);
    }

    let retries = 3;
    let connected = false;

    while (retries > 0 && !connected) {
        try {
            console.log(`🔄 Attempting to connect to MongoDB (Attempt ${4 - retries}/3)...`);
            console.log('📍 DB_URI:', process.env.DB_URI.substring(0, 30) + '...');

            await mongoose.connect(process.env.DB_URI, {
                serverSelectionTimeoutMS: 8000,
                socketTimeoutMS: 8000,
                connectTimeoutMS: 8000,
                retryWrites: false,
                maxPoolSize: 10,
                minPoolSize: 2
            });

            console.log(`✅ MongoDB connected successfully!`);
            console.log(`📊 Host: ${mongoose.connection.host}`);
            console.log(`📊 Database: ${mongoose.connection.db.getName()}`);
            connected = true;
            return true;

        } catch (error) {
            retries--;
            console.error(`❌ Connection attempt failed:`, error.message);
            
            if (retries > 0) {
                console.log(`⏳ Retrying in 2 seconds... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('❌ FATAL: Could not connect to MongoDB after 3 attempts');
                console.error('Possible causes:');
                console.error('  1. DB_URI is incorrect in Render environment variables');
                console.error('  2. MongoDB cluster is down or unreachable');
                console.error('  3. Network timeout - MongoDB Atlas may be blocking connections');
                process.exit(1);
            }
        }
    }
};

module.exports = connectDatabase;