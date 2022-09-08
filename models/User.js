const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fname:{
        type:String,
        required:true,
        max:20,
        lowercase:true
    },
    lname:{
        type:String,
        required:true,
        max:20,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    avatar:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports =  User = mongoose.model('User',userSchema);