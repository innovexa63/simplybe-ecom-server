const mongoose = require('mongoose');

const homepageContentSchema = new mongoose.Schema({
    sectionKey: {
        type: String,
        required: true,
        unique: true,
        enum: ['hero', 'hotRightNow', 'promoCards', 'instagramGrid', 'announcement', 'socialLinks']
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('HomepageContent', homepageContentSchema);
