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

    .at_train_area_pre{
      position: relative;
      width: 326px;
      height: auto;
      border-radius: 8px;
      border: solid 2px #473119;
      background-color: #222;
      overflow-x: scroll;
      overflow-y: hidden;
      white-space: nowrap;
      padding: 0px;
    }

    .at_train_area{
      position: relative;
      width: 322px;
      height: 68px;
      background-color: #222;
      white-space: nowrap;
    }

    .at_item{
      position: relative;
      border-radius: 8px;
      border: solid 2px #666;
      background-color: #444;
      padding: 0px;
      height: 60px;
      width: 59px;;
      margin: 2px;
      display: block;
      float:left;
    }

    .at_hover{
      border-radius: 8px;
      border: solid 2px #888;
    }

    .at_clicked{
      background-color: #555;
    }

    .at_add{
      width: 15px;
      height: 82px;
      margin: 4px;
      float: left;
      color: white;
      line-height: 82px;
      vertical-align: center;
      text-align: center;
      overflow-x: hidden
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

  <script src="sources/threejs/build/three.js"></script>
  <script src='libs/3dImageStatic.js'></script>
  <script>

    var addTrainDisplayType = 'engine';

    displayOneType = function(type){
      addTrainDisplayType = type;
      var children = document.getElementById('at_selectArea').children;
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
    }

    highlightOut = function(e){
      if(e.target.className.indexOf('at_item') >= 0){
        e.target.className = 'at_item'
      }
    }

    highlightClick = function(e){
      if(e.target.className.indexOf('at_item') >= 0){
        e.target.className = 'at_item at_hover at_clicked'
        setTimeout(function(){e.target.className = 'at_item at_hover'},100);
      }
    }

    var addTrain = {
      engine: '',
      railcars: []
    }

    var at_objs = 0;

    delete_from_addTrain = function(e){
      var par_el = e.target.parentNode;
      if(e.target.type == 'railcar'){
        par_el.removeChild(e.target);
        addTrain.railcars.splice(e.target.trainNum,1);
        console.log(addTrain);
      }
      else if (e.target.type == 'engine'){
        addTrain = {
          engine: '',
          railcars: []
        }
        while( par_el.hasChildNodes() ){
          par_el.removeChild(par_el.lastChild);
        }
        displayOneType('engine');
        console.log(addTrain);
      }
    }

    processClick = function(e){
      new_el = e.target.cloneNode(true);
      new_el.id = 'obj'+e.target.type+addTrain.railcars.length+e.target.title
      new_el.trainNum = addTrain.length;
      new_el.type = e.target.type;

      //events
      new_el.className = 'at_item';
      new_el.onmouseover = highlightIn;
      new_el.onmouseout = highlightOut;
      new_el.onmousedown = function(e){highlightClick(e); delete_from_addTrain(e);};

      par_el = document.getElementById('at_train_area');
      par_el.appendChild(new_el);

      el_width = (new_el.getBoundingClientRect().width+4) * (addTrain.railcars.length + 2);

      par_el.style.width = el_width > 322 ? el_width+'px' : '322px';
      par_el.parentNode.scrollLeft = el_width

      if(addTrainDisplayType == 'engine'){
        addTrain.engine = e.target.title;
        displayOneType('railcar');
      }
      else if(addTrainDisplayType == 'railcar'){

        addTrain.railcars.push(e.target.title);
      }
      else if(addTrainDisplayType == 'object'){

      }
      console.log(addTrainDisplayType,addTrain);
    }

    runNextAddTrainItem = function(urls,curUrlNum){

      if(urls[curUrlNum] == undefined)
        return

      var parEl = document.getElementById('at_selectArea');
      var div = document.createElement('img');

      //divinfo
      div.className += 'at_item';
      div.id = 'obj_'+urls[curUrlNum].path;
      div.type = urls[curUrlNum].type;
      div.style.display = 'block';
      div.innerHTML = '';

      //events
      div.onmouseover = highlightIn;
      div.onmouseout = highlightOut;
      div.onmousedown = function(e){highlightClick(e); processClick(e);};

      //append to parent
      parEl.appendChild(div);

      obj = new staticObj();
      obj.loadFile(urls[curUrlNum].path,div)
      if(urls.length > curUrlNum) {
        var keepGoing = function(){
          console.log(obj.done);
          if(obj.done == 1){
            div.src = obj.image;
            div.title = urls[curUrlNum].name;
            runNextAddTrainItem(urls,curUrlNum+1);
            return
          }
          else{
            setTimeout(keepGoing,2);
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
          if(strpos(end($ex),'.') === false){
            echo file_get_contents($Loadobjs).",";
          }
        }
      ?>
      ]
      console.log(urls);
      runNextAddTrainItem(urls,0);
      setTimeout(function(){displayOneType('engine')},2000);
    }
  </script>

  <div class='at_lowerMenu'>
    <div class='at_train_area_pre at_add'>
        +
    </div>
    <div id='at_train_area_pre' class='at_selectArea at_train_area_pre'>
      <div id='at_train_area' class='at_train_area'>

      </div>
    </div>
    <div id='at_selectArea' class='at_selectArea'>
    </div>
  </div>
</span>
