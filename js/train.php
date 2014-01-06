<script>
	var trainFunc = function(){
		this.engines = {}
		this.train = []
		
		this.rebuildPath = function(specNum){
			var i = specNum != undefined ? specNum + 1 : this.train.length;
			var j = specNum != undefined ? specNum     : 0;
			console.log('here',i,j,this.train)
			while(i > j) {
				i--;
				
				//onclick of switch arrow mark that trains need to be checked for changes
				//only if the change switch is checked though
				this.train[i].path = [];
				
				startT = this.train[i].engine.curDir == 1 ? 0 : 1;
				console.log(this.train[i].engine.curTrack);
				this.train[i].path.push(nextTrack(this.train[i].engine.curTrack,startT));
				nextT = true;
				l = 0
				while (nextT !== false & l < 200) {
					
					l++;
					console.log(this.train[i].path.length-1,this.train[i].path[this.train[i].path.length-1].startT);
					nextT = nextTrack(this.train[i].path[this.train[i].path.length-1].num,this.train[i].path[this.train[i].path.length-1].startT)
					this.train[i].path.push(nextT);
					//console.log(this.train[i].path);
				}
				this.train[i].engine.curTrack = this.train[i].path[0].num;
				this.train[i].engine.curT = 0;
				this.train[i].engine.curPath = 0;
				console.log('path',this.train[i].path,k);
			}
		}
		
		this.addTrain = function(){
			this.train.push({
				engine: engines['shunter'],
				railcars: [],
				jobs: {},
				findNextPath: 1,
			});
			console.log('train',this.train)
			this.rebuildPath(this.train.length - 1);
			addTrainMeshFunction = function(){
				console.log('asdfasdf',train.train[train.train.length - 1],train.train.length - 1);
				if (train.train[train.train.length - 1].engine.mesh != undefined) {
					console.log('asdfasdf',train.train[train.train.length - 1],train.train.length - 1);
					scene.add(train.train[train.train.length - 1].engine.mesh);
				}
				else{
					console.log('hereasdf')
					setTimeout(addTrainMeshFunction,20)
				}
			};
			addTrainMeshFunction();
			
			m['m_tad'].e.click();
		}
		
		this.workJobs = function(dTime){
			//check for new trains
			if (m['m_tad'].clicked == 1) {
				this.addTrain();
			}
			
			dTime /= 1000;
			var i = this.train.length;
			while(i > 0) {
				i--;
				this.train[i].engine.curSpeed += this.train[i].engine.acc*dTime;
				travDist = this.train[i].engine.curSpeed*dTime;
				brakeDist = ((this.train[i].engine.curSpeed*this.train[i].engine.dec)/60)+travDist;
				
				//-- follow path --//
				//-- find dist left --//
				curTrackRemDist = lengthOfTrack(this.train[i].engine.curTrack,
					{startT: this.train[i].engine.curT
				});
				//-- compare to travel --//
				remDist = travDist - curTrackRemDist;
				curTrackLen = this.train[i].path[this.train[i].engine.curPath].len;
				if ( remDist < 0) {
					//remDist is a negative number, so we ADD it! not subtract!
					//this.train[i].engine.curT = ((curTrackLen + remDist) / curTrackLen);
					lenTPlus = lengthOfTrack(this.train[i].engine.curTrack,
						{startT: this.train[i].engine.curT,
						 endT: this.train[i].engine.curT + .01,
						 numBreaks: 1
					});
					//.01/lenTPlus = x/-remDist
					this.train[i].engine.curT += ((travDist*.01)/lenTPlus);
				}
				else{
					//-- if remainder, compare to next track length --//
					//-- subtract distance from other tracks (if not the same track) --//
					j = this.train[i].engine.curPath;
					this.train[i].engine.curPath++;
					while (j < this.train[i].path.length - 2){
						j++;
						if (travDist <= this.train[i].path[j].len	) {
							console.log('here');
							this.train[i].engine.curT = (travDist/this.train[i].path[j].len);
							break;
						}
						else{
							console.log('here')
							travDist -= this.train[i].path[j].len;
							this.train[i].engine.curPath++;
						}
					}
				}
				//console.log(this.train[i].engine.curT,this.train[i].engine.curTrack,this.train[i].engine.curPath,this.train[i].engine.curSpeed,dTime,travDist,brakeDist);
				//-- move remaining distance --//
				this.train[i].engine.curP = lerp(
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p1,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p2,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p2,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p3,
					this.train[i].engine.curT);
				//-- find dist + .001 for rotation --//
				pointAt = lerp(
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p1,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p2,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p2,
					drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p3,
					(this.train[i].engine.curT + .01));
				//console.log(this.train[i].engine.curPath,this.train[i].path[this.train[i].engine.curPath].num,drawTrack[this.train[i].path[this.train[i].engine.curPath].num].p1);
				
				
				//-- update train --//
				if (this.train[i].engine.mesh != undefined) {
					this.train[i].engine.mesh.position = this.train[i].engine.curP;
					this.train[i].engine.mesh.lookAt(pointAt)
					this.train[i].engine.mesh.rotationNeedsUpdate = true;
				}
				//this.train[i].engine.mesh.geometry.verticesNeedUpdate = true; 
			}
		}
	};
	train = new trainFunc();
	var engines = [];
	var railcars = [];
	
	function engine(mesh,opts){
			opts = opts != undefined ? opts : {};
			engines[mesh] = {};
			engines[mesh].acc = opts.acceleration != undefined ? opts.acceleration : 1;
			engines[mesh].top = opts.topSpeed != undefined ? opts.topSpeed : 100;
			engines[mesh].dec = opts.deceleration != undefined ? opts.deceleration : 100;
			
			engines[mesh].startEndPoint = opts.startEndPoint != undefined ? opts.startEndPoint : 0;
			
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
					console.log(engines);
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
							dec: {$in['dec']}
						}
					);";
				}
			}
		?>
	}
	if (endPoints !== undefined & engines == undefined) {
		initEngines();
		train.addTrain();
		train.rebuildPath();
		console.log('engines',engines);
	}
	

</script>

c