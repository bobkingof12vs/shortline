<script>
	var train = [];
	var engines = [];
	var railcars = [];
	
	function engine(){
		this.init = function(mesh,opts){
			opts = opts != undefined ? opts : {};
			this.acc = opts.acceleration != undefined ? opts.acceleration : 1;
			this.top = opts.topSpeed != undefined ? opts.topSpeed : 100;
			this.dec = opts.deceleration != undefined ? opts.deceleration : 1;
			
			this.startEndPoint = opts.startEndPoint != undefined ? opts.startEndPoint : 0;
			
			this.curSpeed = 0;
			this.curP = endPoints[startEndPoint].end;
			this.curDir = endPoints[startEndPoint].dir;
			this.curTrack = endPoints[startEndPoint].track;
			
			loader.load("js/trains/"+mesh+".js", jsObjToGlobalMesh(mesh));
			while (globalMesh[mesh] !== undefined){}
		}
	}


<?php

	foreach(glob('/Google Drive/webroot/train/engines/*') as $engines){
		eval('$in = array('.file_get_contents($engines).');');
		
		$ex = explode('/',$engines);
		$name = end($ex);
		
		echo "engine[$name] = new engine();
		engine[$name].init(
			$name,{
				acc: {$in['acc']},
				top: {$in['top']},
				dec: {$in['dec']}
			}
		);";
	}
?>


</script>