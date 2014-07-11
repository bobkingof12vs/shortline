<script>

	//--do this first--//

	var loadedObjData = [];
	var countOfLoadedLoaderObjs = 0;
	var loader = new THREE.JSONLoader();

	//load train function
	gOpts = [];
	function jsObjToGlobalMesh(name,opts,objData,callback){
		gOpts[name] = (opts !== undefined) ? opts : {};
		gOpts[name].scale = (gOpts[name].scale !== undefined) ? gOpts[name].scale : new THREE.Vector3(10,10,10);
		console.log('name: '+name,'scale: ');
		//THREE.GeometryUtils.merge(geometry, outlineGeometry(geometry));
		return function(geometry,materials){
			//obj[name].newGeom = geometry;
			//obj[name].newMat = new THREE.MeshFaceMaterial(materials);
			if (objData.type == 'engine') {
				engines[name] = {};
				engines[name].geom = geometry;
				engines[name].mats = materials;
				engines[name].newEngine = function(endPoint){
					//curEndData = endPoints[endPoint];
					return {
						curSpeed: 0,
						curPath: 0,
						userSpeed: objData.top,
						opts: objData
					}
				}
				engines[name].newMesh = function(){
					var retMesh = new THREE.Mesh(engines[name].geom, new THREE.MeshFaceMaterial(engines[name].mats));
					retMesh.scale.set(gOpts[name].scale.x,gOpts[name].scale.y,gOpts[name].scale.z);
					retMesh.castShadow = (gOpts[name].castShadow !== undefined) ? gOpts[name].castShadow : false;
					retMesh.receiveShadow = (gOpts[name].receiveShadow !== undefined) ? gOpts[name].receiveShadow : false;
					return retMesh;
				}
				console.log(engines[name]);
			}
			else if(objData.type == 'railcar'){
				railcars[name] = {};
				railcars[name].geom = geometry;
				railcars[name].mats = materials;
				railcars[name].newOpts = function(){
					return objData;
				}
				railcars[name].newMesh = function(){
					var retMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
					retMesh.scale.set(gOpts[name].scale.x,gOpts[name].scale.y,gOpts[name].scale.z);
					retMesh.castShadow = (gOpts[name].castShadow !== undefined) ? gOpts[name].castShadow : false;
					retMesh.receiveShadow = (gOpts[name].receiveShadow !== undefined) ? gOpts[name].receiveShadow : false;
					return retMesh;
				}
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
	/*function waitForPreLoadObjects(){
		if (
			endPoints.length > 0
		) {*/
			<?php
				$loadObjFiles = glob('loadObjects/*');
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
		/*}
		else{
			setTimeout(waitForPreLoadObjects,20);
		}
	}*/

	function waitForAllLoadedObjs(){
		if (countOfLoadedLoaderObjs == numOfLoaderObjects & numOfLoaderObjects > 0) {
			console.log('num objs loaded: ',countOfLoadedLoaderObjs);
			console.log('obj',obj);
			console.log('engines',engines);
			console.log('railcars',railcars);
			//-- things to do once we have all of our objects loaded --//
			train.addTrain('shunter')
			train.addRailcar('flatcar',0);
			train.addRailcar('flatcar',0);
			train.addRailcar('flatcar',0);
			train.addRailcar('flatcar',0);
			//train.addRailcar('flatcar',train.train.length-1);
			//train.addRailcar('flatcar',train.train.length-1);
			//train.addRailcar('flatcar',train.train.length-1);
			/*setTimeout(function(){
				train.addTrain('shunter');
				train.addRailcar(train.train.length-1);
				train.addRailcar(train.train.length-1);
				train.addRailcar(train.train.length-1);
			},10000);*/
			render();
		}
		else{
			setTimeout(waitForAllLoadedObjs,20);
		}
	}

	//waitForPreLoadObjects();

</script>
