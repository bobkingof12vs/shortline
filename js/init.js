

//---Init---//

//global variables
var obj = [];
var globalMesh = [];
var id = -1;
var mouse = {};
var click = 0;
var zoom = .5;

//initialize Three.js

var scene = new THREE.Scene();
var camera =  new THREE.OrthographicCamera(window.innerWidth / -zoom, window.innerWidth / zoom, window.innerHeight / zoom, window.innerHeight / -zoom, -1, 100000);
camera.position = new THREE.Vector3(10000,15000,10000);
camera.lookAt(new THREE.Vector3(0,0,0));
console.log("'camera'",camera);

//var toonMaterial = new THREE.MeshLambertMaterial

//load plane
var w = 10;
var h = 10;
var scale = 100;
var color = 0x7CBA30;
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
console.log("'line'",line);
//add plane
var pm = new THREE.MeshLambertMaterial( {vertexColors: THREE.FaceColors} );
pm.color.setHex(0x227733);
plane = new THREE.Mesh(planeGeometry,pm);
//plane.receiveShadow = true;
//plane.castShadow = true;
group.add(plane);
console.log("'plane'",plane);
obj['plane'] = group;
scene.add(group);
console.log("'group'",group)

//add track line object
obj['trkPreLine'] = new THREE.Object3D();
console.log('preline',obj['trkPreLine']);

//add track line object
obj['trkLine'] = new THREE.Object3D();
console.log('drawline',obj['trkLine']);

//add track line object
obj['switches'] = new THREE.Object3D();
console.log('switches',obj['switches']);

//add lights
var ambientLight = new THREE.AmbientLight(0xbbbbbb);
scene.add(ambientLight);
console.log("'ambientLight'",ambientLight);

//add shadows
var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-300, 400, 400);
//directionalLight.castShadow = true;
//directionalLight.shadowOnly = true;
//directionalLight.shadowDarkness = .5;
scene.add(directionalLight);
console.log("'directionalLight'",directionalLight);


//init renderer
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('c'),  antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.shadowMapEnabled = true;
//renderer.shadowMapSoft = true;
console.log("'renderer'",renderer);

//init controls
var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI/2.5;
controls.noZoom = true;
console.log("'controls'",controls);

//init mouse intersections
projector = new THREE.Projector();
function getMouseIntersect( mouse, objects, callback) {
  var vector = new THREE.Vector3(
    (( event.clientX / window.innerWidth ) * 2 - 1),
    (- ( event.clientY / window.innerHeight ) * 2 + 1),
    1 );
  var ray = projector.pickingRay( vector, camera );
  var intersects = ray.intersectObjects( objects );
  if ( intersects.length > 0 ){
    callback(intersects);
  }
}

function testCube(p1,col,scale) {
  scale = scale != undefined ? scale : 1;
  col = col != undefined ? col : 0x00ff00;
  var cubeMaterial = new THREE.MeshBasicMaterial( {color: col} );
  var cubeGeometry = new THREE.CubeGeometry( 10*scale, 10*scale, 10*scale, 1, 1, 1 );
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
