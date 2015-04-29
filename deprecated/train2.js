var testC = testCube(new THREE.Vector3(0,0,0));

m['m_tgo'].onclickEvent = function(){
  then = Date.now(), now=Date.now();
}

var trainFunc = function(){
  this.engines = {}
  this.train = []

  this.rebuildPath = function(stay, specNum){
    var i = specNum != undefined ? specNum + 1 : this.train.length;
    var j = specNum != undefined ? specNum     : 0;

    while(i > j) {
      i--;

      var trainLength = 0;
      if(this.train[i].railcars.length > 0)
        this.train[i].path.trainLength = trainLength = this.train[i].railcars[this.train[i].railcars.length - 1].distanceBehind + this.train[i].railcars[this.train[i].railcars.length - 1].opts.sizeLength

      var brakeDist = ((Math.pow(this.train[i].engine.opts.top,2)/(2*this.train[i].engine.opts.dec)) + this.train[i].engine.curSpeed);

      var nextTotalDist = 0;
      var prevTotalDist = 0;
      var k = 0;

      if(this.train[i].engine.curSpeed >= 0){
        //.log('forward')
        if(this.train[i].path.nextP[0] !== false && !stay){
          this.train[i].path.previousP.unshift(this.train[i].path.currentP);
          this.train[i].path.currentP = this.train[i].path.nextP[0];
        }

        var klim = this.train[i].path.previousP.length;
        while(k < klim && this.train[i].path.previousP[k] !== false){
          prevTotalDist += track.sectionDistance(this.train[i].path.previousP[k].sec.id);
          if(prevTotalDist >= trainLength + brakeDist){
            this.train[i].path.previousP.splice(k+1,klim);
            klim = this.train[i].path.previousP.length;
          }
          k++;
        }

        this.train[i].path.nextP = [];
        this.train[i].path.nextP.push(track.getNextSec(this.train[i].path.currentP.sec.id,this.train[i].path.currentP.dir))
        if(this.train[i].path.nextP[this.train[i].path.nextP.length - 1] !== false)
          nextTotalDist += track.sectionDistance(this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id);
      }

      if(this.train[i].engine.curSpeed <= 0){
        if(this.train[i].path.previousP[0] !== false && !stay){
          this.train[i].path.nextP.unshift(this.train[i].path.currentP);
          this.train[i].path.currentP = this.train[i].path.previousP[0];
        }

        var klim = this.train[i].path.nextP.length; //-1
        while(k < klim && this.train[i].path.nextP[k] !== false){
          nextTotalDist += track.sectionDistance(this.train[i].path.nextP[k].sec.id);
          if(nextTotalDist >= brakeDist){
            this.train[i].path.nextP.splice(k+1,klim);
            klim = this.train[i].path.nextP.length;
          }
          k++;
        }

        this.train[i].path.previousP = [];
        this.train[i].path.previousP.push(track.getPrevSec(this.train[i].path.currentP.sec.id,this.train[i].path.currentP.dir));
        if(this.train[i].path.previousP[this.train[i].path.previousP.length - 1] != false)
          prevTotalDist += track.sectionDistance(this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id);
      }

      while(nextTotalDist <= brakeDist && this.train[i].path.nextP.length < 2 && this.train[i].path.nextP[this.train[i].path.nextP.length - 1] !== false){
        this.train[i].path.nextP.push(
          track.getNextSec(
            this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id,
            this.train[i].path.nextP[this.train[i].path.nextP.length - 1].dir
          )
        );
        if(this.train[i].path.nextP[this.train[i].path.nextP.length - 1] !== false)
          nextTotalDist += track.sectionDistance(this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id);
      }
      this.train[i].path.nextPTotalDist = nextTotalDist;

      while((prevTotalDist <= trainLength + brakeDist) && this.train[i].path.previousP[this.train[i].path.previousP.length - 1] !== false){
        this.train[i].path.previousP.push(
          track.getPrevSec(
            this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id,
            this.train[i].path.previousP[this.train[i].path.previousP.length - 1].dir
          )
        );
        if(this.train[i].path.previousP[this.train[i].path.previousP.length - 1] !== false)
          prevTotalDist += track.sectionDistance(this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id);
      }
      this.train[i].path.previousPTotalDist = prevTotalDist;

      console.log('train',i,'path', this.train[i].path);
    }
  }

  this.addTrain = function(name){
    var trainNum = this.train.length
    //.log(engines[name].newEngine(0));
    this.train.push({
      engine: engines[name].newEngine(0),
      railcars: [],
      jobs: {},
      curPointId: 1,
      curDist: 0,
      curSegDist: 0,
      lastSpeed: 1
    });
    this.train[trainNum].path = {
      currentP: {
        sec: track.sections[track.sections.length - 1],
        dir: 0
      },
      nextP: [],
      previousP: [],
      reverseDir: 0
    }
    this.train[trainNum].engine.mesh = engines[name].newMesh();
    this.train[trainNum].engine.mesh.position.set(0,0,0);
    this.train[trainNum].engine.userSpeed = this.train[trainNum].engine.opts.top;
    this.train[trainNum].engine.opts.acc = this.train[trainNum].engine.opts.maxAcc;
    this.train[trainNum].path.nextP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,this.train[trainNum].path.currentP.dir))
    this.train[trainNum].path.previousP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,(this.train[trainNum].path.currentP.dir)))
    console.log('train added','id: ' + trainNum,this.train[trainNum]);
    scene.add(this.train[trainNum].engine.mesh);
    this.rebuildPath(true, trainNum);
  }

  this.carDistBehindEngine = function(i,j){
    var dist = ((this.train[i].engine.opts.sizeLength - this.train[i].engine.opts.axleOffset)/2) + this.train[i].engine.opts.axleOffset;
    for(k = 0; k < j; k++){
      dist += this.train[i].railcars[k].opts.sizeLength + 5;
    }
    return (dist + ((this.train[i].railcars[j].opts.sizeLength - this.train[i].railcars[j].opts.axleOffset)/2))
  }

  this.addRailcar = function(name,i){
    this.train[i].railcars.push({
      opts: railcars[name].newOpts(),
      mesh: railcars[name].newMesh()
    });
    this.train[i].railcars[this.train[i].railcars.length - 1].distanceBehind = this.carDistBehindEngine(i,this.train[i].railcars.length - 1)
    scene.add(this.train[i].railcars[this.train[i].railcars.length - 1].mesh);

    //.log('railcars',this.train[i].railcars)
  }

  this.moveBackOnPath = function(curDist, moveDist, path, curPointId, trainSpeed){

    console.log('moveback',curDist, moveDist, path, curPointId)

    var moved = this.moveOnPath(curDist, -moveDist, path, curPointId, trainSpeed, true, true);

    moved.rebuild = false;
    var prevPId = -1;
    var timesThrough = 1
    while(moved.pointId === false){
      console.log('poke');
      if(path.previousP[prevPId + 1] == undefined  || path.previousP[prevPId + 1] == false){
        console.error('path not long enough in moveBackOnPath; returning false. prevPId:'+prevPId)
        return false;
      }

      prevPId++;

      var curPathArray = {
        nextP: [(prevPId == 0 ? path.currentP : path.previousP[prevPId - 1])],
        currentP: path.previousP[prevPId],
        previousP: [path.previousP[prevPId + 1]]
      };

      curPointId = (
        equalXZ(
          curPathArray.nextP[0].sec.points[curPathArray.nextP[0].dir == 1 ? 0 : curPathArray.nextP[0].sec.points.length - 1],
          curPathArray.currentP.sec.points[0]
        ) == 1)
          ? curPointId = 1
          : curPointId = curPathArray.currentP.sec.points.length - 2;

      moved = this.moveOnPath(
        0,
        moved.remDist,
        curPathArray,
        curPointId,
        trainSpeed,
        true,
        false
      );
      moved.rebuild = true;
    }
    return moved;
  }

  this.workJobs = function(dTime){
    console.log('-----');
    dTime /= 1000;
    var i = -1;
    while(i < this.train.length - 1) {
      i++;

      brakeDist = (Math.pow(this.train[i].engine.curSpeed,2)/(2*this.train[i].engine.opts.dec));

      /*if(this.train[i].engine.curSpeed > 0
        && track.sectionDistanceRemaining(
          this.train[i].path.currentP.sec.id,
          this.train[i].path.currentP.dir,
          this.train[i].curPointId,
          this.train[i].curDist
        ) + this.train[i].path.nextPTotalDist < brakeDist
      ){
        this.train[i].engine.opts.acc = -1 * this.train[i].engine.opts.maxAcc;
      }
      if(this.train[i].engine.curSpeed < 0
        && track.sectionDistanceRemaining(
          this.train[i].path.currentP.sec.id,
          this.train[i].path.currentP.dir == 1 ? 0 : 1,
          this.train[i].curPointId,
          this.train[i].curSegDist - this.train[i].curDist
        ) + this.train[i].path.previousPTotalDist < brakeDist + this.train[i].path.trainLength
      ){
        this.train[i].engine.opts.acc = this.train[i].engine.opts.maxAcc;
        //console.log(/*this.train[i].path.nextPTotalDist,this.train[i].path.previousPTotalDist, this.train[i].curDist, this.train[i].path.trainLength, brakeDist, a2);
      }*/

      var speedWas = this.train[i].engine.curSpeed;

      if (this.train[i].engine.opts.acc > 0 & this.train[i].engine.userSpeed > 0){
        if ((this.train[i].engine.curSpeed + this.train[i].engine.opts.acc*dTime) < 0)
          this.train[i].engine.curSpeed += this.train[i].engine.opts.dec*dTime;
        else if ((this.train[i].engine.curSpeed + this.train[i].engine.opts.acc*dTime) < this.train[i].engine.userSpeed)
          this.train[i].engine.curSpeed += this.train[i].engine.opts.acc*dTime;
        else
          this.train[i].engine.curSpeed = this.train[i].engine.userSpeed;
      }
      else if (this.train[i].engine.opts.acc < 0 & this.train[i].engine.userSpeed > 0){
        if ((this.train[i].engine.curSpeed - this.train[i].engine.opts.dec*dTime) > -1 * this.train[i].engine.opts.acc)
          this.train[i].engine.curSpeed -= this.train[i].engine.opts.dec*dTime;
        else{
          if (this.train[i].engine.curSpeed > this.train[i].engine.opts.dec)
            this.train[i].engine.curSpeed -= this.train[i].engine.opts.dec*dTime;
          else if (this.train[i].engine.curSpeed < -this.train[i].engine.opts.dec)
            this.train[i].engine.curSpeed += this.train[i].engine.opts.dec*dTime;
          else
            this.train[i].engine.curSpeed = 0;
        }
      }
      else if (this.train[i].engine.opts.acc < 0 & this.train[i].engine.userSpeed < 0){
        if ((this.train[i].engine.curSpeed + this.train[i].engine.opts.acc*dTime) > 0)
          this.train[i].engine.curSpeed -= this.train[i].engine.opts.dec*dTime;
        else if ((this.train[i].engine.curSpeed + this.train[i].engine.opts.acc*dTime) > this.train[i].engine.userSpeed)
          this.train[i].engine.curSpeed += this.train[i].engine.opts.acc*dTime;
        else
          this.train[i].engine.curSpeed = this.train[i].engine.userSpeed;
      }
      else if (this.train[i].engine.opts.acc > 0 & this.train[i].engine.userSpeed < 0){
        if ((this.train[i].engine.curSpeed + this.train[i].engine.opts.dec*dTime) < -1 * this.train[i].engine.opts.acc)
          this.train[i].engine.curSpeed += this.train[i].engine.opts.dec*dTime;
        else{
          if (this.train[i].engine.curSpeed < -this.train[i].engine.opts.dec)
            this.train[i].engine.curSpeed += this.train[i].engine.opts.dec*dTime;
          else if (this.train[i].engine.curSpeed > this.train[i].engine.opts.dec)
            this.train[i].engine.curSpeed -= this.train[i].engine.opts.dec*dTime;
          else
            this.train[i].engine.curSpeed = 0;
        }
      }
      else if(this.train[i].engine.userSpeed == 0){
        if (this.train[i].engine.curSpeed > this.train[i].engine.opts.dec)
          this.train[i].engine.curSpeed -= this.train[i].engine.opts.dec*dTime;
        else if (this.train[i].engine.curSpeed < -this.train[i].engine.opts.dec)
          this.train[i].engine.curSpeed += this.train[i].engine.opts.dec*dTime;
        else
          this.train[i].engine.curSpeed = 0;
      }


      travDist = this.train[i].engine.curSpeed*dTime;

      if(travDist == 0)
        continue;

      //-- Find Distance on track --//
      //.log(this.train[i].path)
      //.log(this.train[i].curDist, travDist, this.train[i].path.currentP, this.train[i].curPointId)


      if(speedWas == 0 && this.train[i].engine.curSpeed != 0
        || speedWas > 0 && this.train[i].engine.curSpeed < 0
        || speedWas < 0 && this.train[i].engine.curSpeed > 0){
          console.log('rebuilding path: ',i)
        this.rebuildPath(true, i);
      }

      var moved = this.moveOnPath(
        this.train[i].curDist,
        travDist,
        this.train[i].path,
        this.train[i].curPointId,
        this.train[i].engine.curSpeed,
        false,
        true
      );


      if(!moved) return -1;

      this.train[i].curPointId = moved.pointId;
      this.train[i].curDist = moved.remDist;
      this.train[i].curSegDist = moved.curSegDist;

      var timesThrough = 1
      while(moved.pointId === false){
        timesThrough++;

        console.log('building new');

        this.rebuildPath(false, i);

        if((this.train[i].path.currentP.dir == 0 && this.train[i].engine.curSpeed > 0)
         ||(this.train[i].path.currentP.dir == 1 && this.train[i].engine.curSpeed < 0)){
          console.log('from a',this.train[i].path.currentP.sec.points.length)
          this.train[i].curPointId = this.train[i].path.currentP.sec.points.length - 2;
        }
        else{
          this.train[i].curPointId = 1;
          console.log('picked point',this.train[i].curPointId = 1);
        }

        moved = this.moveOnPath(
          0,
          this.train[i].curDist,
          this.train[i].path,
          this.train[i].curPointId,
          this.train[i].engine.curSpeed,
          false,
          false
        );

        this.train[i].curPointId = moved.pointId;
        this.train[i].curPointId = moved.pointId;
        this.train[i].curSegDist = moved.curSegDist;
      }

      this.train[i].engine.mesh.position.set(moved.pos.x,moved.pos.y,moved.pos.z);

      console.log('-backP-');
      this.train[i].engine.backP = this.moveBackOnPath(
        this.train[i].curDist,
        this.train[i].engine.opts.axleOffset,
        this.train[i].path,
        this.train[i].curPointId,
        this.train[i].engine.curSpeed
      ).pos
      this.train[i].engine.mesh.lookAt(this.train[i].engine.backP);
      this.train[i].engine.mesh.verticesNeedUpdate = true;
      trainTestCube.position.set(this.train[i].engine.backP.x,this.train[i].engine.backP.y,this.train[i].engine.backP.z);

      //-- calc rem T --//
      //-- apply to curP --//

      //then loop through railcars
      j = this.train[i].railcars.length
      while(j--){
        console.log('--- next car ---');
        var newpos = this.moveBackOnPath(
          this.train[i].curDist,
          this.train[i].railcars[j].distanceBehind,
          this.train[i].path,
          this.train[i].curPointId,
          this.train[i].engine.curSpeed
        ).pos
        this.train[i].railcars[j].mesh.position.set(newpos.x,newpos.y,newpos.z)

        console.log('-lookat-');
        this.train[i].railcars[j].backP = this.moveBackOnPath(
          this.train[i].curDist,
          this.train[i].railcars[j].distanceBehind + this.train[i].railcars[j].opts.axleOffset,
          this.train[i].path,
          this.train[i].curPointId,
          this.train[i].engine.curSpeed
        ).pos;
        this.train[i].railcars[j].mesh.lookAt(this.train[i].railcars[j].backP);
        if(j == this.train[i].railcars.length - 1)
          trainTestCube.position.set(this.train[i].railcars[j].backP.x,this.train[i].railcars[j].backP.y,this.train[i].railcars[j].backP.z);
        this.train[i].railcars[j].mesh.rotationNeedsUpdate = true;
      }
    }
  }

  this.moveOnPath = function(curDist, moveDist, path, curPointId, trainSpeed, followFlag, firstTimeThrough){
    console.log(path);
    var curPath = path.currentP;
    var nextP = path.nextP[0];
    var prevP = path.previousP[0];

    if(curPointId == undefined){
      console.error('curPointId is undefined');
      return false;
    }

    var inc = curPath.dir == 0 ? -1 : 1
    console.log('inc',inc,'dir',curPath.dir);
    var moveDir = curPath.dir;

    if(moveDist == 0){
      return {
        curSegDist: curDist,
        remDist: 0,
        pointId: curPointId,
        pos: this.train[i].engine.curP
      }
    }


    var remDist = (curDist + moveDist);
    if(firstTimeThrough == true && remDist <= 0){
      curPointId -= (2* inc);
    }

    //.log('rem',remDist, 'moveDir', moveDir, 'inc', inc, 'curPath', curPath, 'curPointId',curPointId)

    var nextPoint = 0;
    var curSegDist = 0;
    var plen = curPath.sec.points.length;
    while(true){
      var backRemDist = false;

      //check for ends
      var checkPathType = path.previousP[0] === false ? 'pf ' : 'ps ';
      checkPathType += path.nextP[0] === false ? 'nf ' : 'ns ';
      checkPathType += moveDist > 0 ? 'r+ ' : 'r- ';
      checkPathType += moveDir == 1 ? 'md1 ' : 'md0 ';
      checkPathType += 'cpid: ' + curPointId + '/' + curPath.sec.points.length;

      console.log(checkPathType);

      var curPathPart = false;
      if(curPointId < -1 || curPointId > plen){
        //checkPathType = 'not set, out of reach';
        console.log('going home 1');
        return {
          curSegDist: curSegDist,
          remDist: remDist,
          pointId: false,
          pos: false
        }
      }
      else if(moveDist > 0){
        if(nextP === false){
          if(curPointId == plen){
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[plen - 2],
                p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
                p3: curPath.sec.points[plen - 1],
                type: '0x01'
              };

            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[plen - 2],
                p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
                p3: curPath.sec.points[plen - 1],
                type: '0x02'
              };

            }
          }
          else if(curPointId == plen - 2){
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x03'
              };

            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[plen - 2],
                p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
                p3: curPath.sec.points[plen - 1],
                type: '0x04'
              };

            }
          }
          else if(curPointId == 1){
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[1],
                p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
                p3: curPath.sec.points[0],
                type: '0x05'
              };

            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x06'
              };

            }
          }
          else if(curPointId == -1){
            if(moveDir == 0){
              console.log('going home 0x07');
              return {
                curSegDist: curSegDist,
                remDist: remDist,
                pointId: false,
                pos: false
              };
            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[0],
                p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
                p3: curPath.sec.points[1],
                type: '0x08'
              };

            }
          }
          else {
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x09'
              };

            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x0a'
              };

            }
          }
        }
        else if (nextP !== false){
          if(curPointId == plen){
            if(moveDir == 0){
              if(prevP !== false){
                var curPathPart = {
                  p1: curPath.sec.points[plen - 2],
                  p2: curPath.sec.points[plen - 1],
                  p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                  type: '0x0b1'
                };
              }
              else{
                var curPathPart = {
                  p1: curPath.sec.points[plen - 1],
                  p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
                  p3: curPath.sec.points[plen - 2],
                  type: '0x0b2'
                };

              }

            }
            else{
              console.log('going home 0xoc');
              return {
                curSegDist: curSegDist,
                remDist: remDist,
                pointId: false,
                pos: false
              };
              var curPathPart = {
                p1: curPath.sec.points[plen - 2],
                p2: curPath.sec.points[plen - 1],
                p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                type: '0x0c'
              };

            }
          }
          else if(curPointId == plen - 2){
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x0d1'
              };
            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[plen - 2],
                p2: curPath.sec.points[plen - 1],
                p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                type: '0x0e'
              };

            }
          }
          else if(curPointId == 1){
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[1],
                p2: curPath.sec.points[0],
                p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                type: '0x0f'
              };

            }
            else{
              if(prevP !== false){
                var curPathPart = {
                  p1: curPath.sec.points[curPointId],
                  p2: curPath.sec.points[curPointId + inc],
                  p3: curPath.sec.points[curPointId + (2 * inc)],
                  //p1: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                  //p2: curPath.sec.points[0],
                  //p3: curPath.sec.points[1],
                  type: '0x101'
                };
              }
              else{
                var curPathPart = {
                  p1: curPath.sec.points[curPointId],
                  p2: curPath.sec.points[curPointId + inc],
                  p3: curPath.sec.points[curPointId + (2 * inc)],
                  type: '0x102'
                };
              }
            }
          }
          else if(curPointId == -1){
            if(moveDir == 0){
              console.log('going home 0x11');
              return {
                curSegDist: curSegDist,
                remDist: remDist,
                pointId: false,
                pos: false
              };
            }
            else{
              if(nextP !== false){
                var curPathPart = {
                  p1: curPath.sec.points[0],
                  p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
                  p3: curPath.sec.points[1],
                  type: '0x121'
                };
              }
              else{
                var curPathPart = {
                  p1: curPath.sec.points[1],
                  p2: curPath.sec.points[0],
                  p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                  type: '0x122'
                };
              }
            }
          }
          else {
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x13'
              };

            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x14'
              };

            }
          }
        }
      }
      else if(moveDist < 0){
        if(prevP === false){
          if(curPointId == plen){
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[plen - 1],
                p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
                p3: curPath.sec.points[plen - 2],
                type: '0x15'
              };

            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[plen - 2],
                p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
                p3: curPath.sec.points[plen - 1],
                type: '0x16'
              };

            }
          }
          else if(curPointId == plen - 2){
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x17'
              };

            }
            else{
              if(nextP === false){
                var curPathPart = {
                  p1: curPath.sec.points[plen - 2],
                  p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
                  p3: curPath.sec.points[plen - 1],
                  type: '0x181'
                };
              }
              else{
                if(/*followFlag == true &&*/ remDist > 0){
                  var curPathPart = {
                    p1: curPath.sec.points[plen - 2],
                    p2: curPath.sec.points[plen - 1],
                    p3: nextP.sec.points[nextP.dir == 1 ? 1 : nextP.sec.points.length - 2],
                    type: '0x182'
                  };
                }
                else{
                  var curPathPart = {
                    p1: curPath.sec.points[curPointId - (2 * inc)],
                    p2: curPath.sec.points[curPointId - inc],
                    p3: curPath.sec.points[curPointId],
                    type: '0x183'
                  };
                }
              }

            }
          }
          else if(curPointId == 1){
            if(moveDir == 0){
              if(nextP === false)
                var curPathPart = {
                  p1: curPath.sec.points[1],
                  p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
                  p3: curPath.sec.points[0],
                  type: '0x191'
                };
              else{
                //if(followFlag == true){
                  var curPathPart = {
                    p1: curPath.sec.points[1],
                    p2: curPath.sec.points[0],
                    p3: nextP.sec.points[nextP.dir == 1 ? 1 : nextP.sec.points.length - 2],
                    type: '0x192'
                  };
                /*}
                else{
                  var curPathPart = {
                    p1: curPath.sec.points[curPointId - (2 * inc)],
                    p2: curPath.sec.points[curPointId - inc],
                    p3: curPath.sec.points[curPointId],
                    type: '0x193'
                  };
                }*/
              }
            }
            else{
              if(nextP !== false){
                var curPathPart = {
                  p1: curPath.sec.points[curPointId],
                  p2: curPath.sec.points[curPointId + inc],
                  p3: curPath.sec.points[curPointId + (2 * inc)],
                  type: '0x1a1'
                };
              }
              else{
                var curPathPart = {
                  type: '0x1a2'
                };
              }
            }
          }
          else if(curPointId == -1){
            if(moveDir == 0){
              if(nextP === false)
                var curPathPart = {
                  p1: curPath.sec.points[1],
                  p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
                  p3: curPath.sec.points[0],
                  type: '0x1b1'
                };
              else{
                var curPathPart = {
                  p1: nextP.sec.points[nextP.dir == 1 ? 1 : nextP.sec.points.length - 2],
                  p2: curPath.sec.points[0],
                  p3: curPath.sec.points[1],
                  type: '0x1b2'
                };
              }
            }
            else{
              if(nextP === false){
                console.log('going home 0x1c1');
                return {
                  curSegDist: curSegDist,
                  remDist: remDist,
                  pointId: false,
                  pos: false
                };
              }
              else{
                var curPathPart = {
                  p1: curPath.sec.points[0],
                  p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
                  p3: curPath.sec.points[1],
                  type: '0x1c2'
                };
              }
            }
          }
          else {
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x1d'
              };
            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x1e'
              };
            }
          }
        }
        else if(prevP !== false){
          if(curPointId == plen){
            if(moveDir == 0){
              var curPathPart = {
                p1: path.previousP[0].sec.points[path.previousP[0].dir == 0 ? 1 : path.previousP[0].sec.points.length - 2],
                p2: curPath.sec.points[plen - 1],
                p3: curPath.sec.points[plen - 2],
                type: '0x1f'
              };

            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[plen - 2],
                p2: curPath.sec.points[plen - 1],
                p3: path.previousP[0].sec.points[path.previousP[0].dir == 0 ? 1 : path.previousP[0].sec.points.length - 2],
                type: '0x20'
              };

            }
          }
          else if(curPointId == plen - 2){
            if(moveDir == 0){
              //if(remDist > 0 || followFlag == true)
                var curPathPart = {
                  p1: curPath.sec.points[curPointId],
                  p2: curPath.sec.points[curPointId + inc],
                  p3: curPath.sec.points[curPointId + (2 * inc)],
                  type: '0x211'
                };
              /*else{
                var curPathPart = {
                  p1: curPath.sec.points[curPointId - (2 * inc)],
                  p2: curPath.sec.points[curPointId - inc],
                  p3: curPath.sec.points[curPointId],
                  type: '0x212'
                };
              }*/
            }
            else {
              if(remDist > 0){
                if(nextP !== false){
                  var curPathPart = {
                    p1: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                    p2: curPath.sec.points[plen - 1],
                    p3: curPath.sec.points[plen - 2],
                    /*p1: curPath.sec.points[plen - 2],
                    p2: curPath.sec.points[plen - 1],
                    p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],*/
                    type: '0x221'
                  };
                }
                else{
                  var curPathPart = {
                    p1: curPath.sec.points[plen - 2],
                    p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
                    p3: curPath.sec.points[plen - 1],
                    type: '0x222'
                  };
                }
              }
              else{
                var curPathPart = {
                  p1: curPath.sec.points[curPointId - (2 * inc)],
                  p2: curPath.sec.points[curPointId - inc],
                  p3: curPath.sec.points[curPointId],
                  type: '0x223'
                };
              }
            }
          }
          else if(curPointId == 1){
            if(moveDir == 0){
              if(nextP !== false){
                if(remDist > 0){
                  var curPathPart = {
                    p1: curPath.sec.points[1],
                    p2: curPath.sec.points[0],
                    p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                    type: '0x233'
                  };
                }
                else{
                  var curPathPart = {
                    p1: curPath.sec.points[curPointId - (2 * inc)],
                    p2: curPath.sec.points[curPointId - inc],
                    p3: curPath.sec.points[curPointId],
                    type: '0x231'
                  };
                }
              }
              else{
                var curPathPart = {
                  p1: curPath.sec.points[1],
                  p2: midpoint(curPath.sec.points[0],curPath.sec.points[1]),
                  p3: curPath.sec.points[0],
                  type: '0x232'
                };
              }
            }
            else{
              //if(followFlag == true || remDist < 0){
                var curPathPart = {
                  p1: curPath.sec.points[curPointId],
                  p2: curPath.sec.points[curPointId + inc],
                  p3: curPath.sec.points[curPointId + (2 * inc)],
                  type: '0x241'
                };
              /*}
              else{
                var curPathPart = {
                  p1: path.previousP[0].sec.points[path.previousP[0].dir == 0 ? 1 : path.previousP[0].sec.points.length - 2],
                  p2: curPath.sec.points[0],
                  p3: curPath.sec.points[1],
                  /*p1: curPath.sec.points[curPointId - (2 * inc)],
                  p2: curPath.sec.points[curPointId - inc],
                  p3: curPath.sec.points[curPointId],
                  type: '0x242'
                };
              }*/
            }
          }
          else if(curPointId == -1){
            if(moveDir == 0){
              if(nextP === false){
                var curPathPart = {
                  p1: curPath.sec.points[0],
                  p2: curPath.sec.points[0],
                  p3: curPath.sec.points[0],
                  type: '0x251'
                };
              }
              else{
                var curPathPart = {
                  p1: curPath.sec.points[1],
                  p2: curPath.sec.points[0],
                  p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
                  type: '0x252'
                };
              }
            }
            else{
              var curPathPart = {
                p1: path.previousP[0].sec.points[path.previousP[0].dir == 0 ? 1 : path.previousP[0].sec.points.length - 2],
                p2: curPath.sec.points[0],
                p3: curPath.sec.points[1],
                type: '0x26'
              };
            }
          }
          else {
            if(moveDir == 0){
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x27'
              };
            }
            else{
              var curPathPart = {
                p1: curPath.sec.points[curPointId],
                p2: curPath.sec.points[curPointId + inc],
                p3: curPath.sec.points[curPointId + (2 * inc)],
                type: '0x28'
              };
            }
          }
        }
      }
      else{
        console.error('moveDist = 0');
      }

      //if the point is out of bounds, return what will be interpreted as a flag for, move to next section
      if(curPathPart === false){
        //checkPathType = 'not set, out of reach';
        console.log('going home2');
        return {
          curSegDist: curSegDist,
          remDist: remDist,
          pointId: false,
          pos: false
        }
      }

      console.log(curPathPart.type, 'remDist:'+remDist, 'INC:'+inc)
      var curSegDist = track.lerpDistance(curPathPart);
      console.log('curSegDist:' + curSegDist, 'curSegDist < remDist: ',curSegDist < remDist, 'curSegDist + remDist:',curSegDist + remDist, 'both:',(curSegDist < remDist) || (curSegDist + remDist < 0))
      //check if we have moved far enough
      if((curSegDist < remDist) || (curSegDist + remDist < 0)){
        //if we havent, adjust the measure and loop again
        remDist += remDist < 0 ? curSegDist : -curSegDist;
        curPointId += (2*(remDist < 0 ? -inc : inc));
        console.log('--- go again ---')
      }
      else //otherwise, move on
        break;
    }

    console.log('--- == --- break --- == ---')

    if(remDist < 0)
      remDist = curSegDist + remDist;

    return {
      curSegDist: curSegDist,
      remDist: remDist,
      pointId: curPointId,
      pos: recalcY(track.lerpToDist(curPathPart,remDist),4)
    }
  }
};
train = new trainFunc();
var engines = [];
var railcars = [];

trainTestCube = testCube();
