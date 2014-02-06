<script>
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
			//this.rebuildPath(this.train.length - 1);
			addTrainMeshFunction = function(){
				if (train.train[train.train.length - 1].engine.mesh != undefined) {
					scene.add(train.train[train.train.length - 1].engine.mesh);
				}
				else{
					setTimeout(addTrainMeshFunction,20)
				}
			};
			addTrainMeshFunction();
		}
		
		this.followBehind = function(i,distanceBehind){
			
			curPath = this.train[i].pathHistory.length - (this.train[i].path.length - this.train[i].engine.curPath - 2) - 1;
			//-- follow path --//
			//-- find dist left --//
			curTrackRemDist = lengthOfTrack(this.train[i].engine.curTrack,
				{startT: this.train[i].engine.curT,
				endT: (this.train[i].pathHistory[curPath].endT == 1 ? 0 : 1)
			});
			
			//-- compare to travel --//
			remDist = distanceBehind - curTrackRemDist;
			curTrackLen = this.train[i].pathHistory[curPath].len;
			if ( remDist < 0) {
				lenTPlus = lengthOfTrack(this.train[i].engine.curTrack,
					{startT: this.train[i].engine.curT,
					 endT: this.train[i].engine.curT + .01,
					 numBreaks: 3
				});
				//.01/lenTPlus = x/-remDist
				toCalcT = this.train[i].engine.curT + (this.train[i].pathHistory[curPath].endT == 0 ? (distanceBehind*.01)/lenTPlus : -(distanceBehind*.01)/lenTPlus)
			}
			else{
				//-- if remainder, compare to \next track length --//
				//-- subtract distance from other tracks (if not the same track) --//
				curPath--;
				while (curPath > 0 & remDist > this.train[i].pathHistory[curPath].len	){
					remDist -= this.train[i].pathHistory[curPath].len;
					curPath--;
				}
				if (curPath >= 0) {
					toCalcT = (this.train[i].pathHistory[curPath].endT == 0 ? (remDist/this.train[i].pathHistory[curPath].len) : 1-(remDist/this.train[i].pathHistory[curPath].len));
				}
				else{
					return false;
				}	
			}
			
			return lerp(
				drawTrack[this.train[i].pathHistory[curPath].num].p1,
				drawTrack[this.train[i].pathHistory[curPath].num].p2,
				drawTrack[this.train[i].pathHistory[curPath].num].p2,
				drawTrack[this.train[i].pathHistory[curPath].num].p3,
				toCalcT
			);
		}
		
		this.workJobs = function(dTime){
			//check for new trains
			if (m['m_tad'].clicked == 1) {
				this.addTrain();
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
				
				this.train[i].engine.curSpeed += this.train[i].engine.acc*dTime;
				travDist = this.train[i].engine.curSpeed*dTime;
				brakeDist = ((this.train[i].engine.curSpeed*this.train[i].engine.dec)/60)+travDist;
				
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
						console.log(this.train[i].path[this.train[i].engine.curPath])
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
				this.train[i].engine.back = this.followBehind(i,this.train[i].engine.axleOffset);
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
				/*
				//then loop through railcars
				j = this.train[i].railcars.length
				while(j > 0){
					j--;
					//-- find front and back based on distance behind curP --//
					front = this.followBehind(i,this.train[i].railcar[j].distanceBehind);
					back = this.followBehind(i,this.train[i].railcar[j].distanceBehind + this.train[i].railcar[j].axleOffset);
					
					if (front != false & back != false) {
						back.y = findY(back.x,back.z);
						front.y = findY(front.x,front.z);
						this.train[i].railcar[j].front = front;
						this.train[i].railcar[j].back = back;
					}
					else if (front != false & back == false) {
						front.y = findY(front.x,front.z);
						this.train[i].railcar[j].front = front;
						this.train[i].railcar[j].back = this.train[i].engine.back;
						
					}
					else{
						this.train[i].railcar[j].front = this.train[i].engine.front;
						this.train[i].railcar[j].back = this.train[i].engine.back;
					}
					
					this.train[i].railcar[j].mesh.position = this.train[i].railcar[j].front;
					this.train[i].railcar[j].mesh.lookAt(this.train[i].railcar[j].back);
					this.train[i].railcar[j].mesh.rotationNeedsUpdate = true;
				}*/
			}
		}
	};
	train = new trainFunc();
	var engines = [];
	var railcars = [];
	
	function engine(mesh,opts){
			engines[mesh] = {};
			engines[mesh].acc = opts.acc;
			engines[mesh].top = opts.top;
			engines[mesh].dec = opts.dec;
			
			engines[mesh].axleOffset = opts.axleOffset;
			engines[mesh].sizeLength = opts.sizeLength;
			
			engines[mesh].startEndPoint = 0; //opts.startEndPoint;
			
			engines[mesh].curSpeed = 0;
			engines[mesh].curP = endPoints[engines[mesh].startEndPoint].end;
			engines[mesh].curDir = endPoints[engines[mesh].startEndPoint].dir;
			engines[mesh].curTrack = endPoints[engines[mesh].startEndPoint].track;
			
			engines[mesh].curT = 0;
			engines[mesh].curPath = 0;
			
			console.log(engines[mesh]);
			loader.load("js/trains/"+mesh+".js", jsObjToGlobalMesh(mesh));
			
			var f = function(){
				if (globalMesh[mesh] != undefined) {
					engines[mesh].mesh = globalMesh[mesh];
					console.log('engine '+mesh, engines[mesh]);
				}
				else{
					setTimeout(f,10);
				}
			}
			f();
	}
	
	function initEngines(){
		<?php
			foreach(glob('/Google Drive/webroot/train/engines/*') as $engines){
				
				$ex = explode('/',$engines);
				$name = end($ex);
				if(strpos($name,'.') === false){
					eval('$in = array('.file_get_contents($engines).');');
					echo "
					engine(
						'$name',{
							acc: {$in['acc']},
							top: {$in['top']},
							dec: {$in['dec']},
							axleOffset: {$in['axleOffset']},
							sizeLength: {$in['sizeLength']},
						}
					);";
				}
			}
		?>
	}
	if (endPoints !== undefined & engines == undefined) {
		initEngines();
		train.addTrain();
		//train.rebuildPath();
		console.log('engines',engines);
	}
	

</script>