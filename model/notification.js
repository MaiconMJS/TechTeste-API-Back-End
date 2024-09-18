const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;