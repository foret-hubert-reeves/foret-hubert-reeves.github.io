const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

let map;

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 48.856788, lng: 2.351077 },
        zoom: 5,
        mapId: "35c8a6c4b8c4939d",
        clickableIcons: true,
        streetViewControl: false,
    });
}

await initMap();

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

// const button = document.getElementById("button");
// button.addEventListener("click", getGinko);


function getGinko() {
    // e.preventDefault();
    // grecaptcha.enterprise.ready(async () => {
    //     const token = await grecaptcha.enterprise.execute('6LcWyrQpAAAAAGEV9ae5SLloyPnM7rdJfM2klN8P', { action: 'LOGIN' });
    // });

    signInAnonymously(auth)
        .then(async () => {
            const db = getFirestore(app);
            const querySnapshot = await getDocs(collection(db, "ginko"));
            //all to json
            const ginkos = querySnapshot.docs.map(doc => doc.data());

            var markers = [];
            var infoWindows = [];

            ginkos.forEach((ginko) => {
                let marker = new AdvancedMarkerElement({
                    map: map,
                    position: { lat: ginko.coord.latitude, lng: ginko.coord.longitude },
                    title: ginko.first_name,
                });

                var infoWindow = new google.maps.InfoWindow({
                    content: ginko.first_name
                });

                markers.push(marker);
                infoWindows.push(infoWindow);

                // Attach click event listener to each marker
                marker.addListener('click', function () {
                    // Close any open info windows
                    infoWindows.forEach(function (infoWindow) {
                        infoWindow.close();
                    });
                    // Open the info window for the clicked marker
                    infoWindow.open(map, marker);
                });

                // console.log(ginko.first_name);
            });

        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
}

getGinko();