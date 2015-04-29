function angleBetweenVectors(a,b,o){

  if (o == undefined) {
    var o = new THREE.Vector3(0,0,0);
  }
  else {
    var a = new THREE.Vector3 (a.x - o.x, a.y - o.y, a.z - o.z)
    var b = new THREE.Vector3 (b.x - o.x, b.y - o.y, b.z - o.z)
  }

  var dotAB = a.dot(b)

  var magA = o.distanceTo(a);
  var magB = o.distanceTo(b);
  if (magA == 0 | magB == 0) {
    //console.log('0 distance found in angleBetweenVectors');
    return 0;
  }
  var val = Math.round(dotAB/(magA * magB)*1000)/1000;
  return (Math.acos(val))*(180/Math.PI);
}

function yAngleOfLine(a,b){
  var c = new THREE.Vector3(a.x+10,0,a.z);
  return angleBetweenFlattenedVectors(b,c,a);
}

function angleBetweenFlattenedVectors(a,b,o){
  if (o != undefined) {
    var a = new THREE.Vector3 (a.x - o.x, 0, a.z - o.z)
    var b = new THREE.Vector3 (b.x - o.x, 0, b.z - o.z)
  }

  return angleBetweenVectors(
    new THREE.Vector3(a.x,0,a.z),
    new THREE.Vector3(b.x,0,b.z)
  );
}

function lerp1(p1,p2,t){
  return new THREE.Vector3(
    ((p2.x-p1.x)*t)+p1.x,
    ((p2.y-p1.y)*t)+p1.y,
    ((p2.z-p1.z)*t)+p1.z
  );
}

function lerp(p1,p2,p3,p4,t){
  return lerp1(
    lerp1(p1,p2,t),
    lerp1(p3,p4,t),
    t
  );
}

function equalXZ(p1,p2){
  if (p1.x == p2.x & p1.z == p2.z) {return 1;}
  else{return 0;}
}

function midpoint(p1,p2){
  return lerp1(p1,p2,.5);
}

function findY(x,z){
  var ray = new THREE.Raycaster (new THREE.Vector3(x, 10000, z), new THREE.Vector3(0, -1, 0));
  var where = ray.intersectObject(worldObj['plane'].children[1],true);
  return where[0].point.y;
}

function recalcY(p,y){
  if (y == undefined) {y = 0;}
  return new THREE.Vector3(p.x,findY(p.x,p.z)+y,p.z)
}

function lineLineIntersect(m1,b1,m2,b2) {
  if ((m1-m2)!=0) {
    var x = (b2-b1)/(m1-m2);
    var z = (m1*x)+b1;
    return new THREE.Vector3(x,0,z);
  }
  else{return new THREE.Vector3(0,-1,0);}
}

function gridPointsOnLine(gridSize, p1, p2, doublePoints) {

  doublePoints == true ? true : false;

  var up = 5;

  var gridsize = gridSize/2
  if (p1.x == p2.x & p1.z == p2.z) {return p1;}

  var mx = maxX = p1.x >= p2.x ? p1.x : p2.x;
  var mz = maxZ = p1.z >= p2.z ? p1.z : p2.z;

  var minX = p1.x < p2.x ? p1.x : p2.x;
  var minZ = p1.z < p2.z ? p1.z : p2.z;

  var m1 = -1;
  var m2 = ((p2.z-p1.z)/(p2.x-p1.x));

  var newPoints = [];
  newPoints.push(recalcY(p1,up));
  if (maxX - gridSize > minX) {
    while(maxX > minX){

      var tempx = Math.floor(maxX/gridSize)*gridSize;
      var tempz = (m2*(tempx-p2.x))+p2.z;

      var b1 = (Math.ceil(minZ/100)*100)-(m1*tempx);
      var b2 = p2.z-(m2*p2.x);
      var np = lineLineIntersect(m1,b1,m2,b2);
      if (np.y != -1 & mx > np.x & minX < np.x & mz > np.z & minZ < np.z){
        newPoints.push(new THREE.Vector3(np.x,findY(np.x,np.z)+up,np.z));
        if(doublePoints == true)
          newPoints.push(newPoints[newPoints.length - 1]);
      }


      if(maxX > tempx & minX < tempx){
        newPoints.push(new THREE.Vector3(tempx,findY(tempx,tempz)+up,tempz));
        if(doublePoints == true)
          newPoints.push(newPoints[newPoints.length - 1]);
      }

      maxX -= gridSize;
    }
  }
  if (maxZ - gridSize > minZ) {
    while(maxZ > minZ){
      var tempz = Math.floor(maxZ/gridSize)*gridSize;
      var tempx = ((tempz-p2.z)/m2)+p2.x

      var b1 = tempz-(m1*(Math.ceil(minX/100)*100));
      var b2 = p2.z-(m2*p2.x);
      var np = lineLineIntersect(m1,b1,m2,b2);
      if (np.y != -1 & mx > np.x & minX < np.x & mz > np.z & minZ < np.z){
        newPoints.push(new THREE.Vector3(np.x,findY(np.x,np.z)+up,np.z));
        if(doublePoints == true)
          newPoints.push(newPoints[newPoints.length - 1]);
      }

      if(maxZ > tempz & minZ < tempz){
        newPoints.push(new THREE.Vector3(tempx,findY(tempx,tempz)+up,tempz));
        if(doublePoints == true)
          newPoints.push(newPoints[newPoints.length - 1]);
      }

      maxZ -= gridSize;
    }
  }
  newPoints.push(recalcY(p2,up));

  newPoints.sort(function(a,b){return a.x-b.x});

  return newPoints;

}

function randomPoint(magnitude,p1){
  p1 = p1 == undefined ? new THREE.Vector3(0,0,0) : p1;
  p1.x += ((Math.random() * magnitude.x * 2) - magnitude.x)
  p1.y += ((Math.random() * magnitude.y * 2) - magnitude.y)
  p1.z += ((Math.random() * magnitude.z * 2) - magnitude.z)
  return p1;
}

function cloneObjSimple(oldObject){
  console.log('a', oldObject, 'b', JSON.parse(JSON.stringify(oldObject)))
  return JSON.parse(JSON.stringify(oldObject));
}

function outlineGeometry(geometry){
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

  return outlineGeometry;
  //var lineMaterial = new THREE.LineBasicMaterial( { color: 0x222222, linewidth: 3 } );
  //var mline = new THREE.Line( outlineGeometry, lineMaterial, THREE.LinePieces);
  //mline.scale.set(sc.x,sc.y,sc.z);
  //globalMesh[name].children.push(mline);
}

function arrayVectorMatch(arr,p1){
  var j = arr.length - 1;
  var i = -1;
  var matches = [];
  while (i < j) {
    i++;
    if (equalXZ(arr[i],p1)) {
      matches.push(i);
    }
  }
  return matches;
}

function perpendicularVectorXZ(matrix,v1,origin){
  if (origin != undefined) {
    var z = matrix.x*(v1.x - origin.x)
    var x = matrix.z*(v1.z - origin.z)
  }
  else{
    var z = matrix.x*v1.x
    var x = matrix.z*v1.z
  }
  return new THREE.Vector3(x,0,z);
}

function extendVector(newLength,v1,origin){
  if (origin != undefined) {
    v1.z = (v1.z - origin.z)
    v1.y = (v1.y - origin.y)
    v1.x = (v1.x - origin.x)
  }
  else{
    origin = new THREE.Vector3(0,0,0);
  }

  var extendFactor = newLength / v1.distanceTo(origin);

  return new THREE.Vector3(
    (v1.x * extendFactor) + origin.x,
    (v1.y * extendFactor) + origin.y,
    (v1.z * extendFactor) + origin.z
  );
}

function addVectorToPoint(origin,v1){
  return new THREE.Vector3(
    origin.x + v1.x,
    origin.y + v1.y,
    origin.z + v1.z
  );
}

function get(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

addSpotToScene = function(point){
  console.log('Called called');
  var geometry = new THREE.TorusGeometry(10, 5, 5, 12);
  var material = new THREE.MeshBasicMaterial( { color: 0x2222bb, side: THREE.DoubleSide } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.rotation.set(Math.PI/2, 0, 0)
  mesh.position.x = point.x
  mesh.position.z = point.z
  mesh.position.y = point.y + 5

  scene.add( mesh );
  return mesh;
}


function testCube(p1,col,scale) {
  p1 = p1 != undefined ? p1 : new THREE.Vector3(0,0,0);
  scale = scale != undefined ? scale : 1;
  col = col != undefined ? col : 0x00ff00;
  var cubeMaterial = new THREE.MeshBasicMaterial( {color: col} );
  var cubeGeometry = new THREE.BoxGeometry( 10*scale, 10*scale, 10*scale, 1, 1, 1 );
  cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  cube.position.set(p1.x, p1.y, p1.z);
  //scene.add(cube);
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
      size: 10 * scale, height: 4 * scale, curveSegments: 3,
      font: "helvetiker", weight: "normal", style: "normal",
      bevelThickness: 1 * scale, bevelSize: 2, bevelEnabled: true,
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

  closePoint = function(point, distance){
    point.x = Math.round(point.x/distance)*distance;
    point.z = Math.round(point.z/distance)*distance;
    return recalcY(point, 5);
  }

  function calcFaceNormals(geom){
    var i = geom.faces.length;
    while(i--){
      var v1 = geom.vertices[geom.faces[i].a].clone().sub(geom.vertices[geom.faces[i].b])
      var v2 = geom.vertices[geom.faces[i].c].clone().sub(geom.vertices[geom.faces[i].b])
      geom.faces[i].normal = v1.clone().cross(v2);
    }
    return geom;
  }
