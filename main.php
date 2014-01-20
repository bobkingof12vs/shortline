<html>
<head>
  <style>
    #c {
      left: 0;
      bottom: 0px;
      width: 100%;
      height: 100%;
      position: fixed;
      background-color: #000000;
      z-index: 0;
    }
    
  </style>
</head>

<body id='b'>
  <div id='game' style='bottom: 40px'>
    <canvas id='c'></canvas>
    
    <script src="js/three.js"></script>
    <script src="js/OrbitControls.js"></script>
    <script src="js/helvetiker_regular.typeface.js"></script>
    <script src="js/general.js"></script>
    <script src="js/init.js"></script>
    <script src="js/terraform.js"></script>
    <script src="js/menu.js"></script>
    <script src="js/track.js"></script>
    <script src="js/events.js"></script>
    <?php include('js/train.php'); ?>
    
    <script>
      //console.log(THREE.UniformsUtils)
      //var v = document.getElementById( 'vertexShader' ).textContent
      //var f = document.getElementById( 'fragmentShader' ).textContent
      
      //---Main---//
      var then = Date.now(), now=Date.now();
      
      var render = function() {
        //requestAnimationFrame(render);
        setTimeout(render,1000/20);
        now = Date.now();
        train.workJobs(now-then);
        then = now;
        endTrack();
        controls.update();
        renderer.render(scene, camera);
      }
      render();
      
    </script>
  </div>
</body>
