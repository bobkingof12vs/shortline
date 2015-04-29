function raiseLowerTerrain(i,upDown){
  a = i[0].face.a;
  b = i[0].face.b;
  c = i[0].face.c;
  vv = i[0].point;
  ad = vv.distanceTo(worldObj['plane'].children[1].geometry.vertices[a]);
  bd = vv.distanceTo(worldObj['plane'].children[1].geometry.vertices[b]);
  cd = vv.distanceTo(worldObj['plane'].children[1].geometry.vertices[c]);
  if (ad <= bd & ad <= cd) {facei = a;}
  else if (bd <= ad & bd <= cd) {facei = b;}
  else{facei = c;}

  for (j = 0; j < worldObj['plane'].children[0].geometry.vertices.length; j++) {
    if (worldObj['plane'].children[1].geometry.vertices[facei].x == worldObj['plane'].children[0].geometry.vertices[j].x
      & worldObj['plane'].children[1].geometry.vertices[facei].z == worldObj['plane'].children[0].geometry.vertices[j].z) {
        worldObj['plane'].children[0].geometry.vertices[j].y += upDown;
        worldObj['plane'].children[0].geometry.verticesNeedUpdate = true;
    }
  }

  worldObj['plane'].children[1].geometry.vertices[facei].y += upDown;
  worldObj['plane'].children[1].geometry.verticesNeedUpdate = true;

  //redraw affected track
  postTerrainAdjustments(point, radius);
}

function loadTerrain(point){
  for (j = 0; j < worldObj['plane'].children[0].geometry.vertices.length; j++)
    if (equalXZ(point, worldObj['plane'].children[0].geometry.vertices[j]) == 1)
        worldObj['plane'].children[0].geometry.vertices[j].y = point.y;

  for (j = 0; j < worldObj['plane'].children[1].geometry.vertices.length; j++)
    if (equalXZ(point, worldObj['plane'].children[1].geometry.vertices[j]) == 1)
        worldObj['plane'].children[1].geometry.vertices[j].y = point.y;

  worldObj['plane'].children[1].geometry.verticesNeedUpdate = true;
  worldObj['plane'].children[0].geometry.verticesNeedUpdate = true;
}

function raiseLowerTerrainAroundClick(intersection, upDown, radius){
  var point = intersection[0].point;
  var i = worldObj['plane'].children[0].geometry.vertices.length;
  while(i > 0){
    i--;
    var d = worldObj['plane'].children[0].geometry.vertices[i].distanceTo(point);
    if(d < radius)
      worldObj['plane'].children[0].geometry.vertices[i].y += (upDown*(1 - (d/radius)));
  }

  var i = worldObj['plane'].children[1].geometry.vertices.length;
  while(i > 0){
    i--;
    var d = worldObj['plane'].children[1].geometry.vertices[i].distanceTo(point);
    if(d < radius)
      worldObj['plane'].children[1].geometry.vertices[i].y += (upDown*(1 - (d/radius)));
  }

  worldObj['plane'].children[0].geometry.verticesNeedUpdate = true;
  worldObj['plane'].children[1].geometry.verticesNeedUpdate = true;

  //redraw affected track
  postTerrainAdjustments(point, radius);

}

function flattenGround(intersection,type){
  var face = intersection[0].face;
  face.color.setHex(0x00ff00);
  var face2 = worldObj['plane'].children[1].geometry.faces[face.buddy];

  var points = [face.a,face.b,face.c];
  points.push(points.indexOf(face2.a) == -1 ? face2.a : (points.indexOf(face2.b)  == -1 ? face2.b : ( face2.c)));

  if(type == 'top'){
    worldObj['plane'].children[1].geometry.vertices[points[0]].y =
    worldObj['plane'].children[1].geometry.vertices[points[1]].y =
    worldObj['plane'].children[1].geometry.vertices[points[2]].y =
    worldObj['plane'].children[1].geometry.vertices[points[3]].y =
    Math.max(
      worldObj['plane'].children[1].geometry.vertices[points[0]].y,
      worldObj['plane'].children[1].geometry.vertices[points[1]].y,
      worldObj['plane'].children[1].geometry.vertices[points[2]].y,
      worldObj['plane'].children[1].geometry.vertices[points[3]].y
    );
  }
  else if(type == 'bottom'){
    worldObj['plane'].children[1].geometry.vertices[points[0]].y =
    worldObj['plane'].children[1].geometry.vertices[points[1]].y =
    worldObj['plane'].children[1].geometry.vertices[points[2]].y =
    worldObj['plane'].children[1].geometry.vertices[points[3]].y =
    Math.min(
      worldObj['plane'].children[1].geometry.vertices[points[0]].y,
      worldObj['plane'].children[1].geometry.vertices[points[1]].y,
      worldObj['plane'].children[1].geometry.vertices[points[2]].y,
      worldObj['plane'].children[1].geometry.vertices[points[3]].y
    );
  }
  else if(type == 'middle' || type == 'average'){
    var avgZ = (
      worldObj['plane'].children[1].geometry.vertices[points[0]].y +
      worldObj['plane'].children[1].geometry.vertices[points[1]].y +
      worldObj['plane'].children[1].geometry.vertices[points[2]].y +
      worldObj['plane'].children[1].geometry.vertices[points[3]].y
    ) / 4;

    if(type == 'middle'){
      worldObj['plane'].children[1].geometry.vertices[points[0]].y =
      worldObj['plane'].children[1].geometry.vertices[points[1]].y =
      worldObj['plane'].children[1].geometry.vertices[points[2]].y =
      worldObj['plane'].children[1].geometry.vertices[points[3]].y =
      avgZ;
    }
    else{
      worldObj['plane'].children[1].geometry.vertices[points[0]].y += ((avgZ - worldObj['plane'].children[1].geometry.vertices[points[0]].y) * .05)
      worldObj['plane'].children[1].geometry.vertices[points[1]].y += ((avgZ - worldObj['plane'].children[1].geometry.vertices[points[1]].y) * .05)
      worldObj['plane'].children[1].geometry.vertices[points[2]].y += ((avgZ - worldObj['plane'].children[1].geometry.vertices[points[2]].y) * .05)
      worldObj['plane'].children[1].geometry.vertices[points[3]].y += ((avgZ - worldObj['plane'].children[1].geometry.vertices[points[3]].y) * .05)
    }
  }

  for(var i = 0; i < 4; i++)
    for (var j = 0; j < worldObj['plane'].children[0].geometry.vertices.length; j++)
      if (equalXZ(worldObj['plane'].children[1].geometry.vertices[points[i]], worldObj['plane'].children[0].geometry.vertices[j]) == 1)
        worldObj['plane'].children[0].geometry.vertices[j].y = worldObj['plane'].children[1].geometry.vertices[points[i]].y;

  worldObj['plane'].children[1].geometry.verticesNeedUpdate = true;
  worldObj['plane'].children[0].geometry.verticesNeedUpdate = true;

  postTerrainAdjustments(intersection[0].point, 145);

}

function postTerrainAdjustments(point, radius){

  track.checkTrackInArea(point, radius + 145);

  setTimeout(function(){
    var i = -2;
    var treeInterval = setInterval(function(){
      i += 2;
      if(i >= tree.trees.length){
        clearInterval(treeInterval);
        return;
      }

      if(point.distanceTo(tree.trees[i][0].position) <= radius){
        var oy = tree.trees[i][0].position.y
        tree.trees[i][0].position.y = findY(tree.trees[i][0].position.x,tree.trees[i][0].position.z);
        tree.trees[i][1].position.y += (tree.trees[i][0].position.y - oy);
      }
    });
  }, 10);

  // tree.trees.map(function(tree){
  //   if(point.distanceTo(tree[0].position) <= radius){
  //     var oy = tree[0].position.y
  //     tree[0].position.y = findY(tree[0].position.x,tree[0].position.z);
  //     tree[1].position.y += (tree[0].position.y - oy);
  //   }
  // });

  building.building.map(function(b){
    b.baseY = findY(b.position.x,b.position.z);
    b.position.y = b.baseY + b.buildingHeight;
  });

  layRoads.recalcPathInArea(point.x,point.z,radius);
}

function recolorGround(intersection){

  var face = intersection[0].face;
  var face2 = worldObj['plane'].children[1].geometry.faces[face.buddy];

  console.log(selectedColor)
  face.color.setRGB(selectedColor[0]/255,selectedColor[1]/255,selectedColor[2]/255)
  face2.color = face.color;
  worldObj['plane'].children[1].geometry.colorsNeedUpdate = true;

}
