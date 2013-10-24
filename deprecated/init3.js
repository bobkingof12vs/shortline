function initCamera() {
  var retCam = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -1000, 1000);
  
  retCam.origin = new THREE.Vector3(0,5,0); 
  retCam.position = new THREE.Vector3(0,15,10);
  retCam.lookAt(retCam.origin);
  
  retCam.rvert = -Math.PI/5;
  retCam.rhont = 0;
  
  retCam.rotCamVert = function(rad){
    if ((retCam.rvert > -Math.PI/5 & rad < 0) | (retCam.rvert < Math.PI/8 & rad > 0)) {
      retCam.rvert = rad;
      retCam.position.y = (10*Math.cos(retCam.rvert) - 10*Math.sin(retCam.rvert))
      retCam.position.z = (10*Math.sin(retCam.rvert) + 10*Math.cos(retCam.rvert))
      retCam.lookAt(retCam.origin);
      matrixWorldNeedsUpdate = true;
    }
  }
  
  retCam.rotCamHont = function(rad){
    if ((retCam.rvert > -Math.PI/5 & rad < 0) | (retCam.rvert < Math.PI/8 & rad > 0)) {
      retCam.rhont = rad;
      retCam.position.z = (10*Math.cos(retCam.rhont) - 10*Math.sin(retCam.rhont))
      retCam.position.x = (10*Math.sin(retCam.rhont) + 10*Math.cos(retCam.rhont))
      retCam.lookAt(retCam.origin);
      matrixWorldNeedsUpdate = true;
    }
  }
  
  retCam.rotCamHont(retCam.rvert);
  retCam.rotCamVert(retCam.rhont);
  return retCam;
}