const mongoose = require('mongoose');

const watchData2PoolSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    poolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pool',
        required: true
    },
    watchDataId: {
        type: String,
        ref: 'WatchData',
        required: true
    }
});

const WatchData2Pool = mongoose.model('WatchData2Pool', watchData2PoolSchema);

module.exports = WatchData2Pool;
