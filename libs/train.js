var testC = testCube(new THREE.Vector3(0,0,0));

m['m_tgo'].onclickEvent = function(){
	then = Date.now(), now=Date.now();
}

var trainFunc = function(){
	this.engines = {}
	this.train = []

	this.rebuildPath = function(stay, specNum){
		var i = specNum != undefined ? specNum + 1 : this.train.length;
		var j = specNum != undefined ? specNum     : 0;

		while(i > j) {
			i--;

			var trainLength = 0;
			if(this.train[i].railcars.length > 0)
				this.train[i].path.trainLength = trainLength = this.train[i].railcars[this.train[i].railcars.length - 1].distanceBehind + this.train[i].railcars[this.train[i].railcars.length - 1].opts.sizeLength

			var brakeDist = ((Math.pow(this.train[i].engine.opts.top,2)/(2*this.train[i].engine.opts.dec)) + this.train[i].engine.curSpeed);

			var nextTotalDist = 0;
			var prevTotalDist = 0;
			var k = 0;

			if(this.train[i].engine.curSpeed >= 0){
				//.log('forward')
				if(this.train[i].path.nextP[0] !== false && !stay){
					this.train[i].path.previousP.unshift(this.train[i].path.currentP);
					this.train[i].path.currentP = this.train[i].path.nextP[0];
				}

				var klim = this.train[i].path.previousP.length;
				while(k < klim && this.train[i].path.previousP[k] !== false){
					prevTotalDist += track.sectionDistance(this.train[i].path.previousP[k].sec.id);
					if(prevTotalDist >= trainLength + brakeDist){
						this.train[i].path.previousP.splice(k+1,klim);
						klim = this.train[i].path.previousP.length;
					}
					k++;
				}

				this.train[i].path.nextP = [];
				this.train[i].path.nextP.push(track.getNextSec(this.train[i].path.currentP.sec.id,this.train[i].path.currentP.dir))
				if(this.train[i].path.nextP[this.train[i].path.nextP.length - 1] !== false)
					nextTotalDist += track.sectionDistance(this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id);
			}

			if(this.train[i].engine.curSpeed <= 0){
				if(this.train[i].path.previousP[0] !== false && !stay){
					this.train[i].path.nextP.unshift(this.train[i].path.currentP);
					this.train[i].path.currentP = this.train[i].path.previousP[0];
				}

				var klim = this.train[i].path.nextP.length; //-1
				while(k < klim && this.train[i].path.nextP[k] !== false){
					nextTotalDist += track.sectionDistance(this.train[i].path.nextP[k].sec.id);
					if(nextTotalDist >= brakeDist){
						this.train[i].path.nextP.splice(k+1,klim);
						klim = this.train[i].path.nextP.length;
					}
					k++;
				}

				this.train[i].path.previousP = [];
				this.train[i].path.previousP.push(track.getPrevSec(this.train[i].path.currentP.sec.id,this.train[i].path.currentP.dir));
				if(this.train[i].path.previousP[this.train[i].path.previousP.length - 1] != false)
					prevTotalDist += track.sectionDistance(this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id);
			}

			while(nextTotalDist <= brakeDist && this.train[i].path.nextP.length < 2 && this.train[i].path.nextP[this.train[i].path.nextP.length - 1] !== false){
				this.train[i].path.nextP.push(
					track.getNextSec(
						this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id,
						this.train[i].path.nextP[this.train[i].path.nextP.length - 1].dir
					)
				);
				if(this.train[i].path.nextP[this.train[i].path.nextP.length - 1] !== false)
					nextTotalDist += track.sectionDistance(this.train[i].path.nextP[this.train[i].path.nextP.length - 1].sec.id);
			}
			this.train[i].path.nextPTotalDist = nextTotalDist;

			while((prevTotalDist <= trainLength + brakeDist) && this.train[i].path.previousP[this.train[i].path.previousP.length - 1] !== false){
				this.train[i].path.previousP.push(
					track.getPrevSec(
						this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id,
						this.train[i].path.previousP[this.train[i].path.previousP.length - 1].dir
					)
				);
				if(this.train[i].path.previousP[this.train[i].path.previousP.length - 1] !== false)
					prevTotalDist += track.sectionDistance(this.train[i].path.previousP[this.train[i].path.previousP.length - 1].sec.id);
			}
			this.train[i].path.previousPTotalDist = prevTotalDist;

			console.log('train',i,'path', this.train[i].path);
		}
	}

	this.addTrain = function(name){
		var trainNum = this.train.length
		//.log(engines[name].newEngine(0));
		this.train.push({
			engine: engines[name].newEngine(0),
			railcars: [],
			jobs: {},
			curPointId: 1,
			curDist: 0
		});
		this.train[trainNum].path = {
			currentP: {
				sec: track.sections[track.sections.length - 1],
				dir: 0
			},
			nextP: [],
			previousP: [],
			reverseDir: 0
		}
		this.train[trainNum].engine.mesh = engines[name].newMesh();
		this.train[trainNum].engine.mesh.position.set(0,0,0);
		this.train[trainNum].engine.userSpeed = 10;//this.train[trainNum].engine.opts.top;
		this.train[trainNum].engine.opts.acc = this.train[trainNum].engine.opts.maxAcc;
		this.train[trainNum].path.nextP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,this.train[trainNum].path.currentP.dir))
		this.train[trainNum].path.previousP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,(this.train[trainNum].path.currentP.dir)))
		console.log('train added','id: ' + trainNum,this.train[trainNum]);
		scene.add(this.train[trainNum].engine.mesh);
		this.rebuildPath(true, trainNum);
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

		//.log('railcars',this.train[i].railcars)
	}

	this.moveBackOnPath = function(curDist, moveDist, path, curPointId, reverse){
		// if(reverse < 0 && curPointId < 0 && path.previousP[0] === false)
		// 	curPointId = 0;
		// if(reverse < 0 && curPointId >= path.currentP.sec.points.length && path.nextP[0] === false)
		// 	curPointId = path.currentP.sec.points.length - 1;

		console.log('moveback',curDist, moveDist, path, curPointId, reverse,-1)

		var moved = this.moveOnPath(curDist, moveDist, path, curPointId, -1);
		moved.rebuild = false;
		var prevPId = -1;
		while(moved.pointId === false){
			console.log('poke');
			if(path.previousP[prevPId + 1] == undefined  || path.previousP[prevPId + 1] == false){
				//console.error('path not long enough in moveBackOnPath; returning false. prevPId:'+prevPId)
				return false;
			}

			prevPId++;
			if((path.previousP[prevPId].dir == 0 & reverse > 0)
				|(path.previousP[prevPId].dir == 1 & reverse < 0))
				curPointId = path.previousP[prevPId].sec.points.length;
			else
				curPointId = -1;

			//.log(path.previousP[prevPId],path.previousP[prevPId + 1], prevPId, path.previousP.length, moved.remDist)
			moved = this.moveOnPath(
				0,
				moved.remDist,
				{
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
		console.log(curPointId);
		curPath = path.currentP;

		//curPointId = reverse < 0 ? curPointId - 2 : curPointId;
		curPointId = curPointId <= 0 ? -1 : curPointId
		curPointId = curPointId >= plen - 1 ? plen : curPointId
		if(curPointId == undefined){
			//.warn('curPointId is undefined');
			return false;
		}

		var moveDir = curPath.dir;
		if(reverse > 0){
			var inc = curPath.dir == 0 ? -1 : 1;
		}
		else if(reverse < 0) {
			moveDist = Math.abs(moveDist);
			//var moveDir = curPath.dir == 0 ? 1 : 0;
			var inc = curPath.dir == 0 ? 1 : -1;
			//.log('curDist, moveDist, path, curPointId, reverse',curDist, moveDist, path, curPointId, reverse)
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

		//.log('rem',remDist, 'moveDir', moveDir, 'inc', inc, 'curPath', curPath, 'curPointId',curPointId)

		var nextPoint = 0;
		var curSegDist = 0;
		var plen = curPath.sec.points.length;
		while(true){
			var backRemDist = false;

			//check for ends
			var checkPathType = path.previousP[0] === false ? 'pf ' : 'ps ';
			checkPathType += path.nextP[0] === false ? 'nf ' : 'ns ';
			checkPathType += reverse > 0 ? 'r+ ' : 'r- ';
			checkPathType += moveDir == 1 ? 'md1 ' : 'md0 ';
			checkPathType += 'cpid: ' + curPointId + '/' + curPath.sec.points.length;

			console.log(checkPathType);
			if(curPointId < -1 || curPointId > plen
				|| ((moveDir == 0 && reverse > 0 || moveDir == 1 && reverse < 0) && curPointId == -1)
				|| ((moveDir == 1 && reverse > 0 || moveDir == 0 && reverse < 0) && curPointId == plen)
			){
				console.log('going home 1',curSegDist, remDist);
				return {
					curSegDist: curSegDist,
					remDist: remDist,
					pointId: false,
					pos: false
				}
			}
			else if(curPointId > 1 && curPointId < plen - 2){
				var curPathPart = {
					p1: curPath.sec.points[curPointId],
					p2: curPath.sec.points[curPointId + inc],
					p3: curPath.sec.points[curPointId + (2 * inc)],
					type: 'a12'
				};
			}

			//switches

			else if(path.nextP[0] !== false && curPointId == 1 && reverse > 0 && moveDir == 0)
				var curPathPart = {
					p1: curPath.sec.points[1],
					p2: curPath.sec.points[0],
					p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
					type: 'a5'
				};
			else if(path.previousP[0] !== false && curPointId == 1 && reverse < 0 && moveDir == 1)
				var curPathPart = {
					p1: curPath.sec.points[1],
					p2: curPath.sec.points[0],
					p3: path.previousP[0].sec.points[path.previousP[0].dir == 0 ? 1 : path.previousP[0].sec.points.length - 2],
					type: 'a52'
				};
			else if(path.nextP[0] !== false && curPointId == 1 && reverse > 0 && moveDir == 0)
				var curPathPart = {
					p1: path.nextP[0].sec.points[path.nextP[0].dir == 0 ? 1 : path.nextP[0].sec.points.length - 2],
					p2: curPath.sec.points[0],
					p3: curPath.sec.points[1],
					type: 'a4'
				};
			else if(path.previousP[0] !== false && curPointId == 1 && reverse < 0 && moveDir == 1)
				var curPathPart = {
					p1: curPath.sec.points[1],
					p2: curPath.sec.points[0],
					p3: path.previousP[0].sec.points[path.previousP[0].dir == 0 ? 1 : path.previousP[0].sec.points.length - 2],
					type: 'a42'
				};
			else if(path.previousP[0] !== false && curPointId == plen -2 && reverse < 0 && moveDir == 0)
				var curPathPart = {
					p1: curPath.sec.points[plen - 2],
					p2: curPath.sec.points[plen - 1],
					p3: path.previousP[0].sec.points[path.previousP[0].dir == 0 ? 1 : path.previousP[0].sec.points.length - 2],
					type: 'a31'
				};
			else if(path.nextP[0] !== false && curPointId == plen -2 && reverse > 0 && moveDir == 1){
				console.log(nextPathP2.x,nextPathP2.z)
				var curPathPart = {
					p1: curPath.sec.points[plen - 2],
					p2: curPath.sec.points[plen - 1],
					p3: path.nextP[0].sec.points[path.nextP[0].dir == 1 ? 1 : path.nextP[0].sec.points.length - 2],
					type: 'a3'
				};
			}
			/*else if(path.previousP[0] !== false && curPointId == plen -2 && reverse < 0 && moveDir == 1)
				var curPathPart = {
					p1: nextPathP2,
					p2: curPath.sec.points[plen - 1],
					p3: curPath.sec.points[plen - 2],
					type: 'a2'
				};*/
			/*else if(path.nextP[0] !== false && curPointId == plen -2 && reverse > 0 && moveDir == 0)
				var curPathPart = {
					p1: nextPathP2,
					p2: curPath.sec.points[plen - 1],
					p3: curPath.sec.points[plen - 2],
					type: 'a222'
				};*/

			//check ends moving towards
			else if(path.previousP[0] === false && reverse < 0 && curPointId <= 1 && moveDir == 1)
				var curPathPart = {
					p1: curPath.sec.points[1],
					p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
					p3: curPath.sec.points[0],
					type: 'a9'
				};
			else if(path.nextP[0] === false && reverse > 0 && curPointId <= 1 && moveDir == 0)
				var curPathPart = {
					p1: curPath.sec.points[1],
					p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
					p3: curPath.sec.points[0],
					type: 'a8'
				};
			else if(path.previousP[0] === false && reverse < 0 && curPointId >= plen - 2 && moveDir == 0)
				var curPathPart = {
					p1: curPath.sec.points[plen - 1],
					p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
					p3: curPath.sec.points[plen - 2],
					type: 'a7'
				};
			else if(path.nextP[0] === false && reverse > 0 && curPointId >= plen - 2 && moveDir == 1)
				var curPathPart = {
					p1: curPath.sec.points[plen - 2],
					p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
					p3: curPath.sec.points[plen - 1],
					type: 'a6'
				};

			//check ends moving from
			else if(path.previousP[0] === false && reverse > 0 && curPointId <= 1 && moveDir == 1)
				var curPathPart = {
					p1: curPath.sec.points[0],
					p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
					p3: curPath.sec.points[1],
					type: 'a7b'
				};
			else if(path.nextP[0] === false && reverse < 0 && curPointId <= 1 && moveDir == 1)
				var curPathPart = {
					p1: curPath.sec.points[1],
					p2: midpoint(curPath.sec.points[1],curPath.sec.points[0]),
					p3: curPath.sec.points[0],
					type: 'a6b'
				};
			else if(path.previousP[0] === false && reverse > 0 && curPointId >= plen - 2 && moveDir == 0)
				var curPathPart = {
				p1: curPath.sec.points[plen - 1],
				p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
				p3: curPath.sec.points[plen - 2],
					type: 'a9b'
				};
			else if(path.nextP[0] === false && reverse < 0 && curPointId >= plen - 2 && moveDir == 0)
				var curPathPart = {
				p1: curPath.sec.points[plen - 2],
				p2: midpoint(curPath.sec.points[plen - 2],curPath.sec.points[plen - 1]),
				p3: curPath.sec.points[plen - 1],
					type: 'a8b'
				};

			else if(curPointId >= 0 && curPointId < plen)
				var curPathPart = {
					p1: curPath.sec.points[curPointId],
					p2: curPath.sec.points[curPointId + inc],
					p3: curPath.sec.points[curPointId + (2 * inc)],
					type: 'a11'
				};


			//if the point is out of bounds, return what will be interpreted as a flag for, move to next section
			else{
				//checkPathType = 'not set, out of reach';
				console.log('going home2');
				return {
					curSegDist: curSegDist,
					remDist: remDist,
					pointId: false,
					pos: false
				}
			}

			console.log(curPathPart.type, 'remDist:'+remDist, 'INC:'+inc)
			var curSegDist = track.lerpDistance(curPathPart);
			console.log('curSegDist:' + curSegDist)
			//check if we have moved far enough
			if(curSegDist < remDist){
				//if we havent, adjust the measure and loop again
				remDist -= curSegDist;
				curPointId += (2*inc);
			}
			else //otherwise, move on
				break;
		}

		return {
			curSegDist: curSegDist,
			remDist: remDist,
			pointId: curPointId,
			pos: recalcY(track.lerpToDist(curPathPart,remDist),4)
		}
	}


	this.workJobs = function(dTime){
		console.log('-----');
		dTime /= 1000;
		var i = -1;
		while(i < this.train.length - 1) {
			i++;

			//.log(this.train[i].engine.opts.acc, this.train[i].engine.userSpeed)
			brakeDist = (Math.pow(this.train[i].engine.curSpeed,2)/(2*this.train[i].engine.opts.dec));

			if(this.train[i].engine.curSpeed > 0
				&& track.sectionDistanceRemaining(
					this.train[i].path.currentP.sec.id,
					this.train[i].path.currentP.dir,
					this.train[i].curPointId,
					this.train[i].curDist
				) + this.train[i].path.nextPTotalDist < brakeDist
			){
				this.train[i].engine.opts.acc = -1 * this.train[i].engine.opts.maxAcc;
			}
			if(this.train[i].engine.curSpeed < 0
				&& track.sectionDistanceRemaining(
					this.train[i].path.currentP.sec.id,
					this.train[i].path.currentP.dir == 1 ? 0 : 1,
					this.train[i].curPointId,
					this.train[i].curSegDist - this.train[i].curDist
				) + this.train[i].path.previousPTotalDist < brakeDist + this.train[i].path.trainLength
			){
				this.train[i].engine.opts.acc = this.train[i].engine.opts.maxAcc;
				//console.log(/*this.train[i].path.nextPTotalDist,this.train[i].path.previousPTotalDist, this.train[i].curDist, this.train[i].path.trainLength,*/ brakeDist, a2);
			}

			var speedWas = this.train[i].engine.curSpeed;

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

			if(
				(this.train[i].engine.curSpeed > 0 && speedWas <= 0)
			 || (this.train[i].engine.curSpeed < 0 && speedWas >= 0)
			){
				console.log('rebuilding Path: '+i);
				this.rebuildPath(true, i);
			}

			travDist = this.train[i].engine.curSpeed*dTime;

			if(travDist == 0)
				continue;

			/*if((this.train[i].engine.curSpeed > 0 && this.train[i].path.reverseDir == 1) || (this.train[i].engine.curSpeed < 0 && this.train[i].path.reverseDir == 0)){
				this.train[i].path.reverseDir = this.train[i].path.reverseDir == 1 ? 0 : 1;
				var moved = this.moveOnPath(this.train[i].curDist, 2 * this.train[i].curDist, this.train[i].path, this.train[i].curPointId, -this.train[i].engine.curSpeed);
				this. train[i].curDist = moved.remDist;
				this. train[i].curPointId = moved.pointId;
			}*/

			//-- Find Distance on track --//
			//.log(this.train[i].path)
			//.log(this.train[i].curDist, travDist, this.train[i].path.currentP, this.train[i].curPointId)

			var moved = this.moveOnPath(
				this.train[i].curDist,
				travDist,
				this.train[i].path,
				this.train[i].curPointId ,
				this.train[i].engine.curSpeed,
				this.train[i].engine.curSpeed > 0 ? this.train[i].path.nextP[0] : this.train[i].path.previousP[0]
			);
			if(!moved) return -1;
			this.train[i].curPointId = moved.pointId;
			this.train[i].curDist = moved.remDist;
			this.train[i].curSegDist = moved.curSegDist;

			//if(this.train[i].engine.curSpeed > 0){
				while(moved.pointId === false){
					console.log('building new');
					//.log('-----',this.train[i].path.currentP)
					this.rebuildPath(false, i);

					if ((this.train[i].path.currentP.dir == 0 & this.train[i].engine.curSpeed > 0)
						/*this.train[i].curPointId = this.train[i].path.currentP.sec.points.length - 2;
					else if*/ || (this.train[i].path.currentP.dir != 0 & this.train[i].engine.curSpeed < 0))
						this.train[i].curPointId = this.train[i].path.currentP.sec.points.length - 2;
					else /*if (this.train[i].engine.curSpeed < 0)
						this.train[i].curPointId = 1;
					else*/
						this.train[i].curPointId = 1;

					moved = this.moveOnPath(
						0,
						this.train[i].curDist,
						this.train[i].path,
						this.train[i].curPointId,
						this.train[i].engine.curSpeed,
						this.train[i].engine.curSpeed > 0 ? this.train[i].path.nextP[0] : this.train[i].path.previousP[0]
					);

					this.train[i].curPointId = moved.pointId;
					this.train[i].curDist = moved.remDist;
					this.train[i].curSegDist = moved.curSegDist;
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

					//.log(path.previousP[prevPId],path.previousP[prevPId + 1], prevPId, path.previousP.length, moved.remDist)
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
			//.log(this.train[i].curPointId)
			return;
			
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
