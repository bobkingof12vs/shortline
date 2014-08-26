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

    var building = new (function(){
      this.building = [];

      this.buildingRotation = 270;
      this.userRot = function(){
        this.buildingRotation = document.getElementById('brot').value * 3.6;
        document.getElementById('buildingRotation').value = this.buildingRotation;
        this.processBuildingMove();
      }

      this.inputRot = function(){
        var preChange = this.buildingRotation;
        this.buildingRotation = document.getElementById('buildingRotation').value.replace(/[^\d]/g, '');
        if(this.buildingRotation > 10000 || this.buildingRotation < -10000){
          alert("no numbers over 10000 or under -10000 please\nno changes made")
          this.buildingRotation = preChange;
        }
        while(this.buildingRotation > 360)
          this.buildingRotation -= 360;
        while(this.buildingRotation < 0)
          this.buildingRotation += 360
        document.getElementById('buildingRotation').value = this.buildingRotation;
        document.getElementById('brot').value = this.buildingRotation / 3.6;
        this.processBuildingMove();
      }

      this.buildingHeight = 0;
      this.userHeight = function(){
        this.buildingHeight = (document.getElementById('bheight').value - 50)/5;
        document.getElementById('buildingHeight').value = this.buildingHeight;
        this.processBuildingMove();
      }

      this.inputHeight = function(){
        var preChange = this.buildingHeight;
        this.buildingHeight = document.getElementById('buildingHeight').value.replace(/[^\d]/g, '');
        document.getElementById('buildingHeight').value = this.buildingHeight;
        document.getElementById('bheight').value = (this.buildingHeight * 5) + 50;
        this.processBuildingMove();
      }

      this.buildingSelection = '';
      this.curBuildingId = 0;
      this.buildingMoving = 'yes'
      this.processBuildingClick = function(point){
        if(this.buildingMoving == 'no' && building.building[this.curBuildingId].position.distanceTo(point) <= 50)
          this.buildingMoving = 'yes'
        else
          this.buildingMoving = 'no'
      }

      this.processBuildingMove = function(point){
        if(this.buildingSelection == '') return;
        if(this.buildingMoving == 'yes'){
          this.building[this.curBuildingId].position.x = point.x;
          this.building[this.curBuildingId].position.z = point.z;
          this.building[this.curBuildingId].baseY = findY(point.x,point.z);
        }
        this.building[this.curBuildingId].buildingHeight = this.buildingHeight;
        this.building[this.curBuildingId].position.y = this.building[this.curBuildingId].baseY + this.buildingHeight;
        this.building[this.curBuildingId].rotation.y = this.buildingRotation * 0.0174532925;
      }

      this.runNextAddBuildingItem = function(urls,curUrlNum,callback){

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
        div.onmouseover = this.highlightIn;
        div.onmouseout = this.highlightOut;
        div.onmousedown = function(e){
          building.curBuildingId++;
          building.buildingMoving = 'yes'
          building.buildingSelection = e.target.title
          building.building[building.curBuildingId] = worldObj[e.target.objName].newMesh();
          scene.add(building.building[building.curBuildingId]);
        };

        //append to parent
        parEl.appendChild(div);

        tempObj = new staticObj();
        tempObj.zoom = 7;
        tempObj.loadFile(urls[curUrlNum].path,div)
        if(urls.length > curUrlNum) {
          var keepGoing = function(){
            if(tempObj.done == 1){
              div.src = tempObj.image;
              div.path = urls[curUrlNum].path
              div.title = urls[curUrlNum].name;
              div.objName = urls[curUrlNum].path.substr(urls[curUrlNum].path.lastIndexOf('/')+1).slice(0,-3);
              building.runNextAddBuildingItem(urls,curUrlNum+1,callback);
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
        this.buildingSelection = '';
        if(click == 1){
          document.getElementById('addBuilding').style.zIndex = 4;
        }
        else
          document.getElementById('addBuilding').style.zIndex = 1;
          if(building.buildingSelection != ''){
            scene.remove(building.building[building.curBuildingId]);
          }
      }
    })();

    console.log('building',building)
  </script>

  <div class='ab_lowerMenu'>
    <div id='ab_editArea'>

    <div style="position: relative;">
      <input id='brot' type='range' value=75  step=6.25 onchange='building.userRot()'>
        <span class='mono backwords'>Rotation</span>
      </input>
      <input id='buildingRotation' type='text' onchange='building.inputRot()' class='mono ab_textArea gray' style='text-align:center;' value=270> </input>
    </div>
    <div style="position: relative;">
      <input id='bheight' type='range' value=50  step=5 onchange='building.userHeight()'>
        <span class='mono backwords'>Height</span>
      </input>
      <input id='buildingHeight' type='text' onchange='building.inputHeight()' class='mono ab_textArea gray' style='text-align:center;' value=0> </input>
    </div>
    </div>
    <div id='ab_selectArea' class='ab_selectArea'>
    </div>
  </div>
</span>
