var trackPoints = [
	{p1: new THREE.Vector3(300, 0, 0),
	 p2: new THREE.Vector3(300, 0, 50),
	 p3: new THREE.Vector3(300, 0, 100)
	},
	{p1: new THREE.Vector3(200, 0, 0),
	 p2: new THREE.Vector3(250, 0, 0),
	 p3: new THREE.Vector3(300, 0, 0)
	},
	{p1: new THREE.Vector3(100, 0, 0),
	 p2: new THREE.Vector3(150, 0, 0),
	 p3: new THREE.Vector3(200, 0, 0)
	},
	{p1: new THREE.Vector3(100, 0, 100),
	 p2: new THREE.Vector3(100, 0, 50),
	 p3: new THREE.Vector3(100, 0, 0)
	},
	{p1: new THREE.Vector3(200, 0, 100),
	 p2: new THREE.Vector3(150, 0, 100),
	 p3: new THREE.Vector3(100, 0, 100)
	},
	{p1: new THREE.Vector3(300, 0, 100),
	 p2: new THREE.Vector3(250, 0, 100),
	 p3: new THREE.Vector3(200, 0, 100)
	},
	{p1: new THREE.Vector3(200, 0, 0),
	 p2: new THREE.Vector3(200, 0, 50),
	 p3: new THREE.Vector3(200, 0, 100)
	},
	{p1: new THREE.Vector3(100, 0, 100),
	 p2: new THREE.Vector3(100, 0, 150),
	 p3: new THREE.Vector3(100, 0, 200)
	},
	{p1: new THREE.Vector3(100, 0, 200),
	 p2: new THREE.Vector3(100, 0, 250),
	 p3: new THREE.Vector3(100, 0, 300)
	},
	{p1: new THREE.Vector3(100, 0, 300),
	 p2: new THREE.Vector3(150, 0, 300),
	 p3: new THREE.Vector3(200, 0, 300)
	},
	{p1: new THREE.Vector3(200, 0, 200),
	 p2: new THREE.Vector3(200, 0, 250),
	 p3: new THREE.Vector3(200, 0, 300)
	},
	{p1: new THREE.Vector3(200, 0, 200),
	 p2: new THREE.Vector3(150, 0, 200),
	 p3: new THREE.Vector3(100, 0, 200)
	},
	{p1: new THREE.Vector3(300, 0, 200),
	 p2: new THREE.Vector3(250, 0, 200),
	 p3: new THREE.Vector3(200, 0, 200)
	},
	{p1: new THREE.Vector3(300, 0, 100),
	 p2: new THREE.Vector3(300, 0, 150),
	 p3: new THREE.Vector3(300, 0, 200)
	},
	{p1: new THREE.Vector3(200, 0, 100),
	 p2: new THREE.Vector3(200, 0, 150),
	 p3: new THREE.Vector3(200, 0, 200)
	},
	{p1: new THREE.Vector3(100, 0, 100),
	 p2: new THREE.Vector3(50,  0, 100),
	 p3: new THREE.Vector3(0,   0, 100)
	},
	{p1: new THREE.Vector3(0,   0, 100),
	 p2: new THREE.Vector3(0,   0, 150),
	 p3: new THREE.Vector3(0,   0, 200)
	},
	{p1: new THREE.Vector3(100, 0, 200),
	 p2: new THREE.Vector3(50,  0, 200),
	 p3: new THREE.Vector3(0,   0, 200)
	},
	{p1: new THREE.Vector3(200,   0, 300),
	 p2: new THREE.Vector3(300,   0, 300),
	 p3: new THREE.Vector3(400,   0, 300)
	},
	{p1: new THREE.Vector3(400,   0, 100),
	 p2: new THREE.Vector3(400,   0, 200),
	 p3: new THREE.Vector3(400,   0, 300)
	},
	{p1: new THREE.Vector3(400,   0, 100),
	 p2: new THREE.Vector3(350,   0, 100),
	 p3: new THREE.Vector3(300,   0, 100)
	}
];
console.log('track points',trackPoints)

uploadFunc = function(){
	this.queue = [];
	this.queueData = function(type,data){
		this.queue.push({type: type, data: data});
		if (this.queue.length == 1) {
			this.requestUpload();
		}
	}
	
	this.requestUpload = function(){
		console.log(this.queue[0])
		xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
				console.log('success',xmlhttp.responseText);
				uploader.queue.shift();
				if (uploader.queue.length > 0) {
					uploader.requestUpload();
				}
			}
		}
		xmlhttp.open("GET","../uploadRequest.php?type="+this.queue[0].type+"&data="+JSON.stringify(this.queue[0].data),true);
		xmlhttp.send();
	}
}
var uploader = new uploadFunc();
console.log(uploader);

trackFunc = function(){
	this.ends = [];
	this.segments = [];
	this.sections = [];
	this.switches = [];
	this.findMatchInTrackPoints = function(p1){
		var j = this.segments.length;
		var count = [];
		while (j > 0){
			j--;
			if (equalXZ(p1, this.segments[j].p1) == 1 | equalXZ(p1, this.segments[j].p3) == 1) {
				count.push(j);
			}
		}
		return count;
	};
	
	this.oppositePointofSeg = function(p,segId){
		if (equalXZ(this.segments[segId].p1,p) == 1) {
			return this.segments[segId].p3;
		}
		else{
			return this.segments[segId].p1;
		}
		return false;
	}
	
	this.getNextSec = function(secId,endId){
		end = this.sections[secId].ends[endId].type;
		if (end.type == 'switch') {
			id = end.secIds.indexOf(secId);
			return ends.connectsTo[id][ends.target[id]];
		}
		else if (end.type == 'end') {
			return end;
		}
		return false;
	}
	
	this.lengthOfSeg = function(segId,opts) {
		opts = opts !== undefined ? opts : {};
		var numBreaks = opts.numBreaks !== undefined ? opts.numBreaks : 10;
		var startT = opts.startT !== undefined ? opts.startT : 0;
		var endT = opts.endT !== undefined ? opts.endT : 1;
		
		if (startT == endT) {return 0;}
		
		var st = startT < endT ? endT : startT;
		var et = startT < endT ? startT : endT;
		var step = (st-et)/numBreaks;
		seg = this.segments[segId];
			
		var d = 0;
		
		p1 = lerp(seg.p1,seg.p2,seg.p2,seg.p3,st);
		while(st>et+.000001){
			st -= step;
			p2 = lerp(seg.p1,seg.p2,seg.p2,seg.p3,st);
			d += p1.distanceTo(p2);
			p1 = p2;
		}
		
		return d;
	}
	
	this.sectionDistanceRemaining = function(secId,secStartDirPoint,curSeg,curT){
		var startT = equalXZ(secStartDirPoint,this.section[secId].ends[0].point) == 1 ? 0 : 1;
		var endT = start == 1 ? 0 : 1;
		var dist = this.lengthOfSeg(curSeg,{startT: curT, endT: endT});
		var i = this.sections[secId].segmentIds.indexOf(curSeg);
		var j = endT == 0 ? 0 : this.section[secId].segmentIds.length;
		var inc = (startT == 0 ? 1 : -1);
		while(i != j){
			i += inc;
			dist += this.segments[this.sections[secId].segmentIds[i]].len;
		}
		return dist;
	}
	
	this.sectionDistance = function(secId){
		var i = this.sections[secId].segmentIds.length
		dist = 0;
		while(i > 0){
			i--;
			dist += this.segments[this.sections[secId].segmentIds[i]].len;
		}
		return dist;
	}
	
	this.addToSection = function(p1,p2,p3){
		
		this.newSec = function(p1,p2,p3,segId){
			var secLen = this.sections.length;
			this.sections.push({
				id: secLen,
				points:[p1,p2,p3],
				ends: [false,false],
				segmentIds: [segId]
			});
			return this.sections.length - 1;
		}
		
		this.connectTo = function(p1,p2,p3,segId,nextSegId){
			secId = this.findSegInSec(segId);
			if(equalXZ(this.sections[secId].points[0], p1) == 1){
				this.sections[secId].points.unshift(p3,p2);
				this.sections[secId].segmentIds.unshift(nextSegId);
				this.sections[secId].ends[0].point = p3;
			}
			else{
				this.sections[secId].points.push(p2,p3);
				this.sections[secId].segmentIds.push(nextSegId);
				this.sections[secId].ends[1].point = p3;
			}
			return secId;
		}
		
		this.combineSecs = function(p1,p2,p3,seg1,seg2) {
			
			secId1 = this.findSegInSec(seg1);
			secId2 = this.findSegInSec(seg2);
			
			if(
				 equalXZ(this.sections[secId1].points[0],p1) == 1,
				 equalXZ(this.sections[secId2].points[0],p3) == 1){
				this.sections[secId1].points.reverse();
				this.sections[secId1].segmentIds.reverse();
				this.sections[secId1].ends[0] = this.sections[secId1].ends[1];
				this.sections[secId1].ends[1] = this.sections[secId2].ends[1];
			}
			else if(equalXZ(this.sections[secId1].points[0],p1) == 1, equalXZ(this.sections[secId2].points[this.sections[secId2].points.length - 1],p3) == 1){
				this.sections[secId1].points.reverse();
				this.sections[secId1].segmentIds.reverse();
				this.sections[secId2].points.reverse();
				this.sections[secId2].segmentIds.reverse();
				this.sections[secId1].ends[0] = this.sections[secId1].ends[1];
				this.sections[secId1].ends[1] = this.sections[secId2].ends[0];
			}
			else if(equalXZ(this.sections[secId1].points[this.sections[secId2].points.length - 1],p1) == 1, equalXZ(this.sections[secId2].points[0],p3) == 1){
				this.sections[secId1].ends[0] = this.sections[secId1].ends[0];
				this.sections[secId1].ends[1] = this.sections[secId2].ends[1];
			}
			else if(equalXZ(this.sections[secId1].points[this.sections[secId2].points.length - 1],p1) == 1, equalXZ(this.sections[secId2].points[this.sections[secId2].points.length - 1],p3) == 1){
				this.sections[secId2].points.reverse();
				this.sections[secId2].segmentIds.reverse();
				this.sections[secId1].ends[0] = this.sections[secId1].ends[0];
				this.sections[secId1].ends[1] = this.sections[secId2].ends[0];
			}
			
			this.sections[secId1].points.push(p2);
			this.sections[secId1].points = this.sections[secId1].points.concat(this.sections[secId2].points);
			
			this.sections[secId1].segmentIds.push(this.segments.length);
			this.sections[secId1].segmentIds = this.sections[secId1].segmentIds.concat(this.sections[secId2].segmentIds);
			
			this.sections[secId2] = null;
			
			return secId1;
		}
		
		this.splitSec = function(segId,p1) {
			
			secId = this.findSegInSec(segId);
			splitPoint = this.findPointInSec(p1,secId).pointId;
			
			if (splitPoint == 0 | splitPoint == this.sections[secId].points.length) {
				return
			}
			
			firstHalfPoints = this.sections[secId].points.splice(0,splitPoint+1);
			secondHalfPoints = this.sections[secId].points;
			secondHalfPoints.unshift(firstHalfPoints[firstHalfPoints.length - 1]);
			firstHalfSegIds = this.sections[secId].segmentIds.splice(0,((splitPoint-1)/2)+1);
			secondHalfSegIds = this.sections[secId].segmentIds;
			
			var newSecId = this.newSec(secondHalfPoints[0],secondHalfPoints[1],secondHalfPoints[2],secondHalfSegIds[0]);
			this.sections[newSecId].points = secondHalfPoints;
			this.sections[newSecId].segmentIds = secondHalfSegIds;
			this.sections[newSecId].ends[1] = this.sections[secId].ends[1]
			
			this.sections[secId].points = firstHalfPoints;
			this.sections[secId].segmentIds = firstHalfSegIds;
			
			this.sections[secId].ends[1] = false;
			this.sections[newSecId].ends[0] = false;
		}
		
		this.newEnd = function(newPoint, secId){
			var endId = this.ends.length;
			this.ends.push({
				type: 'end',
				point: newPoint,
				id: endId,
				secId: secId 
			});
			this.sections[secId].ends[(equalXZ(this.sections[secId].points[0], newPoint) == 1 ? 0 : 1)] = this.ends[endId];
		}
		
		this.removeEnd = function(point){
			var i = this.ends.length;
			while (i > 0) {
				i--;
				if (this.ends[i] != null && equalXZ(point,this.ends[i].point) == 1) {
					this.ends[i] = null;
				}
			}
		}
		
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
				target: [0, 0, 0],
				connectsTo: [[],[],[]]
			};
			
			this.sections[secId1].ends[(equalXZ(this.sections[secId1].points[0],p1) == 1 ? 0 : 1)] = this.switches[switchId];
			this.sections[secId2].ends[(equalXZ(this.sections[secId2].points[0],p1) == 1 ? 0 : 1)] = this.switches[switchId];
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
					this.switches[i].connectsTo.push([])
					this.rebuildSwitch(i,{p2:p2});
					console.log('---',i,this.switches[i],p1)
					return i;
				}
			}
			return -1;
		}
		
		this.rebuildSwitch = function(switchId,newSeg){
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
						if (pInsert.p2 != undefined && equalXZ(pInsert.p2,newSegArray[j].p2) == 1) {
							pInsert = -1;
						}
					}
					if(pInsert != -1) newSegArray.push(pInsert);
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
			}
		}
		
		this.getSwtichThrow = function(swtichId,secId,segId){
			var i = this.switches[switchId].secId.length;
			if(this.switches[switchId].secIds[i] == secId && this.switches[switchId].segIds[i] == segId){
				return this.switches[switchId].connectsTo[targetId];
			}
			return false;
		}
		
		this.rebuildEnds = function(secId){
			p1 = this.sections[secId].points[0]
			var found = true;
			var i = this.switches.length;
			while(i > 0){
				i--;
				if (this.switches[i].secIds.indexOf(secId) != -1) {
					found = false;
					this.sections[secId].ends[0] = this.switches[i];
				}
			}
			if (found) {
				var i = this.ends.length;
				while(i > 0){
					if (equalXZ(this.ends[i].point,p1) == 1) {
						found = false;
					}
				}
			}
			
			p1 = this.sections[secId].points[this.sections[secId].points.length - 1]
			var found = true;
			var i = this.switches.length;
			while(i > 0){
				i--;
				if (this.switches[i].secIds.indexOf(secId) != -1) {
					found = false;
					this.sections[secId].ends[0] = this.switches[i];
				}
			}
			if (found) {
				var i = this.ends.length;
				while(i > 0){
					if (equalXZ(this.ends[i].point,p1) == 1) {
						found = false;
					}
				}
			}
		}
		
		this.findSegInSec = function(segId){
			var i = this.sections.length;
			while(i > 0){
				i--;
				if (this.sections[i] != null && this.sections[i].segmentIds.indexOf(segId) != -1) {
					return i;
				}
			}
			return false;
		}
		
		this.findPointInSec = function(p1,secId){
			if (secId == undefined) {
				var i = this.sections.length;
				while(i > 0){
					i--;
					var j = this.sections[i].points.length;
					while (j > 0){
						j--;
						if (this.sections[i] != null && equalXZ(this.sections[i].points[j],p1) == 1) {
							return {secId: i, pointId: j};
						}	
					}
				}
			}
			else{
				var j = this.sections[secId].points.length;
				while (j > 0){
					j--;
					if (this.sections[secId] != null && equalXZ(this.sections[secId].points[j],p1) == 1) {
						return {secId: secId, pointId: j};
					}	
				}
			}
			return false;
		}
		
		pointsP1 = this.findMatchInTrackPoints(p1);
		pointsP3 = this.findMatchInTrackPoints(p3);
		console.log('p1p3',pointsP1,pointsP3);
		console.log('cur seg',this.segments.length)
		if (pointsP1.length == 0) {
			//point connects to nothing thus a new section
			if (pointsP3.length == 0) {
				console.log('point connects to nothing thus a new new section');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newEnd(p1,secId);
				this.newEnd(p3,secId);
				//this.rebuildEnds([secId]);
			}
			else if (pointsP3.length == 1) {
				console.log('point connects to an existing end and is a new end');
				this.connectTo(p3,p2,p1,pointsP3[0],this.segments.length);
				secId = this.findSegInSec(pointsP3[0]);
				//this.rebuildEnds([secId]);
			}
			else if (pointsP3.length == 2) {
				console.log('point splits an existing section and is a new switch and is a new end');
				var secId = this.newSec(p3,p2,p1,this.segments.length);
				this.splitSec(pointsP3[1],p3);
				this.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length); //check for new segs
				this.newEnd(p1,secId);
				//this.rebuildEnds([secId,this.findSegInSec(pointsP3[0]),this.findSegInSec(pointsP3[1])]);
			}
			else if (pointsP3.length >= 3) {
				console.log('point connects to existing switch and is a new end');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newEnd(p1,secId);
				console.log(p1,p3);
				this.addToSwitch(p3,p2,this.segments.length);
			}
			else{
				console.log('no match 0',this.segments.length);
			}
		}
		else if (pointsP1.length == 1) {
			console.log('point connects to an existing end');
			if (pointsP3.length == 0) {
				console.log('and is a new end');
				secId = this.findSegInSec(pointsP1[0]);
				this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
			}
			else if (pointsP3.length == 1) {
				console.log('point connects to two existing ends');
				console.log(this.sections);
				if (this.findSegInSec(pointsP1[0]) == this.findSegInSec(pointsP3[0])) {
					console.log('self enclosed loop found');
					secId = this.findSegInSec(pointsP1[0]);
					this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
					this.newSwitch(p3,p2,pointsP3[0],this.segments.length,-1);
				}
				else{
					console.log(p1,p2,p3,pointsP1[0],pointsP3[0],false);
					secId = this.combineSecs(p1,p2,p3,pointsP1[0],pointsP3[0],false);
					this.removeEnd(p1);
					this.removeEnd(p3);
				}
			}
			else if (pointsP3.length == 2) {
				console.log('point splits existing section and connects to a new switch and existing section');
				this.splitSec(pointsP3[1],p3);
				this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
				this.removeEnd(p1);
				console.log(this.sections);
				this.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
			}
			else if (pointsP3.length >= 3) {
				console.log('point connects exitsting segment to existing switch');
				this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
				this.removeEnd(p1);
				this.addToSwitch(p3,p2,this.segments.length);
			}
			else{
				console.log('no match 1',this.segments.length);
			}
		}
		else if (pointsP1.length == 2) {
			//point is a new switch
			if (pointsP3.length == 0) {
				console.log('and is a new segment and a new end');
				this.splitSec(pointsP1[1],p1);
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
				this.newEnd(p3,secId);
			}
			else if (pointsP3.length == 1) {
				console.log('point connects existing segement to a new switch');
				this.splitSec(pointsP1[1],p1);
				this.connectTo(p3,p2,p1,pointsP3[0],this.segments.length);
				this.removeEnd(p1);
				this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
			}
			else if (pointsP3.length == 2) {
				console.log('point connects new switch to a new switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP1[1],p1);
				this.splitSec(pointsP3[1],p3);
				this.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
				this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
			}
			else if (pointsP3.length >= 3) {
				console.log('point connects an existing switch to existing switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP1[1],p1);
				this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
				this.addToSwitch(p3,p2,this.segments.length);
			}
			else{
				console.log('no match 2',this.segments.length);
			}
		}
		else if (pointsP1.length >= 3) {
			//point connects to existing switch
			if (pointsP3.length == 0) {
				console.log('and is a new segment and a new end');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newEnd(p3,secId);
				this.addToSwitch(p1,p2,this.segments.length);
			}
			else if (pointsP3.length == 1) {
				console.log('point connects and existing switch to an existing end');
				this.connectTo(p3,p2,p1,pointsP3[0],this.segments.length);
				this.addToSwitch(p1,p2,this.segments.length);
			}
			else if (pointsP3.length == 2) {
				console.log('notpushed','32');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP3[1],p3);
				this.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
				this.addToSwitch(p1,p2,this.segments.length);
			}
			else if (pointsP3.length >= 3) {
				console.log('point connects an existing switch to existing switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.addToSwitch(p3,p2,this.segments.length);
				this.addToSwitch(p1,p2,this.segments.length);
			}
			else{
				console.log('no match 3',this.segments.length);
			}
		}
		else{
			console.log('no match -1',this.segments.length);
		}
		
		var segIdNext = this.segments.length;
		this.segments.push({p1: p1,p2: p2,p3: p3});
		this.segments[segIdNext].len = this.lengthOfSeg(segIdNext);
		//uploader.queueData('points',{segId:this.segments.length - 1, p1: p1, p2: p2, p3: p3});
		//uploader.queueData('sections',this.sections[0]);
		
	}
	this.addGroupToSection = function(thatGroup){
		
	}
	this.downloadData = function(){
		//ajax
		//if newData
		//add via group
	},
	this.bulkAddTrack = function(bulkPoints){
		var i = bulkPoints.length
		while(i > 0){
			i--;
			this.addToSection(bulkPoints[i].p1,bulkPoints[i].p2,bulkPoints[i].p3);
		}
	}
}

track = new trackFunc
track.bulkAddTrack(trackPoints);
console.log('track',track);