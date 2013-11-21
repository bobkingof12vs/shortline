
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

var toonMaterial = new THREE.MeshLambertMaterial
//load trains
var loader = new THREE.JSONLoader();
loader.load("js/trains/shunter.js", modelToScene('shunter'));
loader.load("js/trains/switchArrow.js", jsObjToGlobalMesh('switchArrow',{line: false, scale: new THREE.Vector3(10,10,10)}));

//load train function
function modelToScene (name){
  opts = {};
  opts.scale = new THREE.Vector3(10, 10, 10);
  opts.castShadow = true;
  opts.receiveShadow = true;
  opts.line = true;
  return jsObjToGlobalMesh(name,opts,function(objName){
    obj[objName] = globalMesh[objName];
    scene.add(obj[objName]);
  });
}

function jsObjToGlobalMesh(name,opts,callback){
  return function(geometry,materials){
    
    globalMesh[name] = {};
    globalMesh[name] = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    sc = (opts.scale !== undefined) ? opts.scale : new THREE.Vector3(10,10,10);
    globalMesh[name].scale.set(sc.x,sc.y,sc.z);
    globalMesh[name].castShadow = (opts.castShadow !== undefined) ? opts.castShadow : false;
    globalMesh[name].receiveShadow = (opts.receiveShadow !== undefined) ? opts.receiveShadow : false;
    
    if (opts.line) {
      var start = geometry.faces.length - 1;
      var i = start;
      var lineVecs = [];
      while(i >= 0){
        var j = start;
        while(j >= 0){
          var set1 = -1;
          var set2 = -1;
          if (geometry.faces[i].a == geometry.faces[j].a 
          | geometry.faces[i].a == geometry.faces[j].b
          | geometry.faces[i].a == geometry.faces[j].c
          ){set1 = geometry.faces[i].a}
          if (geometry.faces[i].b == geometry.faces[j].a 
          | geometry.faces[i].b == geometry.faces[j].b
          | geometry.faces[i].b == geometry.faces[j].c
          ){
            if(set1 != -1){set2 = geometry.faces[i].b}
            else{set1 = geometry.faces[i].b}
          }
          if (geometry.faces[i].c == geometry.faces[j].a 
          | geometry.faces[i].c == geometry.faces[j].b
          | geometry.faces[i].c == geometry.faces[j].c
          ){if(set2 != -1){set2 = -1}
            else if(set1 != -1){set2 = geometry.faces[i].c}}
          
          if (set2 >= 0) {
            var caught = 0;
            for(k = lineVecs.length-1; k = 0; k--){
              if((set1 == lineVecs[k][0] & set2 == lineVecs[k][1])
              |  (set1 == lineVecs[k][1] & set2 == lineVecs[k][0])
              ) {caught = 1;}
            }
            
            if(caught <= 0 
            & (angleBetweenVectors(geometry.faces[i].normal,geometry.faces[j].normal) > 15
              |angleBetweenVectors(geometry.faces[i].normal,geometry.faces[j].normal) < -10)
            ){lineVecs.push([set1,set2]);}
          }
          j--;
        }
        i--;
      }
      var outlineGeometry = new THREE.Geometry();
      for (i = 0; i < lineVecs.length; i++) { 
        outlineGeometry.vertices.push(geometry.vertices[lineVecs[i][0]]);
        outlineGeometry.vertices.push(geometry.vertices[lineVecs[i][1]]);
      }
      var lineMaterial = new THREE.LineBasicMaterial( { color: 0x222222, linewidth: 3 } );
      var mline = new THREE.Line( outlineGeometry, lineMaterial, THREE.LinePieces);
      mline.scale.set(sc.x,sc.y,sc.z);
      globalMesh[name].children.push(mline);
    }
    
    if(callback !== undefined) callback(name);
  }
}

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
plane.receiveShadow = true;
plane.castShadow = true;
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
directionalLight.castShadow = true;
directionalLight.shadowOnly = true;
directionalLight.shadowDarkness = .5;
scene.add(directionalLight);
console.log("'directionalLight'",directionalLight);


//init renderer
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('c'),  antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
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