const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken");

const isValid = function(value){
  if(typeof value === 'undefined'|| value ===  null) return false
  if(typeof value=== 'string' && value.trim().length ===0) return false
  return true;
}

const isValidTitle=  function (title){
  return[ 'Mr','Mrs','Miss'].indexOf(title) !== -1
}
const isValidRequestBody= function (requestBody){
  return Object.keys(requestBody).length>0
}


const registerAuthor = async function (req, res) {
    try {
        var requestBody = req.body
        if(!isValidRequestBody(requestBody)){
          res.status(400).send({status:false,message:'invalid request parameter. Please provide author details'})
          return
        }
//// extract params
const {fname,lname,title,email,password}= requestBody;  // object destructing

// validation starts
if(!isValid(fname)) {
  res.status(400).send({status:false, message:'first name is required'})
  return
}

if(!isValid(lname)) {
  res.status(400).send({status:false, message:'last name is required'})
  return
}

if(!isValid(title)) {
  res.status(400).send({status:false, message:'title is required'})
  return
}

if(!isValidTitle(title)) {
  res.status(400).send({status:false, message:'title should be among Mr,Mrs,Miss'})
  return
}

if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
  res.status(400).send({status:false, message:'email should be a valid email address'})
  return
}


if(!isValid(password)) {
  res.status(400).send({status:false, message:'password is required'})
  return
}


const isEmailAlreadyUsed= await  authorModel.findOne({email});

if(isEmailAlreadyUsed){
  res.status(400).send({status:false, message:`${email} email is already registered`})
  return
}


// validation ends

const authorData = {fname, lname,title,email,password}
const newAuthor =  await authorModel.create(authorData);

res.status(201).send({status:true, message:'author created successfully', data:newAuthor});

    } catch (error) {
        res.status(500).send({ status: "failed", message: error.message })
    }
  }

//login author(phase 2)

const loginAuthor = async function (req, res) {
  try{
    const requestBody = req.body;
    if(!isValidRequestBody(requestBody)) {
      res.status(400).send({status:false, message:'invalid request parameter. Please provide author details'})
      return
    }

    // extract params
    const {email , password } = requestBody;

    // validation starts

    if(!isValid(email)) {
      res.status(400).send({status:false, message:'email is required'})
      return
    }
    if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
      res.status(400).send({status:false, message:'email should be a valid email address'})
      return
    }

    if(!isValid(password)) {
      res.status(400).send({status:false, message:'password is required'})
      return
    }


    // validation ends

    const author =  await authorModel.findOne({email,password});

    if(!author) {
      res.status(401).send({status:false, message: 'Invalid login credentials'})
      return
    }

    

      // Once the login is successful, create the jwt token with sign function
// Sign function has 2 inputs:
// Input 1 is the payload or the object containing data to be set in token
// The decision about what data to put in token depends on the business requirement
// Input 2 is the secret
// The same secret will be used to decode tokens

    const token = jwt.sign(
      {
        authorId: author._id,
        iat : Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() /1000) +10*60*60
      }, 'hiimyprivatekeyisverysecuredbecauseitiscreatedbymesagarsolanki0123')

    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true,message:'Author login successfully', data: {token}});
  }
  catch (err) {
    console.log(err)
    res.status(500).send({ status: "failed", message: err.message })
}
  
};




module.exports.registerAuthor = registerAuthor
module.exports.loginAuthor = loginAuthor