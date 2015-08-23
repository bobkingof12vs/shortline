var lay = function(menuItem, gridValue, color, pointValidator, mouseClickFunction){

  this.pointValidator = (pointValidator != undefined ? mouseMoveFunction : function(){return true;});
  this.mouseClickFunction = (mouseClickFunction != undefined ? mouseMoveFunction : function(){return true;});
  this.far = gridValue;
  this.minLen = 0;
  this.vertLen = 0;
  this.color = color;
  this.clickHold = false;

  this.line = new THREE.Line(
    new THREE.Geometry(),
    new THREE.LineBasicMaterial( { color: this.color, linewidth: 5 } ),
    THREE.LinePieces
  );

  this.tempLine = new THREE.Line(
    new THREE.Geometry(),
    new THREE.LineBasicMaterial( { color: this.color, linewidth: 5 } ),
    THREE.LinePieces
  );

  this.segments = [];

  var scope = this;
  console.log(menuItem,m);
  m[menuItem].onclickEvent = function(menu, clicked){
    if(clicked == 1){
      var i = scope.line.geometry.vertices.length;
      while(i--){
        scope.line.geometry.vertices[i] = recalcY(scope.line.geometry.vertices[i], 5);
        scope.line.geometry.verticesNeedUpdate = true;
      }

      scope.anyClick = false;

      scope.mousemove = function(e){

        if(scope.anyClick == false)
          return;

        getMouseIntersect({x: e.clientX, y: e.clientY}, [plane], function(i){
          if (i != 1) {
            var point = closePoint(i[0].point, gridValue);

            scope.segments[scope.segments.length -1] = point.clone()

            if(scope.pointValidator(point, scope.segments, scope.anyClick)){
              scene.remove(scope.tempLine)
              var tempLineGeom = new THREE.Geometry();
              tempLineGeom.vertices = gridPointsOnLine(100, scope.segments[scope.segments.length - 2], point, true);
              scope.tempLine = new THREE.Line( tempLineGeom, scope.tempLine.material, THREE.LinePieces );
              scene.add(scope.tempLine);
            }
            else{
              scene.remove(scope.tempLine);
            }
          }
        });
      }
      document.body.addEventListener('mousemove', scope.mousemove, false);

      scope.click = function(e){
        if(scope.clickHold == true)
          return

        scope.clickHold = true;
        getMouseIntersect({x: e.clientX, y: e.clientY}, [plane], function(i){
          if(i != scope.downDistance){
            var point = closePoint(i[0].point,gridValue);

            if(mouseInMenu == 0){
              if(scope.anyClick == false){
                scope.segments.push(point.clone())
                scope.segments.push(point.clone())
                scope.anyClick = true;
              }
              else if(scope.pointValidator(point, scope.segments, scope.anyClick)){

                scope.mouseClickFunction(point, scope.segments);

                scope.segments.push(point.clone())
                scope.segments.push(point.clone())

                scene.remove(scope.line)

                var newGeom = new THREE.Geometry();
                newGeom.vertices = scope.line.geometry.vertices.concat(scope.tempLine.geometry.vertices);

                scope.line = new THREE.Line(newGeom, scope.line.material, THREE.LinePieces);

                scene.add(scope.line)
              }
            }
          }
          scope.clickHold = false;
        });
      }
      document.body.addEventListener('click', scope.click, false);

      scene.add(scope.line);

    }
    else{

      scene.remove(scope.line);
      scene.remove(scope.tempLine);

      if(scope.anyClick){
        scope.segments.pop();
        scope.segments.pop();
      }

      scope.anyClick = false;
      //scope.minLen = scope.line.geometry.vertices.length;

      document.body.removeEventListener('mousemove', scope.mousemove, false);
      document.body.removeEventListener('click', scope.click, false);
    }
  }

  m[menuItem+'_nxt'].onclickEvent = function(){
    if(m[menuItem+'_nxt'].clicked == 1){
      m[menuItem].e.click();
      m[menuItem].e.click();
      document.body.removeEventListener('mousemove', scope.mousemove, false);
      document.body.removeEventListener('click', scope.click, false);
    }
  }

  this.saveData = function(){

    console.log(Object.keys(scope.segments))
    var data = [];
    for(var i = 0; i < scope.segments.length; i++)
      data.push({
        x: scope.segments[i].x,
        z: scope.segments[i].z
      });
    console.log(data)
    return data;
  }

  this.loadData = function(p1,p2){
    //console.log(p1,p2)
    scope.line.geometry.vertices = scope.line.geometry.vertices.concat(gridPointsOnLine(100, p1, p2, true));
    scope.segments.push(p1);
    scope.segments.push(p2);
    scope.mouseClickFunction(p2, scope.segments);
    console.log('loaded another')
  }
}

function createPathGeom(p1, p2, p3, numDivisions, width, height, faceColor){
  var zero = new THREE.Vector3(0,0,0);
  var path = []
  path.push({point: p1.clone(), t: p2.clone()});
  var i = numDivisions;
  while(i-- > 1){
    var d = (1 - (i/numDivisions))
    path.push({
      point: lerp(p1,p2,p2,p3,d),
      t: lerp(p1,p2,p2,p3,d + .001),
    })
  }
  path.push({
    point: p3,
    t: p3.clone().add(p3.clone().sub(p2))
  })


  var i = path.length
  while(i--){
    path[i].l = path[i].point.clone();
    path[i].l.add(
      perpendicularVectorXZ(
        {x:-1, z: 1},
        path[i].t,
        path[i].point
      ).setLength(width/2)
    );
    path[i].l.setY(findY(path[i].l.x,path[i].l.z) + height);

    path[i].r = path[i].point.clone();
    path[i].r.add(
      perpendicularVectorXZ(
        {x: 1, z:-1},
        path[i].t,
        path[i].point
      ).setLength(width/2)
    );
    path[i].r.setY(findY(path[i].r.x,path[i].r.z) + height);
  }

  var geom = new THREE.Geometry()

  geom.vertices.push(
    path[0].l.clone().setY(path[0].l.y - (2 * height)),
    path[0].l,
    path[0].r,
    path[0].r.clone().setY(path[0].r.y - (2 * height))
  );

  for(var i = 1; i < path.length; i++){
    geom.vertices.push(
      path[i].l.clone().setY(path[i].l.y - (2 * height)),
      path[i].l,
      path[i].r,
      path[i].r.clone().setY(path[i].r.y - (2 * height))
    );

    var u2 = geom.vertices.length
    var u1 = u2 - 4;

    geom.faces.push(new THREE.Face3(u1 - 4, u1 - 3, u2 - 4));//, zero, color));
    geom.faces.push(new THREE.Face3(u2 - 4, u1 - 3, u2 - 3));//, zero, color));

    geom.faces.push(new THREE.Face3(u1 - 3, u1 - 2, u2 - 3));//, zero, color));
    geom.faces.push(new THREE.Face3(u2 - 3, u1 - 2, u2 - 2));//, zero, color));

    geom.faces.push(new THREE.Face3(u1 - 2, u1 - 1, u2 - 2));//, zero, color));
    geom.faces.push(new THREE.Face3(u2 - 2, u1 - 1, u2 - 1));//, zero, color));
  }

  return geom;
  //return calcFaceNormals(geom);
}

var layRoads = new(function(){

  var scope = this;
  scope.roads = [];
  scope.segments = [];
  scope.roadChunks = 17;
  scope.roadWidth = 12;
  scope.roadHeight = 3
  scope.roadColor = 0x49311c;

  scope.lay = new lay('m_rod',25,0xff00ff);
  scope.lay.pointValidator = function(point, verts, anyClick){

    if(verts.length < 3 | anyClick == false){
      return true;
    }

    for(var i = verts.length - 4; i >= 0; i -= 2){
      if(equalXZ(verts[verts.length-2], verts[i]) == 1 && angleBetweenFlattenedVectors(point, verts[i + 1], verts[i]) < 90)
        return false;
      else if(equalXZ(verts[verts.length-2], verts[i + 1]) == 1 && angleBetweenFlattenedVectors(point,verts[i], verts[i + 1]) < 90)
        return false
      else if(equalXZ(point, verts[i]) == 1 && angleBetweenFlattenedVectors(verts[verts.length-2], verts[i + 1], verts[i]) < 90)
        return false;
      else if(equalXZ(point, verts[i + 1]) == 1 && angleBetweenFlattenedVectors(verts[verts.length-2],verts[i], verts[i + 1]) < 90)
        return false
    }

    return true;

  }

  scope.lay.mouseClickFunction = function(point, verts){

    if(verts.length < 2)
      return

    var len = scope.segments.length;
    scope.segments[len] = {
      points: [verts[verts.length - 1], verts[verts.length - 2]],
      connectsTo: [],
      obj: [],
      angleToSegment: function(n){
        if(n == len)
          return 'same';
        if(equalXZ(scope.segments[n].points[0],scope.segments[len].points[0]) == 1)
          return {type: [0,0], angle: angleBetweenFlattenedVectors(scope.segments[n].points[1], scope.segments[len].points[1], scope.segments[n].points[0])};
        if(equalXZ(scope.segments[n].points[0],scope.segments[len].points[1]) == 1)
          return {type: [0,1], angle: angleBetweenFlattenedVectors(scope.segments[n].points[1], scope.segments[len].points[0], scope.segments[n].points[0])};
        if(equalXZ(scope.segments[n].points[1],scope.segments[len].points[0]) == 1)
          return {type: [1,0], angle: angleBetweenFlattenedVectors(scope.segments[n].points[0], scope.segments[len].points[1], scope.segments[n].points[1])};
        if(equalXZ(scope.segments[n].points[1],scope.segments[len].points[1]) == 1)
          return {type: [1,1], angle: angleBetweenFlattenedVectors(scope.segments[n].points[0], scope.segments[len].points[0], scope.segments[n].points[1])};
        return false
      }
    };

    for(var i = 0; i < scope.segments.length; i++){
      var segment = scope.segments[len].angleToSegment(i);
      if(segment != false & segment != 'same'){
        scope.segments[len].connectsTo.push({segment: scope.segments[i], angle: segment.angle, type: segment.type[1]});
        scope.segments[i].connectsTo.push({segment: scope.segments[len], angle: segment.angle, type: segment.type[0]});

        var mp1 = midpoint(scope.segments[len].points[0], scope.segments[len].points[1]);
        var mp2 = midpoint(scope.segments[i].points[0],   scope.segments[i].points[1]);
        var p = [
          mp1,
          scope.segments[i].points[segment.type[0]].clone(),
          mp2
        ]

        var divisions = ((p[0].distanceTo(p[1]) + p[1].distanceTo(p[2]) + p[2].distanceTo(p[0])) / 3) / scope.roadChunks;

        var obj = new THREE.Mesh(
          createPathGeom(p[0], p[1], p[2], divisions, scope.roadWidth, scope.roadHeight, scope.roadColor),
          new THREE.MeshBasicMaterial({ color: scope.roadColor })
        );
        console.log('created mesh here');

        if(scope.segments[len].obj[i] != undefined && scope.segments[len].obj[i] instanceof THREE.Mesh)
          scene.remove(scope.segments[len].obj[i])

        scope.segments[len].obj[i] = scope.segments[i].obj[len] = obj;

        scope.roads.push({
          path: p,
          obj: obj,
          divisions: divisions,
          range: {
            min: [Math.min(p[0].x,p[1].x,p[2].x),Math.min(p[0].z,p[1].z,p[2].z)],
            max: [Math.max(p[0].x,p[1].x,p[2].x),Math.max(p[0].z,p[1].z,p[2].z)]
          },
          segmentReference: [i,len]
        });

        scene.add(obj);

      }

      if(scope.segments[i].obj[-1] != undefined && scope.segments[i].obj[-1] instanceof THREE.Mesh){
        console.log('here',scope.segments[i].obj[-1]);
        scene.remove(scope.segments[i].obj[-1])
        scope.segments[i].obj[-1].geometry.dispose()
      }

      if(scope.segments[i].obj[-2] != undefined && scope.segments[i].obj[-2] instanceof THREE.Mesh){
        scene.remove(scope.segments[i].obj[-2])
        scope.segments[i].obj[-2].geometry.dispose()
      }

      var sidesTaken = [false,false];
      for (var j = 0; j < scope.segments[i].connectsTo.length; j++)
        if(scope.segments[i].connectsTo[j] != undefined)
          sidesTaken[scope.segments[i].connectsTo[j].type] = true

      var j = scope.roads.length;
      while(j--)
        if(scope.roads[j] != undefined && scope.roads[j].segmentReference[0] == i && scope.roads[j].segmentReference[1] < 0)
          scope.roads[j] = undefined;

      scope.segments[i].points[0] = new THREE.Vector3(scope.segments[i].points[0].x,0,scope.segments[i].points[0].z);
      scope.segments[i].points[1] = new THREE.Vector3(scope.segments[i].points[1].x,0,scope.segments[i].points[1].z);

      if(!sidesTaken[0]){
        var mid = midpoint(scope.segments[i].points[0],scope.segments[i].points[1])

        var p = [
          scope.segments[i].points[0],
          midpoint(scope.segments[i].points[0],mid),
          mid
        ];
        obj = new THREE.Mesh(
          createPathGeom(p[0], p[1], p[2], divisions, scope.roadWidth, scope.roadHeight, scope.roadColor),
          new THREE.MeshBasicMaterial({ color: scope.roadColor })
        );
        scope.segments[i].obj[-1] = obj;
        scene.add(obj);

        var divisions = p[0].distanceTo(p[2]) / scope.roadChunks;

        scope.roads.push({
          path: p,
          obj: obj,
          divisions: divisions,
          range: {
            min: [Math.min(scope.segments[i].points[0].x,scope.segments[i].points[1].x),Math.min(scope.segments[i].points[0].z,scope.segments[i].points[1].z)],
            max: [Math.max(scope.segments[i].points[0].x,scope.segments[i].points[1].x),Math.max(scope.segments[i].points[0].z,scope.segments[i].points[1].z)]
          },
          segmentReference: [i,-1]
        });
      }

      if(!sidesTaken[1]){
        var mid = midpoint(scope.segments[i].points[0],scope.segments[i].points[1])

        var p = [
          scope.segments[i].points[1],
          midpoint(scope.segments[i].points[1],mid),
          mid
        ];

        obj = new THREE.Mesh(
          createPathGeom(p[0], p[1], p[2], divisions, scope.roadWidth, scope.roadHeight, scope.roadColor),
          new THREE.MeshBasicMaterial({ color: scope.roadColor })
        );
        scope.segments[i].obj[-2] = obj;
        scene.add(obj);

        var divisions = p[0].distanceTo(p[2]) / scope.roadChunks;

        scope.roads.push({
          path: p,
          obj: obj,
          divisions: divisions,
          range: {
            min: [Math.min(scope.segments[i].points[0].x,scope.segments[i].points[1].x),Math.min(scope.segments[i].points[0].z,scope.segments[i].points[1].z)],
            max: [Math.max(scope.segments[i].points[0].x,scope.segments[i].points[1].x),Math.max(scope.segments[i].points[0].z,scope.segments[i].points[1].z)]
          },
          segmentReference: [i,-2]
        });
      }
    }

  }

  scope.recalcPathInArea = function(x,z,radius){

    var i = scope.roads.length;
    while(i--){

      if(scope.roads[i] == undefined)
        continue;

      if(
        scope.roads[i].range.min[0] <= x + radius
        & scope.roads[i].range.max[0] >= x - radius
        & scope.roads[i].range.min[1] <= z + radius
        & scope.roads[i].range.max[1] >= z - radius
      ){

        scene.remove(scope.roads[i].obj);
        scope.roads[i].obj.geometry.dispose();

        //var j = scope.roads[i].path.length;
        //while(j--)
          scope.roads[i].obj = new THREE.Mesh(
            createPathGeom(scope.roads[i].path[0], scope.roads[i].path[1], scope.roads[i].path[2], scope.roads[i].divisions, scope.roadWidth, scope.roadHeight, scope.roadColor),
            new THREE.MeshBasicMaterial({ color: scope.roadColor })
          );

        scope.segments[scope.roads[i].segmentReference[0]].obj[scope.segments[scope.roads[i].segmentReference[1]]] = scope.roads[i].obj;

        if(scope.roads[i].segmentReference[1] >= 0)
          scope.segments[scope.roads[i].segmentReference[1]].obj[scope.segments[scope.roads[i].segmentReference[0]]] = scope.roads[i].obj;

        scene.add(scope.roads[i].obj);

      }
    }
  }

});

// var layRivers = new(function(){
//   this.lay = new lay('m_riv',0xffff00);
// });
