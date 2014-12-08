var tree = new (function(){
  this.trees = [];

  this.numberOfNodes = 0;

  this.lerp2 = function(p1,p2,p3,p4,t){
    var p5 = p1.clone().lerp(p2,t);
    var p6 = p3.clone().lerp(p4,t);
    // //console.log(p5,p6)
    return p5.lerp(p6, t);
  }

  this.rnd2 = function() {
    return (((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3);
  }

  this.calcCircleAroundAxis = function(axisStart,axisEnd,radius,numPoints){
    if(axisStart.equals(axisEnd))
      return false;

    var a = new THREE.Vector3().subVectors(axisEnd,axisStart).normalize();

    //this controls the start angle of the circle...
    var b = new THREE.Vector3(
      axisStart.x - 100.014,
      axisStart.y - 1.014,
      axisStart.z - 1.014
    ).normalize();

    var startPoint = new THREE.Vector3().crossVectors(a,b).setLength(radius);

    var circle = [startPoint];
    var increment = ((2 * Math.PI)/numPoints);
    //console.log(increment)
    for(var i = increment; i < (2 * Math.PI)-.001; i += increment){
      var tempPoint = new THREE.Vector3();
      tempPoint.copy(startPoint);
      tempPoint.applyAxisAngle(a,i);
      tempPoint.add(axisStart);
      circle.push(tempPoint);
    }
    circle.push(circle[0].add(axisStart));

    return {circle: circle, center: axisStart};
  }

  this.lerpBranch = function(p1,p2,p3,p4,startRadius,endRadius,numBreaks,numPoints,geom){
    //console.log(p1,p2,p3,p4,startRadius,endRadius,numBreaks,numPoints,geom)
    var circles = []

    var i = 0;
    while(i <= numBreaks){
      var t = i / numBreaks;
      var p = this.lerp2(p1,p2,p3,p4,t);
      var q = this.lerp2(p1,p2,p3,p4,t+.0000000001);
      circles[i] = this.calcCircleAroundAxis(p, q, endRadius + ((1 - t) * (startRadius-endRadius)), numPoints);
      circles[i].circle = this.addCircleToObj(circles[i].circle, geom);
      i++;
    }
    i = -1;
    while(++i < numBreaks)
      this.circlesToFaces(circles[i].circle, circles[i + 1].circle, geom)

    //this.calcCap(circles[0], p1, geom);

  }

  this.addCircleToObj = function(circle, geom){
    var i = circle.length;
    while(i > 1){
      i--;
      circle[i].objVertNum = geom.vertices.length;
      geom.vertices.push(circle[i]);
    }
    return circle;
  }

  this.circlesToFaces = function(a, b, geom){
    if(a.length != b.length){
      return false;
    }
    //console.log(a,b)
    var i = 0;
    var num = a.length - 1;
    while (i < num){
      geom.faces.push(new THREE.Face3(b[i].objVertNum, a[i].objVertNum,   b[i+1].objVertNum))
      geom.faces.push(new THREE.Face3(a[i].objVertNum, a[i+1].objVertNum, b[i+1].objVertNum))
      i++;
    }
  }

  this.calcCap = function(circle, mid, geom){

    var midPointNumber = geom.vertices.length;
    geom.vertices.push(mid);

    for(var i = 0; i < circle.length - 1; i++)
      geom.faces.push(new THREE.Face3(circle[i].objVertNum, circle[i+1].objVertNum, midPointNumber))
  }

  this.newNodePoint = function(endPoint,length,half,side){
    if(half == -1)
      return new THREE.Vector3(
          endPoint.x + 2 * (((length * this.rnd2()) + .5) * side),
          endPoint.y + length + (this.rnd2() * 4),
          endPoint.z + 2 * (length * this.rnd2())
        )
    else
      return new THREE.Vector3(
          endPoint.x + 2 * (length * this.rnd2()),
          endPoint.y + length + (this.rnd2() * 4),
          endPoint.z + 2 * (((length * this.rnd2()) + .5) * side)
        )
  }

  this.node = function (startPoint, endPoint, thisHalf, scaleFactor, length, decrement){
    tree.numberOfNodes++;
    if(length - decrement <= 0)
      return {
        nodeNumber: tree.numberOfNodes,
        midPoint: startPoint,
        end: true,
        thisHalf:  thisHalf
      };
    else
      return {
        nodeNumber: tree.numberOfNodes,
        startPoint: startPoint,
        midPoint: (startPoint.clone().lerp(endPoint,.5)),
        endPoint: endPoint,
        startThickness: ((length/decrement) * scaleFactor),
        endThickness: (((length - decrement)/decrement) * scaleFactor),
        length: length,
        end: false,
        thisHalf: thisHalf,
        children: [
          new tree.node(endPoint, tree.newNodePoint(endPoint,(length - decrement),thisHalf,-1), thisHalf == 1 ? -1 : 1, scaleFactor, length - decrement, decrement),
          new tree.node(endPoint, tree.newNodePoint(endPoint,(length - decrement),thisHalf, 1), thisHalf == 1 ? -1 : 1, scaleFactor, length - decrement, decrement)
        ]
      };
  }

  this.growTreeNodes = function(length, decrement){
    tree.numberOfNodes = 0;
    if(decrement > length)
      console.warning('decrement less that length in this tree',this.trees[this.trees.length - 1]);
    else
      return new this.node(
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(
          (length * this.rnd2()),
          length, //(length * Math.random()+.1),
          (length * this.rnd2())
        ),
        0,
        .1, //scaleFactor,
        length,
        decrement
      );
  };

  this.growBark = function(node,geom){
    if(node.nodeNumber == 1){
      var half = node.startPoint.clone().lerp(node.midPoint,.5)
      this.lerpBranch(
        node.startPoint,
        half,
        half,
        node.midPoint,
        node.startThickness,
        node.startThickness,
        2,3,geom);
    }

    if(node.end){
      return geom;
    }
    else{
      if(!node.children[0].end){
        this.lerpBranch(node.midPoint,
          node.endPoint,
          node.endPoint,
          node.children[0].midPoint,
          node.startThickness,
          node.endThickness,
          2,3,geom);
        geom = this.growBark(node.children[0],geom);
      }
      if(!node.children[1].end){
        this.lerpBranch(node.midPoint,
          node.endPoint,
          node.endPoint,
          node.children[1].midPoint,
          node.startThickness,
          node.endThickness,
          2,3,geom);
        geom = this.growBark(node.children[1],geom);
      }
      if(node.children[0].end || node.children[1].end){
        var half = node.midPoint.clone().lerp(node.endPoint,.5)
        this.lerpBranch(node.midPoint,
          half,
          half,
          node.endPoint,
          node.startThickness,
          node.endThickness,
          2,3,geom);
      }
      return geom
    }
  }

  this.newLeavesCanvas = function(x,y,numLeaves){
    var scaleX = x/1200;
    var scaleY = y/1200;
    var leafCanvas = document.createElement('canvas');
    var leafCon = leafCanvas.getContext('2d');
    leafCon.beginPath();
    leafCon.moveTo(0, 0);
    leafCon.lineTo(7 * scaleX,10 * scaleY);
    leafCon.quadraticCurveTo(15 * scaleX,35 * scaleY,40 * scaleX,40 * scaleY);
    leafCon.quadraticCurveTo(35 * scaleX,15 * scaleY,10 * scaleX,7  * scaleY);
    leafCon.closePath();
    leafCon.lineWidth = Math.ceil(3 * scaleX);
    leafCon.fillStyle = '#8A9A5B';
    leafCon.fill();
    leafCon.strokeStyle = '#4A5D23';
    leafCon.stroke();


    var leavesCanvas = document.createElement('canvas');
    leavesCanvas.width = x;
    leavesCanvas.height = y;
    centerX = x/2;
    centerY = y/2;
    var leavesCon = leavesCanvas.getContext('2d');

    for(var i = 0; i < numLeaves; i++){
        leavesCon.save();
      randomX = Math.random() * centerX / 3;
      randomY = Math.random() * centerY / 2;
      randomAngle = Math.random() * 2 * Math.PI;
      leavesCon.translate(centerX,centerY);
      leavesCon.rotate(randomAngle);
      leavesCon.drawImage(leafCanvas,randomX,randomY);
      leavesCon.restore();
    }
    var image = new Image()
    image.src = leavesCanvas.toDataURL("image/png");
    return image;
  }
  this.growSimpleLeaves = function(leafGeom, treeGeom){
    var size = 10;
    var multiple = 3.5;
    var up = Math.random() * 2;
    var min = treeGeom.boundingBox.min.clone().addScalar(-size)
    var max = treeGeom.boundingBox.max.clone().addScalar(size)
    var mid = min.clone().lerp(max,.5);
    mid.x += (this.rnd2() * multiple);
    mid.y = max.y/2 + up;
    mid.z += (this.rnd2() * multiple);
    min.y = 0;
    max.y += up;

    var countP = leafGeom.vertices.length;
    leafGeom.vertices.push(new THREE.Vector3(max.x,max.y,mid.z))
    leafGeom.vertices.push(new THREE.Vector3(min.x,max.y,mid.z))
    leafGeom.vertices.push(new THREE.Vector3(min.x,min.y,mid.z))
    leafGeom.vertices.push(new THREE.Vector3(max.x,min.y,mid.z))

    leafGeom.faces.push( new THREE.Face3(countP,  countP+1,countP+2))
    leafGeom.faceVertexUvs[0].push([
      new THREE.Vector2(1,1),
      new THREE.Vector2(0,1),
      new THREE.Vector2(0,0)
    ]);
    leafGeom.faces.push( new THREE.Face3(countP+2,countP+3,countP))
    leafGeom.faceVertexUvs[0].push([
      new THREE.Vector2(0,0),
      new THREE.Vector2(1,0),
      new THREE.Vector2(1,1)
    ]);

    leafGeom.vertices.push(new THREE.Vector3(mid.x,max.y,max.z))
    leafGeom.vertices.push(new THREE.Vector3(mid.x,max.y,min.z))
    leafGeom.vertices.push(new THREE.Vector3(mid.x,min.y,min.z))
    leafGeom.vertices.push(new THREE.Vector3(mid.x,min.y,max.z))

    leafGeom.faces.push( new THREE.Face3(countP+4,countP+5,countP+6))
    leafGeom.faceVertexUvs[0].push([
      new THREE.Vector2(1,1),
      new THREE.Vector2(0,1),
      new THREE.Vector2(0,0)
    ]);
    leafGeom.faces.push( new THREE.Face3(countP+6,countP+7,countP+4))
    leafGeom.faceVertexUvs[0].push([
      new THREE.Vector2(0,0),
      new THREE.Vector2(1,0),
      new THREE.Vector2(1,1)
    ]);

    leafGeom.vertices.push(new THREE.Vector3(max.x,mid.y,max.z))
    leafGeom.vertices.push(new THREE.Vector3(max.x,mid.y,min.z))
    leafGeom.vertices.push(new THREE.Vector3(min.x,mid.y,min.z))
    leafGeom.vertices.push(new THREE.Vector3(min.x,mid.y,max.z))

    leafGeom.faces.push( new THREE.Face3(countP+8,countP+9,countP+10))
    leafGeom.faceVertexUvs[0].push([
      new THREE.Vector2(1,1),
      new THREE.Vector2(0,1),
      new THREE.Vector2(0,0)
    ]);
    leafGeom.faces.push( new THREE.Face3(countP+10,countP+11,countP+8))
    leafGeom.faceVertexUvs[0].push([
      new THREE.Vector2(0,0),
      new THREE.Vector2(1,0),
      new THREE.Vector2(1,1)
    ]);
  }

  this.growLeaves = function(node,leafGeom){
    if(node.end){
      var size = 15;
      var countP = leafGeom.vertices.length;
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3( size, size,this.rnd2()*size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(-size, size,this.rnd2()*size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(-size,-size,this.rnd2()*size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3( size,-size,this.rnd2()*size)))

      leafGeom.faces.push( new THREE.Face3(countP,  countP+1,countP+2))
      leafGeom.faceVertexUvs[0].push([
        new THREE.Vector2(1,1),
        new THREE.Vector2(0,1),
        new THREE.Vector2(0,0)
      ]);
      leafGeom.faces.push( new THREE.Face3(countP+2,countP+3,countP))
      leafGeom.faceVertexUvs[0].push([
        new THREE.Vector2(0,0),
        new THREE.Vector2(1,0),
        new THREE.Vector2(1,1)
      ]);

      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(this.rnd2()*size, size, size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(this.rnd2()*size, size,-size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(this.rnd2()*size,-size,-size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(this.rnd2()*size,-size, size)))

      leafGeom.faces.push( new THREE.Face3(countP+4,countP+5,countP+6))
      leafGeom.faceVertexUvs[0].push([
        new THREE.Vector2(1,1),
        new THREE.Vector2(0,1),
        new THREE.Vector2(0,0)
      ]);
      leafGeom.faces.push( new THREE.Face3(countP+6,countP+7,countP+4))
      leafGeom.faceVertexUvs[0].push([
        new THREE.Vector2(0,0),
        new THREE.Vector2(1,0),
        new THREE.Vector2(1,1)
      ]);

      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(size, this.rnd2()*size, size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(size, this.rnd2()*size,-size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(-size,this.rnd2()*size,-size)))
      leafGeom.vertices.push(node.midPoint.clone().add(new THREE.Vector3(-size,this.rnd2()*size, size)))

      leafGeom.faces.push( new THREE.Face3(countP+8,countP+9,countP+10))
      leafGeom.faceVertexUvs[0].push([
        new THREE.Vector2(1,1),
        new THREE.Vector2(0,1),
        new THREE.Vector2(0,0)
      ]);
      leafGeom.faces.push( new THREE.Face3(countP+10,countP+11,countP+8))
      leafGeom.faceVertexUvs[0].push([
        new THREE.Vector2(0,0),
        new THREE.Vector2(1,0),
        new THREE.Vector2(1,1)
      ]);
    }
    else{
      tree.growLeaves(node.children[0],leafGeom);
      tree.growLeaves(node.children[1],leafGeom);
    }
  }


  //this.treeMaterial = new THREE.MeshBasicMaterial({color: 0xf08000, wireframe: false})
  this.treeMaterial = new THREE.MeshLambertMaterial({shading: THREE.NoShading, castShadow: true, vertexColors: THREE.FaceColors})
  this.leafTexture = new THREE.Texture(this.newLeavesCanvas(400,400,350));
  this.leafTexture.needsUpdate = true;
  //this.leafMaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide} );
  this.leafMaterial = new THREE.MeshBasicMaterial( {map: this.leafTexture, side: THREE.DoubleSide, transparent: true, depthTest: false} );

  this.newTree = function(x,z){
    var y = findY(x,z);
    //console.log(y);
    var TreeGeom = new THREE.Geometry();
    var leafGeom = new THREE.Geometry();

    var rootNode = this.growTreeNodes(4,.8);

    this.growBark(rootNode, TreeGeom).computeBoundingBox();
    for(var i = 0; i < TreeGeom.faces.length; i++)
      TreeGeom.faces[ i ].color.setHex(0x7D6445);
    TreeGeom.colorsNeedUpdate = true;
    //this.growLeaves(rootNode, leafGeom)
    this.growSimpleLeaves(leafGeom,TreeGeom)

    TreeGeom.mergeVertices();
    TreeGeom.computeFaceNormals();
    TreeGeom.computeVertexNormals();

    leafGeom.computeFaceNormals();
    leafGeom.computeVertexNormals();
    leafGeom.uvsNeedUpdate = true;

    //leafMaterial.needsUpdate = true;

    var theNewTree = new THREE.Mesh(TreeGeom, this.treeMaterial);
    var theNewLeaves = new THREE.Mesh(leafGeom, this.leafMaterial);

    theNewTree.position.x = theNewLeaves.position.x = x;
    theNewTree.position.y = theNewLeaves.position.y = y - 10;
    theNewTree.position.z = theNewLeaves.position.z = z;
    theNewTree.scale.x = theNewTree.scale.y = theNewTree.scale.z = 5;
    theNewLeaves.scale.x = theNewLeaves.scale.y = theNewLeaves.scale.z = 5;
    theNewTree.rotation.y = theNewLeaves.rotation.y = (Math.random() * 2 * Math.PI);

    theNewTree.castShadow = true;

    scene.add(theNewTree)
    scene.add(theNewLeaves)

    this.trees.push([theNewTree,theNewLeaves]);

  }

  this.onclickAddTree = function(i){
    this.newTree(i.x,i.z);
  }

  this.onclickAddManyTrees = function(lmh, i){
    this.newTree(i.x,i.z);
    lmh--;
    while(lmh--)
      this.newTree(i.x+((Math.random()*250)-125),i.z+((Math.random()*250)-125));
  }

})()
