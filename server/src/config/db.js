const mongoose = require('mongoose');
const net = require('net');

const checkPort = (port, host) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.once('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.once('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.once('error', () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, host);
    });
};

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/simplybe';

        if (process.env.NODE_ENV === 'development' && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
            const isLocalMongoRunning = await checkPort(27017, '127.0.0.1');
            if (!isLocalMongoRunning) {
                console.log('Local MongoDB not running on port 27017. Starting mongodb-memory-server...');
                try {
                    const { MongoMemoryServer } = require('mongodb-memory-server');
                    const mongoServer = await MongoMemoryServer.create({
                        binary: {
                            version: '6.0.14'
                        }
                    });
                    mongoUri = mongoServer.getUri();
                    console.log(`In-memory MongoDB started at: ${mongoUri}`);
                    process.env.MONGO_URI = mongoUri; // update env for seeding/other scripts
                } catch (memErr) {
                    console.error('Failed to start mongodb-memory-server:', memErr.message);
                }
            }
        }

               const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Seed initial data
        const seedData = require('../utils/seeder');
        await seedData();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
