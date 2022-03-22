const jwt = require("jsonwebtoken");



//authentication
const  middle1= async function (req, res, next){
  try{
   let token =req.headers["x-api-key"];
   if (!token){
         res.status(403).send({status:false, msg:"token not avilable(authentication)"})
      reture;
    }  
    console.log(token)
    
    let decodedToken = await jwt.verify(token, "hiimyprivatekeyisverysecuredbecauseitiscreatedbymesagarsolanki0123");
    if (!decodedToken){
       res.status(400).send({ status: false, msg: "token is invalid" });
      }
    
    req.authorId=decodedToken.authorId;  
     
    next()
  }
  catch(error){
  console.log(error)
  res.status(500).send({status:false, msg:error})
  }
}


module.exports.middle1=middle1


