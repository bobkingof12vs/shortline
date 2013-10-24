
obj['trackLines'].part = 'init';
obj['trackLines'].curTrack = -1;
obj['trackLines'].curSeg = -1;
obj['trackLines'].origin = new THREE.Vector3();

trackPoints = [];

function layTrack(i){
	
	console.log(obj['trackLines'].part)
	
	point = i[0].point;
	if (obj['trackLines'].part == 'init') {
		obj['trackLines'].part = 'part2';
		obj['trackLines'].curTrack++;
		obj['trackLines'].curSeg++;
		obj['trackLines'].origin = point;
		obj['trackLines'].children[obj['trackLines'].curTrack] = {children: []};
		
		var geom = new THREE.Geometry();
		geom.vertices.push(point);
		geom.vertices.push(point);
		
		var blinemat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );
		
	}
		
	if (obj['trackLines'].part == 'part2') {
		obj['trackLines'].part = 'part3'
		
		listener = function(e){
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			
			scene.remove(obj['trackLines'].children[obj['trackLines'].curTrack].children[obj['trackLines'].curSeg]);
			
			if (m['m_tra_lay'].clicked == 1 & mouseInMenu == 0) {
				getMouseIntersect(mouse, [obj['plane'].children[1]],function(i){
					
					if (i != 1) {
						
						if (trackPoints.length > 0) {
							if (angleBetweenFlattenedVectors(
								trackPoints[trackPoints.length-1].p1,
								i[0].point,
								trackPoints[trackPoints.length-1].p3
							) <= 90) {return}
						}
						
						var j = trackPoints.length;
						var far = 50;
						var winner = -1;
						while (j>0) {
							j--;{
								if (trackPoints[j].p1.distanceTo(i[0].point) < far) {
									far = trackPoints[j].p1.distanceTo(i[0].point);
									winner = trackPoints[j].p1;
								}
								else if (trackPoints[j].p3.distanceTo(i[0].point) < far) {
									far = trackPoints[j].p3.distanceTo(i[0].point);
									winner = trackPoints[j].p3;
								}
							}
						}
						if (winner != -1) {
							i[0].point = winner;
						}
						
						var geom = new THREE.Geometry();
						geom.vertices = gridPointsOnLine(100,obj['trackLines'].origin,i[0].point);
						
						var blinemat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );
						
						obj['trackLines'].children[obj['trackLines'].curTrack].children[obj['trackLines'].curSeg] = new THREE.Line( geom, blinemat)
						scene.add(obj['trackLines'].children[obj['trackLines'].curTrack].children[obj['trackLines'].curSeg]);
						
						//console.log(obj['trackLines'].children[obj['trackLines'].curSeg].geometry.vertices)
					}
				});
			}
			else if (m['m_tra_lay'].clicked == 0 & mouseInMenu == 0){
				obj['trackLines'].part = 'init';
				obj['trackLines'].curSeg = -1;
				document.body.removeEventListener('mousemove',listener,false);
			}
			
		}
		document.body.addEventListener('mousemove',listener,false);
	}
	
	else if (obj['trackLines'].part == 'part3') {
		//obj['trackLines'].part = 'part2'
		
		if (trackPoints.length > 1) {
			if (angleBetweenFlattenedVectors(
				trackPoints[trackPoints.length-1].p1,
				point,
				obj['trackLines'].origin
			) <= 90) { return;}
		}
		
		var w = midpoint(obj['trackLines'].origin,point);
		
		trackPoints.push({
			p1: obj['trackLines'].origin,
			p2: w,
			p3: point
		});
		
		obj['trackLines'].curSeg++;
		obj['trackLines'].origin = point;
	}
	
	generateDrawTrack();
	console.log('dt',drawTrack,'sw',switches);
}

drawTrack = [];
switches = [];
function generateDrawTrack() {
	drawTrack = [];
	var i = trackPoints.length;
	while(i>0){
		i--;
		j = trackPoints.length;
		while(j>0){
			j--;
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
		}
	}
	
	switches = [];
	var i = drawTrack.length;
	while(i>0){
		i--;
		j = drawTrack.length;
		while(j>0){
			j--;
			if (equalXZ(drawTrack[i].p1,drawTrack[j].p1) == 1) {
				switches.push({
					o: drawTrack[i].p1,
					p: drawTrack[i].p2,
					d1: drawTrack[i].p3,
					d2: drawTrack[j].p3,
					s: 'd1',
					switchTrack: function(){
						if (this.s == 'd1') {this.s = 'd2';}
						else{this.s = 'd1';}
					}
				});
			}
			else if (equalXZ(drawTrack[i].p1,drawTrack[j].p3) == 1) {
				switches.push({
					o: drawTrack[i].p1,
					p: drawTrack[i].p2,
					d1: drawTrack[i].p3,
					d2: drawTrack[j].p1,
					s: 'd1',
					switchTrack: function(){
						if (this.s == 'd1') {this.s = 'd2';}
						else{this.s = 'd1';}
					}
				});
			}
			else if (equalXZ(drawTrack[i].p3,drawTrack[j].p3) == 1) {
				switches.push({
					o: drawTrack[i].p3,
					p: drawTrack[i].p2,
					d1: drawTrack[i].p1,
					d2: drawTrack[j].p1,
					s: 'd1',
					switchTrack: function(){
						if (this.s == 'd1') {this.s = 'd2';}
						else{this.s = 'd1';}
					}
				});
			}
		}
	}
}

function renderTrack(){
	
}