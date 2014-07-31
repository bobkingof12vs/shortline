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

    <script src="sources/threejs/build/three.js"></script>
    <script src="sources/threejs/examples/js/controls/OrbitControls.js"></script>
    <script src="sources/threejs/examples/fonts/helvetiker_regular.typeface.js"></script>
    <script src="libs/general.js"></script>
    <script src="libs/init.js"></script>
    <script src="libs/terraform.js"></script>
    <script src="libs/menu.js"></script>
    <script src="libs/buildTrack.js"></script>
    <script src="libs/events.js"></script>
    <script src="libs/train.js"></script>
    <?php include('libs/load.php') ?>

    <?php
      $loadHTMLFiles = glob('libs/html/*');
      foreach($loadHTMLFiles as $load){
        echo "\n".file_get_contents($load);
      }
    ?>

    <script>
      //console.log(THREE.UniformsUtils)
      //var v = document.getElementById( 'vertexShader' ).textContent
      //var f = document.getElementById( 'fragmentShader' ).textContent

      //---Main---//

      document.title = 'Shortline';
      var then = Date.now(), now=Date.now();

      var work = working = 0;
      var render = function() {
        //requestAnimationFrame(render);
        //setTimeout(render,1000/2);
        setTimeout(render,1000/20);
        now = Date.now();
        if(work != -1
          && m['m_hlt'].clicked != 1
          && m['m_tgo'].clicked == 1){
          work = train.workJobs(50);
          then = now;
          track.endTrack();
          checkMenus();
        }//now-then);
        controls.update();
        renderer.render(scene, camera);
      }
      render();

      /*var dispObjects = [];
      var demObjs = function(){
        i = dispObjects.length;
        while( i > 0){
          i--;
          scene.remove(dispObjects[i]);
        }
        dispObjects = [];
        var i = track.sections.length;
        while (i > 0){
          i--;
          if(track.sections[i] != null){
            var j = Math.floor(track.sections[i].points.length/2);
            dispObjects.push(testText(i,recalcY(track.sections[i].points[j],30),THREE.Vector3(9,0,0),THREE.Vector3(.5,.5,.5)));
          }
        }
        var i = track.segments.length;
        while (i > 0){
          i--;
          if(track.segments[i] != null){
            dispObjects.push(testText(i,recalcY(track.segments[i].p2,10),THREE.Vector3(9,0,0),THREE.Vector3(.5,.5,.5),0x000088,0xff0000));
          }
        }
        var i = track.switches.length
        while (i > 0){
          i--;
          dispObjects.push(testText(i,recalcY(track.switches[i].origin,10),THREE.Vector3(9,0,0),THREE.Vector3(.5,.5,.5),0x00ff88,0xffff00));
        }
        setTimeout(demObjs,10000);
      };
      demObjs();*/
    </script>
  </div>


</body>
