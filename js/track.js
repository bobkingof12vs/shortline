
obj['trkPreLine'].part = 'init';
obj['trkPreLine'].curTrack = -1;
obj['trkPreLine'].curSeg = -1;
obj['trkPreLine'].origin = new THREE.Vector3();
obj['trkPreLine'].blinemat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );
obj['trkLine'].blinemat = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );
trackPoints = [];

function layTrack(i){
	
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
		obj['trkPreLine'].curTrack++;
		obj['trkPreLine'].curSeg++;
		obj['trkPreLine'].origin = point;
		obj['trkPreLine'].children[obj['trkPreLine'].curTrack] = {children: []};
		
		var geom = new THREE.Geometry();
		geom.vertices.push(point);
		geom.vertices.push(point);
		
	}
		
	if (obj['trkPreLine'].part == 'part2') {
		obj['trkPreLine'].part = 'part3'
		
		listener = function(e){
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			
			scene.remove(obj['trkPreLine'].children[obj['trkPreLine'].curTrack].children[obj['trkPreLine'].curSeg]);
			
			if (m['m_tra_lay'].clicked == 1 & mouseInMenu == 0) {
				getMouseIntersect(mouse, [obj['plane'].children[1]],function(i){
					
					if (i != 1) {
						i[0].point = closePoint(i[0].point);
						
						if (trackPoints.length > 0) {
							if (angleBetweenFlattenedVectors(
								trackPoints[trackPoints.length-1].p1,
								i[0].point,
								trackPoints[trackPoints.length-1].p3
							) <= 90) {return}
						}
						
						var geom = new THREE.Geometry();
						geom.vertices = gridPointsOnLine(100,obj['trkPreLine'].origin,i[0].point);
						
						obj['trkPreLine'].children[obj['trkPreLine'].curTrack].children[obj['trkPreLine'].curSeg] = new THREE.Line( geom, obj['trkPreLine'].blinemat)
						scene.add(obj['trkPreLine'].children[obj['trkPreLine'].curTrack].children[obj['trkPreLine'].curSeg]);
						
						//console.log(obj['trkPreLine'].children[obj['trkPreLine'].curSeg].geometry.vertices)
					}
				});
			}
			else if (m['m_tra_lay'].clicked == 0 & mouseInMenu == 0){
				obj['trkPreLine'].part = 'init';
				obj['trkPreLine'].curSeg = -1;
				document.body.removeEventListener('mousemove',listener,false);
			}
			
		}
		document.body.addEventListener('mousemove',listener,false);
	}
	
	else if (obj['trkPreLine'].part == 'part3') {
		//obj['trkPreLine'].part = 'part2'
		
		if (trackPoints.length > 1) {
			if (angleBetweenFlattenedVectors(
				trackPoints[trackPoints.length-1].p1,
				point,
				obj['trkPreLine'].origin
			) <= 90) { return;}
		}
		
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
	
	//add a line object to show where switches are and what switches are being added, it looks currently
	//like avery point is being added as a switch....
	addSwtich = function(o,p,d1,d2){
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
			s: 1,
			switchTrack: function(){
				if (this.s == this.s.length) {this.s = 0;}
				else{this.s++;}
			}
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
	
	switches = switches.filter(function(elem) {
		console.log('dl',elem.d.length)
		return elem.d.length > 2
	});
	
	console.log('dratrack',drawTrack);
	console.log('switches',switches);
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
			
			current = recalcY(lerp(drawTrack[i].p1,drawTrack[i].p2,drawTrack[i].p2,drawTrack[i].p3,j));
			
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