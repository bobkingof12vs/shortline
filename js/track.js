
obj['trkPreLine'].curSeg = -1;

function layTrackFunc(){

	this.part = 0;
	this.blinemat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );
	this.firstClick = 1;

	this.closePoint = function(point){
		var j = trackPoints.length;
		var far = 50;
		var winner = -1;
		while (j > 0) {
			j--;
			if (trackPoints[j].p1.distanceTo(point) < far) {
				far = trackPoints[j].p1.distanceTo(point);
				winner = trackPoints[j].p1;
			}
			else if (trackPoints[j].p3.distanceTo(point) < far) {
				far = trackPoints[j].p3.distanceTo(point);
				winner = trackPoints[j].p3;
			}
		}
		if (winner != -1) {
			point = winner;
		}
		else{
			console.log('ddd',point);
			point.x = Math.round(point.x/50)*50;
			point.z = Math.round(point.z/50)*50;
			console.log(point);
		}
		return point;
	}

	this.part = 0;
	this.intersect = function(intersection){
		var point = closePoint(intersection[0].point);
		if(this.part == 0)
			this.init(point);
		if(this.part == 1)
			this.part1(point);
		if(this.part == 2)
			this.part2(point)
	}

	this.init = function(point){
		this.part++;
		this.curSeg++;
		this.origin = point;
	}

	this.part1 = function(point){
		this.part++;

		this.listener = function(e){
			mouse.x = e.clientX;
			mouse.y = e.clientY;

			//this needs to happen in any case
			scene.remove(obj['trkPreLine'].children[layTrack.curSeg]);

			if (m['m_tra_lay'].clicked != 1){
				document.body.removeEventListener('mousemove',layTrack.listener,false);
			}
			else if (mouseInMenu == 0) {
				getMouseIntersect(mouse, [obj['plane'].children[1]],function(i){

					if (i != 1) {
						var point = closePoint(i[0].point);

						if (trackPoints.length > 0) {
							if (angleBetweenFlattenedVectors(
								trackPoints[trackPoints.length-1].p1,
								point,
								trackPoints[trackPoints.length-1].p3
							) <= 90 & layTrack.firstClick == 0) {return}
						}

						track.addPreLineToScene(layTrack.origin,point);
					}
				});
			}
		}
		document.body.addEventListener('mousemove',this.listener,false);
	}

	this.part2 = function(point){
		if (trackPoints.length > 1) {
			if (angleBetweenFlattenedVectors(
				trackPoints[trackPoints.length-1].p1,
				point,
				this.origin
			) <= 90 & this.firstClick == 0) { return;}
		}

		this.firstClick = 0;

		var w = midpoint(this.origin,point);

		trackPoints.push({
			p1: this.origin,
			p2: w,
			p3: point
		});
		track.addToSection(this.origin,w,point);

		obj['trkPreLine'].curSeg++;
		this.origin = point;

	}
}
//var layTrack = layTrackFunc();
