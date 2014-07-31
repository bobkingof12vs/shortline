<span id='addTrain' style='display: block;'>
  <style scoped>
    .at_lowerMenu{
      position: fixed;
      bottom: 0px;
      right: 0px;
      padding: 6px;
      border: solid 2px #473119;
      border-radius: 15px 0px 0px 0px;
      background-color: #c37547
    }

    .at_selectArea{
      position: relative;
      width: 348px;
      height: 150px;
      margin: 4px;
      border-radius: 8px;
      border: solid 2px #473119;
      background-color: #222;
      overflow-y: scroll;
    }

    .at_item{
      position: relative;
      border-radius: 8px;
      border: solid 2px #666;
      background-color: #444;
      height: 60px;
      width: 59px;;
      margin: 2px;
      display: block;
      float:left;
    }

    .at_hover{
      border-radius: 8px;
      border: solid 2px #aaa;
    }

    .at_clicked{
      background-color: #888;
    }

    div::-webkit-scrollbar {
      width: 15px;
      background-color: #222;
      border-radius: 8px;
      opacity: 0;
      zoom: 1;
    }

    div::-webkit-scrollbar-thumb {
      background-color:#aaa;
      border: solid 2px #555;
      border-radius: 8px;
      height: 10px;
    }

  </style>

  <script src='libs/3dImageStatic.js'></script>
  <script src="sources/threejs/build/three.js"></script>
  <script>

    var addTrainDisplayType = 'railcar';

    displayOneType = function(type){
      var children = document.getElementById('at_selectArea').children
      var i = children.length;
      while (i > 0){
        i--;
        console.log(children[i].style.display);
        if(type == 'all' || children[i].type == type)
          children[i].style.display = 'block';
        else
          children[i].style.display = 'none';
      }
    }

    highlightIn = function(e){
      if(e.target.className.indexOf('at_item') >= 0){
        e.target.className = 'at_item at_hover'
      }
      if(e.target.parentNode.className.indexOf('at_item') >= 0){
        e.target.parentNode.className = 'at_item at_hover'
      }
    }

    highlightOut = function(e){
      if(e.target.className.indexOf('at_item') >= 0){
        e.target.className = 'at_item'
      }
      if(e.target.parentNode.className.indexOf('at_item') >= 0){
        e.target.parentNode.className = 'at_item'
      }
    }

    highlightClick = function(e){
      if(e.target.className.indexOf('at_item') >= 0){
        e.target.className = 'at_item at_hover at_clicked'
        setTimeout(function(){e.target.className = 'at_item at_hover'},100);
      }
      if(e.target.parentNode.className.indexOf('at_item') >= 0){
        e.target.parentNode.className = 'at_item at_hover at_clicked'
        setTimeout(function(){e.target.parentNode.className = 'at_item at_hover'},100);
      }
    }

    runNextAddTrainItem = function(urls,curUrlNum){
      if(urls[curUrlNum] == undefined)
        return

      console.log(urls,curUrlNum,urls.length);
      var parEl = document.getElementById('at_selectArea');
      var div = document.createElement('div');
      div.className += 'at_item';
      div.title = urls[curUrlNum].path;
      div.id = 'obj_'+urls[curUrlNum].path;
      div.style.display = 'block';
      div.type = urls[curUrlNum].type;
      div.onmouseover = highlightIn;
      div.onmouseout = highlightOut;
      div.onmousedown = highlightClick;
      parEl.appendChild(div);
      obj = new staticObj();
      obj.loadFile(urls[curUrlNum].path,div)
      if(urls.length - 1 > curUrlNum) {
        var keepGoing = function(){
          console.log(obj.done);
          if(obj.done == 1){
            runNextAddTrainItem(urls,curUrlNum+1);
            return
          }
          else{
            setTimeout(keepGoing,200);
          }
        }
        keepGoing();

      }

    }

    window.onload = function(){
      var urls = [
      <?php
        $loadObjFiles = glob('loadObjects/*');
        foreach($loadObjFiles as $Loadobjs){
          $ex = explode('/',$Loadobjs);
          if(strpos(end($ex),'.') === false)
            echo file_get_contents($Loadobjs).",";
        }
      ?>
      ]
      console.log(urls);
      runNextAddTrainItem(urls,0);
      setTimeout(function(){displayOneType('engine')},2000);
    }
  </script>

  <div class='at_lowerMenu'>
    <div id='at_selectArea' class='at_selectArea'>
    </div>
  </div>
</span>
