var i_renderer = new THREE.WebGLRenderer( {antialias:true, alpha:true} );

staticObj = function(){
  this.i_camera_height = 10;
  this.zoom = 15;
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
      obj.i_mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(mat));

      geom.computeBoundingBox();
      var boundBox = geom.boundingBox
      console.log(boundBox)
      var width = boundBox.max.x - boundBox.min.x

      obj.i_camera.left =  width / -obj.zoom ;
      obj.i_camera.right = width / obj.zoom;
      obj.i_camera.top = width / obj.zoom;
      obj.i_camera.bottom = width / -obj.zoom;

      var midpoint = new THREE.Vector3(
        boundBox.min.x + ((boundBox.max.x - boundBox.min.x) / 2),
        3,
        boundBox.min.z + ((boundBox.max.z - boundBox.min.z) / 2)
      )

      obj.i_camera.position.set(midpoint.x - 200,midpoint.y,midpoint.z)
      obj.i_camera.lookAt(midpoint);

      obj.i_scene.add(obj.i_mesh);
      i_renderer.render( obj.i_scene, obj.i_camera );
      obj.image = i_renderer.domElement.toDataURL();
      obj.done = 1;
    });
  }
}
