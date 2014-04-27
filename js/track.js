
obj['trkPreLine'].part = 'init';
obj['trkPreLine'].curTrack = -1;
obj['trkPreLine'].curSeg = -1;
obj['trkPreLine'].origin = new THREE.Vector3();
obj['trkPreLine'].blinemat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );
obj['trkLine'].blinemat = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );

var firstClick = 1;

function layTrack(i){
	
	firstClick = 1;
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
	
	if (obj['trkPreLine'].part == 'init') {
		obj['trkPreLine'].part = 'part2';
		obj['trkPreLine'].curSeg++;
		obj['trkPreLine'].origin = point;
		
		var geom = new THREE.Geometry();
		geom.vertices.push(point);
		geom.vertices.push(point);
		
	}
		
	if (obj['trkPreLine'].part == 'part2') {
		obj['trkPreLine'].part = 'part3'
		
		listener = function(e){
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			
			scene.remove(obj['trkPreLine'].children[obj['trkPreLine'].curSeg]);
			
			if (m['m_tra_lay'].clicked == 1 & mouseInMenu == 0) {
				getMouseIntersect(mouse, [obj['plane'].children[1]],function(i){
					
					if (i != 1) {
						i[0].point = closePoint(i[0].point);
						
						if (trackPoints.length > 0) {
							if (angleBetweenFlattenedVectors(
								trackPoints[trackPoints.length-1].p1,
								i[0].point,
								trackPoints[trackPoints.length-1].p3
							) <= 90 & firstClick == 0) {return}
						}
						
						addPreLineToScene(obj['trkPreLine'].origin,i[0].point);
					}
					
				});
			}
			
			else if (m['m_tra_lay'].clicked != 1){
				document.body.removeEventListener('mousemove',listener,false);
			}
			
		}
		document.body.addEventListener('mousemove',listener,false);
	}
	
	else if (obj['trkPreLine'].part == 'part3') {
		
		if (trackPoints.length > 1) {
			if (angleBetweenFlattenedVectors(
				trackPoints[trackPoints.length-1].p1,
				point,
				obj['trkPreLine'].origin
			) <= 90 & firstClick == 0) { return;}
		}
		
		firstClick = 0;
		
		var w = midpoint(obj['trkPreLine'].origin,point);
		
		trackPoints.push({
			p1: obj['trkPreLine'].origin,
			p2: w,
			p3: point
		});
		track.addToSection(obj['trkPreLine'].origin,w,point);
		
		obj['trkPreLine'].curSeg++;
		obj['trkPreLine'].origin = point;
		generateDrawTrack();
		
	}
	
}

checkTrack = 1;
function endTrack(){
	if (checkTrack == 1 & m['m_tra_lay'].clicked != 1) {
		checkTrack = 0;
		
		obj['trkPreLine'].part = 'init';
		
		var j = obj['trkPreLine'].children.length;
		while (j>0){
			j--;
			scene.remove(obj['trkPreLine'].children[j]);
		}
	}
	if (checkTrack == 0 & m['m_tra_lay'].clicked == 1) {
		checkTrack = 1;
		
		obj['trkPreLine'].children.pop();
		
		var j = obj['trkPreLine'].children.length;
		while (j>0){
			j--;
			scene.add(obj['trkPreLine'].children[j]);
		}
	}
}

function addPreLineToScene(o,p) {
	var geom = new THREE.Geometry();
	geom.vertices = gridPointsOnLine(100,o,p);
	
	obj['trkPreLine'].children[obj['trkPreLine'].curSeg] = new THREE.Line( geom, obj['trkPreLine'].blinemat)
	scene.add(obj['trkPreLine'].children[obj['trkPreLine'].curSeg]);
}
/*Finds the length of a track segment(drawTack[numTrack])
 *trackNum is the drawTrack id
 *available opts:
 *  numBreaks - the Number of pieces to cur the curve into
 *  startT - marks the where to start measurement. must be between 0 and 1
 *  endT - marks the end of measurement. must be between 0 and 1
 */
function lengthOfTrack(trackNum,opts) {
	opts = opts !== undefined ? opts : {};
	var numBreaks = opts.numBreaks !== undefined ? opts.numBreaks : 10;
	var startT = opts.startT !== undefined ? opts.startT : 0;
	var endT = opts.endT !== undefined ? opts.endT : 1;
	
	if (startT == endT) {return 0;}
	
	var st = startT < endT ? endT : startT;
	var et = startT < endT ? startT : endT;
	var step = (st-et)/numBreaks;
	tr = drawTrack[trackNum];
		
	var d = 0;
	
	p1 = lerp(tr.p1,tr.p2,tr.p2,tr.p3,st);
	while(st>et+.000001){
		st -= step;
		p2 = lerp(tr.p1,tr.p2,tr.p2,tr.p3,st);
		d += p1.distanceTo(p2);
		p1 = p2;
	}
	
	return d;
}


/*
function existsInDrawTrack(p1,p2,p3,i,j){
	i = drawTrack.length;
	while (i > 0){
		i--;
		if(drawTrack[i] != undefined) {
			if ((equalXZ(drawTrack[i].p1,p3) == 1 & equalXZ(drawTrack[i].p2,p2) == 1 & equalXZ(drawTrack[i].p3,p1) == 1 )
				| (equalXZ(drawTrack[i].p1,p1) == 1 & equalXZ(drawTrack[i].p2,p2) == 1 & equalXZ(drawTrack[i].p3,p3) == 1 )) {
				console.log('found one',i,j);
				return 1;
			}
		}
	}
	return 0;
}

drawTrack = [];
switches = [];
endPoints = [];
//drawTrackWorker = new Worker('js/drawTrack.js');

function generateDrawTrack(rebuild) {
	if (rebuild == undefined) {
		var endVal = trackPoints.length - 1;
	}
	else{
		drawTrack = [];
		endPoints = [];
		var endVal = 0;
	}
	var i = trackPoints.length;
	while(i > endVal){
		i--;
		j = trackPoints.length;
		var found1 = found3 = 0;
		while(j>0){
			j--;
			if (i != j) {
				if (equalXZ(trackPoints[i].p1,trackPoints[j].p1) == 1) {
					if (angleBetweenFlattenedVectors(trackPoints[i].p3,trackPoints[j].p3,trackPoints[i].p1) >= 90
						& existsInDrawTrack(trackPoints[i].p2,trackPoints[i].p1,trackPoints[j].p2,i,j) == 0) {
						drawTrack.push({
							//len calculated below
							p1: trackPoints[i].p2,
							p2: trackPoints[i].p1,
							p3: trackPoints[j].p2
						});
					}
				}
				else if (equalXZ(trackPoints[i].p1,trackPoints[j].p3) == 1) {
					if (angleBetweenFlattenedVectors(trackPoints[i].p3,trackPoints[j].p1,trackPoints[i].p1) >= 90
						& existsInDrawTrack(trackPoints[i].p2,trackPoints[i].p3,trackPoints[j].p2,i,j) == 0) {
						drawTrack.push({
							//len calculated below
							p1: trackPoints[i].p2,
							p2: trackPoints[i].p1,
							p3: trackPoints[j].p2
						});
					}
				}
				else if (equalXZ(trackPoints[i].p3,trackPoints[j].p3) == 1) {
					if (angleBetweenFlattenedVectors(trackPoints[i].p1,trackPoints[j].p1,trackPoints[i].p3) >= 90
						& existsInDrawTrack(trackPoints[i].p2,trackPoints[i].p3,trackPoints[j].p2,i,j) == 0) {
						drawTrack.push({
							//len calculated below
							p1: trackPoints[i].p2,
							p2: trackPoints[i].p3,
							p3: trackPoints[j].p2
						});
					}
				}
					
				if ((equalXZ(trackPoints[i].p1,trackPoints[j].p1) == 1)
					 |(equalXZ(trackPoints[i].p1,trackPoints[j].p3) == 1)){
					found1 = 1;
				}
				if ((equalXZ(trackPoints[i].p3,trackPoints[j].p1) == 1)
					 |(equalXZ(trackPoints[i].p3,trackPoints[j].p3) == 1)){
					found3 = 1;
				}
			}
		}
		if (found1 == 0) {
			drawTrack.push({
				//len calculated below
				p1: trackPoints[i].p1,
				p2: midpoint(trackPoints[i].p1,trackPoints[i].p2),
				p3: trackPoints[i].p2,
				end: true
			});
			//testCube(trackPoints[i].p1, 0xff0000);
		}
		if (found3 == 0) {
			drawTrack.push({
				//len calculated below
				p1: trackPoints[i].p3,
				p2: midpoint(trackPoints[i].p3,trackPoints[i].p2),
				p3: trackPoints[i].p2,
				end: true
			});
			//testCube(trackPoints[i].p3, 0x00ff00);
		}
	}
	
	if (rebuild == undefined) {
		i = drawTrack.length
		while(i > 0){
			i--;
			if (drawTrack[i].end != undefined) {
				if ((equalXZ(drawTrack[i].p1, trackPoints[trackPoints.length-1].p3) == 1)
					 |(equalXZ(drawTrack[i].p1, trackPoints[trackPoints.length-1].p1) == 1)){
						console.log(i);
						drawTrack.splice(i,1);
				}
			}
		}
	}
	
	switches = [];
	
	//add a line object to show where switches are and what switches are being added, it looks currently
	//like avery point is being added as a switch....
	addSwtich = function(o,p,d1,d2){
		if (d1 == d2) {return;}
		var k = switches.length;
		while(k>0){
			k--;
			if (equalXZ(switches[k].o,o) == 1
			 &  equalXZ(switches[k].p,p) == 1
			) {
				
				switches[k].d.push(d1)
				switches[k].d.push(d2)
				switches[k].d = switches[k].d.filter(function(elem, pos, self) {
					return self.indexOf(elem) == pos;
				});
				
				switches[k].s = 1;
				
				return;
			}
		}
		switches.push({
			o: o,
			p: p,
			d: [d1,d2],
			s: 1
		});
		///testText(switches.length-1,randomPoint(new THREE.Vector3(5,0,5),recalcY(o,10)),-1);
		return;
	}
	
	var i = drawTrack.length;
	while(i>0){
		i--;
		
		//len calculated here
		drawTrack[i].len = lengthOfTrack(i)
		//testText(i,recalcY(lerp(drawTrack[i].p1,drawTrack[i].p2,drawTrack[i].p2,drawTrack[i].p3,.68),10),-1)
		
		found1 = found3 = 0;
		
		j = drawTrack.length;
		while(j>0){
			j--;
			if (i != j) {
				if (equalXZ(drawTrack[i].p2,drawTrack[j].p2) == 1){
					if (equalXZ(drawTrack[i].p1,drawTrack[j].p1) == 1 ) {
						addSwtich(
							drawTrack[i].p1,
							drawTrack[i].p2,
							drawTrack[i].p3,
							drawTrack[j].p3
						);
					}
					else if (equalXZ(drawTrack[i].p1,drawTrack[j].p3) == 1) {
						addSwtich(
							drawTrack[i].p1,
							drawTrack[i].p2,
							drawTrack[i].p3,
							drawTrack[j].p1
						);
					}
					else if (equalXZ(drawTrack[i].p3,drawTrack[j].p3) == 1) {
						addSwtich(
							drawTrack[i].p3,
							drawTrack[i].p2,
							drawTrack[i].p1,
							drawTrack[j].p1
						);
					}
				}
				
				if (equalXZ(drawTrack[i].p1,drawTrack[j].p3) == 1
					| equalXZ(drawTrack[i].p1,drawTrack[j].p1) == 1) {
					found1 = 1;
				}
				if (equalXZ(drawTrack[i].p3,drawTrack[j].p3) == 1
					| equalXZ(drawTrack[i].p3,drawTrack[j].p1) == 1) {
					found3 = 1;
				}
				
			}
		}
		if (found1 == 0) {
			endPoints.push({end: drawTrack[i].p1, track: i, dir: 0});
		}
		if (found3 == 0) {
			endPoints.push({end: drawTrack[i].p3, track: i, dir: 0});
		}
	}
	
	switches = switches.filter(function(elem) {
		return elem.d.length > 1
	});
	
	var j = obj['switches'].children.length;
	while (j>0){
		j--;
		scene.remove(obj['switches'].children[j]);
	}
	console.log('switches', switches);
	var j = switches.length;
	obj['switches'].children = [];
	while (j>0){
		j--;
		switchMeshWait = function(){
			if (globalMesh['switchArrow'] != undefined) {
				obj['switches'].children[j] = globalMesh['switchArrow'].clone();
				obj['switches'].children[j].position.set(switches[j].o.x,switches[j].o.y,switches[j].o.z);
				obj['switches'].children[j].lookAt(switches[j].p)
				obj['switches'].children[j].rotation.y += (-60 + (switches[j].s * (120/(switches[j].d.length-1))));
				scene.add(obj['switches'].children[j]);
			}
			else{
				setTimeout(switchMeshWait,20);
			}
		}
		switchMeshWait();
	}
	
}

function checkSwitches(i){
	var count = 0;
	var j = i.length;
	while (j>0) {
		j--;
		var k = switches.length;
		while(k>0){
			k--;
			if (obj['switches'].children[k].id == i[j].object.id) {
				if (switches[k].s >= switches[k].d.length-1) {
					switches[k].s = 0;
				}
				else{
					switches[k].s++;
				}
				obj['switches'].children[k].lookAt(switches[k].p)
				obj['switches'].children[k].rotation.y += (-60 + (switches[k].s * (120/(switches[k].d.length-1))));
				obj['switches'].children[k].rotationNeedsUpdate = true;
			}
		}
	}
}

function renderTrack(){
	scene.remove(obj['trkLine'].obj);
	geom = new THREE.Geometry();
	
	last = -1;
	var i = drawTrack.length;
	while(i>0){
		i--;
		var j = 1.1;
		last = -1;
		while (j > 0.01) {
			j -= .1;
			
			current = recalcY(lerp(drawTrack[i].p1,drawTrack[i].p2,drawTrack[i].p2,drawTrack[i].p3,j),1);
			
			if (last != -1) {	
				geom.vertices.push(last);
				geom.vertices.push(current);
			}
			
			last = current;
			
		}
	}
	
	obj['trkLine'].obj = new THREE.Line( geom, obj['trkLine'].blinemat, THREE.LinePieces );
	scene.add(obj['trkLine'].obj);
}

function nextTrackFromSwitch(i,change){
	console.log('switch',i)
	if (change != -1) {
		switches[i].s = change
	}
	k = drawTrack.length;
	
	while (k > 0) {
		k--;
		if ((equalXZ(switches[i].o, drawTrack[k].p1) == 1)
			 &(equalXZ(switches[i].d[switches[i].s], drawTrack[k].p3) == 1)) {
			return {type: 'switch', num: k, startT: 0, endT: 1, s: i, len: drawTrack[k].len}
		} 
		if ((equalXZ(switches[i].o, drawTrack[k].p3) == 1)
			 &(equalXZ(switches[i].d[switches[i].s], drawTrack[k].p1) == 1)) {
			return {type: 'switch', num: k, startT: 1, endT: 0, s: i, len: drawTrack[k].len}
		}
	}
	console.log('error: switch with no found D. switch: ' + i +'. change: '+change);
	return false;
}

function nextTrack(i,lastEndT,lastSwitchNum,opts){
	p3 = lastEndT === 1 ? drawTrack[i].p3 : drawTrack[i].p1;
	
	opts = (opts != undefined ? opts : {});
	//calculating change of switch should be here
	//just send the code/func as the opt and it will calc here.
	change = opts.change != undefined ? opts.change : -1;
	
	j = switches.length;
	while (j > 0){
		j--;
		if (j != lastSwitchNum) {
			if ((equalXZ(switches[j].o,p3) == 1)
				 &(equalXZ(drawTrack[i].p2,switches[j].p) != 1)){
				console.log(drawTrack[i].p2,switches[j].p)
				if (lastSwitchNum == undefined) {
					return nextTrackFromSwitch(j,change);
				}
				else if(equalXZ(switches[j].p,switches[lastSwitchNum].p) != 1)	{
					console.log('pew pew',switches[j].p,switches[lastSwitchNum].p)
					return nextTrackFromSwitch(j,change);
				}
			}
		}
	}
	j = drawTrack.length;
	while (j > 0){
		j--;
		if (j != i & drawTrack[i].p2 != drawTrack[j].p2) {
			if (equalXZ(drawTrack[j].p1, p3) == 1) {
				k = endPoints.length;
				while (k > 0){
					k--;
					if (endPoints[k].track == j) {
						console.log('20',i,j,endPoints[k]);
						return {type: 'stop', num: j, startT: 1, endT: 0, stop: k, len: drawTrack[j].len}
					}
				}
						console.log('23',i,j);
				return {type: 'track', num: j, startT: 0, endT: 1, len: drawTrack[j].len}
			}
			else if (equalXZ(drawTrack[j].p3, p3) == 1) {
				k = endPoints.length;
				while (k > 0){
					k--;
					if (endPoints[k].track == j) {
						console.log('21',i,j);
						return {type: 'stop', num: j, startT: 1, endT: 0, stop: k, len: drawTrack[j].len}
					}
				}
						console.log('22',i,j);
				return {type: 'track', num: j, startT: 1, endT: 0, len: drawTrack[j].len}
			}
		}
	}
	return false;
}

function getTFromDist(trackNum,dir,dist){

	trackLen = drawTrack[trackNum].len;

	tempNewT = (dir == 1 ? 1 - (dist / drawTrack[trackNum].len) : (dist / drawTrack[trackNum].len));
	
	var LerpNewDist = lengthOfTrack(trackNum,
		{startT: dir,
		endT: tempNewT
	});
	offByDist = dist - LerpNewDist;
	
	var LerpAdjust = lengthOfTrack(trackNum,
		{startT: tempNewT,
		endT: tempNewT + .01
	});
		//.01/lenTPlus = x/-remDist
	adjustT = (offByDist*.01)/LerpAdjust;

	return tempNewT + adjustT;
}
	
	function findMatchIn(arr, p1){
		var j = arr.length;
		var count = 0;
		while (j > 0){
			j--;
			if (equalXZ(p1, arr[j]) == 1) {
				return false;
			}
		}
		return true;
	}
	
	function findSegmentInSection(num){
		var k = trackSections.length;
		while (k > 0) {
			k--;
			if(trackSections[k].trackPointIds.indexOf(num) >= 0){
				return k;
			}
		}
		return false;
	}
	
	function buildASectionFromSegment(seg, dir){
		var retSeg = [];
		if (dir == 1) {
			retSeg[0] = trackPoints[seg].p1;
			retSeg[1] = trackPoints[seg].p2;
			retSeg[2] = trackPoints[seg].p3;
		}
		else{
			retSeg[0] = trackPoints[seg].p3;
			retSeg[1] = trackPoints[seg].p2;
			retSeg[2] = trackPoints[seg].p1;
		}
		retSegIds = [seg];
		while(findMatchIn(switches, retSeg[retSeg.length - 1]) && findMatchIn(ends, retSeg[retSeg.length - 1])){
			var k = trackPoints.length;
			while(k > 0){
				k--;
				if (equalXZ(trackPoints[k].p1, retSeg[retSeg.length - 1]) == 1 && k != retSegIds[retSegIds.length - 1]) {
					retSeg.push(trackPoints[k].p2,trackPoints[k].p3);
					retSegIds.push(k);
					break;
				}
				else if (equalXZ(trackPoints[k].p3, retSeg[retSeg.length - 1]) == 1 && k != retSegIds[retSegIds.length - 1]) {
					retSeg.push(trackPoints[k].p2,trackPoints[k].p1);
					retSegIds.push(k);
					break;
				}
			}
		}
		console.log({points: retSeg, trackPointIds: retSegIds});
		return {points: retSeg, trackPointIds: retSegIds};
	}
	
	var i = trackPoints.length;
	
	while (i > 0){
		i--;
		if(findMatchInTrackPoints(trackPoints[i].p1) > 2 && findMatchIn(switches, trackPoints[i].p1)){
			switches.push(trackPoints[i].p1);
		}
		else if(findMatchInTrackPoints(trackPoints[i].p1) == 1 && findMatchIn(ends, trackPoints[i].p1)){
			ends.push(trackPoints[i].p1);
		}
		
		if(findMatchInTrackPoints(trackPoints[i].p3) > 2 && findMatchIn(switches, trackPoints[i].p3)){
			switches.push(trackPoints[i].p3);
		}
		else if(findMatchInTrackPoints(trackPoints[i].p3) == 1 && findMatchIn(ends, trackPoints[i].p3)){
			ends.push(trackPoints[i].p3);
		}
	}
	
	console.log('switches',switches);
	console.log('ends',ends);

	i = switches.length;
	while(i > 0){
		i--;
		tempSections = [];
		tempSectionsTPIds = [];
		tempSections.push(switches[i]);
		j = trackPoints.length;
		while(j > 0 && tempSections.length < 15){
			j--;
			if (equalXZ(switches[i], trackPoints[j].p1) == 1) {
				if(findSegmentInSection(j)){
					trackSections.shift(findSegmentInSection(j),1);
				}
				trackSections.push(buildASectionFromSegment(j, 1));
			}
			else if (equalXZ(switches[i], trackPoints[j].p3) == 1) {
				if(findSegmentInSection(j)){
					trackSections.shift(findSegmentInSection(j),1);
				}
				trackSections.push(buildASectionFromSegment(j, 0));
			}
		}
	}
	console.log('sections - predata',trackSections)*/
