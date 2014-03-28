<script>
trackPoints = [
	{p1: new THREE.Vector3(-50,  0,-50),
	 p2: new THREE.Vector3(-50,  0,  0),
	 p3: new THREE.Vector3(-50,  0, 50)
	},
	{p1: new THREE.Vector3(50,  0,-50),
	 p2: new THREE.Vector3(50,  0,-150),
	 p3: new THREE.Vector3(50,  0,-250)
	},
	{p1: new THREE.Vector3(-50,  0, 50),
	 p2: new THREE.Vector3(  0,  0, 50),
	 p3: new THREE.Vector3( 50,  0, 50)
	},
	{p1: new THREE.Vector3( 50,  0, 50),
	 p2: new THREE.Vector3( 50,  0,  0),
	 p3: new THREE.Vector3( 50,  0,-50)
	},
	{p1: new THREE.Vector3( -50,  0,-50),
	 p2: new THREE.Vector3(-100,  0,-50),
	 p3: new THREE.Vector3(-150,  0,-50)
	},
	{p1: new THREE.Vector3(-150,  0,-50),
	 p2: new THREE.Vector3(-200,  0,-50),
	 p3: new THREE.Vector3(-250,  0,-50)
	},
	{p1: new THREE.Vector3(-250,  0,-50),
	 p2: new THREE.Vector3(-300,  0,-50),
	 p3: new THREE.Vector3(-350,  0,-50)
	},
	{p1: new THREE.Vector3(-150,  0,-50),
	 p2: new THREE.Vector3(-150,  0,-100),
	 p3: new THREE.Vector3(-150,  0,-150)
	},
	{p1: new THREE.Vector3(-150,  0,-150),
	 p2: new THREE.Vector3(-150,  0,-200),
	 p3: new THREE.Vector3(-150,  0,-250)
	}
];

trackSections = [];
function buildSections(){
	switches = [];
	
	function findMatch(p1){
		var j = trackPoints.length;
		var count = 0;
		while (j > 0){
			j--;
			if (equalXZ(p1, trackPoints[j].p1) | equalXZ(p1, trackPoints[j].p3)) {
				count++;
			}
		}
	}
	
	var i = trackPoints.length;
	
	while (i > 0){
		if(findMatch(trackPoints[i].p1 > 2)){
			switches.push(trackPoints[i].p1);
		}
		else if(findMatch(trackPoints[i].p3 > 2)){
			switches.push(trackPoints[i].p3);
		}
	}
	
	switches = switches.filter(function(elem, pos, self) {
		return self.indexOf(elem) == pos;
	});
	
	console.log('switches',switches);
	
}</script>