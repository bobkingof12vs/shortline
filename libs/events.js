
//---Events---//
var middleButtonDown = false;
renderer.domElement.addEventListener( 'mousewheel', function( event ) {
  event.preventDefault();
  event.stopPropagation();

  if(middleButtonDown) return;

  var speed = .0001;
  var deltaY = event.wheelDelta * speed;
  var deltaX = event.wheelDeltaX * speed;

  controls.rotateLeft( deltaX * Math.PI);

  if(event.shiftKey & deltaY > 0)
    controls.rotateUp(deltaY * Math.PI);
  else if(event.shiftKey & deltaY < 0)
    controls.rotateUp(deltaY * Math.PI);

  if (!event.shiftKey & (((zoom + deltaY > .5) & deltaY < 0) | ((zoom + deltaY < 20) & deltaY > 0)))
    zoom += deltaY * 10;

  camera.left = window.innerWidth / -zoom;
  camera.right = window.innerWidth / zoom;
  camera.top = window.innerHeight / zoom;
  camera.bottom = window.innerHeight / -zoom;

  camera.updateProjectionMatrix();
},false);

function onWindowResize() {
  camera.left = window.innerWidth / -zoom;
  camera.right = window.innerWidth / zoom;
  camera.top = window.innerHeight / zoom;
  camera.bottom = window.innerHeight / -zoom;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

mouseInMenu = 0;
document.addEventListener( 'mousemove', function (e){
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (e.target.id == 'c') {
    mouseInMenu = 0;
    getMouseIntersect(mouse, [plane],function(i){
      if(m['m_bld'].clicked == 1){building.processBuildingMove(i[0].point);}
      //if(m['m_tre'].clicked == 1){tree.moveCircle(i[0].point);}
    });
  }
  else{
    mouseInMenu = 1;
  }
});

document.addEventListener( 'mouseup', function (e){
    middleButtonDown = false;
});

document.addEventListener( 'mousedown', function (e){
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  if(e.button != undefined && e.button == 1)
    middleButtonDown = true

  if (mouseInMenu == 0) {

    //terrain
    //console.log(plane);
    getMouseIntersect(mouse, [plane],function(i){
      //console.log("'intersect'",i);
      if(m['m_ter_raise'].clicked == 1){raiseLowerTerrain(i,+10);}
      if(m['m_ter_lower'].clicked == 1){raiseLowerTerrain(i,-10);}
      if(m['m_tra_lay'].clicked == 1 ){layTrack.processClick(i);}
      if(m['m_tre_one'].clicked == 1){tree.onclickAddTree(i[0].point);}
      if(m['m_tre_five'].clicked == 1){tree.onclickAddManyTrees(5,i[0].point);}
      if(m['m_bld'].clicked == 1){building.processBuildingClick(i[0].point);}
    });

    //trackswitches
    //console.log(track.throws);
    getMouseIntersect( mouse, track.throws, getThrows);

  }
  //e.preventDefault();
  //e.stopPropagation();
}, false );
