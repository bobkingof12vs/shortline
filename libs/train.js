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
				console.log('top');
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
			console.log('bottom');
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

			this.train[i].path.currentPTotalDist = track.sectionDistance(this.train[i].path.currentP.sec.id);

			var pathPoints = [];
			if(this.train[i].path.currentP.dir == 1){
				var j = -1;
				while(++j < this.train[i].path.currentP.sec.points.length)
					pathPoints.push(this.train[i].path.currentP.sec.points[j])
			}
			else{
				var j = this.train[i].path.currentP.sec.points.length;
				while(j--)
					pathPoints.push(this.train[i].path.currentP.sec.points[j])
			}

			var j = -1;
			while(++j < this.train[i].path.nextP.length && this.train[i].path.nextP[j] !== false){
				if(this.train[i].path.nextP[j].dir == 1){
					var k = 0;
					while(++k < this.train[i].path.nextP[j].sec.points.length)
						pathPoints.push(this.train[i].path.nextP[j].sec.points[k])
				}
				else{
					var k = this.train[i].path.nextP[j].sec.points.length - 1;
					while(k--)
						pathPoints.push(this.train[i].path.nextP[j].sec.points[k])
				}
			}

			// var l = pathPoints.length;
			// pathPoints.push(pathPoints[l - 1]);
			// pathPoints[l - 2] = midpoint(pathPoints[l - 1], pathPoints[l - 3]);

			var backPathIterator = 0;
			var j = -1;
			while(++j < this.train[i].path.previousP.length && this.train[i].path.previousP[j] !== false){
				if(this.train[i].path.previousP[j].dir == 0){
					var k = 0;
					while(++k < this.train[i].path.previousP[j].sec.points.length)
						pathPoints[--backPathIterator] = this.train[i].path.previousP[j].sec.points[k]
				}
				else{
					var k = this.train[i].path.previousP[j].sec.points.length - 1;
					while(k--)
						pathPoints[--backPathIterator] = this.train[i].path.previousP[j].sec.points[k]
				}
			}

			//pathPoints[--backPathIterator] = pathPoints[backPathIterator + 1];
			//pathPoints[backPathIterator + 1] = midpoint(pathPoints[backPathIterator], pathPoints[backPathIterator + 2])

			this.train[i].path.pathPoints = pathPoints;

			/*if(this.pt != undefined){
				v = this.pt.length;
				while(v-- > this.train[i].path.backPathIterator)
				scene.remove(this.pt[v]);
			}

			this.train[i].path.backPathIterator = backPathIterator;

			this.pt = []
			var v = pathPoints.length;
			while(v-- > backPathIterator)
				this.pt.push(testText(v,recalcY(pathPoints[v],40),THREE.Vector3(9,0,0),1,0xff8888,0xffff00))
			*/
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
			curDist: 0,
			curSegDist: 0,
			lastSpeed: 1
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
		this.train[trainNum].engine.userSpeed = this.train[trainNum].engine.opts.top;
		this.train[trainNum].engine.opts.acc = this.train[trainNum].engine.opts.maxAcc;
		this.train[trainNum].path.nextP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,this.train[trainNum].path.currentP.dir))
		this.train[trainNum].path.previousP.push(track.getNextSec(this.train[trainNum].path.currentP.sec.id,(this.train[trainNum].path.currentP.dir)))
		console.log('train added','id: ' + trainNum,this.train[trainNum]);
		scene.add(this.train[trainNum].engine.mesh);
		this.rebuildPath(true, trainNum);

		this.train[trainNum].segmentDistance = this.train[trainNum].path.currentPTotalDist;
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
	}

	this.workJobs = function(dTime){

		dTime /= 1000;
		var i = -1;
		while(i < this.train.length - 1) {
			i++;

			brakeDist = (Math.pow(this.train[i].engine.curSpeed,2)*(9/this.train[i].engine.opts.dec));

			if(this.train[i].engine.curSpeed > 0
				&& (this.train[i].segmentDistance + this.train[i].path.nextPTotalDist < brakeDist)
			){
				this.train[i].engine.userSpeed = 0;
			}
			if(this.train[i].engine.curSpeed < 0
				&& (this.train[i].path.currentPTotalDist - this.train[i].segmentDistance) + this.train[i].path.previousPTotalDist < brakeDist + this.train[i].path.trainLength
			){
				this.train[i].engine.userSpeed = 0;
			}

			var speedWas = this.train[i].engine.curSpeed;

			console.log((this.train[i].engine.curSpeed - (this.train[i].engine.opts.dec * dTime)));

			if((this.train[i].engine.curSpeed + (this.train[i].engine.opts.maxAcc * dTime)) < this.train[i].engine.userSpeed){
				console.log('a');
				this.train[i].engine.curSpeed = this.train[i].engine.curSpeed + (this.train[i].engine.opts.maxAcc * dTime)
			}
			else if((this.train[i].engine.curSpeed - (this.train[i].engine.opts.dec * dTime)) > this.train[i].engine.userSpeed){
				console.log('b');
				this.train[i].engine.curSpeed = this.train[i].engine.curSpeed - (this.train[i].engine.opts.dec * dTime)
			}
			else{
				console.log('c');
				this.train[i].engine.curSpeed = this.train[i].engine.userSpeed
			}

			travDist = this.train[i].engine.curSpeed*dTime;

			if(travDist == 0)
				continue;

			//-- Find Distance on track --//
			//.log(this.train[i].path)
			//.log(this.train[i].curDist, travDist, this.train[i].path.currentP, this.train[i].curPointId)


			if(speedWas == 0 && this.train[i].engine.curSpeed != 0
				|| speedWas > 0 && this.train[i].engine.curSpeed < 0
				|| speedWas < 0 && this.train[i].engine.curSpeed > 0){
					console.log('rebuilding path: ',i)
				this.rebuildPath(true, i);
			}

			var moved = this.moveOnPath(
				this.train[i].curDist,
				travDist,
				this.train[i].path,
				this.train[i].curPointId,
				this.train[i].engine.curSpeed,
				false,
				true
			);


			if(!moved) return -1;

			if((moved.pointId < 0 && this.train[i].path.previousP[0] != false) || (moved.pointId >= this.train[i].path.currentP.sec.points.length && this.train[i].path.nextP[0] != false)){
				this.rebuildPath(false, i);
				this.train[i].curPointId = this.train[i].engine.curSpeed > 0 ? 1 : this.train[i].path.currentP.sec.points.length - 2;
				console.log('poke');
				this.train[i].segmentDistance = this.train[i].path.currentPTotalDist - (this.train[i].curSegDist - this.train[i].curDist);
			}
			else{
				this.train[i].curPointId = moved.pointId;
			}

			this.train[i].segmentDistance -= Math.abs(travDist);

			this.train[i].curDist = moved.remDist;
			console.log(this.train[i].segmentDistance);
			this.train[i].curSegDist = moved.curSegDist;
			this.train[i].engine.mesh.position.set(moved.pos.x,moved.pos.y,moved.pos.z);

			this.train[i].engine.backP = this.moveOnPath(
				this.train[i].curDist,
				-this.train[i].engine.opts.axleOffset,
				this.train[i].path,
				this.train[i].curPointId,
				this.train[i].engine.curSpeed,
				true,
				true
			).pos

			this.train[i].engine.mesh.lookAt(this.train[i].engine.backP);
			this.train[i].engine.mesh.verticesNeedUpdate = true;

			trainTestCube.position.set(this.train[i].engine.backP.x,this.train[i].engine.backP.y,this.train[i].engine.backP.z);

			//-- calc rem T --//
			//-- apply to curP --//

			//then loop through railcars
			j = this.train[i].railcars.length
			while(j--){
				var newpos = this.moveOnPath(
					this.train[i].curDist,
					-this.train[i].railcars[j].distanceBehind,
					this.train[i].path,
					this.train[i].curPointId,
					this.train[i].engine.curSpeed,
					true,
					true
				).pos
				this.train[i].railcars[j].mesh.position.set(newpos.x,newpos.y,newpos.z)

				this.train[i].railcars[j].backP = this.moveOnPath(
					this.train[i].curDist,
					-this.train[i].railcars[j].distanceBehind - this.train[i].railcars[j].opts.axleOffset,
					this.train[i].path,
					this.train[i].curPointId,
					this.train[i].engine.curSpeed,
					true,
					true
				).pos;

				this.train[i].railcars[j].mesh.lookAt(this.train[i].railcars[j].backP);

				if(j == this.train[i].railcars.length - 1)
					trainTestCube.position.set(this.train[i].railcars[j].backP.x,this.train[i].railcars[j].backP.y,this.train[i].railcars[j].backP.z);

				this.train[i].railcars[j].mesh.rotationNeedsUpdate = true;
			}
		}
	}

	this.moveOnPath = function(curDist, moveDist, path, curPointId, trainSpeed, followFlag){
		pathPoints = path.pathPoints;

		if(curPointId == undefined)
			throw new Error('curPointId is undefined');

		var remDist = (curDist + moveDist);

		if(remDist < 0)
			curPointId -= 2;

		var plen = path.currentP.sec.points.length;

		//console.log('cd:',curDist,'plen:',plen,'cpi',curPointId, 'rd:',remDist)
		while(true){

			if(pathPoints[curPointId] == undefined){
				var curPathPart = {
					p1: pathPoints[curPointId + 1],
					p2: midpoint(pathPoints[curPointId + 2],pathPoints[curPointId + 1]),
					p3: pathPoints[curPointId + 2]
				};
			}
			else if(pathPoints[curPointId + 2] == undefined){
				var curPathPart = {
					p1: pathPoints[curPointId],
					p2: midpoint(pathPoints[curPointId],pathPoints[curPointId + 1]),
					p3: pathPoints[curPointId + 1]
				};
			}
			else{
				var curPathPart = {
					p1: pathPoints[curPointId],
					p2: pathPoints[curPointId + 1],
					p3: pathPoints[curPointId + 2],
				};
			}

			var curSegDist = track.lerpDistance(curPathPart);

			//check if we have moved far enough
			if(curSegDist < Math.abs(remDist)){
				//if we havent, adjust the measure and loop again
				remDist += remDist < 0 ? curSegDist : -curSegDist;
				curPointId += (remDist < 0 ? -2 : 2);
			}
			else //otherwise, move on
				break;
		}

		if(remDist < 0)
			remDist = curSegDist + remDist;

		//console.log('rd:',remDist, 'csd:',curSegDist, 'cpi:',curPointId, curPathPart)

		return {
			curSegDist: curSegDist,
			remDist: remDist,
			pointId: curPointId,
			pos: recalcY(track.lerpToDist(curPathPart,remDist),4)
		}
	}
};
train = new trainFunc();
var engines = [];
var railcars = [];

trainTestCube = testCube();
