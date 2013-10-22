// unlocking twice

// scene object variables
var renderer, scene, camera, pointLight, spotLight;

// field variables
var fieldWidth = 400, fieldHeight = 200;


// cubie
var cubieDimension = 30;
var cornerRadius = Math.sqrt( Math.pow(1.1*cubieDimension,2) + Math.pow(1.1*cubieDimension,2));
var edgeRadius = 1.1*cubieDimension;
var cubieRotationSpeed = 5 * Math.PI/180;
var turnThreshold = 20 * Math.PI/180;
var cubiesArray = [], cubiesArrayHTML = [];

var UF,UB,UR,UL,DF,DB,DR,DL,FL,FR,BL,RB,UFL,UFR,UBL,UBR,DFL,DFR,DBL,DBR; // slots

var LALA = [0,0,0], LELE = [0,0,0];

// Camera
var rotCamZ = 0, rotCamY = 0;





// set opponent reflexes (0 - easiest, 1 - hardest)
var difficulty = 0.2;


// Class

function cubeFace (Face) {
    this.locked = false;
    this.aligned = true;
    this.rotCalc = 0;
    this.rot = 0;
    this.facesLocked = [];
    this.slots = [];
    this.name = Face;

    this.lockFace = function() {
             this.locked = true;
             document.getElementById(Face + "Lock").innerHTML = "locked";
         };

    this.unlockFace = function() {
             this.locked = false;
             document.getElementById(Face + "Lock").innerHTML = "not locked";
         };

    this.alignFace = function() {
             this.aligned = true;
             document.getElementById(Face + "Align").innerHTML = "aligned";
         };

    this.unalignFace = function() {
             this.aligned = false;
             document.getElementById(Face + "Align").innerHTML = "not aligned";
         };

    this.updateValue = function() {
             document.getElementById(Face +"Turn").innerHTML = Math.round(this.rot * 180/Math.PI) + "&deg;";
         };

}




var UFace = new cubeFace("U");
var DFace = new cubeFace("D");
var RFace = new cubeFace("R");
var LFace = new cubeFace("L");
var FFace = new cubeFace("F");
var BFace = new cubeFace("B");


UFace.facesLocked = [FFace,BFace,LFace,RFace];
DFace.facesLocked = [FFace,BFace,LFace,RFace];
FFace.facesLocked = [UFace,DFace,LFace,RFace];
BFace.facesLocked = [UFace,DFace,LFace,RFace];
RFace.facesLocked = [UFace,DFace,FFace,BFace];
LFace.facesLocked = [UFace,DFace,FFace,BFace];





// Rotate functions

// Rotate an object around an axis in world space (the axis passes through the object's position)
function rotateAroundWorldX( object, rotAngle ) {
    var radians = rotAngle - object.rotation.x;
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.set(1,                0,                 0,0,
                       0,Math.cos(radians),-Math.sin(radians),0,
                       0,Math.sin(radians), Math.cos(radians),0,
                       0,                 0,                0,1);
    object.applyMatrix(rotationMatrix);
}
function rotateAroundWorldY( object, rotAngle ) {
    var radians = rotAngle - object.rotation.y;
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.set( Math.cos(radians),0,Math.sin(radians),0,
                       0,                 1,                0,0,
                       -Math.sin(radians),0,Math.cos(radians),0,
                       0,                 0,                0,1);
    object.applyMatrix(rotationMatrix);
}
function rotateAroundWorldZ( object, rotAngle ) {
    var radians = rotAngle - object.rotation.z;
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.set(Math.cos(radians),-Math.sin(radians),0,0,
                       Math.sin(radians), Math.cos(radians),0,0,
                                       0,                 0,1,0,
                                       0,                 0,0,1);
    object.applyMatrix(rotationMatrix); // premultiply

}









// ------------------------------------- //
// ---------------- SETUP -------------- //
// ------------------------------------- //

function setup()
{

    // set up all the 3D objects in the scene
    createScene();

    // and let's get cracking!
    draw();
}

function createScene()
{
    // set the scene size
    var WIDTH = 640,
            HEIGHT = 360;

    // set some camera attributes
    var VIEW_ANGLE = 50,
            ASPECT = WIDTH / HEIGHT,
            NEAR = 0.1,
            FAR = 10000;

    var c = document.getElementById("gameCanvas");

    // create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer();
    camera =
            new THREE.PerspectiveCamera(
                VIEW_ANGLE,
                ASPECT,
                NEAR,
                FAR);

    scene = new THREE.Scene();

    // add the camera to the scene
    scene.add(camera);

    // set a default position for the camera
    // not doing this somehow messes up shadow rendering
    camera.position.z = 320;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    c.appendChild(renderer.domElement);

    // set up the playing surface plane
    var planeWidth = fieldWidth,
            planeHeight = fieldHeight,
            planeQuality = 10;

    // create the ground's material
    var groundMaterial =
            new THREE.MeshLambertMaterial(
                {
                    color: 0x888888
                });

    // plane to show off pretty shadows
    var ground = new THREE.Mesh(

                new THREE.CubeGeometry(
                    2000,
                    1000,
                    3,
                    1,
                    1,
                    1 ),

                groundMaterial);
    // set ground to arbitrary z position to best show off shadowing
    ground.position.z = -200;
    ground.receiveShadow = true;
    scene.add(ground);



    // CUBIES

    // Textures:

    blackTexture = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/black.png' ) });
    whiteTexture = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/white.png' ) });
    blueTexture = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/blue.png' ) });
    greenTexture = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/green.png' ) });
    yellowTexture = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/yellow.png' ) });
    redTexture = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/red.png' ) });
    orangeTexture = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/orange.png' ) });





    function makeMaterial(colors){
        var colorArray = [];
        if(colors[0]) colorArray.push(whiteTexture); else colorArray.push(blackTexture);
        if(colors[1]) colorArray.push(blueTexture); else colorArray.push(blackTexture);
        if(colors[2]) colorArray.push(greenTexture); else colorArray.push(blackTexture);
        if(colors[3]) colorArray.push(yellowTexture); else colorArray.push(blackTexture);
        if(colors[4]) colorArray.push(redTexture); else colorArray.push(blackTexture);
        if(colors[5]) colorArray.push(orangeTexture); else colorArray.push(blackTexture);
        var colorMaterial = new THREE.MeshFaceMaterial(colorArray);

        return colorMaterial;
    }



    // One object for each cubie
    // Cubies are named according to their color scheme

    // BGR = blue-green-red corner

    // Cubies change positions. For example: BGR cubie is in FLU position with a certain orientation


    ///////////////////// CENTERS //////////////////////////

    // W
    var WMaterial = makeMaterial([1,0,0,0,0,0]);
    W = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WMaterial);
    scene.add(W);
    W.receiveShadow = true;
    W.castShadow = true;
    W.position.x = edgeRadius;

    // B
    var BMaterial = makeMaterial([0,1,0,0,0,0]);
    B = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BMaterial);
    scene.add(B);
    B.receiveShadow = true;
    B.castShadow = true;
    B.position.x = -edgeRadius;

    // G
    var GMaterial = makeMaterial([0,0,1,0,0,0]);
    G = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),GMaterial);
    scene.add(G);
    G.receiveShadow = true;
    G.castShadow = true;
    G.position.y = edgeRadius;

    // Y
    var YMaterial = makeMaterial([0,0,0,1,0,0]);
    Y = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),YMaterial);
    scene.add(Y);
    Y.receiveShadow = true;
    Y.castShadow = true;
    Y.position.y = -edgeRadius;

    // R
    var RMaterial = makeMaterial([0,0,0,0,1,0]);
    R = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),RMaterial);
    scene.add(R);
    R.receiveShadow = true;
    R.castShadow = true;
    R.position.z = edgeRadius;

    // O
    var OMaterial = makeMaterial([0,0,0,0,0,1]);
    O = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),OMaterial);
    scene.add(O);
    O.receiveShadow = true;
    O.castShadow = true;
    O.position.z = -edgeRadius;

    ///////////////////// EDGES //////////////////////////

    // WG
    var WGMaterial = makeMaterial([1,0,1,0,0,0]);
    WG = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WGMaterial);
    scene.add(WG);
    WG.receiveShadow = true;
    WG.castShadow = true;
    WG.position.x = edgeRadius;
    WG.position.y = edgeRadius;

    // WY
    var WYMaterial = makeMaterial([1,0,0,1,0,0]);
    WY = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WYMaterial);
    scene.add(WY);
    WY.receiveShadow = true;
    WY.castShadow = true;
    WY.position.x = edgeRadius;
    WY.position.y = -edgeRadius;

    // WR
    var WRMaterial = makeMaterial([1,0,0,0,1,0]);
    WR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WRMaterial);
    scene.add(WR);
    WR.receiveShadow = true;
    WR.castShadow = true;
    WR.position.x = edgeRadius;
    WR.position.z = edgeRadius;

    // WO
    var WOMaterial = makeMaterial([1,0,0,0,0,1]);
    WO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WOMaterial);
    scene.add(WO);
    WO.receiveShadow = true;
    WO.castShadow = true;
    WO.position.x = edgeRadius;
    WO.position.z = -edgeRadius;

    // BG
    var BGMaterial = makeMaterial([0,1,1,0,0,0]);
    BG = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BGMaterial);
    scene.add(BG);
    BG.receiveShadow = true;
    BG.castShadow = true;
    BG.position.x = -edgeRadius;
    BG.position.y = edgeRadius;

    // BY
    var BYMaterial = makeMaterial([0,1,0,1,0,0]);
    BY = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BYMaterial);
    scene.add(BY);
    BY.receiveShadow = true;
    BY.castShadow = true;
    BY.position.x = -edgeRadius;
    BY.position.y = -edgeRadius;

    // BR
    var BRMaterial = makeMaterial([0,1,0,0,1,0]);
    BR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BRMaterial);
    scene.add(BR);
    BR.receiveShadow = true;
    BR.castShadow = true;
    BR.position.x = -edgeRadius;
    BR.position.z = edgeRadius;

    // BO
    var BOMaterial = makeMaterial([0,1,0,0,0,1]);
    BO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BOMaterial);
    scene.add(BO);
    BO.receiveShadow = true;
    BO.castShadow = true;
    BO.position.x = -edgeRadius;
    BO.position.z = -edgeRadius;

    // GR
    var GRMaterial = makeMaterial([0,0,1,0,1,0]);
    GR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),GRMaterial);
    scene.add(GR);
    GR.receiveShadow = true;
    GR.castShadow = true;
    GR.position.y = edgeRadius;
    GR.position.z = edgeRadius;


    // GO
    var GOMaterial = makeMaterial([0,0,1,0,0,1]);
    GO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),GOMaterial);
    scene.add(GO);
    GO.receiveShadow = true;
    GO.castShadow = true;
    GO.position.y = edgeRadius;
    GO.position.z = -edgeRadius;

    // YR
    var YRMaterial = makeMaterial([0,0,0,1,1,0]);
    YR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),YRMaterial);
    scene.add(YR);
    YR.receiveShadow = true;
    YR.castShadow = true;
    YR.position.y = -edgeRadius;
    YR.position.z = edgeRadius;

    // YO
    var YOMaterial = makeMaterial([0,0,0,1,0,1]);
    YO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),YOMaterial);
    scene.add(YO);
    YO.receiveShadow = true;
    YO.castShadow = true;
    YO.position.y = -edgeRadius;
    YO.position.z = -edgeRadius;

    ///////////////////// CORNERS //////////////////////////

    // WGR
    var WGRMaterial = makeMaterial([1,0,1,0,1,0]);
    WGR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WGRMaterial);
    scene.add(WGR);
    WGR.receiveShadow = true;
    WGR.castShadow = true;
    WGR.position.x = edgeRadius;
    WGR.position.y = edgeRadius;
    WGR.position.z = edgeRadius;

    // WGO
    var WGOMaterial = makeMaterial([1,0,1,0,0,1]);
    WGO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WGOMaterial);
    scene.add(WGO);
    WGO.receiveShadow = true;
    WGO.castShadow = true;
    WGO.position.x = edgeRadius;
    WGO.position.y = edgeRadius;
    WGO.position.z = -edgeRadius;

    // WYR
    var WYRMaterial = makeMaterial([1,0,0,1,1,0]);
    WYR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WYRMaterial);
    scene.add(WYR);
    WYR.receiveShadow = true;
    WYR.castShadow = true;
    WYR.position.x = edgeRadius;
    WYR.position.y = -edgeRadius;
    WYR.position.z = edgeRadius;

    // WYO
    var WYOMaterial = makeMaterial([1,0,0,1,0,1]);
    WYO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WYOMaterial);
    scene.add(WYO);
    WYO.receiveShadow = true;
    WYO.castShadow = true;
    WYO.position.x = edgeRadius;
    WYO.position.y = -edgeRadius;
    WYO.position.z = -edgeRadius;

    // BGR
    var BGRMaterial = makeMaterial([0,1,1,0,1,0]);
    BGR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BGRMaterial);
    BGR.receiveShadow = true;
    BGR.castShadow = true;
    BGR.position.x = -edgeRadius;
    BGR.position.y = edgeRadius;
    BGR.position.z = edgeRadius;
    scene.add(BGR);

    // BGO
    var BGOMaterial = makeMaterial([0,1,1,0,0,1]);
    BGO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BGOMaterial);
    scene.add(BGO);
    BGO.receiveShadow = true;
    BGO.castShadow = true;
    BGO.position.x = -edgeRadius;
    BGO.position.y = edgeRadius;
    BGO.position.z = -edgeRadius;

    // BYR
    var BYRMaterial = makeMaterial([0,1,0,1,1,0]);
    BYR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BYRMaterial);
    scene.add(BYR);
    BYR.receiveShadow = true;
    BYR.castShadow = true;
    BYR.position.x = -edgeRadius;
    BYR.position.y = -edgeRadius;
    BYR.position.z = edgeRadius;

    // BYO
    var BYOMaterial = makeMaterial([0,1,0,1,0,1]);
    BYO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BYOMaterial);
    scene.add(BYO);
    BYO.receiveShadow = true;
    BYO.castShadow = true;
    BYO.position.x = -edgeRadius;
    BYO.position.y = -edgeRadius;
    BYO.position.z = -edgeRadius;


    // Cubie array
    //             0 1 2 3 4 5  6  7  8  9 10 11 12 13 14 15 16 17  18  19  20  21  22  23  24  25
    cubiesArray = [W,B,G,Y,R,O,WG,WY,WR,WO,BG,BY,BR,BO,GR,GO,YR,YO,WGR,WGO,WYR,WYO,BGR,BGO,BYR,BYO];
    cubiesArrayHTML = ["<font color='white'>W</font>","<font color='blue'>B</font>","<font color='green'>G</font>","<font color='yellow'>Y</font>","<font color='red'>R</font>","<font color='orange'>O</font>","<font color='white'>W</font><font color='green'>G</font>","<font color='white'>W</font><font color='yellow'>Y</font>","<font color='white'>W</font><font color='red'>R</font>","<font color='white'>W</font><font color='orange'>O</font>","<font color='blue'>B</font><font color='green'>G</font>","<font color='blue'>B</font><font color='yellow'>Y</font>","<font color='blue'>B</font><font color='red'>R</font>","<font color='blue'>B</font><font color='orange'>O</font>","<font color='green'>G</font><font color='red'>R</font>","<font color='green'>G</font><font color='orange'>O</font>","<font color='yellow'>Y</font><font color='red'>R</font>","<font color='yellow'>Y</font><font color='orange'>O</font>","<font color='white'>W</font><font color='green'>G</font><font color='red'>R</font>","<font color='white'>W</font><font color='green'>G</font><font color='orange'>O</font>","<font color='white'>W</font><font color='yellow'>Y</font><font color='red'>R</font>","<font color='white'>W</font><font color='yellow'>Y</font><font color='orange'>O</font>","<font color='blue'>B</font><font color='green'>G</font><font color='red'>R</font>","<font color='blue'>B</font><font color='green'>G</font><font color='orange'>O</font>","<font color='blue'>B</font><font color='yellow'>Y</font><font color='red'>R</font>","<font color='blue'>B</font><font color='yellow'>Y</font><font color='orange'>O</font>"];


    // fill slots at startup
    UF = BR;
    UB = WR;
    UR = YR;
    UL = GR;
    DF = BO;
    DB = WO;
    DR = YO;
    DL = GO;
    FL = BG;
    FR = BY;
    BL = WG;
    RB = WY;
    UFL = BGR;
    UFR = BYR;
    UBL = WGR;
    UBR = WYR;
    DFL = BGO;
    DFR = BYO;
    DBL = WGO;
    DBR = WYO;



    // LIGHTS & SHADOWS
    pointLight = new THREE.PointLight(0xF8D898);

    // set its position
    pointLight.position.x = -1000;
    pointLight.position.y = 0;
    pointLight.position.z = 1000;
    pointLight.intensity = 2.9;
    pointLight.distance = 10000;
    // add to the scene
    scene.add(pointLight);

    // add a spot light
    // this is important for casting shadows
    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(-400, -200, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);


    // MAGIC SHADOW CREATOR DELUXE EDITION with Lights PackTM DLC
    renderer.shadowMapEnabled = true;
}

function draw()
{
    // draw THREE.JS scene
    renderer.render(scene, camera);
    // loop draw function call
    requestAnimationFrame(draw);

    cameraPhysics();
    playerCubeMovement();
}






// Handles player's cube movement
function playerCubeMovement()
{

    // TURN FACES

    // U turn
    if (Key.isDown(Key.U)) turnFace(UFace,[R,UF,UR,UB,UL,UFR,UBR,UBL,UFL],[0,0,-1],[1,0,0,0,0,0]);

    // D turn
    if (Key.isDown(Key.D)) turnFace(DFace,[O,DR,DF,DL,DB,DFR,DFL,DBL,DBR],[0,0,1],[0,1,0,0,0,0]);

    // R turn
    if (Key.isDown(Key.R)) turnFace(RFace,[Y,FR,DR,RB,UR,DFR,DBR,UBR,UFR],[0,1,0],[0,0,0,0,1,0]);

    // L turn
    if (Key.isDown(Key.L)) turnFace(LFace,[G,DL,FL,UL,BL,DFL,UFL,UBL,DBL],[0,-1,0],[0,0,0,0,0,1]);

    // F turn
    if (Key.isDown(Key.F)) turnFace(FFace,[B,DF,FR,UF,FL,DFR,UFR,UFL,DFL],[1,0,0],[0,0,1,0,0,0]);

    // B turn
    if (Key.isDown(Key.B)) turnFace(BFace,[W,RB,DB,BL,UB,DBR,DBL,UBL,UBR],[-1,0,0],[0,0,0,1,0,0]);



    // UPDATE FACES
    // when all faces are aligned
    if(UFace.aligned && DFace.aligned && FFace.aligned && BFace.aligned && RFace.aligned && LFace.aligned ){
        for(i = 6; i < cubiesArray.length; i++ ){
            if(Math.abs(cubiesArray[i].position.x - edgeRadius) < 1){
                if(Math.abs(cubiesArray[i].position.y - edgeRadius) < 1){
                    if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
                        UBL = cubiesArray[i]; // + + +
                        document.getElementById("UBL").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z) < 1){
                        BL = cubiesArray[i]; // + + 0
                        document.getElementById("BL").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
                        DBL = cubiesArray[i]; // + + -
                        document.getElementById("DBL").innerHTML = cubiesArrayHTML[i];
                    }
                }
                if(Math.abs(cubiesArray[i].position.y) < 1){
                    if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
                        UB = cubiesArray[i]; // + 0 +
                        document.getElementById("UB").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
                        DB = cubiesArray[i]; // + 0 -
                        document.getElementById("DB").innerHTML = cubiesArrayHTML[i];
                    }
                }
                if(Math.abs(cubiesArray[i].position.y + edgeRadius) < 1){
                    if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
                        UBR = cubiesArray[i]; // + - +
                        document.getElementById("UBR").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z) < 1){
                        RB = cubiesArray[i]; // + - 0
                        document.getElementById("RB").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
                        DBR = cubiesArray[i]; // + - -
                        document.getElementById("DBR").innerHTML = cubiesArrayHTML[i];
                    }
                }
            }
            if(Math.abs(cubiesArray[i].position.x) < 1){
                if(Math.abs(cubiesArray[i].position.y - edgeRadius) < 1){
                    if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
                        UL = cubiesArray[i]; // 0 + +
                        document.getElementById("UL").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
                        DL = cubiesArray[i]; // 0 + -
                        document.getElementById("DL").innerHTML = cubiesArrayHTML[i];
                    }
                }
                if(Math.abs(cubiesArray[i].position.y + edgeRadius) < 1){
                    if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
                        UR = cubiesArray[i]; // 0 - +
                        document.getElementById("UR").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
                        DR = cubiesArray[i]; // 0 - -
                        document.getElementById("DR").innerHTML = cubiesArrayHTML[i];
                    }

                }
            }
            if(Math.abs(cubiesArray[i].position.x + edgeRadius) < 1){
                if(Math.abs(cubiesArray[i].position.y - edgeRadius) < 1){
                    if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
                        UFL = cubiesArray[i]; // - + +
                        document.getElementById("UFL").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z) < 1){
                        FL = cubiesArray[i]; // - + 0
                        document.getElementById("FL").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
                        DFL = cubiesArray[i]; // - + -
                        document.getElementById("DFL").innerHTML = cubiesArrayHTML[i];
                    }
                }
                if(Math.abs(cubiesArray[i].position.y) < 1){
                    if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
                        UF = cubiesArray[i]; // - 0 +
                        document.getElementById("UF").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
                        DF = cubiesArray[i]; // - 0 -
                        document.getElementById("DF").innerHTML = cubiesArrayHTML[i];
                    }
                }
                if(Math.abs(cubiesArray[i].position.y + edgeRadius) < 1){
                    if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
                        UFR = cubiesArray[i]; // - - +
                        document.getElementById("UFR").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z) < 1){
                        FR = cubiesArray[i]; // - - 0
                        document.getElementById("FR").innerHTML = cubiesArrayHTML[i];
                    }
                    if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
                        DFR = cubiesArray[i]; // - - -
                        document.getElementById("DFR").innerHTML = cubiesArrayHTML[i];
                    }
                }
            }

        }
    }







}



function turnFace(thisFace,theseCubies,faceRot,xyz)
{
    // Only move if it isn't locked
    if(!thisFace.locked){
        // Rotate
        if (Key.isDown(Key.SPACE)){
            thisFace.rotCalc -= cubieRotationSpeed;
        }
        else{
            thisFace.rotCalc += cubieRotationSpeed;
        }
        // Keep within one turn
        thisFace.rotCalc = thisFace.rotCalc % (Math.PI*2);
        if(thisFace.rotCalc < 0){
            thisFace.rotCalc = Math.PI*2 - thisFace.rotCalc;
        }
        // Calculate rotation angle taking alignment into account
        if( (Math.abs(thisFace.rotCalc % (Math.PI/2)) < turnThreshold)){
            thisFace.rot = Math.floor(thisFace.rotCalc/(Math.PI/2))*Math.PI/2;
            if(thisFace.rot == (Math.PI*2)){
                thisFace.rot = 0;
            }
            thisFace.alignFace();
            thisFace.facesLocked[0].unlockFace();
            thisFace.facesLocked[1].unlockFace();
            thisFace.facesLocked[2].unlockFace();
            thisFace.facesLocked[3].unlockFace();
        }else{if( ((Math.PI/2)-(Math.abs(thisFace.rotCalc % (Math.PI/2))) < turnThreshold) ){
                thisFace.rot = Math.floor(thisFace.rotCalc/(Math.PI/2))*Math.PI/2 + Math.PI/2;
                if(thisFace.rot == (Math.PI*2)){
                    thisFace.rot = 0;
                }
                thisFace.alignFace();
                thisFace.facesLocked[0].unlockFace();
                thisFace.facesLocked[1].unlockFace();
                thisFace.facesLocked[2].unlockFace();
                thisFace.facesLocked[3].unlockFace();
            }else{
                thisFace.rot = thisFace.rotCalc;
                thisFace.unalignFace();
                thisFace.facesLocked[0].lockFace();
                thisFace.facesLocked[1].lockFace();
                thisFace.facesLocked[2].lockFace();
                thisFace.facesLocked[3].lockFace();
            }
        }

        thisFace.updateValue();


        thisFace.slots = []; // make sure slots are empty
        thisFace.slots.push(theseCubies[0]);
        thisFace.slots.push(theseCubies[1]);
        thisFace.slots.push(theseCubies[2]);
        thisFace.slots.push(theseCubies[3]);
        thisFace.slots.push(theseCubies[4]);
        thisFace.slots.push(theseCubies[5]);
        thisFace.slots.push(theseCubies[6]);
        thisFace.slots.push(theseCubies[7]);
        thisFace.slots.push(theseCubies[8]);


        if(faceRot[0] != 0){
            for(var i=0;i<9;i++){
                rotateAroundWorldX(thisFace.slots[i],faceRot[0]*thisFace.rot);
            }
        }
        if(faceRot[1] != 0){
            for(var i=0;i<9;i++){
                rotateAroundWorldY(thisFace.slots[i],faceRot[1]*thisFace.rot);
            }
        }
        if(faceRot[2] != 0){
            for(var i=0;i<9;i++){
                rotateAroundWorldZ(thisFace.slots[i],faceRot[2]*thisFace.rot);
            }
        }

/*


        // Orient all cubies on this face while rotating
        for(var i=0;i<9;i++){
            thisFace.slots[i].rotation.x = faceRot[0]*thisFace.rot;
            thisFace.slots[i].rotation.y = faceRot[1]*thisFace.rot;
            thisFace.slots[i].rotation.z = faceRot[2]*thisFace.rot;
        }
        // Position all edges on this face while rotating
        for(var i=1;i<5;i++){
            thisFace.slots[i].position.x =  xyz[0]*edgeRadius*Math.sin(thisFace.rot - 90*i* Math.PI/180) +
                    xyz[1]*edgeRadius*Math.cos(thisFace.rot - 90*i* Math.PI/180) +
                    -xyz[2]*edgeRadius +
                    xyz[3]*edgeRadius +
                    xyz[4]*edgeRadius*Math.sin(thisFace.rot - 90*i* Math.PI/180) +
                    xyz[5]*edgeRadius*Math.cos(thisFace.rot - 90*i* Math.PI/180);
            thisFace.slots[i].position.y =  xyz[0]*edgeRadius*Math.cos(thisFace.rot - 90*i* Math.PI/180) +
                    xyz[1]*edgeRadius*Math.sin(thisFace.rot - 90*i* Math.PI/180) +
                    xyz[2]*edgeRadius*Math.cos(thisFace.rot - 90*i* Math.PI/180) +
                    xyz[3]*edgeRadius*Math.sin(thisFace.rot - 90*i* Math.PI/180) +
                    -xyz[4]*edgeRadius +
                    xyz[5]*edgeRadius;
            thisFace.slots[i].position.z =  xyz[0]*edgeRadius +
                    -xyz[1]*edgeRadius +
                    xyz[2]*edgeRadius*Math.sin(thisFace.rot - 90*i* Math.PI/180) +
                    xyz[3]*edgeRadius*Math.cos(thisFace.rot - 90*i* Math.PI/180) +
                    xyz[4]*edgeRadius*Math.cos(thisFace.rot - 90*i* Math.PI/180) +
                    xyz[5]*edgeRadius*Math.sin(thisFace.rot - 90*i* Math.PI/180);
        }
        // Position all corners on this face while rotating
        for(var i=5;i<9;i++){
            thisFace.slots[i].position.x =  xyz[0]*cornerRadius*Math.sin(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    xyz[1]*cornerRadius*Math.cos(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    -xyz[2]*edgeRadius +
                    xyz[3]*edgeRadius +
                    xyz[4]*cornerRadius*Math.sin(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    xyz[5]*cornerRadius*Math.cos(thisFace.rot - (45+90*(i-4))* Math.PI/180);
            thisFace.slots[i].position.y =  xyz[0]*cornerRadius*Math.cos(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    xyz[1]*cornerRadius*Math.sin(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    xyz[2]*cornerRadius*Math.cos(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    xyz[3]*cornerRadius*Math.sin(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    -xyz[4]*edgeRadius +
                    xyz[5]*edgeRadius;
            thisFace.slots[i].position.z =  xyz[0]*edgeRadius +
                    -xyz[1]*edgeRadius +
                    xyz[2]*cornerRadius*Math.sin(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    xyz[3]*cornerRadius*Math.cos(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    xyz[4]*cornerRadius*Math.cos(thisFace.rot - (45+90*(i-4))* Math.PI/180) +
                    xyz[5]*cornerRadius*Math.sin(thisFace.rot - (45+90*(i-4))* Math.PI/180);
        }
*/
    }

}











// Move camera
function cameraPhysics()
{
    var camRadius = 300;
    var camSpeed = 5 * Math.PI/180;

    if (Key.isDown(Key.LEFTARROW)){
        rotCamZ += camSpeed;
        if(rotCamZ > 45 * Math.PI/180){
            rotCamZ = 45 * Math.PI/180;
        }
    }else{
        if (Key.isDown(Key.RIGHTARROW)){
            rotCamZ -= camSpeed;
            if(rotCamZ < -45 * Math.PI/180){
                rotCamZ = -45 * Math.PI/180;
            }
        }else{
            rotCamZ += (0-rotCamZ)*camSpeed;
        }
    }

    if (Key.isDown(Key.DOWNARROW)){
        rotCamY += camSpeed;
        if(rotCamY > 120 * Math.PI/180){
            rotCamY = 120 * Math.PI/180;
        }
    }else{
        rotCamY += (0-rotCamY)*camSpeed;
    }



    camera.position.x = -camRadius*Math.cos(rotCamZ);
    camera.position.y = camRadius*Math.sin(rotCamZ);
    camera.position.z = 170*Math.cos(rotCamY);

    camera.rotation.x = 0;
    camera.rotation.y = -55 * Math.PI/180 - rotCamY/Math.PI;
    camera.rotation.z = -90 * Math.PI/180;


}


