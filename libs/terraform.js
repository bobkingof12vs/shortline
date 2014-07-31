function raiseLowerTerrain(i,upDown){
  a = i[0].face.a;
  b = i[0].face.b;
  c = i[0].face.c;
  vv = i[0].point;
  ad = vv.distanceTo(obj['plane'].children[1].geometry.vertices[a]);
  bd = vv.distanceTo(obj['plane'].children[1].geometry.vertices[b]);
  cd = vv.distanceTo(obj['plane'].children[1].geometry.vertices[c]);
  if (ad <= bd & ad <= cd) {facei = a;}
  else if (bd <= ad & bd <= cd) {facei = b;}
  else{facei = c;}
  
  for (j = 0; j < obj['plane'].children[0].geometry.vertices.length; j++) {
    if (obj['plane'].children[1].geometry.vertices[facei].x == obj['plane'].children[0].geometry.vertices[j].x
      & obj['plane'].children[1].geometry.vertices[facei].z == obj['plane'].children[0].geometry.vertices[j].z) {
        obj['plane'].children[0].geometry.vertices[j].y += upDown;
        obj['plane'].children[0].geometry.verticesNeedUpdate = true;
    }
  }

  obj['plane'].children[1].geometry.vertices[facei].y += upDown;
  obj['plane'].children[1].geometry.verticesNeedUpdate = true;
  
  //redraw affected track
  track.checkTrackInArea(obj['plane'].children[1].geometry.vertices[facei]);
}