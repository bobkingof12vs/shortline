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
	}/*,
	{p1: new THREE.Vector3(300, 0, 100),
	 p2: new THREE.Vector3(250, 0, 100),
	 p3: new THREE.Vector3(200, 0, 100)
	},
	{p1: new THREE.Vector3(200, 0, 0),
	 p2: new THREE.Vector3(200, 0, 50),
	 p3: new THREE.Vector3(200, 0, 100)
	}*/,
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
	}/*,
	{p1: new THREE.Vector3(200, 0, 200),
	 p2: new THREE.Vector3(200, 0, 250),
	 p3: new THREE.Vector3(200, 0, 300)
	},
	{p1: new THREE.Vector3(200, 0, 200),
	 p2: new THREE.Vector3(150, 0, 200),
	 p3: new THREE.Vector3(100, 0, 200)
	}*/,
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
	},
	{p1: new THREE.Vector3(-50,  0,-50),
	 p2: new THREE.Vector3(-50,  0,  0),
	 p3: new THREE.Vector3(-50,  0, 50)
	},
	{p1: new THREE.Vector3(50,  0,-50),
	 p2: new THREE.Vector3(50,  0,-150),
	 p3: new THREE.Vector3(50,  0,-250)
	},
	{p1: new THREE.Vector3(-50,  0, 50),
	 p2: new THREE.Vector3(  0,  0, 50),
	 p3: new THREE.Vector3( 50,  0, 50)
	},
	{p1: new THREE.Vector3( 50,  0, 50),
	 p2: new THREE.Vector3( 50,  0,  0),
	 p3: new THREE.Vector3( 50,  0,-50)
	},
	{p1: new THREE.Vector3( -50,  0,-50),
	 p2: new THREE.Vector3(-100,  0,-50),
	 p3: new THREE.Vector3(-150,  0,-50)
	},
	{p1: new THREE.Vector3(-150,  0,-50),
	 p2: new THREE.Vector3(-200,  0,-50),
	 p3: new THREE.Vector3(-250,  0,-50)
	},
	{p1: new THREE.Vector3(-250,  0,-50),
	 p2: new THREE.Vector3(-300,  0,-50),
	 p3: new THREE.Vector3(-350,  0,-50)
	},
	{p1: new THREE.Vector3(-150,  0,-50),
	 p2: new THREE.Vector3(-150,  0,-100),
	 p3: new THREE.Vector3(-150,  0,-150)
	},
	{p1: new THREE.Vector3(-150,  0,-150),
	 p2: new THREE.Vector3(-150,  0,-200),
	 p3: new THREE.Vector3(-150,  0,-250)
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
		console.log(end);
		if (end.type == 'switch') {
			console.log(end.id,secId,(endId == 0 ? this.sections[secId].segmentIds[0] : this.sections[secId].segmentIds[this.sections[secId].segmentIds.length - 1]));
			var switchThrow = this.getSwitchThrow(end.id,secId,(endId == 0 ? this.sections[secId].segmentIds[0] : this.sections[secId].segmentIds[this.sections[secId].segmentIds.length - 1]));
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

	this.sectionDistanceRemaining = function(secId,secStartDirPoint,curSeg,curT){
		var startT = equalXZ(secStartDirPoint,this.section[secId].ends[0].point) == 1 ? 0 : 1;
		var endT = start == 1 ? 0 : 1;
		var dist = this.lerpDistance(this.segments[curSeg],{startT: curT, endT: endT});
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
		//console.log(this.sections[secId],secId)
		var i = this.sections[secId].segmentIds.length
		dist = 0;
		while(i > 0){
			i--;
			dist += this.segments[this.sections[secId].segmentIds[i]].len;
		}
		return dist;
	}

	this.trackPreLine = {};
	this.trackPreLine.part = 'init';
	this.trackPreLine.curTrack = -1;
	this.trackPreLine.curSeg = -1;
	this.trackPreLine.origin = new THREE.Vector3();
	this.trackPreLine.blinemat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );
	this.trackPreLine.children = [];

	this.firstClick = 1;
	this.layTrack = function(i){

		this.firstClick = 1;
		var closePoint = function(point){
			var j = trackPoints.length;
			var far = 50;
			var winner = -1;
			while (j>0) {
				j--;{
					if (trackPoints[j].p1.distanceTo(point) < far) {
						far = trackPoints[j].p1.distanceTo(point);
						winner = trackPoints[j].p1;
					}
					else if (trackPoints[j].p3.distanceTo(point) < far) {
						far = trackPoints[j].p3.distanceTo(point);
						winner = trackPoints[j].p3;
					}
				}
			}
			if (winner != -1) {
				point = winner;
			}
			return point;
		}

		point = closePoint(i[0].point);

		if (this.trackPreLine.part == 'init') {
			this.trackPreLine.part = 'part2';
			this.trackPreLine.curSeg++;
			this.trackPreLine.origin = point;

			var geom = new THREE.Geometry();
			geom.vertices.push(point);
			geom.vertices.push(point);

		}

		if (this.trackPreLine.part == 'part2') {
			this.trackPreLine.part = 'part3'

			listener = function(e){
				mouse.x = e.clientX;
				mouse.y = e.clientY;

				if(track.trackPreLine.children.length > 0)
					scene.remove(track.trackPreLine.children[track.trackPreLine.curSeg]);

				if (m['m_tra_lay'].clicked == 1 & mouseInMenu == 0) {
					getMouseIntersect(mouse, [obj['plane'].children[1]],function(i){

						if (i != 1) {
							i[0].point = closePoint(i[0].point);

							if (trackPoints.length > 0) {
								if (angleBetweenFlattenedVectors(
									trackPoints[trackPoints.length-1].p1,
									i[0].point,
									trackPoints[trackPoints.length-1].p3
								) <= 90 & track.firstClick == 0) {return}
							}

							track.addPreLineToScene(track.trackPreLine.origin,i[0].point);
						}

					});
				}

				else if (m['m_tra_lay'].clicked != 1){
					document.body.removeEventListener('mousemove',listener,false);
				}

			}
			document.body.addEventListener('mousemove',listener,false);
		}

		else if (this.trackPreLine.part == 'part3') {

			if (trackPoints.length > 1) {
				if (angleBetweenFlattenedVectors(
					trackPoints[trackPoints.length-1].p1,
					point,
					this.trackPreLine.origin
				) <= 90 & this.firstClick == 0) { return;}
			}

			this.firstClick = 0;

			var w = midpoint(this.trackPreLine.origin,point);

			trackPoints.push({
				p1: this.trackPreLine.origin,
				p2: w,
				p3: point
			});
			track.addToSection(this.trackPreLine.origin,w,point);

			this.trackPreLine.curSeg++;
			this.trackPreLine.origin = point;

		}

	}

	this.checkTrack = 1;
	this.endTrack = function(){
		if (this.checkTrack == 1 & m['m_tra_lay'].clicked != 1) {
			this.checkTrack = 0;

			this.trackPreLine.part = 'init';

			var j = this.trackPreLine.children.length;
			while (j>0){
				j--;
				scene.remove(this.trackPreLine.children[j]);
			}
		}
		if (this.checkTrack == 0 & m['m_tra_lay'].clicked == 1) {
			this.checkTrack = 1;

			this.trackPreLine.children.pop();

			var j = this.trackPreLine.children.length;
			while (j>0){
				j--;
				scene.add(this.trackPreLine.children[j]);
			}
		}
	}

	this.addPreLineToScene = function(o,p) {
		var geom = new THREE.Geometry();
		geom.vertices = gridPointsOnLine(100,o,p);

		this.trackPreLine.children[this.trackPreLine.curSeg] = new THREE.Line( geom, this.trackPreLine.blinemat)
		scene.add(this.trackPreLine.children[this.trackPreLine.curSeg]);
	}


	this.newSec = function(p1,p2,p3,segId){
		var secLen = this.sections.length;
		console.log(secLen);
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
		if(splitPointPre.length >= 2) console.error(segId,p1,'splitSec found a split point with more than one section, continuing');
		var splitPoint = splitPointPre[0].pointId;

		if (splitPoint == 0 | splitPoint == this.sections[secId].points.length) {
			return
		}
		console.log('splitting section, secId',secId)

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
		console.log('got called')
		for(i = 0; i < track.switches.length; i++){
			if(this.switches[i] != undefined && track.switches[i] != null){
				if(this.switchTestBoxes[i] == undefined) this.switchTestBoxes[i] = [];
				console.log(this.switchTestBoxes[i])
				for(j = 0; j < track.switches[i].secIds.length; j++){
					console.log(j)
					if(this.switchTestBoxes[i][j] == undefined){

						this.switchTestBoxes[i][j] = testCube(this.getThrowPoint(i,this.switches[i].secIds[j],this.switches[i].segIds[j]));
					}
					else{
						this.switchTestBoxes[i][j].position = this.getThrowPoint(i,this.switches[i].secIds[j],this.switches[i].segIds[j]);
					}
				}
			}
		}
	}
	this.getSwitchThrow = function(switchId,secId,segId){
		var i = this.switches[switchId].secIds.length;
		while(i > 0){
			i--;
			if(this.switches[switchId].secIds[i] === secId && this.switches[switchId].segIds[i] === segId){
				this.switches[switchId].connectsTo[i][this.switches[switchId].target[i]]
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
				console.log('targetId',this.switches[switchId].target[i])
				return this.switches[switchId].target[i];
			}
		}
		return false;
	}

	this.switchByPoint = function(p1){

		var points = [p1];
		var secs = this.findPointInSec(p1);
		var i = secs.length
		while(i > 0){
			i--;
			points.push(this.sections[secs[i].secId].points[(secs[i].pointId == 0 ? this.sections[secs[i].secId].points.length - 1 : 0)]);
		}
		var p = points.length;
		while(p > 0){
			p--;
			p1 = points[p];
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
					else if(equalXZ(this.sections[i].points[this.sections[i].points.length - 1],p1) == 1)
						secIds.push({secId: i, pointId: this.sections[i].points.length - 2, segId: this.sections[i].segmentIds[this.sections[i].segmentIds.length - 1]});
				}
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
				throwObjs: []
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

			console.log('***switch',p1);
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
							console.log('1',{secId: i, pointId: j})
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
						console.log('2',{secId: secId, pointId: j})
						ret.push({secId: secId, pointId: j});
					}
				}
			}
		}
		console.log(ret != [] ? ret : false)
		return ret != [] ? ret : false;
	}

	this.addToSection = function(p1,p2,p3){
		console.log('blink');
	pointsP1 = this.findMatchInTrackPoints(p1);
	pointsP3 = this.findMatchInTrackPoints(p3);
	//console.log('p1p3',pointsP1,pointsP3)
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
				this.splitSec(pointsP3[1],p3,this.segments.length);
				this.newEnd(p1,secId);
				this.switchByPoint(p3,p2);
			}
			else if (pointsP3.length >= 3) {
				console.log('point connects to existing switch and is a new end');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newEnd(p1,secId);
				//this.addToSwitch(p3,p2,this.segments.length);
				this.switchByPoint(p3,p2);
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
				if (this.findSegInSec(pointsP1[0]) == this.findSegInSec(pointsP3[0])) {
					console.log('self enclosed loop found');
					secId = this.findSegInSec(pointsP1[0]);
					this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
					//this.newSwitch(p3,p2,pointsP3[0],this.segments.length,-1);
				}
				else{
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
				//this.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else if (pointsP3.length >= 3) {
				console.log('point connects exitsting segment to existing switch');
				this.connectTo(p1,p2,p3,pointsP1[0],this.segments.length);
				this.removeEnd(p1);
				//this.addToSwitch(p3,p2,this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else{
				console.log('no match 1',this.segments.length);
			}
		}
		else if (pointsP1.length == 2) {
			//point is a new switch
			if (pointsP3.length == 0) {
				console.log('and is a new segment and a new end');
				this.splitSec(pointsP1[1],p1,this.segments.length);
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				//this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
				this.newEnd(p3,secId);
			}
			else if (pointsP3.length == 1) {
				console.log('point connects existing segement to a new switch');
				this.splitSec(pointsP1[1],p1,this.segments.length);
				this.connectTo(p3,p2,p1,pointsP3[0],this.segments.length);
				this.removeEnd(p1);
				//this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
			}
			else if (pointsP3.length == 2) {
				console.log('point connects new switch to a new switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP1[1],p1,this.segments.length);
				this.splitSec(pointsP3[1],p3,this.segments.length);
				this.switchByPoint(p3,p2,this.segments.length);
				//this.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
				//this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
			}
			else if (pointsP3.length >= 3) {
				console.log('point connects an existing switch to existing switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP1[1],p1,this.segments.length);
				//this.newSwitch(p1,p2,pointsP1[0],pointsP1[1],this.segments.length);
				//this.addToSwitch(p3,p2,this.segments.length);
				this.switchByPoint(p3,p2,this.segments.length);
			}
			else{
				console.log('no match 2',this.segments.length);
			}
			this.switchByPoint(p1,p2,this.segments.length);
		}
		else if (pointsP1.length >= 3) {
			//point connects to existing switch
			if (pointsP3.length == 0) {
				console.log('and is a new segment and a new end');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.newEnd(p3,secId);
			}
			else if (pointsP3.length == 1) {
				console.log('point connects and existing switch to an existing end');
				this.connectTo(p3,p2,p1,pointsP3[0],this.segments.length);
			}
			else if (pointsP3.length == 2) {
				console.log('notpushed','32');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				this.splitSec(pointsP3[1],p3);
				//.newSwitch(p3,p2,pointsP3[0],pointsP3[1],this.segments.length);
				//this.addToSwitch(p1,p2,this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else if (pointsP3.length >= 3) {
				console.log('point connects an existing switch to existing switch');
				var secId = this.newSec(p1,p2,p3,this.segments.length);
				//this.addToSwitch(p3,p2,this.segments.length);
				//this.addToSwitch(p1,p2,this.segments.length);
				this.switchByPoint(p3,p2);
			}
			else{
				console.log('no match 3',this.segments.length);
			}
			this.switchByPoint(p1,p2);
		}
		else{
			console.log('no match -1',this.segments.length);
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
		var tie = new THREE.CubeGeometry(x,y,z);
		tie.applyMatrix( new THREE.Matrix4().makeTranslation(origin.x,origin.y+2,origin.z).lookAt( origin,originOffset,new THREE.Vector3(0,1,0)));
		tie.verticesNeedUpdate = true;
		tie.origin = origin;
		return tie;
	}

	this.buildLinePointsLeft = function(origin,originOffset){
		return addVectorToPoint(origin,extendVector(5,perpendicularVectorXZ({x: -1, z:  1},originOffset,origin)));
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
			THREE.GeometryUtils.merge(geom, this.buildGeomPoints(l,lPlus,14,2,2));

			i -= spacing;
		}

		//post
		var l = recalcY(lerp(startP2,p1,p1,endP2,-.01));
		var lPlus = recalcY(lerp(startP2,p1,p1,endP2,0));

		path   = path.concat(l);
		lleft  = lleft.concat(this.buildLinePointsLeft(l,lPlus));
		lright = lright.concat(this.buildLinePointsRight(l,lPlus));

		THREE.GeometryUtils.merge(geom, this.buildGeomPoints(lerp(startP2,p1,p1,endP2, lim),lerp(startP2,p1,p1,endP2,lim+.01),14,2,2));

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
						THREE.GeometryUtils.merge(geom, builtPoints.geom);
						THREE.GeometryUtils.merge(trackLines, this.segments['trackShape'].extrude(builtPoints.lleft));
						THREE.GeometryUtils.merge(trackLines, this.segments['trackShape'].extrude(builtPoints.lright));
						THREE.GeometryUtils.merge(base, this.segments['baseShape'].extrude(builtPoints.base));
					}
				}
			}
			else{
				var builtPoints = this.calcFromP2toP2(p2,midpoint(p2,p1),p1,false);
				THREE.GeometryUtils.merge(geom, builtPoints.geom);
				THREE.GeometryUtils.merge(trackLines, this.segments['trackShape'].extrude(builtPoints.lleft));
				THREE.GeometryUtils.merge(trackLines, this.segments['trackShape'].extrude(builtPoints.lright));
				THREE.GeometryUtils.merge(base, this.segments['baseShape'].extrude(builtPoints.base));
				var tempGeom = this.buildGeomPoints(p1,p2,15,9,5)
				tempGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-4,0));
				THREE.GeometryUtils.merge(trackLines, tempGeom);
			}
			var pointsFromP3 = this.findP2OfConnectingSegs(p3,segIds[j]);
			if (pointsFromP3 != false) {
				var i = pointsFromP3.length;
				while( i > 0){
					i--;
					var builtPoints = this.calcFromP2toP2(p2,p3,pointsFromP3[i].p2,true);
					THREE.GeometryUtils.merge(geom, builtPoints.geom);
					THREE.GeometryUtils.merge(trackLines, this.segments['trackShape'].extrude(builtPoints.lleft));
					THREE.GeometryUtils.merge(trackLines, this.segments['trackShape'].extrude(builtPoints.lright));
					THREE.GeometryUtils.merge(base, this.segments['baseShape'].extrude(builtPoints.base));
				}
			}
			else{
				var builtPoints = this.calcFromP2toP2(p2,midpoint(p2,p3),p3,false);
				THREE.GeometryUtils.merge(geom, builtPoints.geom);
				THREE.GeometryUtils.merge(trackLines, this.segments['trackShape'].extrude(builtPoints.lleft));
				THREE.GeometryUtils.merge(trackLines, this.segments['trackShape'].extrude(builtPoints.lright));
				THREE.GeometryUtils.merge(base, this.segments['baseShape'].extrude(builtPoints.base));
				var tempGeom = this.buildGeomPoints(p3,p2,15,9,5)
				tempGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-4,0));
				THREE.GeometryUtils.merge(trackLines, tempGeom);
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

	this.checkTrackInArea = function(p1) {
		var lft = p1.x - 100;
		var rht = p1.x + 100;
		var top = p1.z + 100;
		var bot = p1.z - 100;

		var i = this.segments.length
		var affectedSegs = [];

		while (i > 0) {
			i--;
			if (
				(this.segments[i].p1.x >= lft && this.segments[i].p1.x <= rht && this.segments[i].p1.z >= bot && this.segments[i].p1.z <= top) |
				(this.segments[i].p2.x >= lft && this.segments[i].p2.x <= rht && this.segments[i].p2.z >= bot && this.segments[i].p2.z <= top) |
				(this.segments[i].p3.x >= lft && this.segments[i].p3.x <= rht && this.segments[i].p3.z >= bot && this.segments[i].p3.z <= top)
			){
				affectedSegs.push(i);
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
						console.log('ny',newY,diffY)
						this.switches[i].throwObjs[j].translateY(diffY);
						this.switches[i].throwObjs[j].geometry.origin.y = newY;
						this.switches[i].throwObjs[j].verticesNeedUpdate = true;
					}
				}
				else{
					console.log('null found',i,j)
				}
			}
		}
	}

	this.downloadData = function(){
		//ajax
		//if newData
		//add via group
	}

	this.bulkAddTrack = function(bulkPoints){

		var i = bulkPoints.length
		while(i > 0){
			i--;
			console.log(i)
			//if(i == 4){console.log(track);die();}
			this.trackPreLine.curSeg++;
			this.addToSection(bulkPoints[i].p1,bulkPoints[i].p2,bulkPoints[i].p3);
			this.addPreLineToScene(bulkPoints[i].p1,bulkPoints[i].p3);

		}
	}
}

track = new trackFunc
track.bulkAddTrack(trackPoints);
console.log('track',track);


function getThrows( mouse ) {
  var vector = new THREE.Vector3(
    (( event.clientX / window.innerWidth ) * 2 - 1),
    (- ( event.clientY / window.innerHeight ) * 2 + 1),
    1
	);
	console.log(track.throws);
	var ray = projector.pickingRay( vector, camera );
	var intersects = ray.intersectObjects( track.throws );
	var i = intersects.length
	console.log('numIntersected',intersects)
	while ( i > 0 ) {
		i--;
		if (intersects[i].object.clickCall != undefined) {
			console.log(intersects[i].object.id)
			intersects[i].object.clickCall();
		}
	}
	console.log(track.switches)
}
