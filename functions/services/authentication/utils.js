const { db, admin } = require("../../utils/admin")

class Utils {
  static async _check_user(uid) {
    return db
      .collection("USERS")
      .where("uid", "==", uid)
      .where("isExist", "==", true)
      .get()
      .then((user) => {
        if (user.size < 1) throw new Error("User is  not There")
        else{
          return user.docs[0].data()
        }
      })
  }
}
module.exports = Utils
