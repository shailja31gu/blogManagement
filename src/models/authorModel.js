const mongoose = require('mongoose')
const validator = require('validator');

const authorSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: 'First name is required',
        trim:true
    },
    lname: {
        type: String,
        requried: 'Last name is required',
        trim:true
    },
    title: {
        type:String,
        enum: ['Mr', 'Mrs', 'Miss'],
        requried: 'title  is required',
    },
    email: {
        type:String,
        requried:  'Email address  is required',
        unique: true,
        trim: true,
        lowercase:true,
        validate:{
            validator:function(email){
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        },
            msg:'Please fill a valid email address', isAsync:false
        } 
    },
      
    password: {
        type: String,
        required: 'password is required',
        trim:true
        
    }

}, { timestamps: true })
module.exports = mongoose.model('Author', authorSchema, 'authors')
