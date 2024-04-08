var wwd = new WorldWind.WorldWindow("canvasOne");

//imagery layers
wwd.addLayer(new WorldWind.BMNGOneImageLayer());
wwd.addLayer(new WorldWind.BMNGLandsatLayer());

//add a compass, a coordinates display, and some view controls
// wwd.addLayer(new WorldWind.CompassLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

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
    signInAnonymously(auth)
        .then(async () => {
            const db = getFirestore(app);
            const querySnapshot = await getDocs(collection(db, "ginko"));
            //all to json
            const ginkos = querySnapshot.docs.map(doc => doc.data());

            var placemarkLayer = new WorldWind.RenderableLayer("Placemark");
            wwd.addLayer(placemarkLayer);

            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);

            placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
            placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 1.0);

            placemarkAttributes.imageSource = "ginkgo.png";
            placemarkAttributes.imageScale = 0.3;
            placemarkAttributes.imageColor = WorldWind.Color.WHITE;


            ginkos.forEach((ginko) => {
                var placemark = new WorldWind.Placemark(new WorldWind.Position(ginko.coord.latitude, ginko.coord.longitude, 1e2), true, placemarkAttributes);

                placemark.label = ginko.first_name;
                placemark.alwaysOnTop = true;
                placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                placemarkLayer.addRenderable(placemark);

                console.log(ginko.first_name);
            });

            wwd.goTo(new WorldWind.Position(46.603354, 1.888334, 1e7));
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
}

getGinko();