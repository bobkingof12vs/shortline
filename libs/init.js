

//---Init---//

//global variables
var worldObj = [];
var globalMesh = [];
var id = -1;
var mouse = {};
var click = 0;
var zoom = 5;

//initialize Three.js

var scene = new THREE.Scene();
var camera =  new THREE.OrthographicCamera(window.innerWidth/-zoom, window.innerWidth/zoom, window.innerHeight/zoom,window.innerHeight/-zoom, -1, 100000);
//camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.x = 1000;
camera.position.y = 1500;
camera.position.z = 1000;
camera.lookAt(new THREE.Vector3(0,0,0));
//console.log("'camera'",camera);

//var toonMaterial = new THREE.MeshLambertMaterial

//load plane
var w = 20;
var h = 20;
var scale = 100;
var color = 0x96A46B;
var planeGeometry = new THREE.Geometry();
var lineGeometry = new THREE.Geometry();
var vertArray = lineGeometry.vertices;
for (var i = 0; i <= w; i++) {
  for (var j = 0; j <= h; j++) {
    z = 0;
    planeGeometry.vertices.push( new THREE.Vector3(((i-w/2)*scale),z,((j-h/2)*scale)));
    if (i!=w) {
      vertArray.push(
        new THREE.Vector3((i*scale)-(w*scale)/2,0.1,(j*scale)-(h*scale)/2),
        new THREE.Vector3(((i+1)*scale)-(w*scale)/2,0.1,(j*scale)-(h*scale)/2)
    );}
    if (j!=h) {
      vertArray.push(
        new THREE.Vector3((i*scale)-(w*scale)/2,0.1,(j*scale)-(h*scale)/2),
        new THREE.Vector3((i*scale)-(w*scale)/2,0.1,((j+1)*scale)-(h*scale)/2)
    );}
    lineGeometry.computeLineDistances();
  }
}
for (j = 0; j < w; j++) {
  k = (j * h) + j;
  for (i = k ; i < k+h; i++) {
      planeGeometry.faces.push(new THREE.Face3(i,(i+1),(i+h+1)));
      planeGeometry.faces.push(new THREE.Face3((i+1),(i+h+2),(i+h+1)));
  }
}
for (i = 0; i < planeGeometry.faces.length; i++) {
  planeGeometry.faces[i].color.setHex(color);
}
//new group for plane
group = new THREE.Object3D();
//add lines
var lineMaterial = new THREE.LineDashedMaterial( { color: 0x227733, linewidth: 2, dashSize: 12, gapSize: 10} );
lineGeometry.computeLineDistances();
var line = new THREE.Line( lineGeometry, lineMaterial, THREE.LinePieces );
group.add(line);
//console.log("'line'",line);
//add plane
var pm = new THREE.MeshLambertMaterial( {vertexColors: THREE.FaceColors, receiveShadow: true, castShadow: true} );
pm.color.setHex(0x227733);
plane = new THREE.Mesh(planeGeometry,pm);
plane.receiveShadow = true;
plane.castShadow = true;
group.add(plane);
//console.log("'plane'",plane);
worldObj['plane'] = group;
scene.add(group);
//console.log("'group'",group)

//add track line object
worldObj['trkPreLine'] = new THREE.Object3D();
//console.log('preline',worldObj['trkPreLine']);

//add track line object
worldObj['trkLine'] = new THREE.Object3D();
//console.log('drawline',worldObj['trkLine']);

//add track line object
worldObj['switches'] = new THREE.Object3D();
//console.log('switches',worldObj['switches']);

//add lights
var ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);
//console.log("'ambientLight'",ambientLight);

//add shadows
var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-3000, 4000, -4000).normalize();
//directionalLight.castShadow = true;
directionalLight.lookAt(new THREE.Vector3(0,0,0));
//directionalLight.shadowOnly = true;
//directionalLight.shadowDarkness = .5;
scene.add(directionalLight);
//console.log("'directionalLight'",directionalLight);


//init renderer
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('c'),  antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
//console.log("'renderer'",renderer);

//init controls
var controls = new THREE.OrbitControls( camera, renderer.domElement );

				/*controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;

				controls.noZoom = false;
				controls.noPan = false;

				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;

				controls.keys = [ 65, 83, 68 ];*/

controls.maxPolarAngle = Math.PI/2.8;
controls.noZoom = true;
//controls.noRotate = true;
//console.log("'controls'",controls);

//init mouse intersections
projector = new THREE.Projector();
function getMouseIntersect( mouse, objects, callback) {
  var vector = new THREE.Vector3(
    (( mouse.x / window.innerWidth ) * 2 - 1),
    (- ( mouse.y / window.innerHeight ) * 2 + 1),
    1 );
  var ray = projector.pickingRay( vector, camera );

  var allObjs = [];
  var j = objects.length
  while(j > 0){
    j--;
    if(objects[j] != undefined)
      allObjs.push(objects[j]);
  }

  var intersects = ray.intersectObjects( allObjs );
  //console.log(intersects)
  if ( intersects.length > 0 ){
    callback(intersects);
  }
}

function testCube(p1,col,scale) {
  scale = scale != undefined ? scale : 1;
  col = col != undefined ? col : 0x00ff00;
  var cubeMaterial = new THREE.MeshBasicMaterial( {color: col} );
  var cubeGeometry = new THREE.BoxGeometry( 10*scale, 10*scale, 10*scale, 1, 1, 1 );
  cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
	cube.position.set(p1.x, p1.y, p1.z);
	scene.add(cube);
  return cube;
}

function testText(text,p1,rot,scale,col1,col2){
  var col1 = col1 != undefined ? col1 : 0xff0000
  var col2 = col2 != undefined ? col2 : 0x000088
  var scale = scale != undefined ? scale : 1;
	// add 3D text
	var materialFront = new THREE.MeshBasicMaterial( { color: col1 } );
	var materialSide = new THREE.MeshBasicMaterial( { color: col2 } );
	var materialArray = [ materialFront, materialSide ];
	var textGeom = new THREE.TextGeometry( text,
	{
		size: 10, height: 4, curveSegments: 3,
		font: "helvetiker", weight: "normal", style: "normal",
		bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
		material: 0, extrudeMaterial: 1
	});
	// font: helvetiker, gentilis, droid sans, droid serif, optimer
	// weight: normal, bold

	var textMaterial = new THREE.MeshFaceMaterial(materialArray);
	var textMesh = new THREE.Mesh(textGeom, textMaterial );

	textGeom.computeBoundingBox();
	var posx = (-0.5 * (textGeom.boundingBox.max.x - textGeom.boundingBox.min.x)) + p1.x;
	var posy = (-0.5 * (textGeom.boundingBox.max.y - textGeom.boundingBox.min.y)) + p1.y;
	var posz = (-0.5 * (textGeom.boundingBox.max.z - textGeom.boundingBox.min.z)) + p1.z;

	textMesh.position.set(posx,posy,posz);

  if (rot != -1) {
    textMesh.rotation.x = (rot == undefined ? 0 : rot.x);
    textMesh.rotation.y = (rot == undefined ? 0 : rot.y);
    textMesh.rotation.z = (rot == undefined ? 0 : rot.z);
  }
  else{
    textMesh.lookAt(camera.position);
    controls.addEventListener( 'change', function(){

      textMesh.lookAt(camera.position);
      textGeom.computeBoundingBox();
      posx = (-0.5 * (textGeom.boundingBox.max.x - textGeom.boundingBox.min.x)) + p1.x;
      posy = (-0.5 * (textGeom.boundingBox.max.y - textGeom.boundingBox.min.y)) + p1.y;
      posz = (-0.5 * (textGeom.boundingBox.max.z - textGeom.boundingBox.min.z)) + p1.z;
      textMesh.position.set(posx,posy,posz);
      textMesh.lookAt(camera.position);
    });
  };


	scene.add(textMesh);

  return textMesh;
}

//testText('this is test',new THREE.Vector3(10,10,10),new THREE.Vector3(3.1415/-2,0,0))
//testText('this is test',new THREE.Vector3(10,10,10),-1)
