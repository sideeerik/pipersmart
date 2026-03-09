const mongoose = require('mongoose');

const connectDatabase = async () => {
    if (!process.env.DB_URI) {
        throw new Error('DB_URI is not set');
    }

    const connection = await mongoose.connect(process.env.DB_URI);
    console.log(`MongoDB Database connected with HOST: ${connection.connection.host}`);
    return connection;
}

module.exports = connectDatabase
