const mongoose = require('mongoose');

const squadSchema = new mongoose.Schema({
    userId: {
        required: true,
        type: Number
    },
    faction: {
        required: true,
        type: String
    },
    name: {
        required: true,
        type: String,
    },
    pilots: {
        required: true,
        type: Array
    }
})

module.exports = mongoose.model('Squad', squadSchema)