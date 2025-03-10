const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json"); 

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_DATABASE_URL,
});

const auth = admin.auth(); // Firebase Auth
const db = admin.firestore(); // Firestore (optional)

module.exports = { auth, db };