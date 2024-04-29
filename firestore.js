import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCl4lijYod8isn5ExZYP034KbmEAu_EMIQ",
    authDomain: "foret-hubert-reeves-419711.firebaseapp.com",
    projectId: "foret-hubert-reeves-419711",
    storageBucket: "foret-hubert-reeves-419711.appspot.com",
    messagingSenderId: "299939617143",
    appId: "1:299939617143:web:56cf6445b653e11bb66972",
    measurementId: "G-2T8PT8759R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

export { app, analytics, auth, getFirestore, collection, getDocs, signInAnonymously };