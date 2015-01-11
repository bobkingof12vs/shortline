treeFunc = function(){

  this.trees = []

  this.leafA = {}
  this.leafA.shape = new THREE.Shape();
  this.leafA.shape.moveTo(   0,   0);
  this.leafA.shape.lineTo(  .1,  .1);
  this.leafA.shape.lineTo(  .2,  .1);
  this.leafA.shape.lineTo( .25, -.125);
  this.leafA.shape.lineTo( .15, -.15);
  this.leafA.shape.lineTo(   0,   0);
  this.leafA.geometry = new THREE.ShapeGeometry( this.leafA.shape );
  this.leafA.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );

  this.growToPoint = function(originStart, originEnd, thickness, opts){
    opts = opts != undefined ? opts : {};
    var minLength = opts.minLength != undefined ? opts.minLength : thickness;
    var maxLength = opts.maxLength != undefined ? opts.maxLength : minLength;
    var rFactor = opts.rFactor != undefined ? opts.rFactor : 1;
    var rotation = opts.rotation != undefined ? opts.rotation : Math.PI / 4;
    if(originStart.x == originEnd.x && originStart.y == originEnd.y && originStart.z == originEnd.z)
      return false;

    var growDir = new THREE.Vector3(
      originEnd.x - originStart.x,
      originEnd.y - originStart.y,
      originEnd.z - originStart.z
    );

    var b = new THREE.Vector3(
      Math.random() - .5,
      Math.random() - .5,
      Math.random() - .5
    );

    var perpAxis = new THREE.Vector3(
      ((growDir.y * b.z) - (growDir.z * b.y)),
      ((growDir.z * b.x) - (growDir.x * b.z)),
      ((growDir.x * b.y) - (growDir.y * b.x))
    );

    var growLength = minLength + (Math.random()*(maxLength - minLength));

    var matrix = new THREE.Matrix4().makeRotationAxis( perpAxis, rotation );

    growDir.applyMatrix4( matrix );

    var curDist = growDir.distanceTo(new THREE.Vector3(0,0,0));

    var resize = growLength / curDist;

    return new THREE.Vector3(
      originStart.x + (growDir.x * resize),
      originStart.y + (growDir.y * resize),
      originStart.z + (growDir.z * resize)
    );
  }

  this.addLeaves = function(originStart, originEnd, thickness, numLeaves){
    twigs = []
    for(var i = 0; i < numLeaves; i++){
      var r = Math.random();
      var newStart = new THREE.Vector3(
        originStart.x + (r*(originEnd.x - originStart.x)),
        originStart.y + (r*(originEnd.y - originStart.y)),
        originStart.z + (r*(originEnd.z - originStart.z))
      );
      var opts = {minLength: thickness, rotation: Math.PI/9};

      twigs.push({
        start: newStart,
        end: this.growToPoint(newStart, originEnd, thickness, opts)
      });
    }
    return twigs;
  }

  this.limb = function(curBranch, breaks, thickness, opts){
    var branches = [];
    for(var i = 1; i < breaks; i++){
      var oStart = new THREE.Vector3(
        (curBranch.start.x + ((curBranch.end.x - curBranch.start.x)*(i/breaks))),
        (curBranch.start.y + ((curBranch.end.y - curBranch.start.y)*(i/breaks))),
        (curBranch.start.z + ((curBranch.end.z - curBranch.start.z)*(i/breaks)))
      );

      var oEnd = new THREE.Vector3(
        (curBranch.start.x + ((curBranch.end.x - curBranch.start.x)*((i+1)/breaks))),
        (curBranch.start.y + ((curBranch.end.y - curBranch.start.y)*((i+1)/breaks))),
        (curBranch.start.z + ((curBranch.end.z - curBranch.start.z)*((i+1)/breaks)))
      );

      //add new branch
      var newEnd = this.growToPoint(oStart, oEnd, thickness, opts);
      branches.push({
        start: oStart,
        end: newEnd,
        thickness: thickness,
        twigs: this.addLeaves(oStart, newEnd, /*len*/ 1, /*numLeaves*/ 8)
      });

      if(breaks > 2)
        branches = branches.concat(this.limb(branches[branches.length - 1], breaks - 1, thickness - breaks/thickness, opts));

    }

    return branches;
  }

  this.smallerDist = function(o,a,b){
    var u = o.distanceTo(a);
    var v = o.distanceTo(b);
    if(u <= v)
      return{dist: u, p: a}
    else
      return{dist: v, p: b}
  }

  this.getNewLeaves = function(treeId){

    var sphereGeom = new THREE.SphereGeometry(this.trees[treeId].height+150,8,7)

    var curBranches = this.trees[treeId].branch;

    var i = sphereGeom.vertices.length
    while(i > 0){
      i--;
      var thickness = 5;
      var j = curBranches.length - 1;
      var minLen = this.smallerDist(sphereGeom.vertices[i],curBranches[j].start,curBranches[j].end)
      while(j > 0){
        j--;
        for(var k = 0; k < curBranches[j].twigs.length;k++){
          var nextTest = this.smallerDist(sphereGeom.vertices[i],curBranches[j].twigs[k].start,curBranches[j].twigs[k].end);
          if (nextTest.dist < minLen.dist){
            minLen = nextTest;
            var thickness = curBranches[j].thickness + 5;
          }
        }
      }
      var winner = lerp1(minLen.p, sphereGeom.vertices[i], (thickness/minLen.dist))
      sphereGeom.vertices[i].x = winner.x;
      sphereGeom.vertices[i].y = winner.y;
      sphereGeom.vertices[i].z = winner.z;
    }
    sphereGeom.vericesNeedUpdate = true;
    sphereGeom.mergeVertices();
    sphereGeom.computeVertexNormals()
    for(var i = 0; i < sphereGeom.faces.length; i++)
      sphereGeom.faces[i].color.setHex( 0x1B6F1B);

    return new THREE.Mesh(
      sphereGeom,
      new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors, receiveShadow: true, castSahdow: true, shading: THREE.SmoothShading, wireframe: false})
    );
  }

  this.addTree = function(height, numBreaks, thickness){
    treeId = this.trees.length;
    this.trees.push({
      height: height,
      branch: [{
        start: new THREE.Vector3(0,0,0),
        end: new THREE.Vector3(0,height,0),
        thickness: thickness,
        twigs: []//this.addLeaves(new THREE.Vector3(0,height/numBreaks,0), new THREE.Vector3(0,height,0), /*len*/ numBreaks/thickness, /*numLeaves*/ 4)
      }],
      color: {
        leaf: 'green',
        trunk: 'brown'
      },
      object: new THREE.Object3D()
    });
    opts = {};
    this.trees[treeId].branch = this.trees[treeId].branch.concat(this.limb(this.trees[treeId].branch[0], numBreaks, thickness, opts));
    this.trees[treeId].object.children.push(new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 25),
      new THREE.MeshBasicMaterial({color: 0x603000})
    ))
    this.trees[treeId].object.children.push(this.getNewLeaves(treeId));
    return treeId;
  }

  this.addTreeToScene = function(treeId,x,z){
    console.log(this.trees[treeId].object);
    this.trees[treeId].object.children[0].position.set(x,findY(x,z)+12.5,z);
    this.trees[treeId].object.children[1].position.set(x,findY(x,z)+25,z);
    this.trees[treeId].object.children[1].scale.set(3,3,3);
    scene.add(this.trees[treeId].object);
  }

  this.addBranchesToScene = function(treeId,x,z){
    var branchGeom = new THREE.Geometry();
    var twigGeom = new THREE.Geometry();
    //var leavesGroup  = new THREE.Object3D();
    this.trees[treeId].Mesh = new THREE.Object3D();

    for(var i = 0; i < this.trees[treeId].branch.length; i++){
      branchGeom.vertices.push(this.trees[treeId].branch[i].start);
      branchGeom.vertices.push(this.trees[treeId].branch[i].end);
      for(var j = 0; j < this.trees[treeId].branch[i].twigs.length; j++){
        twigGeom.vertices.push(this.trees[treeId].branch[i].twigs[j].start);
        twigGeom.vertices.push(this.trees[treeId].branch[i].twigs[j].end);

        /*var leaf = new THREE.Mesh(this.leafA.geometry, this.leafA.material);
        leaf.position.x = this.trees[treeId].branch[i].twigs[j].end.x;
        leaf.position.y = this.trees[treeId].branch[i].twigs[j].end.y;
        leaf.position.z = this.trees[treeId].branch[i].twigs[j].end.z;
        leaf.lookAt(new THREE.Vector3(0,0,0));
        leavesGroup.add(leaf);*/

      }
    }

    //branchGeom.computeLineDistances();
    //twigGeom.computeLineDistances();
    var BranchMaterial = new THREE.LineBasicMaterial( { color: 0x603000, linewidth: 3 });
    var twigMaterial = new THREE.LineBasicMaterial( { color: 0x1B6F1B, linewidth: 5 });
    var BranchMesh = new THREE.Line( branchGeom, BranchMaterial, THREE.LinePieces );
    var twigMesh = new THREE.Line( twigGeom, twigMaterial, THREE.LinePieces );
    this.trees[treeId].Mesh.add(BranchMesh);
    this.trees[treeId].Mesh.add(twigMesh);
    //this.trees[treeId].Mesh.add(leavesGroup);
    this.trees[treeId].Mesh.position.x = x;
    this.trees[treeId].Mesh.position.z = z;
    this.trees[treeId].Mesh.position.y = findY(x,z);
    this.trees[treeId].Mesh.scale.x = 6;
    this.trees[treeId].Mesh.scale.y = 6;
    this.trees[treeId].Mesh.scale.z = 6;
    scene.add(this.trees[treeId].Mesh);
  }

  this.onclickAddTree = function(i){
    this.addTreeToScene(this.addTree(8,4,4),i.x,i.z)
    //this.addBranchesToScene(this.addTree(10,5,5),i.x,i.z)
  }
  this.onclickAddManyTrees = function(lmh, i){
    this.addTreeToScene(this.addTree(8,5,5),i.x,i.z)
    while(lmh--)
      this.addTreeToScene(this.addTree(8,5,5),i.x+((Math.random()*200)-100),i.z+((Math.random()*200)-100));
  }
}

var tree = new treeFunc();
console.log('tree',tree)
