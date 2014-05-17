var testC = testCube(new THREE.Vector3(0,0,0));

var trainFunc = function(){
	this.engines = {}
	this.train = []

	this.rebuildPath = function(specNum){
		var i = specNum != undefined ? specNum + 1 : this.train.length;
		var j = specNum != undefined ? specNum     : 0;

		while(i > j) {
			i--;
			var stay = (specNum != undefined || this.train[i].engine.curSpeed == 0) ? false : true;
			console.log(stay ? 'true' : 'fa;lse')
			var trainLength = this.train[i].engine.opts.sizeLength;
			if(this.train[i].railcars.length > 0)
				trainLength += this.train[i].railcars[this.train[i].railcars.length - 1].distanceBehind + this.train[i].railcars[this.train[i].railcars.length - 1].opts.sizeLength
			var brakeDist = (Math.pow(this.train[i].engine.curSpeed,2)/(2*this.train[i].engine.opts.dec)) + this.train[i].engine.curSpeed;
			var nextTotalDist = 0;
			var prevTotalDist = 0;
			var k = 0
			if(this.train[i].engine.curSpeed > 0 || stay){
				if(!stay){
					this.train[i].path.previousP.unshift(this.train[i].path.currentP);
					var curSec = this.train[i].path.currentP = this.train[i].path.nextP[0];
					var klim = this.train[i].path.previousP.length - 1;
					while(k < klim){
						prevTotalDist += track.sectionDistance(this.train[i].path.previousP[i].sec.id);
						if(prevTotalDist >= trainLength + brakeDist){
							this.train[i].path.previousP.splice(k+1,klim);
							klim = this.train[i].path.previousP.length;
						}
						k++;
					}
				}
				this.train[i].path.nextP = [];
				this.train[i].path.nextP.push(track.getNextSec(this.train[i].path.currentP.sec.id,this.train[i].path.currentP.dir))
			}
			if(this.train[i].engine.curSpeed < 0 || stay){
				if(!stay){
					this.train[i].path.nextP.unshift(this.train[i].path.currentP);
					var curSec = this.train[i].path.currentP = this.train[i].path.previousP[0];
					var klim = this.train[i].path.nextP.length - 1;
					while(k < klim){
						nextTotalDist += track.sectionDistance(this.train[i].path.nextP[i].sec.id);
						if(nextTotalDist >= brakeDist){
							this.train[i].path.nextP.splice(k+1,klim);
							klim = this.train[i].path.nextP.length;
						}
						k++;
					}
				}
				this.train[i].path.previousP = [];
				this.train[i].path.previousP.push(track.getNextSec(this.train[i].path.currentP.sec.id,this.train[i].path.currentP.dir))
			}

			while(nextTotalDist <= brakeDist && this.train[i].path.nextP[this.train[i].path.nextP.length - 1] !== false){
				this.train[i].path.nextP.push(track.getNextSec(this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id,this.train[i].path.nextP[this.train[i].path.nextP.length - 1].dir))
				nextTotalDist += track.sectionDistance(this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id);
			}
			while(prevTotalDist <= trainLength + brakeDist && this.train[i].path.previousP[this.train[i].path.previousP.length - 1] !== false){
				this.train[i].path.previousP.push(track.getNextSec(this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id,this.train[i].path.previousP[this.train[i].path.previousP.length - 1].dir))
				prevTotalDist += track.sectionDistance(this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id);
			}
			console.log('train',i,'path', this.train[i].path);
		}
	}

	this.addTrain = function(name){
		var trainNum = this.train.length
		console.log(engines[name].newEngine(0));
		this.train.push({
			engine: engines[name].newEngine(0),
			railcars: [],
			jobs: {},
			pathMaxLength: 2,
			curPointId: 1,
			curDist: 0
		});
		this.train[trainNum].path = {
			currentP: {
				sec: track.sections[10],
				dir: 1
			},
			nextP: [],
			previousP: []
		}
		this.train[trainNum].engine.mesh = engines[name].newMesh();
		this.train[trainNum].engine.userSpeed = this.train[trainNum].engine.opts.top;
		this.train[trainNum].engine.opts.acc = this.train[trainNum].engine.opts.maxAcc;
		this.train[trainNum].path.nextP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,this.train[trainNum].path.currentP.dir))
		this.train[trainNum].path.previousP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,(this.train[trainNum].path.currentP.dir == 1 ? 0 : 1)))
		console.log('train added','id: ' + this.train.length,this.train[trainNum]);
		scene.add(this.train[trainNum].engine.mesh);
		this.rebuildPath();
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

		console.log('railcar',this.train[i].railcars)
	}

	this.moveOnPath = function(curDist, moveDist, path, curPointId){
		var moveDir = path.dir;
		var inc = path.dir == 0 ? -1 : 1;


		var remDist = (curDist + moveDist);

		//console.log('rem',remDist, 'moveDir', moveDir, 'inc', inc, 'path', path, 'curPointId',curPointId)

		var nextPoint = 0;
		var curSegDist = 0;
		while(true){
			//console.log('rem',remDist, 'moveDir', moveDir, 'inc', inc, 'path', path, 'curPointId',curPointId);
			if(curPointId == 1 && moveDir == 0){
				//console.log('ta');
				if(path.sec.ends[0].type == 'end'){
					//console.log('end')
					var curSegDist = track.lerpDistance({
						p1: path.sec.points[1],
						p2: midpoint(path.sec.points[1],path.sec.points[0]),
						p3: path.sec.points[0]
					});
				}
				else{
					//console.log('switch')
					var curSegDist = track.lerpDistance({
						p1: path.sec.points[1],
						p2: path.sec.points[0],
						p3: path.sec.ends[0].points[track.getSwitchThrowId(path.sec.ends[0].id,path.sec.id,path.sec.segmentIds[0])]
					});
				}
			}
			else if(curPointId == path.sec.points.length - 2 && moveDir == 1){
				//console.log('tb');
				if(path.sec.ends[0].type == 'end'){
					//console.log('end')
					var curSegDist = track.lerpDistance({
						p1: path.sec.points[path.sec.points.length - 2],
						p2: midpoint(path.sec.points[path.sec.points.length - 2],path.sec.points[path.sec.points.length - 1]),
						p3: path.sec.points[path.sec.points.length - 1]
					});
				}
				else{
					//console.log('switch',track.getSwitchThrowId(path.sec.ends[1].id,path.sec.id,path.sec.segmentIds[path.sec.segmentIds.length - 1]))
					var curSegDist = track.lerpDistance({
						p1: path.sec.points[path.sec.points.length - 2],
						p2: path.sec.points[path.sec.points.length - 1],
						p3: path.sec.ends[1].points[track.getSwitchThrowId(path.sec.ends[1].id,path.sec.id,path.sec.segmentIds[path.sec.segmentIds.length - 1])]
					});
				}
			}
			else if(curPointId == 0){
				//console.log('tc');
				var curSegDist = track.lerpDistance({
					p1: path.sec.points[1],
					p2: midpoint(path.sec.points[1],path.sec.points[0]),
					p3: path.sec.points[0]
				});
			}
			else if(curPointId == path.sec.points.length - 1){
				//console.log('td');
				var curSegDist = track.lerpDistance({
					p1: path.sec.points[path.sec.points.length - 2],
					p2: midpoint(path.sec.points[path.sec.points.length - 2],path.sec.points[path.sec.points.length - 1]),
					p3: path.sec.points[path.sec.points.length - 1]
				});
			}
			else{
				//console.log('te',path.sec.points,curPointId,path.sec.points[curPointId + inc],path.sec.points[curPointId + (2 * inc)]);
				var curSegDist = track.lerpDistance({
					p1: path.sec.points[curPointId],
					p2: path.sec.points[curPointId + inc],
					p3: path.sec.points[curPointId + (2 * inc)]
				});
				//console.log(curSegDist)
			}

			//console.log(curPointId)
			if(curSegDist < remDist){
				remDist -= curSegDist;

				//console.log('les',curPointId,path.sec.points.length - 1,curSegDist,remDist)
				curPointId += (2*inc);
				//console.log('cpi',curPointId, 'mdir',moveDir)

				if (curPointId <= 0 || curPointId >= path.sec.points.length - 1){
					return {
						remDist: remDist,
						pointId: false,
						pos: false
					}
				}
			}
			else
				break;
		}
		//console.log(remDist);
		if(curPointId == 1 && moveDir == 0){
			//console.log('pa');
			if(path.sec.ends[0].type == 'end'){
				//console.log('end')
				var point = track.lerpToDist({
					p1: path.sec.points[1],
					p2: midpoint(path.sec.points[1],path.sec.points[0]),
					p3: path.sec.points[0]
				},remDist);
			}
			else{
				//console.log('switch')
				var point = track.lerpToDist({
					p1: path.sec.points[1],
					p2: path.sec.points[0],
					p3: path.sec.ends[0].points[track.getSwitchThrowId(path.sec.ends[0].id,path.sec.id,path.sec.segmentIds[0])]
				},remDist);
			}
		}
		else if(curPointId == path.sec.points.length - 2 && moveDir == 1){
			//console.log('pb');
			if(path.sec.ends[0].type == 'end'){
				//console.log('end')
				var point = track.lerpToDist({
					p1: path.sec.points[path.sec.points.length - 2],
					p2: midpoint(path.sec.points[path.sec.points.length - 2],path.sec.points[path.sec.points.length - 1]),
					p3: path.sec.points[path.sec.points.length - 1]
				},remDist);
			}
			else{
				//console.log('switch',track.getSwitchThrowId(path.sec.ends[1].id,path.sec.id,path.sec.segmentIds[path.sec.segmentIds.length - 1]))
				var point = track.lerpToDist({
					p1: path.sec.points[path.sec.points.length - 2],
					p2: path.sec.points[path.sec.points.length - 1],
					p3: path.sec.ends[1].points[track.getSwitchThrowId(path.sec.ends[1].id,path.sec.id,path.sec.segmentIds[path.sec.segmentIds.length - 1])]
				},remDist);
			}
		}
		else if(curPointId == 0){
			//console.log('pc');
			var point = track.lerpToDist({
				p1: path.sec.points[1],
				p2: midpoint(path.sec.points[1],path.sec.points[0]),
				p3: path.sec.points[0]
			},remDist);
		}
		else if(curPointId == path.sec.points.length - 1){
			//console.log('pd');
			var point = track.lerpToDist({
				p1: path.sec.points[path.sec.points.length - 2],
				p2: midpoint(path.sec.points[path.sec.points.length - 2],path.sec.points[path.sec.points.length - 1]),
				p3: path.sec.points[path.sec.points.length - 1]
			},remDist);
		}
		else{
			//console.log('pe',path.sec.points[curPointId],path.sec.points[curPointId + inc],path.sec.points[curPointId + (2 * inc)]);
			var point = track.lerpToDist({
				p1: path.sec.points[curPointId],
				p2: path.sec.points[curPointId + inc],
				p3: path.sec.points[curPointId + (2 * inc)]
			},remDist);
			//console.log(curSegDist)
		}

		return {
			remDist: remDist,
			pointId: curPointId,
			pos: recalcY(point,4)
		}
	}


	this.workJobs = function(dTime){
		dTime /= 1000;
		var i = -1;
		while(i < this.train.length - 1) {
			i++;

			//console.log(this.train[i].engine.opts.acc, this.train[i].engine.userSpeed)
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
			brakeDist = (Math.pow(this.train[i].engine.curSpeed,2)/(2*this.train[i].engine.opts.dec));

			//-- Find Distance on track --//
			var moved = this.moveOnPath(this.train[i].curDist, travDist, this.train[i].path.currentP, this.train[i].curPointId);
			this.train[i].curPointId = moved.pointId;
			this.train[i].curDist = moved.remDist;
			while(moved.pointId === false){
				//console.log('-----',this.train[i].path.currentP)
				this.rebuildPath(i);
				//console.log('-----',this.train[i].path.currentP)
				if(this.train[i].path.currentP.dir == 0){
					this.train[i].curPointId = this.train[i].path.currentP.sec.points.length - 2;
				}
				else{
					this.train[i].curPointId = 1;
				}

				this.moveOnPath(this.train[i].curDist, 0, this.train[i].path.currentP, this.train[i].curPointId);

				moved = this.moveOnPath(this.train[i].curDist, 0, this.train[i].path.currentP, this.train[i].curPointId);

				this.train[i].curDist = moved.remDist;
			}
			this.train[i].engine.backP = this.train[i].engine.curP
			this.train[i].engine.mesh.position = this.train[i].engine.curP = moved.pos;
			this.train[i].engine.mesh.lookAt(this.train[i].engine.backP);
			this.train[i].engine.mesh.verticesNeedUpdate = true;

			return;
			//-- calc rem T --//
			//-- apply to curP --//


			//-- move to new point --//
			this.train[i].engine.curP = recalcY(track.getSegPointFromt(path-segid,curt));

			//-- find back of engine --//
			this.train[i].engine.back = this.followBehind(i,this.train[i].engine.opts.axleOffset);
			if (this.train[i].engine.back == false) {
				this.train[i].engine.back = lerp(
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p1,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p2,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p2,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p3,
					(this.train[i].engine.curT -.001)
				);
			}
			this.train[i].engine.back.y = findY(this.train[i].engine.back.x,this.train[i].engine.back.z);

			//-- update engine mesh --//
			if (this.train[i].engine.mesh != undefined) {
				this.train[i].engine.mesh.position = this.train[i].engine.curP;
				this.train[i].engine.mesh.lookAt(this.train[i].engine.back)
				this.train[i].engine.mesh.rotationNeedsUpdate = true;
			}

			//then loop through railcars
			j = this.train[i].railcars.length
			while(j > 0){
				j--;
				//-- find front and back based on distance behind curP --//
				front = this.followBehind(i,this.train[i].railcars[j].distanceBehind);
				back = this.followBehind(i,this.train[i].railcars[j].distanceBehind + this.train[i].railcars[j].opts.axleOffset);

				if (front != false & back != false) {
					back.y = findY(back.x,back.z);
					front.y = findY(front.x,front.z);
					this.train[i].railcars[j].front = front;
					this.train[i].railcars[j].back = back;
				}
				else if (front != false & back == false) {
					front.y = findY(front.x,front.z);
					this.train[i].railcars[j].front = front;
					this.train[i].railcars[j].back = this.train[i].engine.back;

				}
				else{
					this.train[i].railcars[j].front = this.train[i].engine.front;
					this.train[i].railcars[j].back = this.train[i].engine.back;
				}
				if (this.train[i].railcars[j].mesh!= undefined) {
					this.train[i].railcars[j].mesh.position = this.train[i].railcars[j].front;
					this.train[i].railcars[j].mesh.lookAt(this.train[i].railcars[j].back);
					this.train[i].railcars[j].mesh.rotationNeedsUpdate = true;
				}
			}
		}
	}
};
train = new trainFunc();
var engines = [];
var railcars = [];
