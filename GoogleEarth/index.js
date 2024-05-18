//Cesium 
import { viewer, flyTo, addPins } from "./cesium.js";

//Fire Store 
let app, analytics, auth, getFirestore, collection, getDocs, signInAnonymously, storage, getDownloadURL, ref;

await import("../firestore.js")
    .then((module) => {
        app = module.app;
        analytics = module.analytics;
        auth = module.auth;
        getFirestore = module.getFirestore;
        collection = module.collection;
        getDocs = module.getDocs;
        signInAnonymously = module.signInAnonymously;
        storage = module.storage;
        getDownloadURL = module.getDownloadURL;
        ref = module.ref;
    })
    .catch((error) => {
        // console.log(error);
    });

// Add 3D Tiles tileset.
// verifie if env.js exists
let MapKey, ginkos, local;

await import("../env.js")
    .then((module) => {
        MapKey = module.MapKey;
        ginkos = module.ginkos;
        local = true;
    })
    .catch((error) => {
        MapKey = "AIzaSyAKghInYGx9TlGfhxmxy_VuAG-SfML2N8Q";
        local = false;
    });


// const tileset = viewer.scene.primitives.add(
//     new Cesium.Cesium3DTileset({
//         url: "https://tile.googleapis.com/v1/3dtiles/root.json?key=" + MapKey,

//         // This property is required to display attributions as required.
//         showCreditsOnScreen: true,
//     })
// );

function getFirebaseGinko() {
    signInAnonymously(auth)
        .then(async () => {
            const db = getFirestore(app);
            const querySnapshot = await getDocs(collection(db, "ginko"));
            //all to json
            let ginkos = {};
            await querySnapshot.docs.forEach((doc) => {
                ginkos[doc.id] = doc.data();
            });
            addPins(ginkos);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
}

console.log("Local", local);

if(local) addPins(ginkos);
else getFirebaseGinko();

//focus on France
flyTo(Cesium.Cartesian3.fromDegrees(2.213749, 46.227638, 1), viewer);
