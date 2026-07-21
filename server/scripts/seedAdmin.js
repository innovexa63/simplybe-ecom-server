/**
 * Seed Admin User
 * Run: node scripts/seedAdmin.js
 * Creates an admin account you can use to log into the dashboard
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/simplybe';

const adminData = {
    name: 'Sandreens Admin',
    email: 'admin@sandreens.com',
    password: 'Admin@1234',
    role: 'admin'
};

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');

        const existing = await User.findOne({ email: adminData.email });
        if (existing) {
            console.log(`✅ Admin already exists: ${adminData.email}`);
            console.log('   Delete existing record to re-seed.');
        } else {
            const admin = await User.create(adminData);
            console.log(`\n✅ Admin user created successfully!\n`);
            console.log(`   📧 Email:    ${adminData.email}`);
            console.log(`   🔑 Password: ${adminData.password}`);
            console.log(`   🌐 Login at: http://localhost:5174/login\n`);
        }
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seed();
