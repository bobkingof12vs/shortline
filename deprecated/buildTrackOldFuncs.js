this.newSwitch = function(p1,p2,segId1,segId2,newSegId3) {
  secId1 = this.findSegInSec(segId1);
  secId2 = this.findSegInSec(segId2);
  secId3 = this.findSegInSec(newSegId3);
  var checkSwitch = -1;

  var i = this.switches.length;
  while(i > 0){
    i--;
    if (equalXZ(this.switches[i].origin,p1) == 1) {
      checkSwitch = i;
      break;
    }
  }

  if (checkSwitch == -1) {
    switchId = this.switches.length;
  }
  else{
    switchId = checkSwitch;
  }
  this.switches[switchId] = {
    type: 'switch',
    origin: p1,
    id: switchId,
    secIds: [secId1, secId2, secId3],
    segIds: [segId1, segId2, newSegId3],
    points: [this.segments[segId1].p2, this.segments[segId2].p2, p2],
    target: [0, 0, 0],
    connectsTo: [[],[],[]],
    throwObjs: [null,null,null]
  };

  this.sections[secId1].ends[(equalXZ(this.sections[secId1].points[0],p1) == 1 ? 0 : 1)] = this.switches[switchId];
  this.sections[secId2].ends[(equalXZ(this.sections[secId2].points[0],p1) == 1 ? 0 : 1)] = this.switches[switchId];
  console.log(secId3,newSegId3,this);
  if (newSegId3 != -1)
    this.sections[secId3].ends[(equalXZ(this.sections[secId3].points[0],p1) == 1 ? 0 : 1)] = this.switches[switchId];

  this.rebuildSwitch(switchId,{p2:p2})
  return switchId;
}

this.addToSwitch = function(p1,p2,addSegId) {
  var i = this.switches.length;
  while(i > 0){
    i--;
    if (equalXZ(this.switches[i].origin,p1) == 1) {
      secId = this.findSegInSec(addSegId);
      this.sections[secId].ends[(equalXZ(this.sections[secId].points[0],p1) == 1 ? 0 : 1)] = this.switches[i];
      this.switches[i].secIds.push(secId);
      this.switches[i].segIds.push(addSegId);
      this.switches[i].target.push(0);
      this.switches[i].connectsTo.push([]);
      this.switches[i].points.push(p2);
      this.switches[i].throwObjs.push(null);
      this.rebuildSwitch(i,{p2:p2});
      return i;
    }
  }
  return -1;
}
//the problem, is that switches are wrong here! best guess so far at least...
this.rebuildSwitch = function(switchId,newSeg){

  var foundPoints = this.findPointInSec(this.switches[switchId].origin);
  console.log(foundPoints);
  var i = this.switches[switchId].segIds.length;
  while (i > 0){
    i--;
    var j = foundPoints.length;
    var notFound = true;
    while(j > 0 & notFound){
      j--
      if(this.sections[foundPoints[j].secId] != null
       & ((foundPoints[j].pointId == 0)
         |(foundPoints[j].pointId == this.sections[foundPoints[j].secId].points.length - 1))){
          notFound = false;
      }
    }
    if(notFound){
      console.log(foundPoints);
      this.switches[switchId].secIds[i] = -1; //.splice(i,1);
      this.switches[switchId].segIds[i] = -1; //.splice(i,1);
      this.switches[switchId].target[i] = -1; //.splice(i,1);
      this.switches[switchId].connectsTo[i] = -1; //.splice(i,1);
      this.switches[switchId].points[i] = -1; //.splice(i,1);
      this.switches[switchId].throwObjs[i] = -1; //.splice(i,1);
    }
  }

  var newSegArray = []
  var i = -1;
  var lim = this.switches[switchId].segIds.length - 1;
  while (i < lim) {
    i++;
    if (this.segments[this.switches[switchId].segIds[i]] != -1) {
      var j = newSegArray.length
      var pInsert = (this.segments[this.switches[switchId].segIds[i]] == undefined ? newSeg : this.segments[this.switches[switchId].segIds[i]]);
      while(j > 0){
        j--;
        console.log('$$$',i,pInsert.p2,newSegArray[j].p2)
        if (pInsert.p2 != undefined && equalXZ(pInsert.p2,newSegArray[j].p2) == 1) {
          console.log('###',i,pInsert.p2,newSegArray[j].p2)
          pInsert = -1;
        }
      }
      if(pInsert != -1) newSegArray.push(pInsert);
        if(switchId == 1) console.log('!!!found it',i,newSegArray.length);
    }
  }
  var i = newSegArray.length;
  while (i > 0) {
    i--;
    var j = newSegArray.length;
    this.switches[switchId].connectsTo[i] = []
    while(j > 0){
      j--;
      if (j != i
        && newSegArray[i] != -1
        && newSegArray[j] != -1
        && angleBetweenFlattenedVectors(
          newSegArray[i].p2,
          newSegArray[j].p2,
          this.switches[switchId].origin) >= 89.999
      ){
        this.switches[switchId].connectsTo[i].push({
          secId: this.findSegInSec(this.switches[switchId].segIds[j]),
          segId: this.switches[switchId].segIds[j]
        });
      }
    }
    if (this.switches[switchId].throwObjs[i] != null) {
      scene.remove(this.switches[switchId].throwObjs[i]);
      delete this.throws[this.switches[switchId].throwObjs[i].id];
      this.switches[switchId].throwObjs[i] = null;
    }
    if(this.switches[switchId].connectsTo[i].length >= 2){
      this.switches[switchId].throwObjs[i] = new THREE.Mesh(
        this.buildGeomPoints(recalcY(addVectorToPoint(newSegArray[i].p2,extendVector(12,perpendicularVectorXZ({x:-1,z:1},this.switches[switchId].origin,newSegArray[i].p2)))),recalcY(newSegArray[i].p2),5,5,5),
        this.switches['material']
      );
      this.switches[switchId].throwObjs[i].clickCall = Function(
        'track.switches['+switchId+'].target['+i+']++;'+
        'console.log("herehere",track.switches['+switchId+'].target['+i+'],'+i+');'+
        'if(track.switches['+switchId+'].target['+i+'] == -1) track.switches['+switchId+'].target['+i+']++;' +
         'if(track.switches['+switchId+'].target['+i+'] == track.switches['+switchId+'].connectsTo['+i+'].length){'+
          'track.switches['+switchId+'].target['+i+'] = 0;'+
        '}'+'console.log("herehere",track.switches['+switchId+'].target['+i+'],'+i+');'+
        'track.updateSwitchBoxes()'
      )
      this.throws[this.switches[switchId].throwObjs[i].id] = this.switches[switchId].throwObjs[i];
      scene.add(this.switches[switchId].throwObjs[i])
      //this.updateSwitchBoxes();
    }
  }
}

this.rebuildEndsByPoint = function(p1){
  var secIds = this.findPointInSec(p1);
  var i = secIds.length;
  while(i > 0){
    i--;
    console.log(secIds[i]);
    this.rebuildEndsBySecId(secIds[i].secId);
  }
}
this.rebuildEndsBySecId = function(secId){
  p1 = this.sections[secId].points[0]
  var unfound = true;
  var i = this.switches.length;
  while(i > 0){
    i--;
    if (this.switches[i] != null && equalXZ(p1,this.switches[i].origin) == 1){
      unfound = false;
      if(this.getSwitchThrow(i,secId,this.sections[secId].segmentIds[0]) !== false)
        this.sections[secId].ends[0] = this.switches[i];
      else //check for the switch to have this point by a different number...
        this.addToSwitch(p1,this.sections[secId].points[1],this.sections[secId].segmentIds[0])
    }
  }
  if (unfound) {
    var i = this.ends.length;
    while(i > 0){
      i--
      if (this.ends[i] != null && equalXZ(this.ends[i].point,p1) == 1) {
        this.sections[secId].ends[0] = this.ends[i];
        found = false;
      }
    }
  }
  if(/*still*/ unfound){
    var ps = this.findMatchInTrackPoints(p1);
    if(ps.length == 1){
      this.newEnd(p1,secId);
    }
    else if(ps.length == 2){
      console.warn("i don't expect this to happen ps.length == 2 of start");
      this.sections[secId].ends[0] = "i don't expect this to happen ps.length == 2 of start"
    }
    else {
      console.warn("i don't expect this to happen either ps length >= 3 or <= 0 of start");
      this.sections[secId].ends[0] = "i don't expect this to happen either ps length >= 3 or <= 0 of start"
    }
  }

  p3 = this.sections[secId].points[this.sections[secId].points.length - 1]
  var unfound = true;
  var i = this.switches.length;
  while(i > 0){
    i--;
    if (this.switches[i] != null && equalXZ(p3,this.switches[i].origin) == 1){
      unfound = false;
      if(this.getSwitchThrow(i,secId,this.sections[secId].segmentIds[this.sections[secId].segmentIds.length - 1]) !== false)
        this.sections[secId].ends[1] = this.switches[i];
      else
        this.addToSwitch(p3,this.sections[secId].points[1],this.sections[secId].segmentIds[this.sections[secId].segmentIds.length - 1])
    }
  }
  if (unfound) {
    var i = this.ends.length;
    while(i > 0){
      i--
      if (this.ends[i] != null && equalXZ(this.ends[i].point,p3) == 1) {
        this.sections[secId].ends[1] = this.ends[i];
        found = false;
      }
    }
  }
  if(/*still*/ unfound){
    var ps = this.findMatchInTrackPoints(p3);
    if(ps.length == 1){
      this.newEnd(p3,secId);
    }
    else if(ps.length == 2){
      this.sections[secId].ends[1] = "i don't expect this to happen ps.length == 2 of end"
    }
    else {
      this.sections[secId].ends[1] = "i don't expect this to happen either ps length >= 3 or <= 0 of end"
    }
  }
}
