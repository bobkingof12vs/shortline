var trainFunc = function(){
	this.engines = {}
	this.train = []
	
	this.rebuildPath = function(specNum){
		var i = specNum != undefined ? specNum + 1 : this.train.length;
		var j = specNum != undefined ? specNum     : 0;
		
		while(i > j) {
			i--;
			
			//onclick of switch arrow mark that trains need to be checked for changes
			//only if the change switch is checked though
			var nextT = nextTrack(
				this.train[i].path[this.train[i].path.length - 2 ].num,
				this.train[i].path[this.train[i].path.length - 2 ].endT,
				this.train[i].path[this.train[i].path.length - 2 ].s
			);
			this.train[i].path = [];
			this.train[i].path.push(nextT);
			l = 1;
			while (nextT !== false & l < this.train[i].pathMaxLength) {
				l++;
				nextT = nextTrack(
					this.train[i].path[this.train[i].path.length-1].num,
					this.train[i].path[this.train[i].path.length-1].endT,
					this.train[i].path[this.train[i].path.length - 1 ].s
				);
				this.train[i].path.push(nextT);
			}
			
			if (this.train[i].path[this.train[i].path.length -1 ] != false) {
				this.train[i].path.push(false);
			}
			
			this.train[i].pathHistory = this.train[i].pathHistory.concat(this.train[i].path);
			this.train[i].pathHistory = this.train[i].pathHistory.slice(Math.max(this.train[i].pathHistory.length - 100, 0));
			this.train[i].pathHistory = this.train[i].pathHistory.filter(function(elem) {
				return elem;
			});
			
			console.log('history',this.train[i].pathHistory)
			
			this.train[i].engine.curTrack = this.train[i].path[0].num;
			this.train[i].engine.curT = 0;
			this.train[i].engine.curPath = 0;
			this.train[i].engine.curDir = this.train[i].path[0].dir
			
			console.log('path',this.train[i].path,k);
			
		}
	}
	
	this.addTrain = function(){
		this.train.push({
			engine: engines['shunter'],
			railcars: [],
			jobs: {},
			pathMaxLength: 2,
			pathHistory: [{type: 'track', num: engines['shunter'].curTrack, startT: 0, endT: 1, len: lengthOfTrack(engines['shunter'].curTrack)}],
			path: [{type: 'track', num: engines['shunter'].curTrack, startT: 0, endT: 1, len: lengthOfTrack(engines['shunter'].curTrack)},false]
		});
		this.train[this.train.length-1].engine.mesh = engines['shunter'].newMesh();
		console.log('train added','id: ' + this.train.length,this.train[this.train.length-1])
		scene.add(this.train[this.train.length-1].engine.mesh);
	}
	
	this.carDistBehindEngineCurP = function(i,j){
		var dist = ((this.train[i].engine.opts.sizeLength - this.train[i].engine.opts.axleOffset)/2) + this.train[i].engine.opts.axleOffset;
		for(k = 0; k < j; k++){
			dist += this.train[i].railcars[k].opts.sizeLength + 5;
		}
		return (dist + ((this.train[i].railcars[j].opts.sizeLength - this.train[i].railcars[j].opts.axleOffset)/2))
	}
	
	this.addRailcar = function(i){
		this.train[i].railcars.push(railcars['flatcar']);
		this.train[i].railcars[this.train[i].railcars.length - 1].mesh = this.train[i].railcars[this.train[i].railcars.length - 1].newMesh();
		this.train[i].railcars[this.train[i].railcars.length - 1].distanceBehind = this.carDistBehindEngineCurP(i,this.train[i].railcars.length - 1);
		scene.add(this.train[i].railcars[this.train[i].railcars.length - 1].mesh);
		
		console.log('railcar',this.train[i].railcars)
		
	}
	
	this.followBehind = function(i,distanceBehind){
		
		curPath = this.train[i].pathHistory.length - (this.train[i].path.length - (this.train[i].engine.curPath + 2)) - 1;
		//-- follow path --//
		//-- find dist left behind point--//
		curLen = lengthOfTrack(this.train[i].pathHistory[curPath].num,
			{startT: (this.train[i].pathHistory[curPath].endT),
			endT: this.train[i].engine.curT
		});
		//console.log(varC);
		//-- compare to travel --//
		//console.log('r',varR);
		//curTrackLen = this.train[i].pathHistory[curPath].len;
		
		if (distanceBehind + curLen < this.train[i].pathHistory[curPath].len) {
			color = 0xff0000;
			toCalcT = getTFromDist(
				this.train[i].pathHistory[curPath].num,
				this.train[i].pathHistory[curPath].endT,
				curLen + distanceBehind
			);
		}
		else{
			color = 0x0000ff;
			//-- if remainder, compare to \next track length --//
			//-- subtract distance from other tracks (if not the same track) --//
			distanceBehind -= (this.train[i].pathHistory[curPath].len - curLen);
			curPath--;
			while (curPath > 0 & distanceBehind > this.train[i].pathHistory[curPath].len){
				distanceBehind -= this.train[i].pathHistory[curPath].len;
				curPath--;
				if (curPath < 0) {return false;}
			}
			if (curPath >= 0 & distanceBehind >= 0) {
				toCalcT = getTFromDist(
					this.train[i].pathHistory[curPath].num,
					this.train[i].pathHistory[curPath].endT,
					distanceBehind
				);
			}
			else{
				console.log('returned false in distanceBehind')
				return false;
			}	
		}
		
		ret = lerp(
			drawTrack[this.train[i].pathHistory[curPath].num].p1,
			drawTrack[this.train[i].pathHistory[curPath].num].p2,
			drawTrack[this.train[i].pathHistory[curPath].num].p2,
			drawTrack[this.train[i].pathHistory[curPath].num].p3,
			toCalcT
		);
		
		//testCube(ret,color);
		return ret;
	}
	
	this.workJobs = function(dTime){
		//check for new trains
		if (m['m_tad'].clicked == 1) {
			this.addTrain();
			this.addRailcar(this.train.length-1);
			m['m_tad'].e.click();
		}
		
		dTime /= 1000;
		var i = -1;
		while(i < this.train.length - 1) {
			i++;
			
			if (this.train[i].path[this.train[i].engine.curPath] == false) {
				console.log('rebuild from false here');
				this.rebuildPath(i);
			}
			
			if((this.train[i].engine.curSpeed + this.train[i].engine.opts.acc*dTime) < this.train[i].engine.opts.top){
				this.train[i].engine.curSpeed += this.train[i].engine.opts.acc*dTime;
			}
			else if(this.train[i].engine.curSpeed != this.train[i].engine.opts.top){
				this.train[i].engine.curSpeed = this.train[i].engine.opts.top
			}
			travDist = this.train[i].engine.curSpeed*dTime;
			brakeDist = ((this.train[i].engine.curSpeed*this.train[i].engine.opts.dec)/60)+travDist;
						
			//-- follow path --//
			//-- find dist left --//
			curTrackRemDist = lengthOfTrack(this.train[i].engine.curTrack,
				{startT: this.train[i].engine.curT,
				endT: this.train[i].path[this.train[i].engine.curPath].endT
			});
			//-- compare to travel --//
			remDist = travDist - curTrackRemDist;
			curTrackLen = this.train[i].path[this.train[i].engine.curPath].len;
			if ( remDist < 0) {
				lenTPlus = lengthOfTrack(this.train[i].engine.curTrack,
					{startT: this.train[i].engine.curT,
					 endT: this.train[i].engine.curT + .01,
					 numBreaks: 3
				});
				//.01/lenTPlus = x/-remDist
				this.train[i].engine.curT += (this.train[i].path[this.train[i].engine.curPath].endT == 1 ? (travDist*.01)/lenTPlus : -(travDist*.01)/lenTPlus)
			}
			else{
				//-- if remainder, compare to \next track length --//
				//-- subtract distance from other tracks (if not the same track) --//
				
				while (this.train[i].engine.curPath < this.train[i].path.length - 1){
					this.train[i].engine.curPath++;
					if (this.train[i].path[this.train[i].engine.curPath] == false) {
						this.rebuildPath(i);
						this.train[i].engine.curPath = 0;
					}
					if (remDist <= this.train[i].path[this.train[i].engine.curPath].len	) {
						this.train[i].engine.curT = (this.train[i].path[this.train[i].engine.curPath].endT == 1 ? (remDist/this.train[i].path[this.train[i].engine.curPath].len) : 1 - (remDist/this.train[i].path[this.train[i].engine.curPath].len));
						break;
					}
					else{
						remDist -= this.train[i].path[this.train[i].engine.curPath].len;
						this.train[i].engine.curPath++;
					}
				}
			}
			
			//-- move to new point --//
			this.train[i].engine.curP = lerp(
				drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p1,
				drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p2,
				drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p2,
				drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p3,
				(this.train[i].engine.curT));
			this.train[i].engine.curP.y = findY(this.train[i].engine.curP.x,this.train[i].engine.curP.z);
			
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