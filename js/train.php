<script>
	var trainFunc = function(){
		this.engines = {}
		this.train = []
		
		this.rebuildPath = function(specNum){
			var i = specNum != undefined ? specNum + 1 : this.train.length;
			var j = specNum != undefined ? specNum     : 0;
			console.log('here',i,j,train)
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
			this.rebuildPath(this.train.length - 1);
			m['m_tad'].e.click();
		}
		
		this.workJobs = function(dTime){
			//check for new trains
			if (m['m_tad'].clicked == 1) {
				this.addTrain();
			}
			
			var i = this.train.length;
			while(i > 0) {
				i--;
				/*
				get distance from stop and compare to brakes
					check if (there is a job for that) {
						follow that job
					}
				while distance left to travel < distance left on track
				for that track
					if  it is a swithc
						run what it says to do for a switch
					if (it is a continuation) {
						just subtract length
					}
					if (you come past an event spot) {
						//code
					}
				*/
				dTime /= 1000;
				this.train[i].engine.speed += this.train[i].engine.acc*dTime;
				travDist = this.train[i].speed*dTime;
				brakeDist = ((this.train[i].speed*this.train[i].engine.dec)/60)+travDist;
				
				//-- follow path --//
				//-- find dist left --//
				dDist = lengthOfTrack(this.train[i].engine.curTrack,
					{startT: this.train[i].engine.curT
				});
				//-- compare to travel --//
				remDist = travDist + dDist;
				if (remDist <= this.train[i].path[this.train[i].engine.curPath].len	) {
					this.train[i].engine.curT = (remDist/this.train[i].path[this.train[i].engine.curPath].len);
				}
				else{
					//-- if remainder, compare to next track length --//
					//-- subtract distance from other tracks (if not the same track) --//
					travDist -= dDist;
					j = this.train[i].engine.curPath - 1;
					while (j < this.train[i].path.length){
						j++;
						if (travDist <= this.train[i].path[j].len	) {
							this.train[i].engine.curT = (travDist/this.train[i].path[j].len);
						}
						else{
							travDist -= this.train[i].path[j].len;
							this.train[i].engine.curPath++;
						}
					}
				}
				console.log(this.train[i].engine.curTrack,this.train[i].engine.curT,this.train[i].engine.curPath);
					//-- move remaining distance --//
					//-- find dist + .001 for rotation --//
					//-- update train --//
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