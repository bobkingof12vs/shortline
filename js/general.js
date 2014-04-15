function angleBetweenVectors(a,b,o){
  
  if (o == undefined) {
    o = new THREE.Vector3(0,0,0);
  }
  else {
    a = new THREE.Vector3 (a.x - o.x, a.y - o.y, a.z - o.z)
    b = new THREE.Vector3 (b.x - o.x, b.y - o.y, b.z - o.z)
  }
  
  dotAB = a.dot(b)
  
  magA = o.distanceTo(a);
  magB = o.distanceTo(b);
  if (magA == 0 | magB == 0) {
    console.log('0 distance found in angleBetweenVectors');
    return 0;
  }
  val = Math.round(dotAB/(magA * magB)*1000)/1000;
  return (Math.acos(val))*(180/Math.PI);
}

function yAngleOfLine(a,b){
  var c = new THREE.Vector3(a.x+10,0,a.z);
  return angleBetweenFlattenedVectors(b,c,a);
}

function angleBetweenFlattenedVectors(a,b,o){
  if (o != undefined) {
    a = new THREE.Vector3 (a.x - o.x, 0, a.z - o.z)
    b = new THREE.Vector3 (b.x - o.x, 0, b.z - o.z)
  }
  
  return angleBetweenVectors(
    new THREE.Vector3(a.x,0,a.z),
    new THREE.Vector3(b.x,0,b.z)
  );
}

function lerp1(p1,p2,t){
  var x = ((p2.x-p1.x)*t)+p1.x;
  var y = ((p2.y-p1.y)*t)+p1.y;
  var z = ((p2.z-p1.z)*t)+p1.z;
  return new THREE.Vector3(x,y,z);
}

function lerp(p1,p2,p3,p4,t){
  p5 = lerp1(p1,p2,t);
  p6 = lerp1(p3,p4,t);
  return lerp1(p5,p6,t);
}

function equalXZ(p1,p2){
  if (p1.x == p2.x & p1.z == p2.z) {return 1;}
  else{return 0;}
}

function midpoint(p1,p2){
  return lerp1(p1,p2,.5);
}

function findY(x,z){
  var ray = new THREE.Raycaster (new THREE.Vector3(x, 1000, z), new THREE.Vector3(0, -1, 0));
  var where = ray.intersectObject(obj['plane'],true);
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

function gridPointsOnLine(gridSize, p1, p2) {
  gridsize = gridSize/2
  if (p1.x == p2.x & p1.z == p2.z) {return p1;}
  
  mx = maxX = p1.x >= p2.x ? p1.x : p2.x;
  mz = maxZ = p1.z >= p2.z ? p1.z : p2.z;
  
  minX = p1.x < p2.x ? p1.x : p2.x;
  minZ = p1.z < p2.z ? p1.z : p2.z;
  
  m1 = -1;
  m2 = ((p2.z-p1.z)/(p2.x-p1.x));
  
  newPoints = [];
  newPoints.push(recalcY(p1));
  if (maxX - gridSize > minX) {
    while(maxX > minX){
      
      tempx = Math.floor(maxX/gridSize)*gridSize;
      tempz = (m2*(tempx-p2.x))+p2.z;
      
      b1 = (Math.ceil(minZ/100)*100)-(m1*tempx);
      b2 = p2.z-(m2*p2.x);
      np = lineLineIntersect(m1,b1,m2,b2);
      if (np.y != -1 & mx > np.x & minX < np.x & mz > np.z & minZ < np.z)
        {newPoints.push(new THREE.Vector3(np.x,findY(np.x,np.z)+3,np.z));}
        
      
      if(maxX > tempx & minX < tempx)
        {newPoints.push(new THREE.Vector3(tempx,findY(tempx,tempz)+1,tempz));}
      
      maxX -= gridSize;
    }
  }
  if (maxZ - gridSize > minZ) {
    while(maxZ > minZ){
      tempz = Math.floor(maxZ/gridSize)*gridSize;
      tempx = ((tempz-p2.z)/m2)+p2.x
      
      b1 = tempz-(m1*(Math.ceil(minX/100)*100));
      b2 = p2.z-(m2*p2.x);
      np = lineLineIntersect(m1,b1,m2,b2);
      if (np.y != -1 & mx > np.x & minX < np.x & mz > np.z & minZ < np.z)
        {newPoints.push(new THREE.Vector3(np.x,findY(np.x,np.z)+1,np.z));}
      
      if(maxZ > tempz & minZ < tempz)
        {newPoints.push(new THREE.Vector3(tempx,findY(tempx,tempz)+1,tempz));}
      
      maxZ -= gridSize;
    }
  }
  newPoints.push(recalcY(p2));
  
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