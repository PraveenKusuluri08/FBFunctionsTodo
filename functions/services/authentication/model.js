const { db, admin } = require("../../utils/admin")
const UTILS = require("./utils")
class Model {
  constructor() {}

  async _SignUp(inputs) {
    return admin
      .auth()
      .createUser(inputs)
      .then((user) => {
        return db
          .collection("USERS")
          .doc(user.uid)
          .set({
            ...inputs,
            createdAt: new Date().toISOString(),
            uid: user.uid,
          })
      })
      .catch((error) => {
        throw error
      })
  }

  async _updateUser(inputData, uid) {
    return UTILS._check_user(uid)
      .then(() => {
        return db.collection("USERS").doc(uid).update(inputData)
      })
      .catch((error) => {
        throw error
      })
  }

  async _getDataExist() {
    return db
      .collection("USERS")
      .where("isExist", "==", true)
      .get()
      .then((snap) => {
        let users = []
        snap.forEach((doc) => {
          users.push({
            ...doc.data(),
          })
        })
        return users
      })
      .catch((error) => {
        throw error
      })
  }

  async _deleteUser(uid) {
    return UTILS._check_user(uid)
      .then(() => {
        return admin.auth().updateUser(uid, { disabled: false })
      })
      .then(() => {
        return db.collection("USERS").doc(uid).update({ isExist: false })
      })
      .catch((error) => {
        throw error
      })
  }
  
}

module.exports = Model
