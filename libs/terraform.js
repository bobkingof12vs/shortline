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
  track.checkTrackInArea(worldObj['plane'].children[1].geometry.vertices[facei]);

  tree.trees.map(function(tree){
    tree.Mesh.position.y = findY(tree.Mesh.position.x,tree.Mesh.position.z);
  });

  building.building.map(function(b){
    console.log(b);
    b.baseY = findY(b.position.x,b.position.z);
    b.position.y = b.baseY + b.buildingHeight;
  });
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
