const mongoose = require('mongoose');

const poolSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // type: {
    //     type: String,
    //     required: true
    // },
    label: {
        type: String,
        required: false,
        default: "Neuer Pool"
    }
});

const Pool = mongoose.model('Pool', poolSchema);

module.exports = Pool;
