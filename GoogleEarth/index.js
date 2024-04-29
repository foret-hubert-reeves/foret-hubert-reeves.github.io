// Enable simultaneous requests.
Cesium.RequestScheduler.requestsByServer["tile.googleapis.com:443"] = 18;

// Create the viewer.
const viewer = new Cesium.Viewer("cesiumContainer", {
    imageryProvider: false,
    baseLayerPicker: false,
    requestRenderMode: true,
    geocoder: false,
    globe: false,
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
    // infoBox: false,    
});

// Add 3D Tiles tileset.
const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
        url: "https://tile.googleapis.com/v1/3dtiles/root.json?key=AIzaSyAKghInYGx9TlGfhxmxy_VuAG-SfML2N8Q",

        // This property is required to display attributions as required.
        showCreditsOnScreen: true,
    })
);

let CurrentLabel;
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
        duration: 3,
    });
}

//Selected Event Handler
viewer.selectedEntityChanged.addEventListener(function (selectedEntity) {
    if (Cesium.defined(selectedEntity)) {
        if (Cesium.defined(selectedEntity.name)) {
            if (Cesium.defined(CurrentLabel))
                viewer.entities.remove(CurrentLabel);
            let pos = selectedEntity.position.getValue();
            DrawLabel(pos, selectedEntity.name);
            console.log('Selected ' + selectedEntity.name);
            flyTo(pos, pos.longitude);
        } else {
            console.log('Unknown entity selected.');
        }
    } else {
        console.log('Deselected.');
        if(Cesium.defined(CurrentLabel))
            viewer.entities.remove(CurrentLabel);
    }
});

// Draw label
const DrawLabel = (newPosition, labelText) => {

    // const newHeight = Cesium.Cartographic.fromCartesian(newPosition).height;
    // let labelText = "Current altitude (meters above sea level):\n\t" + newHeight;
    CurrentLabel = viewer.entities.add({
        position: newPosition,
        label: {
            text: labelText,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            pixelOffset: new Cesium.Cartesian2(0, -40),
            showBackground: true,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            }
    });
};


//Fire Store
import { app, analytics, auth, getFirestore, collection, getDocs, signInAnonymously } from "../firestore.js";

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
                    
                    return viewer.entities.add({
                        name: ginko.first_name,
                        //place the pin on the ground
                        position: Cesium.Cartesian3.fromDegrees(ginko.coord.longitude, ginko.coord.latitude, 100),
                        billboard: {
                            text: ginko.first_name,
                            image: canvas.toDataURL(),
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            // yeOffset: new Cesium.Cartesian3(0, 0, 1000),

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
flyTo(Cesium.Cartesian3.fromDegrees(2.213749, 46.227638, 1000));
