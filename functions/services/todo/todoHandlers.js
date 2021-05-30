const { db, admin } = require("../../utils/admin")

exports.getUserByEmail = async (req, res) => {
  const users = {}
  const email = req.query
  try {
    const authEmalData = admin.auth().getUserByEmail(email)
    users = { ...authEmalData }
    return res.status(200).json(autheEmailData)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error })
  }
}
