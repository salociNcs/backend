const mongoose = require('mongoose');

const VotesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    watchDataId: {
        type: String,
        ref: 'WatchData',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    poolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pool',
        required: true
    },
    voted: {
        type: Boolean,
        required: true
    },
    liked: {
        type: Boolean,
        required: true
    },

});

const Votes = mongoose.model('Votes', VotesSchema);

module.exports = Votes;
