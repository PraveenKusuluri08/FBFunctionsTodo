const Model = require("./model")
const { db, admin } = require("../../utils/admin")
const router = require("express").Router()
const {endPoint} = require("../../endPoint/endpoint")
router.post("/createUser", (req, res) => {
  const inputs = {
    email: req.body.email,
    password: req.body.password,
    isExist: req.body.isExist,
    role: req.body.role,
    name: req.body.name,
  }
  const obj = new Model()
  obj
    ._SignUp(inputs)
    .then(() => {
      return res.status(202).json({ message: `User successfully created` })
    })
    .catch((error) => {
      if (error.code === "auth/email-already-exists") {
        return res.status(400).json({ message: `User already exists` })
      }
      if (error.code === "auth/invalid-email") {
        return res.status(400).json({ error: `Email address is invalid` })
      }
      if (error.code === "auth/invalid-password") {
        return res.status(400).json({ error: `Password is invalid!! not 6 characters` })
      }
      console.error(error)
      return res.status(400).json({ error: `Failed to create user` })
    })
})

router.put("/updateUser/:id",endPoint,(req,res)=>{
  const inputData={
    phoneNumber:req.body.phoneNumber,
    displayName: req.body.displayName,
  }
  const id = req.params.id
  const obj = new Model()
  obj._updateUser(inputData,id).then(()=>{
    return res.status(200).json({message:`User data uploaded successfully`})
  }).catch((error)=>{
    console.error(error)
    return res.status(500).json({error:`Failed to update data for ${id}`})
  })
})

router.get("/getData",(req,res)=>{
  const obj = new Model()
  obj._getDataExist().then((data)=>{
    return res.status(200).json(data)
  }).catch((error)=>{
    console.error(error)
    return res.status(500).json({error:`Failed to fetch the data`})
  })
})
module.exports = router
