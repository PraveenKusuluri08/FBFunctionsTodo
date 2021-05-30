const functions = require("firebase-functions")

const { admin, db } = require("./utils/admin")

const app = require("express")()

app.use("/auth",require("./services/authentication/controller"))


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

//delete document by id
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

//delete user by uid hard delete
app.delete("/deleteUser/:id", async (req, res) => {
  const uid = req.params.id
  await admin
    .auth()
    .deleteUser(uid)
    .then(() => {
      console.log("Deleted Successfully")
      return res.status(200).json({ message: `user deleted successfully` })
    })
    .catch((error) => {
      console.log(error)
      return res.status(500).json({ error: error })
    })
})

app.put("/updateData/:id", (req, res) => {
  const inputs = req.body
  const id = req.params.id
  return admin
    .auth()
    .updateUser(id, {
      phoneNumber: inputs.phoneNumber,
      displayName: inputs.displayName,
    })
    .then((userRecord) => {
      db.collection("USERS").doc(id).set(
        {
          phoneNumber: userRecord.phoneNumber,
          displayName: userRecord.displayName,
        },
        { merge: true }
      )
    })
    .then(() => {
      return res.status(200).json({ message: `Document updated successfully` })
    })
    .catch((error) => {
      if (error.code === "auth/invalid-phone-number") {
        return res.status(400).json({ error: `Check your mobile number and try again` })
      }
      console.log(error)
      return res.status(500).json({ error: error })
    })
})
//update user
app.patch("/updateUser", (req, res) => {
  const inputs = {
    phoneNumber: req.body.phoneNumber,
    displayName: req.body.displayName,
    photoURL: req.body.photoURL,
  }
  const { uid } = req.query
  return admin
    .auth()
    .updateUser(uid, {
      phoneNumber: inputs.phoneNumber,
      displayName: inputs.displayName,
      photoURL: inputs.photoURL,
    })
    .then((userRecord) => {
      return db
        .collection("USERS")
        .doc(uid)
        .set(
          {
            phoneNumber: userRecord.phoneNumber,
            displayName: userRecord.displayName,
          },
          { merge: true }
        )
        .then(() => {
          return res.status(200).json({ message: `Document updated successfully` })
        })
        .catch((error) => {
          console.log(error).json({ error: error.code })
        })
    })
})
//get userRecord
app.get("/getUserData/:id", async (req, res) => {
  let users = {}
  const id = req.params.id
  try {
    const authData = await admin.auth().getUser(id)
    users = { ...authData }
    const dbData = await db.collection("USERS").doc(id).get()
    users = { ...dbData.data(), ...users }
    return res.status(200).json({ users })
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
})

//disable user record
app.delete("/userDelete/:id", async (req, res) => {
  const id = req.params.id
  try {
    //getting auth user data and db data
    const authData = await admin.auth().getUser(id)
    const dbData = await db.collection("USERS").doc(id).get()

    //perform the delete operation
    await admin.auth().updateUser(id, {
      disabled: true,
    })
    await await db.collection("USERS").doc(id).update({ isExist: false })
    return res.status(200).send(JSON.stringify("User successfully deleted"))
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error })
  }
})
//enable
app.put("/enableUser", async (req, res) => {
  const { uid } = req.query
  try {
    const doc = await db.collection("USERS").doc(uid).get()
    const authData = await admin.auth().getUser(uid)

    await db.collection("USERS").doc(uid).update({ isExist: true })
    await admin.auth().updateUser(uid, {
      disabled: false,
    })
    return res.status(200).json({ message: `User enabled successfuly` })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error })
  }
})

app.get("/getUser", async (req, res) => {
  const snap = await db.collection("USERS").get()
  let userData = []
  snap.forEach((doc) => {
    let id = doc.id
    let data = doc.data()
    userData.push({ id: id, data })
  })
  return res.status(200).json(userData)
})
exports.api = functions.https.onRequest(app)
