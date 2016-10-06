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
	this.rotBefore = 0;
	this.slots = [];
	this.name = Face;
	this.lockColor = "white";

	this.lockFace = function() {
		this.locked = true;
		document.getElementById(Face + "Lock").innerHTML = "<font color = '" + this.lockColor + "'>locked</font>";
	};

	this.unlockFace = function() {
		this.locked = false;
		document.getElementById(Face + "Lock").innerHTML = "not locked";
		this.lockColor = "white";
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




// Rotate functions

// Rotate an object around an axis in world space (the axis passes through the object's position)
function rotateAroundWorldX( object, radians ) {
	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.set(1,                0,                 0,0,
			0,Math.cos(radians),-Math.sin(radians),0,
			0,Math.sin(radians), Math.cos(radians),0,
			0,                 0,                0,1);
	object.matrix.multiplyMatrices( rotationMatrix, object.matrix );
	object.position.getPositionFromMatrix( object.matrix );
	object.rotation.setEulerFromRotationMatrix(object.matrix, object.order);
}
function rotateAroundWorldY( object, radians ) {
	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.set( Math.cos(radians),0,Math.sin(radians),0,
			0,                 1,                0,0,
			-Math.sin(radians),0,Math.cos(radians),0,
			0,                 0,                0,1);
	object.matrix.multiplyMatrices( rotationMatrix, object.matrix );
	object.position.getPositionFromMatrix( object.matrix );
	object.rotation.setEulerFromRotationMatrix(object.matrix, object.order);
}
function rotateAroundWorldZ( object, radians ) {
	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.set(Math.cos(radians),-Math.sin(radians),0,0,
			Math.sin(radians), Math.cos(radians),0,0,
			0,                 0,1,0,
			0,                 0,0,1);
	object.matrix.multiplyMatrices( rotationMatrix, object.matrix );
	object.position.getPositionFromMatrix( object.matrix );
	object.rotation.setEulerFromRotationMatrix(object.matrix, object.order);



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
	W.color = "W";
	scene.add(W);
	W.receiveShadow = true;
	W.castShadow = true;
	W.position.x = edgeRadius;

	// B
	var BMaterial = makeMaterial([0,1,0,0,0,0]);
	B = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BMaterial);
	B.color = "B";
	scene.add(B);
	B.receiveShadow = true;
	B.castShadow = true;
	B.position.x = -edgeRadius;

	// G
	var GMaterial = makeMaterial([0,0,1,0,0,0]);
	G = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),GMaterial);
	G.color = "G";
	scene.add(G);
	G.receiveShadow = true;
	G.castShadow = true;
	G.position.y = edgeRadius;

	// Y
	var YMaterial = makeMaterial([0,0,0,1,0,0]);
	Y = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),YMaterial);
	Y.color = "Y";
	scene.add(Y);
	Y.receiveShadow = true;
	Y.castShadow = true;
	Y.position.y = -edgeRadius;

	// R
	var RMaterial = makeMaterial([0,0,0,0,1,0]);
	R = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),RMaterial);
	R.color = "R";
	scene.add(R);
	R.receiveShadow = true;
	R.castShadow = true;
	R.position.z = edgeRadius;

	// O
	var OMaterial = makeMaterial([0,0,0,0,0,1]);
	O = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),OMaterial);
	O.color = "O";
	scene.add(O);
	O.receiveShadow = true;
	O.castShadow = true;
	O.position.z = -edgeRadius;

	///////////////////// EDGES //////////////////////////

	// WG
	var WGMaterial = makeMaterial([1,0,1,0,0,0]);
	WG = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WGMaterial);
	WG.color = "WG";
	scene.add(WG);
	WG.receiveShadow = true;
	WG.castShadow = true;
	WG.position.x = edgeRadius;
	WG.position.y = edgeRadius;

	// WY
	var WYMaterial = makeMaterial([1,0,0,1,0,0]);
	WY = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WYMaterial);
	WY.color = "WY";
	scene.add(WY);
	WY.receiveShadow = true;
	WY.castShadow = true;
	WY.position.x = edgeRadius;
	WY.position.y = -edgeRadius;

	// WR
	var WRMaterial = makeMaterial([1,0,0,0,1,0]);
	WR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WRMaterial);
	WR.color = "WR";
	scene.add(WR);
	WR.receiveShadow = true;
	WR.castShadow = true;
	WR.position.x = edgeRadius;
	WR.position.z = edgeRadius;

	// WO
	var WOMaterial = makeMaterial([1,0,0,0,0,1]);
	WO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WOMaterial);
	WO.color = "WO";
	scene.add(WO);
	WO.receiveShadow = true;
	WO.castShadow = true;
	WO.position.x = edgeRadius;
	WO.position.z = -edgeRadius;

	// BG
	var BGMaterial = makeMaterial([0,1,1,0,0,0]);
	BG = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BGMaterial);
	BG.color = "BG";
	scene.add(BG);
	BG.receiveShadow = true;
	BG.castShadow = true;
	BG.position.x = -edgeRadius;
	BG.position.y = edgeRadius;

	// BY
	var BYMaterial = makeMaterial([0,1,0,1,0,0]);
	BY = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BYMaterial);
	BY.color = "BY";
	scene.add(BY);
	BY.receiveShadow = true;
	BY.castShadow = true;
	BY.position.x = -edgeRadius;
	BY.position.y = -edgeRadius;

	// BR
	var BRMaterial = makeMaterial([0,1,0,0,1,0]);
	BR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BRMaterial);
	BR.color = "BR";
	scene.add(BR);
	BR.receiveShadow = true;
	BR.castShadow = true;
	BR.position.x = -edgeRadius;
	BR.position.z = edgeRadius;

	// BO
	var BOMaterial = makeMaterial([0,1,0,0,0,1]);
	BO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BOMaterial);
	BO.color = "BO";
	scene.add(BO);
	BO.receiveShadow = true;
	BO.castShadow = true;
	BO.position.x = -edgeRadius;
	BO.position.z = -edgeRadius;

	// GR
	var GRMaterial = makeMaterial([0,0,1,0,1,0]);
	GR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),GRMaterial);
	GR.color = "GR";
	scene.add(GR);
	GR.receiveShadow = true;
	GR.castShadow = true;
	GR.position.y = edgeRadius;
	GR.position.z = edgeRadius;


	// GO
	var GOMaterial = makeMaterial([0,0,1,0,0,1]);
	GO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),GOMaterial);
	GO.color = "GO";
	scene.add(GO);
	GO.receiveShadow = true;
	GO.castShadow = true;
	GO.position.y = edgeRadius;
	GO.position.z = -edgeRadius;

	// YR
	var YRMaterial = makeMaterial([0,0,0,1,1,0]);
	YR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),YRMaterial);
	YR.color = "YR";
	scene.add(YR);
	YR.receiveShadow = true;
	YR.castShadow = true;
	YR.position.y = -edgeRadius;
	YR.position.z = edgeRadius;

	// YO
	var YOMaterial = makeMaterial([0,0,0,1,0,1]);
	YO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),YOMaterial);
	YO.color = "YO";
	scene.add(YO);
	YO.receiveShadow = true;
	YO.castShadow = true;
	YO.position.y = -edgeRadius;
	YO.position.z = -edgeRadius;

	///////////////////// CORNERS //////////////////////////

	// WGR
	var WGRMaterial = makeMaterial([1,0,1,0,1,0]);
	WGR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WGRMaterial);
	WGR.color = "WGR";
	scene.add(WGR);
	WGR.receiveShadow = true;
	WGR.castShadow = true;
	WGR.position.x = edgeRadius;
	WGR.position.y = edgeRadius;
	WGR.position.z = edgeRadius;

	// WGO
	var WGOMaterial = makeMaterial([1,0,1,0,0,1]);
	WGO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WGOMaterial);
	WGO.color = "WGO";
	scene.add(WGO);
	WGO.receiveShadow = true;
	WGO.castShadow = true;
	WGO.position.x = edgeRadius;
	WGO.position.y = edgeRadius;
	WGO.position.z = -edgeRadius;

	// WYR
	var WYRMaterial = makeMaterial([1,0,0,1,1,0]);
	WYR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WYRMaterial);
	WYR.color = "WYR";
	scene.add(WYR);
	WYR.receiveShadow = true;
	WYR.castShadow = true;
	WYR.position.x = edgeRadius;
	WYR.position.y = -edgeRadius;
	WYR.position.z = edgeRadius;

	// WYO
	var WYOMaterial = makeMaterial([1,0,0,1,0,1]);
	WYO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),WYOMaterial);
	WYO.color = "WYO";
	scene.add(WYO);
	WYO.receiveShadow = true;
	WYO.castShadow = true;
	WYO.position.x = edgeRadius;
	WYO.position.y = -edgeRadius;
	WYO.position.z = -edgeRadius;

	// BGR
	var BGRMaterial = makeMaterial([0,1,1,0,1,0]);
	BGR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BGRMaterial);
	BGR.color = "BGR";
	BGR.receiveShadow = true;
	BGR.castShadow = true;
	BGR.position.x = -edgeRadius;
	BGR.position.y = edgeRadius;
	BGR.position.z = edgeRadius;
	scene.add(BGR);

	// BGO
	var BGOMaterial = makeMaterial([0,1,1,0,0,1]);
	BGO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BGOMaterial);
	BGO.color = "BGO";
	scene.add(BGO);
	BGO.receiveShadow = true;
	BGO.castShadow = true;
	BGO.position.x = -edgeRadius;
	BGO.position.y = edgeRadius;
	BGO.position.z = -edgeRadius;

	// BYR
	var BYRMaterial = makeMaterial([0,1,0,1,1,0]);
	BYR = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BYRMaterial);
	BYR.color = "BYR";
	scene.add(BYR);
	BYR.receiveShadow = true;
	BYR.castShadow = true;
	BYR.position.x = -edgeRadius;
	BYR.position.y = -edgeRadius;
	BYR.position.z = edgeRadius;

	// BYO
	var BYOMaterial = makeMaterial([0,1,0,1,0,1]);
	BYO = new THREE.Mesh(new THREE.CubeGeometry(cubieDimension,cubieDimension,cubieDimension,1,1,1),BYOMaterial);
	BYO.color = "BYO";
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


	Key.addKeyListener(function(key) {
		var clockwise = true;
		if (Key.isDown(Key.SPACE))
			clockwise = false;
		switch (key) {
			case Key.U:
				turnFace(UFace, clockwise);
				break;
			case Key.F:
				turnFace(FFace, clockwise);
				break;
			case Key.R:
				turnFace(RFace, clockwise);
				break;
			case Key.L:
				turnFace(LFace, clockwise);
				break;
			case Key.D:
				turnFace(DFace, clockwise);
				break;
			case Key.B:
				turnFace(BFace, clockwise);
				break;
		}
	});

	// U turn
	//if (Key.isDown(Key.U)) turnFaceStepped(UFace,[R,UF,UR,UB,UL,UFR,UBR,UBL,UFL],[0,0,-1], clockwise);
	//if (Key.isDown(Key.U)) turnFace(UFace, clockwise);

	// D turn
	//if (Key.isDown(Key.D)) turnFaceStepped(DFace,[O,DR,DF,DL,DB,DFR,DFL,DBL,DBR],[0,0,1], clockwise);

	// R turn
	//if (Key.isDown(Key.R)) turnFaceStepped(RFace,[Y,FR,DR,RB,UR,DFR,DBR,UBR,UFR],[0,1,0], clockwise);

	// L turn
	//if (Key.isDown(Key.L)) turnFaceStepped(LFace,[G,DL,FL,UL,BL,DFL,UFL,UBL,DBL],[0,-1,0], clockwise);

	// F turn
	//if (Key.isDown(Key.F)) turnFaceStepped(FFace,[B,DF,FR,UF,FL,DFR,UFR,UFL,DFL],[1,0,0], clockwise);

	// B turn
	//if (Key.isDown(Key.B)) turnFaceStepped(BFace,[W,RB,DB,BL,UB,DBR,DBL,UBL,UBR],[-1,0,0], clockwise);


	// Lock / unlock faces
	if(FFace.aligned && RFace.aligned && BFace.aligned && LFace.aligned){
		UFace.unlockFace();
		DFace.unlockFace();
	}
	else{
		UFace.lockFace();
		DFace.lockFace();
	}
	if(FFace.aligned && UFace.aligned && BFace.aligned && DFace.aligned){
		RFace.unlockFace();
		LFace.unlockFace();
	}
	else{
		RFace.lockFace();
		LFace.lockFace();
	}
	if(UFace.aligned && RFace.aligned && DFace.aligned && LFace.aligned){
		FFace.unlockFace();
		BFace.unlockFace();
	}
	else{
		FFace.lockFace();
		BFace.lockFace();
	}


	// UPDATE FACES
	// when all faces are aligned
	if(UFace.aligned && DFace.aligned && FFace.aligned && BFace.aligned && RFace.aligned && LFace.aligned ){
		for(i = 6; i < cubiesArray.length; i++ ){
			if(Math.abs(cubiesArray[i].position.x - edgeRadius) < 1){
				if(Math.abs(cubiesArray[i].position.y - edgeRadius) < 1){
					if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
						UBL = cubiesArray[i]; // + + +
						//document.getElementById("UBL").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z) < 1){
						BL = cubiesArray[i]; // + + 0
						//document.getElementById("BL").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
						DBL = cubiesArray[i]; // + + -
						//document.getElementById("DBL").innerHTML = cubiesArrayHTML[i];
					}
				}
				if(Math.abs(cubiesArray[i].position.y) < 1){
					if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
						UB = cubiesArray[i]; // + 0 +
						//document.getElementById("UB").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
						DB = cubiesArray[i]; // + 0 -
						//document.getElementById("DB").innerHTML = cubiesArrayHTML[i];
					}
				}
				if(Math.abs(cubiesArray[i].position.y + edgeRadius) < 1){
					if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
						UBR = cubiesArray[i]; // + - +
						//document.getElementById("UBR").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z) < 1){
						RB = cubiesArray[i]; // + - 0
						//document.getElementById("RB").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
						DBR = cubiesArray[i]; // + - -
						//document.getElementById("DBR").innerHTML = cubiesArrayHTML[i];
					}
				}
			}
			if(Math.abs(cubiesArray[i].position.x) < 1){
				if(Math.abs(cubiesArray[i].position.y - edgeRadius) < 1){
					if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
						UL = cubiesArray[i]; // 0 + +
						//document.getElementById("UL").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
						DL = cubiesArray[i]; // 0 + -
						//document.getElementById("DL").innerHTML = cubiesArrayHTML[i];
					}
				}
				if(Math.abs(cubiesArray[i].position.y + edgeRadius) < 1){
					if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
						UR = cubiesArray[i]; // 0 - +
						//document.getElementById("UR").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
						DR = cubiesArray[i]; // 0 - -
						//document.getElementById("DR").innerHTML = cubiesArrayHTML[i];
					}

				}
			}
			if(Math.abs(cubiesArray[i].position.x + edgeRadius) < 1){
				if(Math.abs(cubiesArray[i].position.y - edgeRadius) < 1){
					if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
						UFL = cubiesArray[i]; // - + +
						//document.getElementById("UFL").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z) < 1){
						FL = cubiesArray[i]; // - + 0
						//document.getElementById("FL").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
						DFL = cubiesArray[i]; // - + -
						//document.getElementById("DFL").innerHTML = cubiesArrayHTML[i];
					}
				}
				if(Math.abs(cubiesArray[i].position.y) < 1){
					if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
						UF = cubiesArray[i]; // - 0 +
						//document.getElementById("UF").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
						DF = cubiesArray[i]; // - 0 -
						//document.getElementById("DF").innerHTML = cubiesArrayHTML[i];
					}
				}
				if(Math.abs(cubiesArray[i].position.y + edgeRadius) < 1){
					if(Math.abs(cubiesArray[i].position.z - edgeRadius) < 1){
						UFR = cubiesArray[i]; // - - +
						//document.getElementById("UFR").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z) < 1){
						FR = cubiesArray[i]; // - - 0
						//document.getElementById("FR").innerHTML = cubiesArrayHTML[i];
					}
					if(Math.abs(cubiesArray[i].position.z + edgeRadius) < 1){
						DFR = cubiesArray[i]; // - - -
						//document.getElementById("DFR").innerHTML = cubiesArrayHTML[i];
					}
				}
			}

		}
	}







}

function turnFace(thisFace, clockwise){

	if (clockwise == null) clockwise = true;
	var cubies = [];
	var rotation = [];

	switch(thisFace){
		case UFace:
			cubies = [R,UF,UR,UB,UL,UFR,UBR,UBL,UFL];
			rotation = [0,0,-1];
			break;
		case DFace:
			cubies = [O,DR,DF,DL,DB,DFR,DFL,DBL,DBR];
			rotation = [0,0,1];
			break;
		case RFace:
			cubies = [Y,FR,DR,RB,UR,DFR,DBR,UBR,UFR];
			rotation = [0,1,0];
			break;
		case LFace:
			cubies = [G,DL,FL,UL,BL,DFL,UFL,UBL,DBL];
			rotation = [0,-1,0];
			break;
		case FFace:
			cubies = [B,DF,FR,UF,FL,DFR,UFR,UFL,DFL];
			rotation = [1,0,0];
			break;
		case BFace:
			cubies = [W,RB,DB,BL,UB,DBR,DBL,UBL,UBR];
			rotation = [-1,0,0];
			break;
	}

	for (var i = 0; i < 18 ; i++) turnFaceStepped(thisFace, cubies, rotation, clockwise);


}

function turnFaceStepped(thisFace,theseCubies,faceRot, clockwise)
{

	if (clockwise == null) clockwise = true;

	// Only move if it isn't locked
	if(!thisFace.locked){
		thisFace.rotBefore = thisFace.rot;
		// Rotate
		if (clockwise){
			thisFace.rotCalc += cubieRotationSpeed;
		}
		else{
			thisFace.rotCalc -= cubieRotationSpeed;
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
		}else{if( ((Math.PI/2)-(Math.abs(thisFace.rotCalc % (Math.PI/2))) < turnThreshold) ){
			thisFace.rot = Math.floor(thisFace.rotCalc/(Math.PI/2))*Math.PI/2 + Math.PI/2;
			if(thisFace.rot == (Math.PI*2)){
				thisFace.rot = 0;
			}
			thisFace.alignFace();
		}else{
			thisFace.rot = thisFace.rotCalc;
			thisFace.unalignFace();
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
				rotateAroundWorldX(thisFace.slots[i],faceRot[0]*(thisFace.rot-thisFace.rotBefore));
			}
		}
		if(faceRot[1] != 0){
			for(var i=0;i<9;i++){
				rotateAroundWorldY(thisFace.slots[i],faceRot[1]*(thisFace.rot-thisFace.rotBefore));
			}
		}
		if(faceRot[2] != 0){
			for(var i=0;i<9;i++){
				rotateAroundWorldZ(thisFace.slots[i],faceRot[2]*(thisFace.rot-thisFace.rotBefore));
			}
		}


	}
	else{
		thisFace.lockColor = "red";
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


