
//---Events---//

renderer.domElement.addEventListener( 'mousewheel', function( event ) {
  event.preventDefault();
  event.stopPropagation();
    
  var delta = 0;
  delta = event.wheelDelta * .001;
  if (((zoom + delta > .25) & delta < 0) | ((zoom + delta < 5) & delta > 0)) {
    zoom += delta;
  }
  
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
  if (e.clientX > menuHW.x | e.clientY > menuHW.y) {mouseInMenu = 0;}
  else{mouseInMenu = 1;}
});

document.addEventListener( 'mousedown', function (e){
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (mouseInMenu == 0) {
    getMouseIntersect(mouse, [obj['plane'].children[1]],function(i){
      console.log("'intersect'",i);
      if(m['m_ter_raise'].clicked == 1){raiseLowerTerrain(i,+50);}
      if(m['m_ter_lower'].clicked == 1){raiseLowerTerrain(i,-50);}
      if(m['m_tra_lay'].clicked == 1 ){layTrack(i);}
    });
    getMouseIntersect(mouse,obj['switches'].children,function(i){
      console.log('switches',i)
      checkSwitches(i);
    });
  }
}, false );