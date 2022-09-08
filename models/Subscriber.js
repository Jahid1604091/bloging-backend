
const mongoose = require('mongoose');
const subsSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = Subscriber = mongoose.model('Subscriber',subsSchema);