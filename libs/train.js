var testC = testCube(new THREE.Vector3(0,0,0));

var trainFunc = function(){
	this.engines = {}
	this.train = []

	this.rebuildPath = function(specNum){
		var i = specNum != undefined ? specNum + 1 : this.train.length;
		var j = specNum != undefined ? specNum     : 0;

		while(i > j) {
			i--;
			//var stay = (specNum != undefined || this.train[i].engine.curSpeed == 0) ? false : true;
			//console.log(stay ? 'true' : 'fa;lse')
			var trainLength = this.train[i].engine.opts.sizeLength;
			if(this.train[i].railcars.length > 0)
				trainLength += this.train[i].railcars[this.train[i].railcars.length - 1].distanceBehind + this.train[i].railcars[this.train[i].railcars.length - 1].opts.sizeLength
			var brakeDist = 4*((Math.pow(this.train[i].engine.opts.top,2)/(2*this.train[i].engine.opts.dec)) + this.train[i].engine.curSpeed);
			//console.log(';;;',brakeDist,Math.pow(this.train[i].engine.opts.top,2));
			var nextTotalDist = 0;
			var prevTotalDist = 0;
			var k = 0
			if(this.train[i].engine.curSpeed >= 0){
				//console.log('forward')
				this.train[i].path.previousP.unshift(this.train[i].path.currentP);
				var curSec = this.train[i].path.currentP = this.train[i].path.nextP[0];
				var klim = this.train[i].path.previousP.length; //-1
				while(k < klim){
					prevTotalDist += track.sectionDistance(this.train[i].path.previousP[i].sec.id);
					if(prevTotalDist >= trainLength + brakeDist){
						this.train[i].path.previousP.splice(k+1,klim);
						klim = this.train[i].path.previousP.length;
					}
					k++;
				}
				this.train[i].path.nextP = [];
				this.train[i].path.nextP.push(track.getNextSec(this.train[i].path.currentP.sec.id,this.train[i].path.currentP.dir))
			}
			if(this.train[i].engine.curSpeed <= 0){
				//console.log('backward')
				this.train[i].path.nextP.unshift(this.train[i].path.currentP);
				var curSec = this.train[i].path.currentP = this.train[i].path.previousP[0];
				var klim = this.train[i].path.nextP.length; //-1
				while(k < klim){
					nextTotalDist += track.sectionDistance(this.train[i].path.nextP[i].sec.id);
					if(nextTotalDist >= brakeDist){
						this.train[i].path.nextP.splice(k+1,klim);
						klim = this.train[i].path.nextP.length;
					}
					k++;
				}
				this.train[i].path.previousP = [];
				this.train[i].path.previousP.push(track.getPrevSec(this.train[i].path.currentP.sec.id,this.train[i].path.currentP.dir))
			}

			while((nextTotalDist <= brakeDist && this.train[i].path.nextP[this.train[i].path.nextP.length - 1] !== false) || this.train[i].path.nextP.length < 2){
				this.train[i].path.nextP.push(
					track.getNextSec(
						this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id,
						this.train[i].path.nextP[this.train[i].path.nextP.length - 1].dir
					)
				);
				nextTotalDist += track.sectionDistance(this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id);
			}
			while(prevTotalDist <= trainLength + brakeDist && this.train[i].path.previousP[this.train[i].path.previousP.length - 1] !== false){
				this.train[i].path.previousP.push(
					track.getPrevSec(
						this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id,
						this.train[i].path.previousP[this.train[i].path.previousP.length - 1].dir
					)
				);
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
			curPointId: 1,
			curDist: 0
		});
		this.train[trainNum].path = {
			currentP: {
				sec: track.sections[4],
				dir: 0
			},
			nextP: [],
			previousP: [],
			reverseDir: 0
		}
		this.train[trainNum].engine.mesh = engines[name].newMesh();
		this.train[trainNum].engine.mesh.position.set(0,0,0);
		this.train[trainNum].engine.userSpeed = this.train[trainNum].engine.opts.top;
		this.train[trainNum].engine.opts.acc = this.train[trainNum].engine.opts.maxAcc;
		this.train[trainNum].path.nextP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,this.train[trainNum].path.currentP.dir))
		this.train[trainNum].path.previousP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,(this.train[trainNum].path.currentP.dir)))
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

		console.log('railcars',this.train[i].railcars)
	}

	this.moveBackOnPath = function(curDist, moveDist, path, curPointId, reverse){
		var moved = this.moveOnPath(curDist, moveDist, path, curPointId, -1);
		moved.rebuild = false;
		var prevPId = -1;
		while(moved.pointId === false){
			if(path.previousP[prevPId + 1] == undefined  || path.previousP[prevPId + 1] == false){
				console.error('path not long enough in moveBackOnPath; returning false. prevPId:'+prevPId)
				return false;
			}

			prevPId++;
			if((path.previousP[prevPId].dir == 0 & reverse > 0)
				|(path.previousP[prevPId].dir != 0 & reverse < 0))
				curPointId = path.previousP[prevPId].sec.points.length;
			else
				curPointId = -1;

			//console.log(path.previousP[prevPId],path.previousP[prevPId + 1], prevPId, path.previousP.length, moved.remDist)
			moved = this.moveOnPath(
				0,
				moved.remDist,{
					nextP: [(prevPId == 0 ? path.currentP : path.previousP[prevPId - 1])],
					currentP: path.previousP[prevPId],
					previousP: [path.previousP[prevPId + 1]]
				},
				curPointId,
				-1
			);
			moved.rebuild = true;
		}
		return moved;
	}

	this.moveOnPath = function(curDist, moveDist, path, curPointId, reverse){

		curPath = path.currentP;

		if(curPointId == undefined){
			console.warn('curPointId is undefined');
			return false;
		}

		var remDist = (curDist + moveDist);

		var nextPathP2 = path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2]

		if(reverse > 0){
			var moveDir = curPath.dir;
			var inc = curPath.dir == 0 ? -1 : 1;
		}
		else if(reverse < 0) {
			moveDist = Math.abs(moveDist);
			var moveDir = curPath.dir == 0 ? 1 : 0;
			var inc = curPath.dir == 0 ? 1 : -1;
			//console.log('curDist, moveDist, path, curPointId, reverse',curDist, moveDist, path, curPointId, reverse)
		}
		else{
			return {
				curSegDist: curDist,
				remDist: 0,
				pointId: curPointId,
				pos: this.train[i].engine.curP
			}
		}


		var remDist = (curDist + moveDist);

		//console.log('rem',remDist, 'moveDir', moveDir, 'inc', inc, 'curPath', curPath, 'curPointId',curPointId)

		var nextPoint = 0;
		var curSegDist = 0;
		while(true){
			//console.log('rem',remDist, 'moveDir', moveDir, 'inc', inc, 'curPath', curPath, 'curPointId',curPointId);
			if (((curPointId <= 0 || curPointId >= curPath.sec.points.length - 1) && reverse > 0)
				|| (((curPointId <= 1 && moveDir == 0) || (curPointId >= curPath.sec.points.length - 2 && moveDir == 1)) && reverse < 0)
				|| (curPointId < -1 || curPointId > curPath.sec.points.length)){
				return {
					curSegDist: curSegDist,
					remDist: remDist,
					pointId: false,
					pos: false
				}
			}
			else if((curPointId == 1  && moveDir == 0 && reverse > 0) || (curPointId == -1 && moveDir == 1 && reverse < 0)){
				//console.log('ta');
				if(curPath.sec.ends[0].type == 'end'){

					//console.log('end')
					var curSegDist = track.lerpDistance({
						p1: curPath.sec.points[1],
						p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
						p3: curPath.sec.points[0]
					});
				}
				else{

					//console.log('switch')
					var curSegDist = track.lerpDistance({
						p1: curPath.sec.points[1],
						p2: curPath.sec.points[0],
						p3: nextPathP2
					});
				}
			}
			else if((curPointId == curPath.sec.points.length - 2  && moveDir == 1 && reverse > 0) || (curPointId == curPath.sec.points.length && moveDir == 0 && reverse < 0)){
				if(curPath.sec.ends[0].type == 'end'){
					//console.log('end')
					var curSegDist = track.lerpDistance({
						p1: curPath.sec.points[curPath.sec.points.length - 2],
						p2: midpoint(curPath.sec.points[curPath.sec.points.length - 2],curPath.sec.points[curPath.sec.points.length - 1]),
						p3: curPath.sec.points[curPath.sec.points.length - 1]
					});
				}
				else{
					//console.log('switch',track.getSwitchThrowId(curPath.sec.ends[1].id,curPath.sec.id,curPath.sec.segmentIds[curPath.sec.segmentIds.length - 1]))
					var curSegDist = track.lerpDistance({
						p1: curPath.sec.points[curPath.sec.points.length - 2],
						p2: curPath.sec.points[curPath.sec.points.length - 1],
						p3: nextPathP2
					});
				}
			}
			else if(curPointId == 0){
				var curSegDist = track.lerpDistance({
					p1: curPath.sec.points[1],
					p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
					p3: curPath.sec.points[0]
				});
			}
			else if(curPointId == curPath.sec.points.length - 1){
				//console.log('td');
				var curSegDist = track.lerpDistance({
					p1: curPath.sec.points[curPath.sec.points.length - 2],
					p2: midpoint(curPath.sec.points[curPath.sec.points.length - 2],curPath.sec.points[curPath.sec.points.length - 1]),
					p3: curPath.sec.points[curPath.sec.points.length - 1]
				});
			}
			else {
				//console.log('te',curPath.sec.points,curPointId,curPath.sec.points[curPointId + inc],curPath.sec.points[curPointId + (2 * inc)]);
				var curSegDist = track.lerpDistance({
					p1: curPath.sec.points[curPointId],
					p2: curPath.sec.points[curPointId + inc],
					p3: curPath.sec.points[curPointId + (2 * inc)]
				});
				//console.log(curSegDist)
			}

			if(curSegDist < remDist){
				remDist -= curSegDist;

				//console.log('les',curPointId,curPath.sec.points.length - 1,curSegDist,remDist)
				curPointId += (2*inc);
				//console.log('cpi',curPointId, 'mdir',moveDir)
			}
			else
				break;


		}

		if((curPointId == 1  && moveDir == 0 && reverse > 0) || (curPointId == -1 && moveDir == 1 && reverse < 0)){
			//console.log('pa');
			if(curPath.sec.ends[0].type == 'end'){
				//console.log('end')
				var point = track.lerpToDist({
					p1: curPath.sec.points[1],
					p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
					p3: curPath.sec.points[0]
				},remDist);
			}
			else{
				//console.log('switch',curPath.sec.ends[0],curPath.sec.ends[0].points[track.getSwitchThrowId(curPath.sec.ends[0].id,curPath.sec.id,curPath.sec.segmentIds[0])]);
				//console.log('curPath.sec.ends[0].id,curPath.sec.id,curPath.sec.segmentIds[0])',curPath.sec.ends[0].id,curPath.sec.id,curPath.sec.segmentIds[0])
				var point = track.lerpToDist({
					p1: curPath.sec.points[1],
					p2: curPath.sec.points[0],
					p3: nextPathP2
				},reverse > 0 ? remDist : curSegDist - remDist);
			}
		}
		else if ((curPointId == curPath.sec.points.length - 2  && moveDir == 1 && reverse > 0) || (curPointId == curPath.sec.points.length && moveDir == 0 && reverse < 0)){
			//console.log('pb');
			if(curPath.sec.ends[0].type == 'end'){
				//console.log('end')
				var point = track.lerpToDist({
					p1: curPath.sec.points[curPath.sec.points.length - 2],
					p2: midpoint(curPath.sec.points[curPath.sec.points.length - 2],curPath.sec.points[curPath.sec.points.length - 1]),
					p3: curPath.sec.points[curPath.sec.points.length - 1]
				},remDist);
			}
			else{
				//console.log('switch',curPath.sec.ends[0],curPath.sec.ends[0].points[track.getSwitchThrowId(curPath.sec.ends[0].id,curPath.sec.id,curPath.sec.segmentIds[0])]);
				//console.log('curPath.sec.ends[0].id,curPath.sec.id,curPath.sec.segmentIds[0])',curPath.sec.ends[0].id,curPath.sec.id,curPath.sec.segmentIds[0])
				var point = track.lerpToDist({
					p1: curPath.sec.points[curPath.sec.points.length - 2],
					p2: curPath.sec.points[curPath.sec.points.length - 1],
					p3: nextPathP2
				},reverse > 0 ? remDist : curSegDist - remDist);
			}
		}
		else if(curPointId == 0){
			//console.log('pc');
			var point = track.lerpToDist({
				p1: curPath.sec.points[1],
				p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
				p3: curPath.sec.points[0]
			},remDist);
		}
		else if(curPointId == curPath.sec.points.length - 1){
			//console.log('pd');
			var point = track.lerpToDist({
				p1: curPath.sec.points[curPath.sec.points.length - 2],
				p2: midpoint(curPath.sec.points[curPath.sec.points.length - 2],curPath.sec.points[curPath.sec.points.length - 1]),
				p3: curPath.sec.points[curPath.sec.points.length - 1]
			},remDist);
		}
		else{
			//console.log('pe',curPath.sec.points[curPointId],curPath.sec.points[curPointId + inc],curPath.sec.points[curPointId + (2 * inc)]);
			var point = track.lerpToDist({
				p1: curPath.sec.points[curPointId],
				p2: curPath.sec.points[curPointId + inc],
				p3: curPath.sec.points[curPointId + (2 * inc)]
			},remDist);
			//console.log(curSegDist)
		}
		//console.log('yo',remDist, curPointId)
		return {
			curSegDist: curSegDist,
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

			/*if((this.train[i].engine.curSpeed > 0 && this.train[i].path.reverseDir == 1) || (this.train[i].engine.curSpeed < 0 && this.train[i].path.reverseDir == 0)){
				this.train[i].path.reverseDir = this.train[i].path.reverseDir == 1 ? 0 : 1;
				var moved = this.moveOnPath(this.train[i].curDist, 2 * this.train[i].curDist, this.train[i].path, this.train[i].curPointId, -this.train[i].engine.curSpeed);
				this. train[i].curDist = moved.remDist;
				this. train[i].curPointId = moved.pointId;
			}*/

			//-- Find Distance on track --//
			//console.log(this.train[i].path)
			//console.log(this.train[i].curDist, travDist, this.train[i].path.currentP, this.train[i].curPointId)

			var moved = this.moveOnPath(this.train[i].curDist, travDist, this.train[i].path, this.train[i].curPointId , this.train[i].engine.curSpeed);
			if(!moved) return -1;
			this.train[i].curPointId = moved.pointId;
			this.train[i].curDist = moved.remDist;

			//if(this.train[i].engine.curSpeed > 0){
				while(moved.pointId === false){
					//console.log('-----',this.train[i].path.currentP)
					this.rebuildPath(i);

					if (this.train[i].path.currentP.dir == 0 & this.train[i].engine.curSpeed > 0)
						this.train[i].curPointId = this.train[i].path.currentP.sec.points.length - 2;
					else if (this.train[i].path.currentP.dir != 0 & this.train[i].engine.curSpeed < 0)
						this.train[i].curPointId = this.train[i].path.currentP.sec.points.length;
					else if (this.train[i].engine.curSpeed < 0)
						this.train[i].curPointId = -1;
					else
						this.train[i].curPointId = 1;

					moved = this.moveOnPath(0, this.train[i].curDist, this.train[i].path, this.train[i].curPointId, this.train[i].engine.curSpeed);

					this.train[i].curPointId = moved.pointId;
					this.train[i].curDist = moved.remDist;
				}
			/*}
			else{
				while(moved.pointId === false){
					this.rebuildPath(i);

					prevPId++;
					if((path.previousP[prevPId].dir == 0 & reverse > 0)
						|(path.previousP[prevPId].dir != 0 & reverse < 0))
						curPointId = path.previousP[prevPId].sec.points.length -2;
					else
						curPointId = 1;

					//console.log(path.previousP[prevPId],path.previousP[prevPId + 1], prevPId, path.previousP.length, moved.remDist)
					moved = this.moveOnPath(0, this.train[i].curDist, this.train[i].path, this.train[i].curPointId, this.train[i].engine.curSpeed);

					this.train[i].curPointId = moved.pointId;
					this.train[i].curDist = moved.remDist;
				}
			}*/
			this.train[i].engine.mesh.position.set(moved.pos.x,moved.pos.y,moved.pos.z);
			this.train[i].engine.backP = this.moveBackOnPath(
				this.train[i].engine.curSpeed > 0 ? (moved.curSegDist - this.train[i].curDist) : this.train[i].curDist,
				this.train[i].engine.opts.axleOffset,
				this.train[i].path,
				this.train[i].engine.curSpeed > 0 ? (this.train[i].curPointId + ( -2 * (this.train[i].path.currentP.dir == 1 ? -1 : 1))) : this.train[i].curPointId,
				-1
			).pos
			this.train[i].engine.mesh.lookAt(this.train[i].engine.backP);
			this.train[i].engine.mesh.verticesNeedUpdate = true;
			//console.log(this.train[i].curPointId)

			//-- calc rem T --//
			//-- apply to curP --//

			//then loop through railcars
			j = this.train[i].railcars.length
			while(j > 0){
				j--;
				var newpos = this.moveBackOnPath(
					this.train[i].engine.curSpeed > 0 ? (moved.curSegDist - this.train[i].curDist) : this.train[i].curDist,
					this.train[i].railcars[j].distanceBehind,
					this.train[i].path,
					this.train[i].engine.curSpeed > 0 ? (this.train[i].curPointId + ( -2 * (this.train[i].path.currentP.dir == 1 ? -1 : 1))) : this.train[i].curPointId,
					-1
				).pos
				this.train[i].railcars[j].mesh.position.set(newpos.x,newpos.y,newpos.z)
				this.train[i].railcars[j].mesh.lookAt(this.moveBackOnPath(
					this.train[i].engine.curSpeed > 0 ? (moved.curSegDist - this.train[i].curDist) : this.train[i].curDist,
					this.train[i].railcars[j].distanceBehind + this.train[i].railcars[j].opts.axleOffset,
					this.train[i].path,
					this.train[i].engine.curSpeed > 0 ? (this.train[i].curPointId + ( -2 * (this.train[i].path.currentP.dir == 1 ? -1 : 1))) : this.train[i].curPointId,
					-1
				).pos);
				this.train[i].railcars[j].mesh.rotationNeedsUpdate = true;
			}
		}
	}
};
train = new trainFunc();
var engines = [];
var railcars = [];
