const functions = require("firebase-functions")

const { admin, db } = require("./utils/admin")

const app = require("express")()

app.post("/dataPost", (req, res) => {
  const data = req.body
  return admin
    .auth()
    .createUser({ email: data.email, password: data.password })
    .then((user) => {
      req.user = user
      return admin.auth().setCustomUserClaims(user.uid, { role: "student" })
    })
    .then(() => {
      const userGiven = db.collection("STUDENTS").doc(`/cse/b/${req.user.uid}`)
      return userGiven.set({
        ...data,
        createdAt: new Date().toISOString(),
        role: "student",
        isExist: true,
        id: userGiven.id,
        uid: req.user.uid,
      })
    })
    .then(() => {
      return res.status(201).json({ message: `Document created successfully` })
    })
    .catch((error) => {
      return res.status(500).json({ error: error.code })
    })
})

app.get("/getData",async(req,res)=>{
  const snapshot =await db.collection(`/STUDENTS/cse/b`).get()
  let UserData=[]
  snapshot.forEach((doc)=>{
    let data = doc.data()
    let id= doc.id
    UserData.push({id,data})
  })
  res.status(200).send(JSON.stringify(UserData))
})

exports.api = functions.https.onRequest(app)
