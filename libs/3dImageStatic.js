var i_renderer = new THREE.WebGLRenderer( {antialias:true, alpha:true} );
staticObj = function(){
  this.i_camera_height = 10;
  this.zoom = 7;
  this.loadFile = function(obj_file,i_el){
    var i_el_box = i_el.getBoundingClientRect()

    //-- init scene --//
    this.i_scene = new THREE.Scene();

    this.i_camera =  new THREE.OrthographicCamera(i_el_box.width / -this.zoom, i_el_box.width / this.zoom, i_el_box.height / this.zoom, i_el_box.height / -this.zoom, -1, 1000);
    this.i_scene.add(this.i_camera);

    var i_ambientLight = new THREE.AmbientLight(0x555555);
    this.i_scene.add(i_ambientLight);

    var i_light1 = new THREE.PointLight(0xffffff);
    i_light1.position.set(-100,5,0);
    i_light1.lookAt(new THREE.Vector3(0,0,0));
    this.i_scene.add(i_light1);


    i_renderer.setSize(i_el_box.width, i_el_box.height);
    i_renderer.setClearColor( 0x000000, 0 );

    //-- init object --//
    this.i_mesh;
    this.done = 0;
    var i_loader = new THREE.JSONLoader();
    i_loader.load(obj_file,function(geom,mat){
      tempObj.i_mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(mat));

      geom.computeBoundingBox();
      var boundBox = geom.boundingBox

      var width = boundBox.max.x - boundBox.min.x

      tempObj.i_camera.left =  width // -tempObj.zoom ;
      tempObj.i_camera.right = width // tempObj.zoom;
      tempObj.i_camera.top = width /// tempObj.zoom;
      tempObj.i_camera.bottom = width // -tempObj.zoom;

      var midpoint = new THREE.Vector3(
        boundBox.min.x + ((boundBox.max.x - boundBox.min.x) / 2),
        3,
        boundBox.min.z + ((boundBox.max.z - boundBox.min.z) / 2)
      )

      tempObj.i_camera.position.x = midpoint.x - 1000
      tempObj.i_camera.position.y = midpoint.y
      tempObj.i_camera.position.z = midpoint.z
      tempObj.i_camera.lookAt(midpoint);

      tempObj.i_scene.add(tempObj.i_mesh);
      i_renderer.render( tempObj.i_scene, tempObj.i_camera );
      tempObj.image = i_renderer.domElement.toDataURL();
      tempObj.done = 1;
    });
  }
}
