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
    
    <script src="sources/threejs/build/three.min.js"></script>
    <script src="sources/threejs/examples/js/controls/OrbitControls.js"></script>
    <script src="sources/threejs/examples/fonts/helvetiker_regular.typeface.js"></script>
    <script src="js/general.js"></script>
    <script src="js/init.js"></script>
    <script src="js/terraform.js"></script>
    <script src="js/menu.js"></script>
    <script src="js/buildTrack.js"></script>
    <script src="js/events.js"></script>
    <!---<script src="js/train.js"></script>--->
    <!---<?php include('js/load.php') ?>--->
    
    <script>
      //console.log(THREE.UniformsUtils)
      //var v = document.getElementById( 'vertexShader' ).textContent
      //var f = document.getElementById( 'fragmentShader' ).textContent
      
      //---Main---//
      
      document.title = 'Shortline';
      var then = Date.now(), now=Date.now();
      
      var render = function() {
        //requestAnimationFrame(render);
        setTimeout(render,1000/20);
        now = Date.now();
        //train.workJobs(now-then);
        then = now;
        track.endTrack();
        checkMenus();
        controls.update();
        renderer.render(scene, camera);
      }
      render();
    </script>
  </div>
  
  <?php
    $loadHTMLFiles = glob('/Google Drive/webroot/train/js/html/*');
    foreach($loadHTMLFiles as $load){
      //echo "\n".file_get_contents($load);
    }
  ?>
  
</body>
