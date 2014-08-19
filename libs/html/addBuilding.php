<span id='addBuilding'>
  <style scoped>
    #addBuilding{
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      z-index: 1;
      position: absolute;
    }

    .ab_lowerMenu{
      position: fixed;
      bottom: 0px;
      right: 0px;
      padding: 6px;
      border: solid 2px #473119;
      border-radius: 15px 0px 0px 0px;
      background-color: #c37547
    }

    .ab_selectArea{
      position: relative;
      width: 348px;
      height: 150px;
      margin: 4px;
      border-radius: 8px;
      border: solid 2px #473119;
      background-color: #222;
      overflow-y: scroll;
    }

    .ab_train_area_pre{
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

    .ab_textArea{
      position: absolute;
      width: 82px;
      height: 22px;
      background-color: #222;
      white-space: nowrap;
      border-radius: 5px;
      top: 7px;
      border-color: #000;
      left: 180px;
      text-align: center;
    }

    .ab_hover{
      border-radius: 8px;
      border: solid 2px #888;
    }

    .ab_clicked{
      background-color: #555;
    }

    .ab_item{
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

    .mid{
      position: absolute;
      top: 38px;
      left: 02px;
    }

    .mono{
      font-family: monospace;
      line-height: 20px;
      text-align: left;
      padding: 5px;
    }

    .backwords{
      position: relative;
      margin-left: -177px;
      left: 17px;
      bottom: 5px;
      text-align: center;
      color: #bbb;
      padding: 1px;
      z-index: 50;
      width: 177px;
    }

    .gray{
      color: #bbb;
    }

    input[type='range'] {
      -webkit-appearance: none;
      outline: none;
      height: 20px;
      width: 160px;
      margin: 8px;
      border: solid 1px #000000;
      border-radius: 5px;
      background-color: #222222;
      z-index: 111;
    }

    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      position: relative;
      height: 32px;
      width: 20px;
      border: solid 1px #222222;
      border-radius: 5px;
      background-color: #777777;
      z-index: 100;
    }

  </style>

  <script>

    var buildingHeight = 0;
    var buildingRotation = 270;
    userRot = function(){
      buildingRotation = document.getElementById('brot').value * 3.6;
      document.getElementById('buildingRotation').value = buildingRotation;
    }
    inputRot = function(){
      var preChange = buildingRotation;
      buildingRotation = document.getElementById('buildingRotation').value.replace(/[^\d]/g, '');
      if(buildingRotation > 10000 || buildingRotation < -10000){
        alert("no numbers over 10000 or under -10000 please\nno changes made")
        buildingRotation = preChange;
      }
      while(buildingRotation > 360)
        buildingRotation -= 360;
      while(buildingRotation < 0)
        buildingRotation += 360
      document.getElementById('buildingRotation').value = buildingRotation;
      document.getElementById('brot').value = buildingRotation / 3.6;
    }

    userHeight = function(){
      buildingRotation = (document.getElementById('bheight').value - 50)/5;
      document.getElementById('buildingHeight').value = buildingRotation;
    }
    inputHeight = function(){
      var preChange = buildingHeight;
      buildingHeight = document.getElementById('buildingHeight').value.replace(/[^\d]/g, '');
      document.getElementById('buildingHeight').value = buildingHeight;
      document.getElementById('bheight').value = (buildingHeight * 5) + 50;
    }


    processBuildingClick = function(e){
      console.log('add '+e.target.title+"\n"+e.target.path)
    }

    runNextAddBuildingItem = function(urls,curUrlNum,callback){

      if(urls[curUrlNum] == undefined)
        return callback();

      var parEl = document.getElementById('ab_selectArea');
      var div = document.createElement('img');

      //divinfo
      div.className = 'at_item';
      div.id = 'obj_'+urls[curUrlNum].path;
      div.style.display = 'block';
      div.innerHTML = '';

      //events
      div.onmouseover = highlightIn;
      div.onmouseout = highlightOut;
      div.onmousedown = function(e){highlightClick(e); processBuildingClick(e);};

      //append to parent
      parEl.appendChild(div);

      obj = new staticObj();
      obj.zoom = 7;
      obj.loadFile(urls[curUrlNum].path,div)
      if(urls.length > curUrlNum) {
        var keepGoing = function(){
          if(obj.done == 1){
            div.src = obj.image;
            div.path = urls[curUrlNum].path
            div.title = urls[curUrlNum].name;
            runNextAddBuildingItem(urls,curUrlNum+1,callback);
            return
          }
          else{
            setTimeout(keepGoing,2);
          }
        }
        keepGoing();
      }
    }

    m['m_bld'].onclickEvent = function(menu,click){
      if(click == 1){
        document.getElementById('addBuilding').style.zIndex = 4;
      }
      else
        document.getElementById('addBuilding').style.zIndex = 1;
    }
  </script>

  <div class='ab_lowerMenu'>
    <div id='ab_editArea'>

    <div style="position: relative;">
      <input id='brot' type='range' value=75  step=6.25 onchange='userRot()'>
        <span class='mono backwords'>Rotation</span>
      </input>
      <input id='buildingRotation' type='text' onchange='inputRot()' class='mono ab_textArea gray' style='text-align:center;' value=270> </input>
    </div>
    <div style="position: relative;">
      <input id='bheight' type='range' value=50  step=5 onchange='userHeight()'>
        <span class='mono backwords'>Height</span>
      </input>
      <input id='buildingHeight' type='text'' onchange='inputHeight()' class='mono ab_textArea gray' style='text-align:center;' value=0> </input>
    </div>
    </div>
    <div id='ab_selectArea' class='ab_selectArea'>
    </div>
  </div>
</span>
