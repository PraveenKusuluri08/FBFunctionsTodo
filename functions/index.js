const functions = require("firebase-functions")

const { admin, db } = require("./utils/admin")

const app = require("express")()

app.use("/auth",require("./services/authentication/controller"))

exports.api = functions.https.onRequest(app)
