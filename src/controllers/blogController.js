const mongoose= require('mongoose')
const ObjectId= mongoose.Types.ObjectId
let blogModel = require('../models/blogModel');
let authorModel = require('../models/authorModel');


const isValid = function(value){
    if(typeof value === 'undefined'|| value ===  null) return false
    if(typeof value=== 'string' && value.trim().length ===0) return false
    return true;
  }
  
  const isValidObjectId = function(ObjectId){
      return mongoose.Types.ObjectId.isValid(ObjectId)
  }

  const isValidRequestBody= function (requestBody){
    return Object.keys(requestBody).length>0
  }
  


let createBlog = async function (req, res) {

    try {
        const requestBody = req.body;
        if(!isValidRequestBody(requestBody)){
            res.status(400).send({status:false,message:'invalid request parameter. Please provide blog details'})
            return
          }

          // validation params
          
        const { title, body, authorId, tags, category,subCategory,isPublished } = requestBody;

        //validation starts

        if(!isValid(title)) {
            res.status(400).send({status:false, message:'blog title is required'})
            return
          }
          
          if(!isValid(body)) {
            res.status(400).send({status:false, message:'blog body is required'})
            return
          }
          
          if(!isValid(authorId)) {
            res.status(400).send({status:false, message:'author id is required'})
            return
          }

          if(!isValidObjectId(authorId)) {
            res.status(400).send({status:false, message:'${authorId} is not a valid author id '})
            return
          }

          if(!isValid(category)) {
            res.status(400).send({status:false, message:'category is required'})
            return
          }
            //// validation ends

            const blogData= {
                title,
                body,
                authorId,
                category,
                isPublished: isPublished? isPublished: false,
                publishedAt : isPublished ? new Date() : null
            }

            if(tags){
                if(Array.isArray(tags)) {
                    blogData['tags'] = [...tags]
                }
                if(Object.prototype.toString.call(tags)=== "[object string]") {
                    blogData['tags'] = [tags]
                }
            }

            if(subCategory){
                if(Array.isArray(subCategory)) {
                    blogData['subCategory'] = [...subCategory]
                }
                if(Object.prototype.toString.call(subCategory)=== "[object string]") {
                    blogData['subCategory'] = [subCategory]
                }
            }    

        const newBlog = await blogModel.create(blogData)
        res.status(201).send({status:true,message: 'new blog created successfully', data:newBlog})
          }  catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

};


const listBlog = async function (req, res) {

    try {

        const filterQuery = {isDeleted:false, deletedAt:null,isPublished:true}
        const queryParams = req.query

        if(isValidRequestBody(queryParams))  {
            const {authorId,category,tags,subCategory} = queryParams

            if(isValid(authorId) && isValidObjectId(authorId)) {
                filterQuery['authorId'] = authorId
            }

            if(isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if(isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery['tags'] = {$all: tagsArr}
            }

            if(isValid(subCategory)){
                const subcatArr = subCategory.trim().split(',').map(subcat.trim());
                filterQuery['subCategory'] = {$all: subcatArr}
            }
        }

        const blogs = await blogModel.find(filterQuery)

        if(Array.isArray(blogs)&&blogs.length===0) {
            res.status(404).send({status:false,message: "no such blog found"})
            return
        }
        res.status(200).send({status:true,message:'Blog List', data:blogs})

    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: "failed", message: err.message })
    }

}

const updateBlog = async function (req, res) {
    try{
            const requestBody = req.body
            const params = req.params
            const blogId = params.blogId
            const authorIdFromToken= req.authorId

            // validation starts
            if(!isValidObjectId(blogId)){
                res.status(400).send({status:false,message:`${blogId} is not a valid blog id`})
                return
            }
            if(!isValidObjectId(authorIdFromToken)){
                res.status(400).send({status:false,message:`${authorIdFromToken} is not a valid token id`})
                return
            }

            const blog = await blogModel.findOne({_id:blogId,isDeleted:false,deletedAt:null})

            if(!blog){
                res.status(404).send({status:false,message:'blog not found'})
                return
            }

            if(blog.authorId.toString() !== authorIdFromToken){
                res.status(401).send({status:false,message:'unauthorised access! owner info does not match'})
                return
            }
            if(!isValidRequestBody(requestBody)){
                res.status(200).send({status:true,message:'no parameter passed Blog unmodified',data:blog})
                return
            }

            /// extract params
            const {title,body,tags, category,subCategory,isPublished} = requestBody;
            const updateBlogData ={}

            if(isValid(title)) {
                if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set']={}
                updateBlogData['$set']['title']= title
            }


            if(isValid(body)) {
                if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set']={}
                updateBlogData['$set']['body']= body
            }

            if(isValid(category)) {
                if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set']={}
                updateBlogData['$set']['category']= category
            }


            if(isPublished !== undefined) {
                if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set']={}
                updateBlogData['$set']['isPublished']= isPublished
                updateBlogData['$set']['isPublishedAt']= isPublished ? new Date():null
            }


            if(tags) {
                if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet']={}
                
                if(Array.isArray(tags)){
                    updateBlogData['$addToSet']['tags'] = {$each: [...tags]}
                }
                if(typeof tags === "string") {
                    updateBlogData['addToSet']['tags'] =tags
                }
            }


            if(subCategory) {
                if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet']={}
                
                if(Array.isArray(subCategory)){
                    updateBlogData['$addToSet']['subCategory'] = {$each: [...subCategory]}
                }
                if(typeof subCategory === "string") {
                    updateBlogData['addToSet']['subCategory'] =subCategory
                }
            }



            const updatedBlog = await blogModel.findOneAndUpdate({_id:blogId}, updateBlogData, {new:true})
            res.status(200).send({status:true,message:'blog updated successfully', data: updatedBlog});


            }catch (err) {
        res.status(500).send({status: false, message: err.message })
    }
}


const deleteBlogByID = async function (req, res) {
    try {
        
        const blogId = req.params.blogId
        

        await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt:  Date.now() } })
        res.status(200).send({ status: true, message: "Blog deleted successfully" })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const deleteBlogByParams = async function (req, res) {
    try {
        //Delete blog documents by category, authorid, tag name, subcategory name, unpublished
        let { blogId, authorId, category, tags, subcategory, isPublished } = req.query
        if (!req.query) {
            return res.status(400).send({ status: false, msg: "bad request" })
        }

        // let multipleDeletes = await BlogModel.find({ $and: [{ isDeleted: false},{ authorId: authorId }, { $or: [{ blogId: blogId }, { category: category }, { tags: tags }, { subcategory: subcategory }, { isPublished: isPublished }] }] })
        let multipleDeletes = await blogModel.find({ $and: [{ isDeleted: false, authorId: authorId }, { $or: [{ authorId: authorId }, { blogId: blogId }, { category: category }, { tags: tags }, { subcategory: subcategory }, { isPublished: isPublished }] }] })
       
        if (multipleDeletes.length <= 0) {
    return res.status(404).send({ status: false, msg: "data not found" })
}
// let date = moment().format("YYYY-MM-DD[T]HH:mm:ss")

//console.log(multipleDeletes)
for (let i = 0; i < multipleDeletes.length; i++) {
    let blogId = multipleDeletes[i]._id

    const result = await blogModel.findByIdAndUpdate(blogId, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
    return res.status(200).send({status:true , blogdata:result })

}

} catch (error) {
    res.status(500).send({ msg: "Error", error: error.message })
}
}


module.exports.createBlog = createBlog;
module.exports.listBlog = listBlog;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlogByID = deleteBlogByID;
module.exports.deleteBlogByParams = deleteBlogByParams;