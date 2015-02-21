var trackPoints = [];

trackFunc = function(){

	this.segments = [];
	this.segments['material'] = new THREE.MeshBasicMaterial({ color: 0x49311c })
	this.segments['lineMaterial'] = new THREE.MeshBasicMaterial({ color: 0x222222 })
	this.segments['trackShape'] = new THREE.Shape([
		new THREE.Vector3(-1, -.5, 0),
		new THREE.Vector3(-1,  .5, 0),
		new THREE.Vector3( 1,  .5, 0),
		new THREE.Vector3( 1, -.5, 0)
	]);
	this.segments['baseMaterial'] = new THREE.MeshBasicMaterial({ color: 0x8E6B23 })
	this.segments['baseShape'] = new THREE.Shape([
		new THREE.Vector3(-9, -9, 0),
		new THREE.Vector3(-9,  9, 0),
		new THREE.Vector3( 9,  9, 0),
		new THREE.Vector3( 9, -9, 0)
	]);

	this.switches = [];
	this.switches['material'] = new THREE.MeshBasicMaterial({ color: 0xaa2222 })
	this.throws = [];

	this.ends = [];
	this.sections = [];
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
	}

	this.getNextSec = function(secId,endId){
		end = this.sections[secId].ends[endId];
		var segId = (endId == 0 ? this.sections[secId].segmentIds[0] : this.sections[secId].segmentIds[this.sections[secId].segmentIds.length - 1]);
		if (end.type == 'switch') {
			var switchThrow = this.getSwitchThrow(end.id,secId,segId);
			var dir = (this.sections[switchThrow.secId].segmentIds[0] === switchThrow.segId ? 1 : 0);
			return {
				sec: this.sections[switchThrow.secId],
				dir: (this.sections[switchThrow.secId].segmentIds[0] === switchThrow.segId ? 1 : 0)
			};
		}
		else if (end.type == 'end') {
			return false;
		}
		return false;
	}

	this.getPrevSec = function(secId,endId){
		end = this.sections[secId].ends[endId == 0 ? 1 : 0];
		var segId = (endId == 1 ? this.sections[secId].segmentIds[0] : this.sections[secId].segmentIds[this.sections[secId].segmentIds.length - 1]);
		if (end.type == 'switch') {
			var switchThrow = this.getSwitchThrow(end.id,secId,segId);
			return {
				sec: this.sections[switchThrow.secId],
				dir: (this.sections[switchThrow.secId].segmentIds[0] === switchThrow.segId ? 0 : 1)
			};
		}
		else if (end.type == 'end') {
			return false;
		}
		return false;
	}

	this.lerpDistance = function(seg,opts) {
		opts = opts !== undefined ? opts : {};
		var numBreaks = opts.numBreaks !== undefined ? opts.numBreaks : 10;
		var startT = opts.startT !== undefined ? opts.startT : 0;
		var endT = opts.endT !== undefined ? opts.endT : 1;

		if (startT == endT) {return 0;}

		var st = startT < endT ? endT : startT;
		var et = startT < endT ? startT : endT;
		var step = (st-et)/numBreaks;

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

	this.lerpToDist = function(seg,dist){
		var totalDist = this.lerpDistance({p1: seg.p1,p2: seg.p2, p3: seg.p3});

		var vagueT = dist/totalDist;

		var vagueDist = this.lerpDistance({p1: seg.p1,p2: seg.p2, p3: seg.p3},
			{
				startT: 0,
				endT: vagueT
			});
		//console.log('vague',vagueDist, vagueT)
		//console.log(seg.p1,seg.p2,seg.p3,vagueT);
		return lerp(seg.p1,seg.p2,seg.p2,seg.p3,vagueT);

	}

	this.sectionDistanceRemaining = function(secId,dir,curPointId,remDist){

		//console.log(secId,dir,curPointId,remDist);

		var i = this.sections[secId].segmentIds.length;

		if (curPointId == this.sections[secId].points.length)
			curPointId -= 2;
		if (curPointId == 0)
			curPointId += 2;
		while(i--){
			//console.log(secId, i, this.segments[this.sections[secId].segmentIds[i]].p2,this.sections[secId].points[curPointId])
			if(equalXZ(this.segments[this.sections[secId].segmentIds[i]].p2, this.sections[secId].points[curPointId]) == 1)
				break;
		}

		var dist = remDist;
		var j = (dir == 1 ? this.sections[secId].segmentIds.length - 1 : 0);
		var inc = (dir == 1 ? 1 : -1);
		//console.log(i,j,inc);
		while(i != j){
			//console.log('dist',dist,this.sections[secId].segmentIds[i+inc],secId,i+inc,this.segments[this.sections[secId].segmentIds[i+inc]]);
			i += inc;
			dist += this.segments[this.sections[secId].segmentIds[i]].len;
		}
		return dist;
	}

	this.sectionDistance = function(secId){
		//console.log(this.sections[secId],secId)
		var i = this.sections[secId].segmentIds.length
		dist = 0;
		while(i > 0){
			i--;
			dist += this.segments[this.sections[secId].segmentIds[i]].len;
		}
		return dist;
	}

	this.newSec = function(p1,p2,p3,segId){
		var secLen = this.sections.length;
		//console.log(secLen);
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

		if(equalXZ(this.sections[secId1].points[0],p1) == 1 && equalXZ(this.sections[secId2].points[0],p3) == 1){
			this.sections[secId1].points.reverse();
			this.sections[secId1].segmentIds.reverse();
			this.sections[secId1].ends[0] = this.sections[secId1].ends[1];
			this.sections[secId1].ends[1] = this.sections[secId2].ends[1];
		}
		else if(equalXZ(this.sections[secId1].points[0],p1) == 1 && equalXZ(this.sections[secId2].points[this.sections[secId2].points.length - 1],p3) == 1){
			this.sections[secId1].points.reverse();
			this.sections[secId1].segmentIds.reverse();
			this.sections[secId2].points.reverse();
			this.sections[secId2].segmentIds.reverse();
			this.sections[secId1].ends[0] = this.sections[secId1].ends[1];
			this.sections[secId1].ends[1] = this.sections[secId2].ends[0];
		}
		else if(
			equalXZ(this.sections[secId1].points[this.sections[secId1].points.length - 1],p1) == 1 && equalXZ(this.sections[secId2].points[0],p3) == 1){
			this.sections[secId1].ends[0] = this.sections[secId1].ends[0];
			this.sections[secId1].ends[1] = this.sections[secId2].ends[1];
		}
		else if(equalXZ(this.sections[secId1].points[this.sections[secId1].points.length - 1],p1) == 1 && equalXZ(this.sections[secId2].points[this.sections[secId2].points.length - 1],p3) == 1){
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

		var secId = this.findSegInSec(segId);
		var splitPointPre = this.findPointInSec(p1,secId)
		if(splitPointPre.length >= 2)
			for(var i = 0; i < splitPointPre.length; i++)
				if(splitPointPre[i].pointId == 0 | splitPointPre[i].pointId == this.sections[secId].points.length - 1)
					splitPointPre.splice(i,1);

		if(splitPointPre.length == 0)
			return
		if(splitPointPre.length == 2)
			console.error(secId, splitPointPre, "error, 2 points found. ")

		var splitPoint = splitPointPre[0].pointId;

		/*var isSelfEnclosed = false;
		if(this.sections[secId].ends[0].secIds.length == 2
			& this.sections[secId].ends[1].secIds.length == 2
			& this.sections[secId].ends[0].secIds[0] == this.sections[secId].ends[0].secIds[1]
			& this.sections[secId].ends[1].secIds[0] == this.sections[secId].ends[1].secIds[1]
		){
			isSelfEnclosed = true;
		}*/

		if (splitPoint == 0 | splitPoint == this.sections[secId].points.length - 1)
			return

		//console.log('splitting section, secId',secId)

		firstHalfPoints = this.sections[secId].points.splice(0,splitPoint+1);
		secondHalfPoints = this.sections[secId].points;
		if(equalXZ(secondHalfPoints[0],firstHalfPoints[firstHalfPoints.length - 1]) != 1)
			secondHalfPoints.unshift(firstHalfPoints[firstHalfPoints.length - 1]);
		else if (equalXZ(secondHalfPoints[secondHalfPoints.length - 1],firstHalfPoints[firstHalfPoints.length - 1]) != 1){
			secondHalfPoints.push(firstHalfPoints[firstHalfPoints.length - 1]);
		}
		firstHalfSegIds = this.sections[secId].segmentIds.splice(0,((splitPoint-1)/2)+1);
		secondHalfSegIds = this.sections[secId].segmentIds;

		var newSecId = this.newSec(secondHalfPoints[0],secondHalfPoints[1],secondHalfPoints[2],secondHalfSegIds[0]);
		this.sections[newSecId].points = secondHalfPoints;
		this.sections[newSecId].segmentIds = secondHalfSegIds;
		this.sections[newSecId].ends[1] = this.sections[secId].ends[1]

		this.sections[secId].points = firstHalfPoints;
		this.sections[secId].segmentIds = firstHalfSegIds;

		/*if(isSelfEnclosed){
			if(equalXZ(p1,this.sections[secId].ends[0].origin) == 1){
				//console.log('self enclosed, but already happy')
			}
			else{
				//console.log('not happy');
			}
		}*/

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

	this.switchTestBoxes = [];
	this.updateSwitchBoxes = function(){
		//console.log('got called')
		for(i = 0; i < track.switches.length; i++){
			if(this.switches[i] != undefined && track.switches[i] != null){
				if(this.switchTestBoxes[i] == undefined) this.switchTestBoxes[i] = [];
				//console.log(this.switchTestBoxes[i])
				for(j = 0; j < track.switches[i].secIds.length; j++){
					//console.log(j)
					if(this.switchTestBoxes[i][j] == undefined){

						this.switchTestBoxes[i][j] = testCube(this.getThrowPoint(i,this.switches[i].secIds[j],this.switches[i].segIds[j]));
					}
					else{
						pos = this.getThrowPoint(i,this.switches[i].secIds[j],this.switches[i].segIds[j])
						this.switchTestBoxes[i][j].position.set(pos.x,pos.y,pos.z);
					}
				}
			}
		}
	}
	this.getSwitchThrow = function(switchId,secId,segId){
		var i = this.switches[switchId].secIds.length;
		while(i > 0){
			i--;
			//console.log(this.switches[switchId].secIds[i] , secId , this.switches[switchId].segIds[i] , segId, switchId)
			if(this.switches[switchId].secIds[i] === secId && this.switches[switchId].segIds[i] === segId){
				//console.log('===',this.switches[switchId],this.switches[switchId].target[i],i)
				return this.switches[switchId].connectsTo[i][this.switches[switchId].target[i]];
			}
		}
		return false;
	}
	this.getThrowPoint = function(switchId,secId,segId){
		return this.segments[this.getSwitchThrow(switchId,secId,segId).segId].p2
	}

	this.getSwitchThrowId = function(switchId,secId,segId){
		var i = this.switches[switchId].secIds.length;
		while(i > 0){
			i--;
			if(this.switches[switchId].secIds[i] == secId && this.switches[switchId].segIds[i] == segId){
				//console.log('targetId',this.switches[switchId].target[i])
				return this.switches[switchId].target[i];
			}
		}
		return false;
	}

	this.switchByPoint = function(inPoint, p2){
		var points = [inPoint];
		var secs = this.findPointInSec(inPoint);
		var i = secs.length
		while(i > 0){
			i--;
			points.push(this.sections[secs[i].secId].points[(secs[i].pointId == 0 ? this.sections[secs[i].secId].points.length - 1 : 0)]);
		}
		var p = points.length;
		while(p > 0){
			p--;
			var p1 = points[p];
			var switchId = i = this.switches.length;
			while(i > 0){
				i--;
				if (equalXZ(this.switches[i].origin,p1) == 1) {
					switchId = i;
				}
			}

			var secIds = []
			var i = this.sections.length;
			while(i > 0){
				i--;
				if(this.sections[i] != null){
					if(equalXZ(this.sections[i].points[0],p1) == 1)
						secIds.push({secId: i, pointId: 1, segId: this.sections[i].segmentIds[0]});
					if(equalXZ(this.sections[i].points[this.sections[i].points.length - 1],p1) == 1)
						secIds.push({secId: i, pointId: this.sections[i].points.length - 2, segId: this.sections[i].segmentIds[this.sections[i].segmentIds.length - 1]});
				}
			}

			if(secIds.length <= 1) // && equalXZ(this.sections[0].points[0], this.sections[i].points[this.sections[i].points.length - 1]) != 1)
				continue;

			if (this.switches[switchId] != undefined){
				if(this.switches[switchId].line != undefined)
					for(var j = 0; j < this.switches[switchId].line.length; j++)
						scene.remove(this.switches[switchId].line[j]);

				if(this.switches[switchId].throwObjs != undefined)
					for(var j = 0; j < this.switches[switchId].throwObjs.length; j++)
						scene.remove(this.switches[switchId].throwObjs[j]);
			}

			this.switches[switchId] = {
				type: 'switch',
				origin: p1,
				id: switchId,
				secIds: [],
				segIds: [],
				points: [],
				target: [],
				connectsTo: [],
				throwObjs: [],
				line: []
			};

			var i = secIds.length;
			while(i > 0){
				i--;
				var startEnd = (equalXZ(this.sections[secIds[i].secId].points[0],p1) == 1 ? 0 : 1);
				this.sections[secIds[i].secId].ends[startEnd] = this.switches[switchId];
				this.switches[switchId].secIds.push(secIds[i].secId);
				this.switches[switchId].segIds.push(secIds[i].segId);
				this.switches[switchId].target.push(0);
				this.switches[switchId].connectsTo.push([]);
				this.switches[switchId].points.push(this.sections[secIds[i].secId].points[secIds[i].pointId]);
				this.switches[switchId].throwObjs.push(null);
			}

			//console.log('***switch',p1);
			var newSegArray = []
			var i = -1;
			var lim = this.switches[switchId].segIds.length - 1;
			while (i < lim) {
				i++;
				if (this.segments[this.switches[switchId].segIds[i]] != -1) {
					var j = newSegArray.length
					var pInsert = (this.segments[this.switches[switchId].segIds[i]] == undefined ? {p2 : p2} : this.segments[this.switches[switchId].segIds[i]]);
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
						/*&& newSegArray[i] != -1
						&& newSegArray[j] != -1
						&& angleBetweenFlattenedVectors(
							newSegArray[i].p2,
							newSegArray[j].p2,
							this.switches[switchId].origin) >= 0*/
					){
						this.switches[switchId].connectsTo[i].push({
							secId: this.findSegInSec(this.switches[switchId].segIds[j]),
							segId: this.switches[switchId].segIds[j],
							point: newSegArray[j].p2
						});
					}
				}
				if (this.switches[switchId].throwObjs[i] != null) {
					this.switches[switchId].throwObjs[i].clickCall = '';
					scene.remove(this.switches[switchId].throwObjs[i]);
					delete this.throws[this.switches[switchId].throwObjs[i].id];
					this.switches[switchId].throwObjs[i] = null;
				}
				if(this.switches[switchId].connectsTo[i].length >= 2){
					this.switches[switchId].throwObjs[i] = new THREE.Mesh(
						this.buildGeomPoints(recalcY(addVectorToPoint(newSegArray[i].p2,extendVector(12,perpendicularVectorXZ({x:-1,z:1},this.switches[switchId].origin,newSegArray[i].p2)))),recalcY(newSegArray[i].p2),5,5,5),
						this.switches['material']
					);
					this.switches[switchId].throwObjs[i].clickCall = (function(t, switchId, curId){
						return function(){
							if (t.id != track.switches[switchId].throwObjs[curId].id)
								return;

							track.switches[switchId].target[curId]++;
							if(track.switches[switchId].target[curId] >= track.switches[switchId].connectsTo[curId].length)
								track.switches[switchId].target[curId] = 0;

							var eTarget = track.switches[switchId].target[curId];
							var mat = new THREE.LineBasicMaterial( { color: 0x7777777, linewidth: 3, transparent: true } );

							//console.log(eTarget)

							var sPoint = track.switches[switchId].points[curId];
							var ePoint = track.switches[switchId].connectsTo[curId][eTarget].point;
							var mPoint = track.switches[switchId].origin;

							var geom = new THREE.Geometry();
							for(var k = 0; k <= .4; k += .05){
								var a = recalcY(lerp(sPoint,mPoint,mPoint,ePoint,k),4.1);
								var b = recalcY(lerp(sPoint,mPoint,mPoint,ePoint,k+.001),4.1);
								geom.vertices.push(track.buildLinePointsLeft(a,b,-1));
							}

							//if(track.switches[switchId].line[curId] != undefined)
							scene.remove(track.switches[switchId].line[curId])

							track.switches[switchId].line[curId] = new THREE.Line(geom,mat);

							track.switches[switchId].line[curId].material.opacity = 1;
							scene.add(track.switches[switchId].line[curId])
							/*var waitFunc = function(line){
								var inFunc = function(){
									line.material.opacity -= .05
									if(line.material.opacity > 0)
										setTimeout(inFunc,100);
									else
										scene.remove(line);
								}
								return inFunc;
							}(line);
							setTimeout(waitFunc,500);*/

						}
					})(this.switches[switchId].throwObjs[i], switchId, i)
					this.switches[switchId].throwObjs[i].clickCall();

					/*Function(
						'if('+this.switches[switchId].throwObjs[i].id+' != track.switches['+switchId+'].throwObjs['+i+'].id) return;'+
						'//console.log("herehere",track.switches['+switchId+'].target['+i+'],'+i+','+switchId+');'+
						'track.switches['+switchId+'].target['+i+']++;'+
						'//console.log("herehere",track.switches['+switchId+'].target['+i+'],'+i+','+switchId+');'+
						'if(track.switches['+switchId+'].target['+i+'] == track.switches['+switchId+'].connectsTo['+i+'].length){'+
							'track.switches['+switchId+'].target['+i+'] = 0;'+
						'}'+'//console.log("herehere",track.switches['+switchId+'].target['+i+'],'+i+');'+
						'track.updateSwitchBoxes()'
					)*/
					this.throws[this.switches[switchId].throwObjs[i].id] = this.switches[switchId].throwObjs[i];
					scene.add(this.switches[switchId].throwObjs[i])
					//this.updateSwitchBoxes();
				}
			}

			if(this.switches[switchId].secIds.length == 1){
				//console.error('it happened here');
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
		ret = [];
		if (secId == undefined) {
			var i = this.sections.length;
			while(i > 0){
				i--;
				if(this.sections[i] != null){
					var j = this.sections[i].points.length;
					while (j > 0){
						j--;
						if(equalXZ(this.sections[i].points[j],p1) == 1) {
							//console.log('1',{secId: i, pointId: j})
							ret.push({secId: i, pointId: j});
						}
					}
				}
			}
		}
		else{
			if (this.sections[secId] != null){
				var j = this.sections[secId].points.length;
				while (j > 0){
					j--;
					if(equalXZ(this.sections[secId].points[j],p1) == 1) {
						//console.log('2',{secId: secId, pointId: j})
						ret.push({secId: secId, pointId: j});
					}
				}
			}
		}
		//console.log(ret != [] ? ret : false)
		return ret != [] ? ret : false;
	}

	this.addToSection = function(p1,p2,p3){
		//console.log('blink');
		pointsP1 = this.findMatchInTrackPoints(p1);
		pointsP3 = this.findMatchInTrackPoints(p3);
		//console.log('p1p3',pointsP1,pointsP3)
		if (pointsP1.length == 0) {
			//point connects to nothing thus a new section
			if (pointsP3.length == 0) {
				//console.log('point connects to nothing thus a new new section');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newEnd(p1,secId);
				this.newEnd(p3,secId);
				//this.rebuildEnds([secId]);
			}
			else if (pointsP3.length == 1) {
				//console.log('point connects to an existing end and is a new end');
				this.connectTo(p3,p2,p1,pointsP3[0],this.segments.length);
				secId = this.findSegInSec(pointsP3[0]);
				//this.rebuildEnds([secId]);
			}
			else if (pointsP3.length == 2) {
				//console.log('point splits an existing section and is a new switch and is a new end');
				var secId = this.newSec(p3,p2,p1,this.segments.length);
				this.splitSec(pointsP3[1],p3,this.segments.length);
				this.newEnd(p1,secId);
				this.switchByPoint(p3,p2);
			}
			else if (pointsP3.length >= 3) {
				//console.log('point connects to existing switch and is a new end');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newEnd(p1,secId);
				//this.addToSwitch(p3,p2,this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else{
				//console.log('no match 0',this.segments.length);
			}
		}
		else if (pointsP1.length == 1) {
			//console.log('point connects to an existing end');
			if (pointsP3.length == 0) {
				//console.log('and is a new end');
				secId = this.findSegInSec(pointsP1[0]);
				this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
			}
			else if (pointsP3.length == 1) {
				//console.log('point connects to two existing ends');
				var secId = this.findSegInSec(pointsP1[0]);
				if (secId == this.findSegInSec(pointsP3[0])) {
					//console.log('self enclosed loop found');
					this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
					//this.splitSec(secId, (this.sections[secId].points[Math.floor(this.sections[secId].points.length/2)]));
					this.switchByPoint(p3,p2);
					this.sections[secId].ends[1] = this.sections[secId].ends[0];
				}
				else{
					secId = this.combineSecs(p1,p2,p3,pointsP1[0],pointsP3[0],false);
					this.removeEnd(p1);
					this.removeEnd(p3);
				}
			}
			else if (pointsP3.length == 2) {
				//console.log('point splits existing section and connects to a new switch and existing section');
				this.splitSec(pointsP3[1],p3);
				this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
				//this.removeEnd(p1);
				//this.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else if (pointsP3.length >= 3) {
				//console.log('point connects exitsting segment to existing switch');
				this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
				this.removeEnd(p1);
				//this.addToSwitch(p3,p2,this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else{
				//console.log('no match 1',this.segments.length);
			}
		}
		else if (pointsP1.length == 2) {
			//point is a new switch
			if (pointsP3.length == 0) {
				//console.log('and is a new segment and a new end');
				//die();//console.error('D -=>')
				//if(this.findSegInSec(pointsP1[0]) == this.findSegInSec(pointsP1[1]))
					this.splitSec(pointsP1[1],p1,this.segments.length);

				var secId = this.newSec(p3,p2,p1,this.segments.length);
				this.newEnd(p3,secId);

				this.switchByPoint(p1,p2);
				//due();
				//this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
			}
			else if (pointsP3.length == 1) {
				//console.log('point connects existing segement to a new switch');
				this.splitSec(pointsP1[1],p1,this.segments.length);
				this.connectTo(p3,p2,p1,pointsP3[0],this.segments.length);
				this.removeEnd(p1);
				//this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
			}
			else if (pointsP3.length == 2) {
				//console.log('point connects new switch to a new switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP1[1],p1,this.segments.length);
				this.splitSec(pointsP3[1],p3,this.segments.length);
				this.switchByPoint(p3,p2);
				//this.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
				//this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
			}
			else if (pointsP3.length >= 3) {
				//console.log('point connects an existing switch to existing switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP1[1],p1,this.segments.length);
				//this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
				//this.addToSwitch(p3,p2,this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else{
				//console.log('no match 2',this.segments.length);
			}
			this.switchByPoint(p1,p2);
		}
		else if (pointsP1.length >= 3) {
			//point connects to existing switch
			if (pointsP3.length == 0) {
				//console.log('and is a new segment and a new end');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newEnd(p3,secId);
			}
			else if (pointsP3.length == 1) {
				//console.log('point connects and existing switch to an existing end');
				this.connectTo(p3,p2,p1,pointsP3[0],this.segments.length);
			}
			else if (pointsP3.length == 2) {
				//console.log('notpushed','32');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP3[1],p3);
				//.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
				//this.addToSwitch(p1,p2,this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else if (pointsP3.length >= 3) {
				//console.log('point connects an existing switch to existing switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				//this.addToSwitch(p3,p2,this.segments.length);
				//this.addToSwitch(p1,p2,this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else{
				//console.log('no match 3',this.segments.length);
			}
			this.switchByPoint(p1,p2);
		}
		else{
			//console.log('no match -1',this.segments.length);
		}

		var segIdNext = this.segments.length;
		this.segments.push({p1: p1,p2: p2,p3: p3});
		this.segments[segIdNext].len = this.lerpDistance(this.segments[segIdNext]);
		this.calcSegmentVertices([segIdNext].concat(pointsP1).concat(pointsP3));
		//uploader.queueData('points',{segId:this.segments.length - 1, p1: p1, p2: p2, p3: p3});
		//uploader.queueData('sections',this.sections[0]);
	}

	this.findP2OfConnectingSegs = function(p1,segId){
		var ret = [];
		var i = this.segments.length;
		while(i > 0){
			i--;
			if (i != segId && (equalXZ(this.segments[i].p1,p1) == 1 || equalXZ(this.segments[i].p3,p1) == 1)) {
				ret.push({segId: i, p2: this.segments[i].p2});
			}
		}
		return ret.length == 0 ? false : ret;
	}

	this.buildGeomPoints = function(origin,originOffset,x,y,z){
		var tie = new THREE.BoxGeometry(x,y,z);
		tie.applyMatrix( new THREE.Matrix4().makeTranslation(origin.x,origin.y+2,origin.z).lookAt( origin,originOffset,new THREE.Vector3(0,1,0)));
		tie.verticesNeedUpdate = true;
		tie.origin = origin;
		return tie;
	}

	this.buildLinePointsLeft = function(origin,originOffset,further){
		if(further == undefined) further = 0;
		return addVectorToPoint(origin,extendVector(5+further,perpendicularVectorXZ({x: -1, z:  1},originOffset,origin)));
	}

	this.buildLinePointsRight = function(origin,originOffset){
		return addVectorToPoint(origin,extendVector(5,perpendicularVectorXZ({x: 1,  z: -1},originOffset,origin)));
	}

	this.calcFromP2toP2 = function(startP2,p1,endP2,half){

		var leftExtrudeSettings = {bevelEnabled: false}
		var rightExtrudeSettings = {bevelEnabled: false}
		var baseExtrudeSettings = {bevelEnabled: false}

		var  path = lleft = lright = [];
		var geom = new THREE.Geometry();
		var dist = this.lerpDistance({p1:startP2,p2:p1,p3:endP2})

		this.trackWidth = 1;
		this.trackSpacing = 7;

		var spacing = 1/Math.floor(dist/this.trackSpacing);

		var i = half ? .5 - (spacing/2) : 1;

		var l = recalcY(lerp(startP2,p1,p1,endP2,half ? .51 : 1.01));
		var lPlus = recalcY(lerp(startP2,p1,p1,endP2,half ? .52 : 1.02));

		path   = path.concat(l);
		lleft  = lleft.concat(this.buildLinePointsLeft(l,lPlus));
		lright = lright.concat(this.buildLinePointsRight(l,lPlus));

		//meat
		var lim = (spacing/2)
		var steps = 0;
		while (i >= lim){
			steps++;

			var l = recalcY(lerp(startP2,p1,p1,endP2,i));
			var lPlus = recalcY(lerp(startP2,p1,p1,endP2,i+.01));

			path   = path.concat(l);
			lleft  = lleft.concat(this.buildLinePointsLeft(l,lPlus));
			lright = lright.concat(this.buildLinePointsRight(l,lPlus));
			geom.merge( this.buildGeomPoints(l,lPlus,14,2,2));

			i -= spacing;
		}

		//post
		var l = recalcY(lerp(startP2,p1,p1,endP2,-.01));
		var lPlus = recalcY(lerp(startP2,p1,p1,endP2,0));

		path   = path.concat(l);
		lleft  = lleft.concat(this.buildLinePointsLeft(l,lPlus));
		lright = lright.concat(this.buildLinePointsRight(l,lPlus));

		geom.merge( this.buildGeomPoints(lerp(startP2,p1,p1,endP2, lim),lerp(startP2,p1,p1,endP2,lim+.01),14,2,2));

		baseExtrudeSettings.extrudePath = new THREE.SplineCurve3(path)
		leftExtrudeSettings.extrudePath = new THREE.SplineCurve3(lleft)
		rightExtrudeSettings.extrudePath = new THREE.SplineCurve3(lright)
		leftExtrudeSettings.steps = rightExtrudeSettings.steps = baseExtrudeSettings.steps = steps * 2

		return {geom: geom, base: baseExtrudeSettings, lleft: leftExtrudeSettings, lright: rightExtrudeSettings};
	}

	this.calcSegmentVertices = function(segIds){
		var j = segIds.length;
		while(j > 0){
			j--;
			var geom = new THREE.Geometry();
			var trackLines = new THREE.Geometry();
			var base = new THREE.Geometry();

			//trackLines.vertices = [];
			var p1 = recalcY(this.segments[segIds[j]].p1);
			var p2 = recalcY(this.segments[segIds[j]].p2);
			var p3 = recalcY(this.segments[segIds[j]].p3);
			var pointsFromP1 = this.findP2OfConnectingSegs(p1,segIds[j]);
			if (pointsFromP1 != false) {
				var i = pointsFromP1.length;
				while( i > 0){
					i--;
					if (angleBetweenFlattenedVectors(p2,pointsFromP1[i].p2,p1)) {
						var builtPoints = this.calcFromP2toP2(p2,p1,pointsFromP1[i].p2,true);
						geom.merge( builtPoints.geom);
						trackLines.merge( this.segments['trackShape'].extrude(builtPoints.lleft));
						trackLines.merge( this.segments['trackShape'].extrude(builtPoints.lright));
						base.merge( this.segments['baseShape'].extrude(builtPoints.base));
					}
				}
			}
			else{
				var builtPoints = this.calcFromP2toP2(p2,midpoint(p2,p1),p1,false);
				geom.merge( builtPoints.geom);
				trackLines.merge( this.segments['trackShape'].extrude(builtPoints.lleft));
				trackLines.merge( this.segments['trackShape'].extrude(builtPoints.lright));
				base.merge( this.segments['baseShape'].extrude(builtPoints.base));
				var tempGeom = this.buildGeomPoints(p1,p2,15,9,5)
				tempGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-4,0));
				trackLines.merge( tempGeom);
			}
			var pointsFromP3 = this.findP2OfConnectingSegs(p3,segIds[j]);
			if (pointsFromP3 != false) {
				var i = pointsFromP3.length;
				while( i > 0){
					i--;
					var builtPoints = this.calcFromP2toP2(p2,p3,pointsFromP3[i].p2,true);
					geom.merge( builtPoints.geom);
					trackLines.merge( this.segments['trackShape'].extrude(builtPoints.lleft));
					trackLines.merge( this.segments['trackShape'].extrude(builtPoints.lright));
					base.merge( this.segments['baseShape'].extrude(builtPoints.base));
				}
			}
			else{
				var builtPoints = this.calcFromP2toP2(p2,midpoint(p2,p3),p3,false);
				geom.merge( builtPoints.geom);
				trackLines.merge( this.segments['trackShape'].extrude(builtPoints.lleft));
				trackLines.merge( this.segments['trackShape'].extrude(builtPoints.lright));
				base.merge( this.segments['baseShape'].extrude(builtPoints.base));
				var tempGeom = this.buildGeomPoints(p3,p2,15,9,5)
				tempGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-4,0));
				trackLines.merge( tempGeom);
			}
			if (this.segments[segIds[j]].mesh != undefined){
				scene.remove(this.segments[segIds[j]].mesh)
			}

			trackLines.applyMatrix(new THREE.Matrix4().makeTranslation(0,3,0));
			base.applyMatrix(new THREE.Matrix4().makeTranslation(0,-8,0));

			var mesh = new THREE.Object3D();
			mesh.add(new THREE.Mesh( geom, this.segments['material']));
			mesh.add(new THREE.Mesh( trackLines, this.segments['lineMaterial']));
			mesh.add(new THREE.Mesh( base, this.segments['baseMaterial']));
			this.segments[segIds[j]].mesh = mesh;
			scene.add(this.segments[segIds[j]].mesh)
		}
	}

	this.checkTrackInArea = function(p1, radius) {
		var lft = p1.x - radius;
		var rht = p1.x + radius;
		var top = p1.z + radius;
		var bot = p1.z - radius;

		var i = this.segments.length
		var affectedSegs = [];

		while (i > 0) {
			i--;
			if (
				(this.segments[i].p1.x >= lft && this.segments[i].p1.x <= rht && this.segments[i].p1.z >= bot && this.segments[i].p1.z <= top) |
				(this.segments[i].p2.x >= lft && this.segments[i].p2.x <= rht && this.segments[i].p2.z >= bot && this.segments[i].p2.z <= top) |
				(this.segments[i].p3.x >= lft && this.segments[i].p3.x <= rht && this.segments[i].p3.z >= bot && this.segments[i].p3.z <= top)
			){
				affectedSegs.push(i); continue;
				var j = 3;
				while(j--){
					var k = this.segments[i].mesh.children[j].geometry.vertices.length;
					while(k--){
						var d = p1.distanceTo(this.segments[i].mesh.children[j].geometry.vertices[k]);
						if(d < radius){
							this.segments[i].mesh.children[j].geometry.vertices[k].y = findY(this.segments[i].mesh.children[j].geometry.vertices[k].x,this.segments[i].mesh.children[j].geometry.vertices[k].z)
							this.segments[i].mesh.children[j].geometry.verticesNeedUpdate = true;
						}
					}
				}
			}
		}

		this.calcSegmentVertices(affectedSegs);

		var i = this.switches.length
		while(i > 0){
			i--;
			j = this.switches[i].throwObjs.length
			while(j > 0){
				j--;
				if (this.switches[i].throwObjs[j] != null) {
					var newY =  findY(this.switches[i].throwObjs[j].geometry.origin.x,this.switches[i].throwObjs[j].geometry.origin.z);
					var diffY = newY - this.switches[i].throwObjs[j].geometry.origin.y;
					if ( diffY != 0) {
						//console.log('ny',newY,diffY)
						this.switches[i].throwObjs[j].translateY(diffY);
						this.switches[i].throwObjs[j].geometry.origin.y = newY;
						this.switches[i].throwObjs[j].verticesNeedUpdate = true;
					}
				}
				else{
					//console.log('null found',i,j)
				}
			}
		}
	}
}

track = new trackFunc
//console.log('track',track);


function getThrows( intersects ) {
	//console.log('numIntersected',intersects)
	var i = intersects.length
	while ( i > 0 ) {
		i--;
		if (intersects[i].object.clickCall != undefined) {
			//console.log(intersects[i].object.id)
			intersects[i].object.clickCall();
		}
	}
}
