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
		console.log('name: '+name,'scale: ',gOpts[name].scale);
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
				worldObj[name] = {};
				worldObj[name].opts = objData;
				worldObj[name].newMesh = function(){
					var retMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
					retMesh.scale.set(gOpts[name].scale.x,gOpts[name].scale.y,gOpts[name].scale.z);
					retMesh.castShadow = (opts.castShadow !== undefined) ? opts.castShadow : false;
					retMesh.receiveShadow = (opts.receiveShadow !== undefined) ? opts.receiveShadow : false;
					return retMesh;
				}
			}
			console.log('made it here',name,objData);
			countOfLoadedLoaderObjs++;
		}
	}

	/*function waitForPreLoadObjects(){
		if (
			endPoints.length > 0
		) {*/
			<?php
				$loadObjFiles = array_merge(glob('loadObjects/train/*'), glob('loadObjects/building/*'));
				//glob('loadObjects/buildings/*');
				//echo "\nconsole.log(".json_encode($loadObjFiles).")";
				$numLoaded = 0;
				foreach($loadObjFiles as $Loadobjs){
					$ex = explode('/',$Loadobjs);
					$name = end($ex);
					if(strpos($name,'.') === false){
						$numLoaded++;
						echo "console.log('@@@$name');";
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
		if (countOfLoadedLoaderObjs == <?= $numLoaded; ?> & <?= $numLoaded; ?> > 0) {
			console.log('num objs loaded: ',<?= $numLoaded; ?>);
			console.log('worldObj',worldObj);
			console.log('engines',engines);
			console.log('railcars',railcars);
			//-- things to do once we have all of our objects loaded --//
			/*train.addTrain('steamer040');
			train.addRailcar('gondolacar',0);
			train.addRailcar('boxcar',0);
			train.addRailcar('passengercar',0);
			train.addRailcar('passengercar',0);
			setTimeout(function(){
				train.addTrain('shunter');
				train.addRailcar('flatcar',train.train.length-1);
				train.addRailcar('flatcar',train.train.length-1);
				train.addRailcar('flatcar',train.train.length-1);
			},10000);*/
			render();
		}
		else{
			setTimeout(waitForAllLoadedObjs,20);
		}
	}

	//waitForPreLoadObjects();

window.addEventListener('load', function(){
	runNextAddTrainItem([
		<?php
			$loadObjFiles = glob('loadObjects/train/*');
			foreach($loadObjFiles as $Loadobjs){
				$ex = explode('/',$Loadobjs);
				if(strpos(end($ex),'.') === false){
					echo file_get_contents($Loadobjs).",";
				}
			}
		?>
	],0,function(){
		building.runNextAddBuildingItem([
			<?php
				$loadObjFiles = glob('loadObjects/building/*');
				foreach($loadObjFiles as $Loadobjs){
					$ex = explode('/',$Loadobjs);
					if(strpos(end($ex),'.') === false){
						echo file_get_contents($Loadobjs).",";
					}
				}
			?>
		],0,function(){
			displayOneType('engine');
		});
	});
});



</script>
