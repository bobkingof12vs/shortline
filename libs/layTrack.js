//trackpreline could be cleaned up to not use a new object for each child

 var layTrack = new (function(){

  this.trackPreLine = {};
  this.trackPreLine.part = 'init';
  this.trackPreLine.curTrack = -1;
  this.trackPreLine.curSeg = -1;
  this.trackPreLine.origin = new THREE.Vector3();
  this.trackPreLine.blinemat = new THREE.LineBasicMaterial( { color: 0xaa2222, linewidth: 5 } );
  this.trackPreLine.blinemat2 = new THREE.LineBasicMaterial( { color: 0x00ff00, linewidth: 5 } );
  this.trackPreLine.children = [];

  m['m_tra_lay'].onclickEvent = function(menu, clicked){
    if(clicked == 1){

      layTrack.addSpotToScene(new THREE.Vector3(0,0,0));

      layTrack.firstClick = 1;
      layTrack.trackPreLine.part = 'init';

      var j = layTrack.trackPreLine.children.length;
      while (j--){
        if(layTrack.trackPreLine.children[j] == undefined) continue;
        //layTrack.trackPreLine.children[j].material = this.trackPreLine.blinemat2;//.color.setHex(0x2222aa);
        var k = layTrack.trackPreLine.children[j].geometry.vertices.length
        while(k--){
          layTrack.trackPreLine.children[j].geometry.vertices[k] = recalcY(layTrack.trackPreLine.children[j].geometry.vertices[k],5);
          layTrack.trackPreLine.children[j].geometry.verticesNeedUpdate = true;
        }
        scene.add(layTrack.trackPreLine.children[j]);
      }
    }
    else{
      console.log('here yep',clicked)

      var j = layTrack.trackPreLine.children.length;
      console.log('start j ',j)
      while (j--){
        console.log(j)
        scene.remove(layTrack.trackPreLine.children[j]);
      }
      scene.remove(layTrack.trackPreLine.temp);
    }
  }

  this.closePoint = function(point){
    var j = trackPoints.length;
    var far = 50;
    var winner = -1;
    while (j>0) {
      j--;{
        if (trackPoints[j].p1.distanceTo(point) < far) {
          far = trackPoints[j].p1.distanceTo(point);
          winner = trackPoints[j].p1;
        }
        else if (trackPoints[j].p3.distanceTo(point) < far) {
          far = trackPoints[j].p3.distanceTo(point);
          winner = trackPoints[j].p3;
        }
      }
    }
    if (winner != -1) {
      point = winner;
    }
    else{
      //console.log('ddd',point);
      point.x = Math.round(point.x/50)*50;
      point.z = Math.round(point.z/50)*50;
      //console.log(point);
    }
    return point;
  }
  this.processClick = function(i){
    var point = this.closePoint(i[0].point);

    if (this.trackPreLine.part == 'init') {
      this.trackPreLine.part = 'part2';
      this.trackPreLine.curSeg++;
      this.trackPreLine.origin = point;

      var geom = new THREE.Geometry();
      geom.vertices.push(point);
      geom.vertices.push(point);

    }

    if (this.trackPreLine.part == 'part2') {
      this.trackPreLine.part = 'part3'

      listener = function(e){
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        if (m['m_tra_lay'].clicked == 1 & mouseInMenu == 0) {
          getMouseIntersect(mouse, [plane],function(i){

            if (i != 1) {
              i[0].point = layTrack.closePoint(i[0].point);

              if (trackPoints.length > 0) {
                if (angleBetweenFlattenedVectors(
                  trackPoints[trackPoints.length-1].p1,
                  i[0].point,
                  trackPoints[trackPoints.length-1].p3
                ) <= 90 & layTrack.firstClick == 0) {return}
              }

              layTrack.addPreLineToScene(layTrack.trackPreLine.origin,i[0].point);
            }

          });
        }
        else if (m['m_tra_lay'].clicked != 1){
          //m['m_tra_lay'].onclickEvent({},-1);
          document.body.removeEventListener('mousemove',listener,false);
        }

      }
      document.body.addEventListener('mousemove',listener,false);
    }

    else if (this.trackPreLine.part == 'part3') {

      if (trackPoints.length > 1) {
        if (angleBetweenFlattenedVectors(
          trackPoints[trackPoints.length-1].p1,
          point,
          this.trackPreLine.origin
        ) <= 90 & this.firstClick == 0) { return;}
      }

      layTrack.trackPreLine.children[layTrack.trackPreLine.curSeg] = new THREE.Line( this.lgeom, this.trackPreLine.blinemat)

      scene.add(layTrack.trackPreLine.children[layTrack.trackPreLine.curSeg]);
      scene.remove(layTrack.trackPreLine.temp);
      layTrack.trackPreLine.temp = {};

      this.firstClick = 0;

      var w = midpoint(this.trackPreLine.origin,point);

      trackPoints.push({
        p1: this.trackPreLine.origin,
        p2: w,
        p3: point
      });
      track.addToSection(this.trackPreLine.origin,w,point);

      this.trackPreLine.curSeg++;
      this.trackPreLine.origin = point;
    }
  }

  this.addPreLineToScene = function(o,p) {
    this.lgeom = new THREE.Geometry();
    this.lgeom.vertices = gridPointsOnLine(100,o,p);

    scene.remove(layTrack.trackPreLine.temp);

    this.trackPreLine.temp = new THREE.Line( this.lgeom, this.trackPreLine.blinemat)
    scene.add(this.trackPreLine.temp);
  }

  this.addSpotToScene = function(point){
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

})();
