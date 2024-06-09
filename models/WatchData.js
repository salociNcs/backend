const mongoose = require('mongoose');

const watchDataSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    isFetched: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    poster: {
        type: String,
        required: false
    }
});

const WatchData = mongoose.model('WatchData', watchDataSchema);

module.exports = WatchData;
