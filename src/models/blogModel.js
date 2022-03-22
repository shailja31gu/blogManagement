const mongoose = require('mongoose')
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: "blog title is required",
        trim:true
    },
    body: {
        type: String,
        required: 'blog body is required',
        trim:true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required:'blog author is required'
    },
    tags: [{type:String, trim:true}],
    category: {
        type: String,
        required: 'blog category is required',
        trim:true
    },
    subCategory: [{type:String, trim:true}],

    deletedAt: { 
        type: Date,
    default:null
 },
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: { 
        type: Date,
    default : null
 },
    isPublished: {
        type: Boolean,
        default: false
    }



}, { timestamps: true })
module.exports = mongoose.model('Blog', blogSchema)