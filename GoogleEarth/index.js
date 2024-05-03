//Fire Store
import { app, analytics, auth, getFirestore, collection, getDocs, signInAnonymously, storage, getDownloadURL, ref } from "../firestore.js";


Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODE1NTVjOS02MzI1LTQ4NTUtYmJmNS1kODAxNzRmODY2MjkiLCJpZCI6MjEyNDExLCJpYXQiOjE3MTQ1NTY2OTJ9.AdHjdw06R4rgVm81B7cQNg58keOWnqnzJbL1vh63hDU';

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer('cesiumContainer', {
    //Terrain is ellipsoid
    terrain: Cesium.EllipsoidTerrainProvider(),
    // imageryProvider: false,
    // baseLayerPicker: false,
    requestRenderMode: true,
    geocoder: false,
    // globe: false,
    depthTestAgainstTerrain: false,
    //hide ui
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false,
    // homeButton: false,
    sceneModePicker: false,
    // navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    // selectionIndicator: false,
    infoBox: false,   
});    

// Add Cesium OSM Buildings, a global 3D buildings layer.
// const buildingTileset = await Cesium.createOsmBuildingsAsync();
// viewer.scene.primitives.add(buildingTileset);

// GOOGLE 
// Enable simultaneous requests.
// Cesium.RequestScheduler.requestsByServer["tile.googleapis.com:443"] = 18;


// Add 3D Tiles tileset.
// const tileset = viewer.scene.primitives.add(
//     new Cesium.Cesium3DTileset({
//         url: "https://tile.googleapis.com/v1/3dtiles/root.json?key=AIzaSyAKghInYGx9TlGfhxmxy_VuAG-SfML2N8Q",

//         // This property is required to display attributions as required.
//         showCreditsOnScreen: true,
//     })
// );

let CurrentLabel;
let CurrentPhoto;
const pinBuilder = new Cesium.PinBuilder();
const url = Cesium.buildModuleUrl("Assets/Textures/maki/park.png");

//Helpers
//Fly to france while showing the globe
const flyTo = (pos) => {
    // let degrees = Cesium.Cartographic.fromCartesian(pos);
    // console.log(degrees);
    const origMagnitude = Cesium.Cartesian3.magnitude(pos);
    const verticalAmount = 5000000;
    const newMagnitude = origMagnitude + verticalAmount;
    const scalar = newMagnitude / origMagnitude;

    const newPosition = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(pos, scalar, newPosition);

    viewer.camera.flyTo({
        destination: newPosition,
        duration: 1,
    });
}

const zoomIn = (pos) => {
    //roate around the center
    
}

// Draw label
const DrawLabel = (newPosition, labelText) => {

    //LABEL
    CurrentLabel = viewer.entities.add({
        position: newPosition,
        label: {
            text: labelText,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            pixelOffset: new Cesium.Cartesian2(0, -50),
            showBackground: true,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        }
    });
};


//Selected Event Handler
viewer.selectedEntityChanged.addEventListener(function (selectedEntity) {
    if (Cesium.defined(selectedEntity)) {
        if (Cesium.defined(selectedEntity.name)) {
            if (Cesium.defined(CurrentLabel))
                viewer.entities.remove(CurrentLabel);
            if (Cesium.defined(CurrentPhoto))
                viewer.entities.remove(CurrentPhoto);
            let pos = selectedEntity.position.getValue();

            DrawLabel(pos, selectedEntity.name);
            
            console.log('Selected ' + selectedEntity.name);
            // zoomIn(pos, viewer);
            flyTo(pos, viewer);


            //Get PHOTO
            getDownloadURL(ref(storage,'https://firebasestorage.googleapis.com/v0/b/foret-hubert-reeves-419711.appspot.com/o/images%2FPALOTAI%20Greta%20Montreuil%20%202024%2005%2001.jpeg?alt=media&token=6f6e674d-3342-4aee-ab56-2d8feb154406'))
                .then((url) => {
                    CurrentPhoto = viewer.entities.add({
                        position: pos,
                        billboard: {
                            image: url,
                            scale: 0.05,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset: new Cesium.Cartesian2(0, -100),
                        },
                    });
                })
                .catch((error) => {
                    console.log(error);
                });

            //PHOTO
            // CurrentPhoto = viewer.entities.add({
            //     position: pos,
            //     billboard: {
            //         image: "../ginkgo.png",
            //         scale: 1,
            //         verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            //         pixelOffset: new Cesium.Cartesian2(0, -50),
            //         // eyeOffset: new Cesium.Cartesian3(0, 0, -1000000),
            //     },
            // });

        } else {
            console.log('Unknown entity selected.');
        }
    } else {
        console.log('Deselected.');
        if (Cesium.defined(CurrentLabel))
            viewer.entities.remove(CurrentLabel);
        if (Cesium.defined(CurrentPhoto))
            viewer.entities.remove(CurrentPhoto);
        viewer.selectedEntity = undefined;
        //remove rotate center point
    }
});


// ginkos.forEach((ginko) => {
//     // Add pins
//     Promise.resolve(
//         pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48)
//     ).then(function (canvas) {

//         //PIN
//         return viewer.entities.add({
//             name: ginko.first_name,
//             //place the pin on the ground
//             position: Cesium.Cartesian3.fromDegrees(ginko.coord.longitude, ginko.coord.latitude),
//             billboard: {
//                 image: canvas.toDataURL(),
//                 verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//                 show: true
//                 // eyeOffset: new Cesium.Cartesian3(0, 0, -1000000),
//             },
//         });
//     });
// });

function getGinko() {

    signInAnonymously(auth)
        .then(async () => {
            const db = getFirestore(app);
            const querySnapshot = await getDocs(collection(db, "ginko"));
            //all to json
            const ginkos = querySnapshot.docs.map(doc => doc.data());

            ginkos.forEach((ginko) => {
                // Add pins
                Promise.resolve(
                    pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48)
                ).then(function (canvas) {

                    //PIN
                    return viewer.entities.add({
                        name: ginko.first_name,
                        //place the pin on the ground
                        position: Cesium.Cartesian3.fromDegrees(ginko.coord.longitude, ginko.coord.latitude, 1),
                        billboard: {
                            image: canvas.toDataURL(),
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            show: true
                            // eyeOffset: new Cesium.Cartesian3(0, 0, -1000000),
                        },
                    });
                });
            });

        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
}

getGinko();

//focus on France
flyTo(Cesium.Cartesian3.fromDegrees(2.213749, 46.227638, 1), viewer);
