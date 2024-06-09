const mongoose = require('mongoose');

const pool2UserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    poolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pool',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Pool2User = mongoose.model('Pool2User', pool2UserSchema);

module.exports = Pool2User;
