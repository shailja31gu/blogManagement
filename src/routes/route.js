const express = require('express');
const router = express.Router();

//--------------------------------------------------
const authorController =require('../controllers/authorController')
const blogController = require ('../controllers/blogController')
const middleware=require("../middleware/tokenMiddleware")

//****************************************** */

//auther router

router.post("/Authors" ,authorController.registerAuthor )

router.post('/login',authorController.loginAuthor);

// BLOG ROUTER

router.post('/blogs', middleware.middle1, blogController.createBlog)

router.get('/getBlog', middleware.middle1, blogController.listBlog)

router.put('/blogs/:blogId',middleware.middle1, blogController.updateBlog)

router.delete('/blogs/:blogId', middleware.middle1, blogController.deleteBlogByID)

router.delete('/blogs', middleware.middle1, blogController.deleteBlogByParams)


module.exports = router;