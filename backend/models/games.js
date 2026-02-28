const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    sport:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    place:{
        type: String,
        required: true
    },
    memberEmails: {
        type: [String],
        required: true
    },
    capacity:{
        type: Number,
        required:true
    },
    organizerEmail: {
        type: String,
        required: true
    }
}, { collection: 'schedules' });

module.exports = mongoose.model('Schedule', sportSchema);