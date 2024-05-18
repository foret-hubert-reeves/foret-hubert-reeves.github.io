Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODE1NTVjOS02MzI1LTQ4NTUtYmJmNS1kODAxNzRmODY2MjkiLCJpZCI6MjEyNDExLCJpYXQiOjE3MTQ1NTY2OTJ9.AdHjdw06R4rgVm81B7cQNg58keOWnqnzJbL1vh63hDU';

let storage, getDownloadURL, ref, db, rotate;

await import("../firestore.js")
    .then((module) => {
        storage = module.storage;
        getDownloadURL = module.getDownloadURL;
        ref = module.ref;
    })
    .catch((error) => {
        // console.log(error);
    });

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer('cesiumContainer', {
    //Terrain is ellipsoid
    terrain: Cesium.EllipsoidTerrainProvider(),
    // baseLayerPicker: false,
    requestRenderMode: true,
    geocoder: false,
    depthTestAgainstTerrain: false,
    //hide ui
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false,
    // homeButton: false,
    sceneModePicker: false,
    navigationInstructionsInitiallyVisible: true,
    // selectionIndicator: false,
    // infoBox: false,
    scene3DOnly: true,
    // requestRenderMode: true,
    useBrowserRecommendedResolution: true,
});

viewer.forceResize();
viewer.resolutionScale = 1.0;
viewer.infoBox.viewModel.enableCamera = true;
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000;
viewer.scene.screenSpaceCameraController.enableTilt = false;
// viewer.scene.screenSpaceCameraController.enableRotate = false;

// Add Cesium OSM Buildings, a global 3D buildings layer.
// const buildingTileset = await Cesium.createOsmBuildingsAsync();
// viewer.scene.primitives.add(buildingTileset);

// GOOGLE 
// Enable simultaneous requests.
// Cesium.RequestScheduler.requestsByServer["tile.googleapis.com:443"] = 18;


let CurrentLabel, CurrentPhoto;
const pinBuilder = new Cesium.PinBuilder();
const url = Cesium.buildModuleUrl("Assets/Textures/maki/park.png");

// Fly to a location
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
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pos);
    let headingPitchRange = new Cesium.HeadingPitchRange(0, -Math.PI / 8, 290)

    // viewer.camera.flyTo({
    //     destination: Cesium.Cartesian3.add(pos, offset, new Cesium.Cartesian3()),
    //     duration: 1,
    // });
    
    viewer.scene.camera.lookAt(pos, headingPitchRange);

}

//Add pins
function addPins(ginkos) {
    db = ginkos;
    Object.keys(ginkos).forEach((id) => {
        // Add pins
        Promise.resolve(
            pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48)
        ).then(function (canvas) {

            let ginko = ginkos[id];
            //PIN
            return viewer.entities.add({
                // description: '<h1>No Image</h1>',
                name: id,
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
}

// Draw label
const DrawLabel = (newPosition, id) => {

    //LABEL
    CurrentLabel = viewer.entities.add({
        position: newPosition,
        label: {
            text: db[id].first_name + " " + db[id].last_name,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            pixelOffset: new Cesium.Cartesian2(0, -50),
            showBackground: true,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        }
    });
};

const DrawPhoto = (pos, selectedEntity) => {
    selectedEntity.description = '<h1>No Image</h1>';
    let id = selectedEntity.name;
    if (storage != null && db[id].photo != null) {
        getDownloadURL(ref(storage, 'images/' + db[id].photo))
            .then((url) => {
                selectedEntity.description = 
                '<div><img width="100%" src="' + url +'"></img></div>\
                <style>div {min-height: 100vw }\
                ';
            })
            .catch((error) => {
                // selectedEntity.description = '<h1>No Image</h1>';
                console.log(error);
            });
    }
    // else selectedEntity.description = '<h1>No Image</h1>';

    //PHOTO
    // else {
    //     CurrentPhoto = viewer.entities.add({
    //         position: pos,
    //         billboard: {
    //             image: "../ginkgo.png",
    //             scale: 1,
    //             verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //             pixelOffset: new Cesium.Cartesian2(0, -50),
    //             // eyeOffset: new Cesium.Cartesian3(0, 0, -1000000),
    //         },
    //     });
    // }
};

// Event Handler
viewer.selectedEntityChanged.addEventListener(function (selectedEntity) {
    if (Cesium.defined(selectedEntity)) {
        if (Cesium.defined(selectedEntity.name)) {
            if (Cesium.defined(CurrentLabel))
                viewer.entities.remove(CurrentLabel);
            if (Cesium.defined(CurrentPhoto))
                viewer.entities.remove(CurrentPhoto);
            let pos = selectedEntity.position.getValue();

            DrawLabel(pos, selectedEntity.name);

            zoomIn(pos, viewer);

            // Orbit this point
            if(rotate!=null) rotate();
            rotate = viewer.clock.onTick.addEventListener(function (clock) {
                viewer.scene.camera.rotateRight(0.001);
            });

            //Get PHOTO
            if (selectedEntity.description == null)
            DrawPhoto(pos, selectedEntity);

        } else {
            console.log('Unknown entity selected.');
        }
    } else {
        console.log('Deselected.');

        flyTo(CurrentLabel.position.getValue(), viewer);
        
        if (Cesium.defined(CurrentLabel))
            viewer.entities.remove(CurrentLabel);
        if (Cesium.defined(CurrentPhoto))
            viewer.entities.remove(CurrentPhoto);

        // Orbit this point
        rotate();

        viewer.selectedEntity = undefined;

        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
});

export { viewer, flyTo, zoomIn, DrawLabel, addPins };