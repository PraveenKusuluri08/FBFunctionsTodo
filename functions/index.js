const functions = require("firebase-functions")

const { admin, db } = require("./utils/admin")

const app = require("express")()

app.post("/dataPost", (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password,
    isExist: req.body.isExist,
    role: req.body.role,
  }
  return admin
    .auth()
    .createUser({ email: data.email, password: data.password })
    .then((user) => {
      req.user = user
      return admin.auth().setCustomUserClaims(user.uid, { role: "student" })
    })
    .then(() => {
      const userGiven = db.collection("STUDENTS").doc(`/ece/b/${req.user.uid}`)
      return userGiven.set({
        email: req.user.email,
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
      if (error.code === "auth/email-already-exists") {
        return res.status(404).json({ error: `Email already exists` })
      } else {
        return res.status(500).json({ error: error.code })
      }
    })
})

app.post("/dataUser", (req, res) => {
  const newData = {
    name: req.body.name,
    title: req.body.title,
    task: req.body.task,
    createdAt: new Date().toISOString(),
  }
  db.collection("USERDATA")
    .add(newData)
    .then((doc) => {
      res.json({ message: `Documnent ${doc.id} created Suucessfully` })
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message })
    })
})
//one way of getting the data
app.get("/dataGet", (req, res) => {
  db.collection("USERDATA")
    .get()
    .then((data) => {
      const dataUser = []
      data.forEach((doc) => {
        dataUser.push({
          id: doc.id,
          name: doc.data().name,
          title: doc.data().title,
          createdAt: doc.data().createdAt,
          task: doc.data().task,
        })
      })
      return res.json(dataUser)
    })
    .catch((error) => {
      console.log(error)
      return res.status(500).json({ error: error.code })
    })
})
//second type of get route
app.get("/get", async (req, res) => {
  const snap = await db.collection("USERDATA").get()
  let userData = []
  snap.forEach((doc) => {
    let id = doc.id
    let data = doc.data()
    userData.push({ id: id, data })
  })
  return res.status(200).json(userData)
})

//getting data by id
app.get("/:id", async (req, res) => {
  const snap = await db.collection("USERDATA").doc(req.params.id).get()
  const data = snap.data()
  const id = snap.id
  return res.status(200).json({ id: id, data })
})

//delete by id
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id
  await db
    .collection("USERDATA")
    .doc(id)
    .delete()
    .then((doc) => {
      console.log(doc)
      console.log("line-106", req.params.id)
      return res.status(200).json({ message: `Document ${req.params.id} deleted successfully` }) 
    })
    .catch((error) => {
      console.log(error)
      return res.status(500).json({ error: `Error while deleting document` })
    })
})
exports.api = functions.https.onRequest(app)
