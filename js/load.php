<script>
	
	//--do this first--//
	generateDrawTrack();
	renderTrack();
	endTrack();

	var loadedObjData = [];
	var countOfLoadedLoaderObjs = 0;
	var loader = new THREE.JSONLoader();
	
	//load train function
	function jsObjToGlobalMesh(name,opts,objData,callback){
		opts = (opts !== undefined) ? opts : {};
		sc = (opts.scale !== undefined) ? opts.scale : new THREE.Vector3(10,10,10);
		//THREE.GeometryUtils.merge(geometry, outlineGeometry(geometry));
		return function(geometry,materials){
			//obj[name].newGeom = geometry;
			//obj[name].newMat = new THREE.MeshFaceMaterial(materials);
			
			if (objData.type == 'engine') {
				engines[name] = {};
				engines[name].opts = objData;
				
				engines[name].startEndPoint = 0; //opts.startEndPoint;
				
				curEndData = endPoints[engines[name].startEndPoint];
				engines[name].curSpeed = 0;
				engines[name].curP = curEndData.end;
				engines[name].curDir = curEndData.dir;
				engines[name].curTrack = curEndData.track;
				
				engines[name].curT = 0;
				engines[name].curPath = 0;
				
				engines[name].newMesh = function(){
					var retMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
					retMesh.scale.set(sc.x,sc.y,sc.z);
					retMesh.castShadow = (opts.castShadow !== undefined) ? opts.castShadow : false;
					retMesh.receiveShadow = (opts.receiveShadow !== undefined) ? opts.receiveShadow : false;
					return retMesh;
				}
				
				console.log('qwerasdc', engines[name].curDir, curEndData.dir)
				console.log(engines[name]);
			}
			else if(objData.type == 'railcar'){
				railcars[name] = {};
				railcars[name].opts = objData;
				railcars[name].newMesh = function(){
					var retMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
					retMesh.scale.set(sc.x,sc.y,sc.z);
					retMesh.castShadow = (opts.castShadow !== undefined) ? opts.castShadow : false;
					retMesh.receiveShadow = (opts.receiveShadow !== undefined) ? opts.receiveShadow : false;
					return retMesh;
				}
				railcars[name].distancebehind = 0;
			}
			else{
				obj[name] = {};
				obj[name].opts = objData;
				obj[name].newMesh = function(){
					var retMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
					retMesh.scale.set(sc.x,sc.y,sc.z);
					retMesh.castShadow = (opts.castShadow !== undefined) ? opts.castShadow : false;
					retMesh.receiveShadow = (opts.receiveShadow !== undefined) ? opts.receiveShadow : false;
					return retMesh;
				}
			}
			console.log('made it here',name,objData);
			countOfLoadedLoaderObjs++;
		}
	}
	
	var numOfLoaderObjects = 0;
	function waitForPreLoadObjects(){
		if (
			endPoints.length > 0
		) {
			<?php
				$loadObjFiles = glob('/Google Drive/webroot/train/loadObjects/*');
				echo "\nnumOfLoaderObjects = ".count($loadObjFiles).';';
				foreach($loadObjFiles as $Loadobjs){
					$ex = explode('/',$Loadobjs);
					$name = end($ex);
					if(strpos($name,'.') === false){
						$data = file_get_contents($Loadobjs);
						echo "\nloadedObjData['$name'] = $data;";
						echo "\nloader.load(
							loadedObjData['$name'].path,
							jsObjToGlobalMesh('$name',loadedObjData['$name'].dispOpts,loadedObjData['$name'])
						);";
					}
				}
			?>
			waitForAllLoadedObjs();
		}
		else{
			setTimeout(waitForPreLoadObjects,20);
		}
	}
	
	function waitForAllLoadedObjs(){
		if (countOfLoadedLoaderObjs == numOfLoaderObjects & numOfLoaderObjects > 0) {
			console.log('num objs loaded: ',countOfLoadedLoaderObjs);
			console.log('obj',obj);
			console.log('engines',engines);
			console.log('railcars',railcars);
			//-- things to do once we have all of our objects loaded --//
			train.addTrain()
			//train.addRailcar(train.train.length-1);
			//train.addRailcar(train.train.length-1);
			render();
		}
		else{
			setTimeout(waitForAllLoadedObjs,20);
		}
	}
	
	waitForPreLoadObjects();
	
</script>