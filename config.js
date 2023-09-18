const firebase = require('firebase')

const firebaseConfig = {
    apiKey: "AIzaSyB2IuIhOeyXuOGBcxgt0-NAOPHT3usnYL0",
    authDomain: "api-rest-trabalho.firebaseapp.com",
    projectId: "api-rest-trabalho",
    storageBucket: "api-rest-trabalho.appspot.com",
    messagingSenderId: "546438058406",
    appId: "1:546438058406:web:3d59999db7f9117e757f67",
    measurementId: "G-DCES35764K"
};

firebase.initializeAoo(firebaseConfig)
const db = firebase.firestore()

const User = db.collection("Users")

module.exports = Users;