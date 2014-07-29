
var i_image_data;
var i_camera_height = 150;

objectInit = function(train_js,i_id,rot){
  var i_el = document.getElementById( i_id )
  var i_el_box = i_el.getBoundingClientRect()
  //-- init scene --//
  this.i_scene = new THREE.Scene();

  var I_VIEW_ANGLE = 45;
  var I_ASPECT = i_el_box.width / i_el_box.height
  var I_NEAR = 0.1
  var I_FAR = 20000;
  var zoom = 15;
  this.i_camera =  new THREE.OrthographicCamera(window.innerWidth / -zoom, window.innerWidth / zoom, window.innerHeight / zoom, window.innerHeight / -zoom, -1, 100000);

  this.i_camera.position = new THREE.Vector3(100,5,100);
  this.i_camera.lookAt(new THREE.Vector3(0,0,0));
  this.i_scene.add(this.i_camera);


  var i_ambientLight = new THREE.AmbientLight(0x555555);
  this.i_scene.add(i_ambientLight);

  var i_light1 = new THREE.PointLight(0xffffff);
  i_light1.position.set(0,-10,250);
  i_light1.lookAt(new THREE.Vector3(0,0,0));
  this.i_scene.add(i_light1);

  var i_light2 = new THREE.PointLight(0xffffff);
  i_light2.position.set(250,-10,-150);
  i_light2.lookAt(new THREE.Vector3(0,0,0));
  this.i_scene.add(i_light2);

  var i_light3 = new THREE.PointLight(0xffffff);
  i_light3.position.set(-150,100,-150);
  i_light3.lookAt(new THREE.Vector3(0,0,0));
  this.i_scene.add(i_light3);

  this.i_renderer = new THREE.WebGLRenderer( {antialias:true} );
  this.i_renderer.setSize(i_el_box.width, i_el_box.height);
  this.i_renderer.setClearColorHex(0x333F47, 1);

  this.i_controls = new THREE.OrbitControls( this.i_camera, this.i_renderer.domElement );
  this.i_controls.maxPolarAngle = Math.PI/2.5;
  this.i_controls.noZoom = true;
  console.log(this.i_controls);

  i_el.appendChild(this.i_renderer.domElement);

  //-- init object --//
  this.i_mesh;
  var i_loader = new THREE.JSONLoader();
  i_model = i_loader.parse(JSON.parse(train_js))
  console.log(i_model);
  this.i_mesh = new THREE.Mesh( i_model.geometry, new THREE.MeshFaceMaterial( i_model.materials ) );
  this.i_mesh.scale.set(10,10,10)
  this.i_mesh.position.set(0,0,10);
  this.i_scene.add(this.i_mesh);

  this.rend = function(){
    obj.i_controls.update();
    obj.i_renderer.render( obj.i_scene, obj.i_camera );
    setTimeout(obj.rend,200);
  }

  this.objPosSet = function(scale){
    this.i_mesh.scale.set(scale,scale,scale);
    this.rend();
  }

  this.getPic = function(){
    return this.i_renderer.domElement.toDataURL();
  }

  function i_wait(){
    if(this.i_mesh == undefined)
      setTimeout(i_wait,300);
    else
      this.rend();
  }

  i_wait();

  this.i_renderer.domElement.addEventListener( 'mousewheel', function( event ) {
    event.preventDefault();
    event.stopPropagation();

    var delta = 0;
    delta = event.wheelDelta * .001;
    if (((zoom + delta > .5) & delta < 0) | ((zoom + delta < 25) & delta > 0)) {
      zoom += delta;
    }

    obj.i_camera.left = window.innerWidth / -zoom;
    obj.i_camera.right = window.innerWidth / zoom;
    obj.i_camera.top = window.innerHeight / zoom;
    obj.i_camera.bottom = window.innerHeight / -zoom;

    obj.i_camera.updateProjectionMatrix();
  },false);

}
