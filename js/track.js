
obj['trkPreLine'].part = 'init';
obj['trkPreLine'].curTrack = -1;
obj['trkPreLine'].curSeg = -1;
obj['trkPreLine'].origin = new THREE.Vector3();
obj['trkPreLine'].blinemat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );
obj['trkLine'].blinemat = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );
trackPoints = [
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


obj['trkPreLine'].curSeg = 0;
addPreLineToScene(
	new THREE.Vector3(-150,0,-50),
	new THREE.Vector3(-150,0,-150)
);
obj['trkPreLine'].curSeg = 1;
addPreLineToScene(
	new THREE.Vector3(-150,0,-50),
	new THREE.Vector3(-250,0,-50)
);
obj['trkPreLine'].curSeg = 2;
addPreLineToScene(
	new THREE.Vector3( -50,0,-50),
	new THREE.Vector3(-150,0,-50)
);
obj['trkPreLine'].curSeg = 3;
addPreLineToScene(
	new THREE.Vector3( 50,0,-50),
	new THREE.Vector3( 50,0, 50)
);
obj['trkPreLine'].curSeg = 4;
addPreLineToScene(
	new THREE.Vector3(-50,0, 50),
	new THREE.Vector3( 50,0, 50)
);
obj['trkPreLine'].curSeg = 5;
addPreLineToScene(
	new THREE.Vector3(-50,0,-50),
	new THREE.Vector3(-50,0, 50)
);
obj['trkPreLine'].curSeg = 6;
addPreLineToScene(
	new THREE.Vector3(-150,0,-150),
	new THREE.Vector3(-150,0,-250)
);

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
	
	console.log(obj['trkPreLine'].part)
	
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
		
		obj['trkPreLine'].curSeg++;
		obj['trkPreLine'].origin = point;
		
	}
	
	generateDrawTrack();
		renderTrack();
}

drawTrack = [];
switches = [];
endPoints = [];
function generateDrawTrack() {
	drawTrack = [];
	endPoints = [];
	var i = trackPoints.length;
	while(i>0){
		i--;
		j = trackPoints.length;
		var found1 = found3 = 0;
		while(j>0){
			j--;
			if (i != j) {
				if (equalXZ(trackPoints[i].p1,trackPoints[j].p1) == 1) {
					if (angleBetweenFlattenedVectors(trackPoints[i].p3,trackPoints[j].p3,trackPoints[i].p1) >= 90) {
						drawTrack.push({
							p1: trackPoints[i].p2,
							p2: trackPoints[i].p1,
							p3: trackPoints[j].p2
						});
					}
				}
				else if (equalXZ(trackPoints[i].p1,trackPoints[j].p3) == 1) {
					if (angleBetweenFlattenedVectors(trackPoints[i].p3,trackPoints[j].p1,trackPoints[i].p1) >= 90) {
						drawTrack.push({
							p1: trackPoints[i].p2,
							p2: trackPoints[i].p1,
							p3: trackPoints[j].p2
						});
					}
				}
				else if (equalXZ(trackPoints[i].p3,trackPoints[j].p3) == 1) {
					if (angleBetweenFlattenedVectors(trackPoints[i].p1,trackPoints[j].p1,trackPoints[i].p3) >= 90) {
						drawTrack.push({
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
				p1: trackPoints[i].p1,
				p2: midpoint(trackPoints[i].p1,trackPoints[i].p2),
				p3: trackPoints[i].p2
			});
			endPoints.push({end: trackPoints[i].p1, track: i, dir: 1});
		}
		if (found3 == 0) {
			drawTrack.push({
				p1: trackPoints[i].p3,
				p2: midpoint(trackPoints[i].p3,trackPoints[i].p2),
				p3: trackPoints[i].p2
			});
			endPoints.push({end: trackPoints[i].p3, track: i, dir: 1});
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
		return;
	}
	
	var i = drawTrack.length;
	while(i>0){
		i--;
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
			}
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
	
	var j = switches.length;
	obj['switches'].children = [];
	while (j>0){
		j--;
		obj['switches'].children[j] = globalMesh['switchArrow'].clone();
		obj['switches'].children[j].position.set(switches[j].o.x,switches[j].o.y,switches[j].o.z);
		obj['switches'].children[j].lookAt(switches[j].p)
		obj['switches'].children[j].rotation.y += (-60 + (switches[j].s * (120/(switches[j].d.length-1))));
		scene.add(obj['switches'].children[j]);
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
	
	console.log(startT,endT);
	if (startT == endT) {return 0;}
	
	var st = startT < endT ? endT : startT;
	var et = startT < endT ? startT : endT;
	var step = (st-et)/numBreaks;
	console.log(st,et,step);
	tr = drawTrack[trackNum];
	
	var d = 0;
	
	p1 = lerp(tr.p1,tr.p2,tr.p2,tr.p3,st);
	while(st>et+.000001){
		console.log(p1.x,p1.z)
		st -= step;
		console.log(st,et,d)
		p2 = lerp(tr.p1,tr.p2,tr.p2,tr.p3,st);
		d += p1.distanceTo(p2);
		console.log(p1.distanceTo(p2))
		p1 = p2;
	}
	
	return d;
}

function nextTrackFromSwitch(i,change){
	if (change != undefined) {
		switches[i].s = change
	}
	j = drawTrack.length;
	while (j > 0) {
		j--;
		if ((equalXZ(switches[i].o, drawTrack[j].p1) == 1)
			 &(equalXZ(switches[i].d[switches[i].s], drawTrack[j].p3) == 1)) {
			return {type: 'switch', num: j, startT: 0, endT: 1, s: i}
		}
		else 
		if ((equalXZ(switches[i].o, drawTrack[j].p3) == 1)
			 &(equalXZ(switches[i].d[switches[i].s], drawTrack[j].p1) == 1)) {
			return {type: 'switch', num: j, startT: 1, endT: 0, s: i}
		}
	}
	console.log('error: switch with no found D. switch: ' + i +'. change: '+change);
	return false;
}

function nextTrack(i,p1,opts){
	opts = (opts != undefined ? opts : {});
	change = opts.change != undefined ? opts.change : -1;
	
	j = switches.length;
	while (j > 0){
		j--;
		if ((equalXZ(switches[j].o,p1) == 1)
			 &(equalXZ(drawTrack[i].p2, switches[j].p) == 0)) {
			return nextTrackFromSwitch(j,change);
		}
	}
	j = drawTrack.length;
	while (j > 0){
		j--;
		if (equalXZ(drawTrack[j].p1, p1) == 1) {
			k = endPoints.length;
			while (k > 0){
				k--;
				if (equalXZ(endPoints[k].end, p1) == 1) {
					return {type: 'stop', num: j, startT: 0, endT: 1, stop: k}
				}
			}
			return {type: 'track', num: j, startT: 1, endT: 0}
		}
		else if (equalXZ(drawTrack[j].p3, p1) == 1) {
			k = endPoints.length;
			while (k > 0){
				k--;
				if (equalXZ(endPoints[k].end, p1) == 1) {
					return {type: 'stop', num: j, startT: 1, endT: 0, stop: k}
				}
			}
			return {type: 'track', num: j, startT: 1, endT: 0}
		}
	}
	return false;
}


loader.load("js/trains/switchArrow.js", jsObjToGlobalMesh('switchArrow',{line: false, scale: new THREE.Vector3(10,10,10)}));

var b = 0;
function initTrack(){
	if(globalMesh['switchArrow'] !== undefined){
		generateDrawTrack();
		renderTrack();
		endTrack();
		b = 1;
	}
	if (b == 0) {
		setTimeout(initTrack,10);
	}
}
initTrack();
		