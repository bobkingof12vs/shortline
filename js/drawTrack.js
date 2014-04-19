importScripts('general.js');
import
onmessage = function(oEvent){
	equalXZ(new THREE.Vector3(0,0,0),new THREE.Vector3(1,0,0));
	postMessage(oEvent.data);
}