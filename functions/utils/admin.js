var admin = require("firebase-admin");

var serviceAccount = require("./admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sampleapp-5c050-default-rtdb.firebaseio.com"
});

const db= admin.firestore();
module.exports={db,admin}