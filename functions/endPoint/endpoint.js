const {admin} = require('../utils/admin')

const endPoint=(req,res,next)=>{
  if(req.headers.authorization){
    const token = req.headers.authorization.split("Bearer ")[1]
    return admin.auth().verifyIdToken(token).then((decodedToken)=>{
      req.user={
        email:decodedToken.email,
        uid :decodedToken.uid
      }
      console.log(`Requested ${req.protocol}${req.originalUrl} ${req.user.email}`)
      return next()
     
    }).catch((error)=>{
      console.error(error)
      return res.status(500).json({error:`Invalid token`})
    })
  }else{
    return res.status(400).json({message:`UnAuthorised`})
  }
}
module.exports = {endPoint}