/*
 *Version 1 Goals:
 *	multiple engines/trains
 *	switches
 *	stops on dead end
 *	reverseable
 *	variable speed
 *	#mold land
 *	#lay track
 *	delete track
 *	min 2 cars
 *	design train
 *	design/generally have
 *		buildings
 *		trees
 *	sql storage
 *Version 1.1:
 *	web release
 *Version 2:
 *	move screen
 *	money
 *	stations (or rather, have stations mean something)
 *	supply/demand
 *		from buildings?
 *	schedulable trains
 *	automatic (yet overridable) switches
 *version 3:
 *	"scriptable" train automation supply demand
 *
 *Ideas:
 *	scenarios
 */

var c = document.getElementById('c');
var ctx = c.getContext('2d');
var back_c = document.getElementById('back');
var back_ctx = back_c.getContext('2d');
var pre_c = document.createElement('canvas');
var pre_ctx = pre_c.getContext('2d');
var back_pre_c = document.createElement('canvas');
var back_pre_ctx = back_pre_c.getContext('2d');
var width = window.innerWidth; 
var height = window.innerHeight;
var qheight = 10;
var qwidth = 10;
var mheight = .5;
var mouse = new point;
mouse.z = 0;
var key;
var r = 0;
width = window.innerWidth; 
height = window.innerHeight;
	c.width = pre_c.width = back_c.width = back_pre_c.width = width;
	c.height = pre_c.height = back_c.height = back_pre_c.height = height;
var mapSize = [Math.ceil(width/60),Math.ceil(height/(60*mheight))];
var lastpos = [0,0,0,0];
var click = 0;
var menuVar = '';
var mouse_pos = [-1,-1];
var maxMapHeight = 120;
var refreshRate = 1;
var message = '';
var chold = 0;
var maxz = 1024

function point(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

function addHexColor(c1, i) {

	var hexSt1 = (Math.round((eval(parseInt(c1.substr(0,2),16)) * i))).toString(16);
	var hexSt2 = (Math.round((eval(parseInt(c1.substr(2,2),16)) * i))).toString(16);
	var hexSt3 = (Math.round((eval(parseInt(c1.substr(4,2),16)) * i))).toString(16);
	if(hexSt1.length < 2) { hexSt1 = '0' + hexSt1; } // Zero pad.
	if(hexSt2.length < 2) { hexSt2 = '0' + hexSt2; } // Zero pad.
	if(hexSt3.length < 2) { hexSt3 = '0' + hexSt3; } // Zero pad.
	return hexSt1 + hexSt2 + hexSt3;
}

function dot(n1,n2) {
	return ((n1.x*n2.x)+(n1.y*n2.y)+(n1.z*n2.z))
}

function cross(u,v) {
	return new point (((u.y*v.z)-(u.z*v.y)),((u.z*v.x)-(u.x*v.z)),((u.x*v.y)-(u.y*v.x)))
}

line = function(x1,y1,z1,x2,y2,z2){
		ctx.strokeStyle = '#0B4C5F';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x1,(mheight*y1)-z1);
		ctx.lineTo(x2,(mheight*y2)-z2);
		ctx.stroke();
	}

function line_intersection(p1,p2,p3,p4) {
	p1.y -= p1.z;
	p2.y -= p2.z;
	p3.y -= p3.z;
	p4.y -= p4.z;
	var d = (p1.x-p2.x)*(p3.y-p4.y) - (p1.y-p2.y)*(p3.x-p4.x)
	if (d == 0) {return [-1,-2]}
	var xi = ((p3.y-p4.y)*(p1.x*p2.y-p1.y*p2.x)-(p1.y-p2.y)*(p3.x*p4.y-p3.y*p4.x))/d
	var yi = ((p3.y-p4.y)*(p1.x*p2.y-p1.y*p2.x)-(p1.y-p2.y)*(p3.x*p4.y-p3.y*p4.x))/d
	if (xi < Math.min(p1.x,p2.x) ||
			xi > Math.max(p1.x,p2.x) ||
			xi < Math.min(p3.x,p4.x) ||
			xi > Math.max(p3.x,p4.x)) {
		return [-1,-3];
	}
	return [xi,yi]
}

function distance(p1,p2) {
	return Math.sqrt(Math.pow((p2.x-p1.x),2)+Math.pow(((p2.y-p2.z)-(p1.y-p1.z)),2))
}

function findDrawArea(map,y) {
	ctx.begginePath();
	ctx.moveTo(width,0);
	ctx.lineTo(0,0);
	for (var x = 0; x <= mapSize[0]; x++) {
		new_y = 0;
		for (var i = 0; i <= Math.ceil(maxMapHeight/30) & map[i] !== undefined;i++) {
			if (map[x][y+i] > new_y) {
				new_y = map[x][y+i];
			}
		}
		ctx.lineTo(x*60,new_y)
	}
	ctx.close();
	ctx.stroke();
}

box = function(bx,by,scol,fcol){
	if (bx >= 0) {
		ctx.strokeStyle = scol;
		ctx.fillStyle = fcol;
		ctx.beginPath();
		ctx.moveTo(bx*60,((by*60)*mheight)-parseFloat(land.map[bx][by]));
		ctx.lineTo((bx+1)*60,((by*60)*mheight)-parseFloat(land.map[bx+1][by])); //+this.map[bx+1][by])*mheight);
		ctx.lineTo((bx+1)*60,(((by+1)*60)*mheight)-parseFloat(land.map[bx+1][by+1])); //+this.map[bx+1][by+1])*mheight);
		ctx.lineTo(bx*60,(((by+1)*60)*mheight)-parseFloat(land.map[bx][by+1])); //+this.map[bx][by+1])*mheight);		
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}
}

function dump(obj) {
	var out = '';
	for (var i in obj) {
			out += i + ": " + obj[i] + "\n";
	}
	alert(out);
}

printm = function() {
	ctx.fillStyle = '#333333';
	ctx.beginPath();
	ctx.rect(0, height - 20, width, height);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle= "#ffffff";
	ctx.font="12px monospace";
	ctx.fillText(message,5,height - 5);
}

function getMap(x,y){
	var cx;
	var wx = window.screenWidth;
	var wy = window.screenHeight;
	request=new XMLHttpRequest();
	request.onreadystatechange=function(){
	if (request.readyState==4 && request.status==200){
		cx = JSON.parse(request.responseText);
		//printm(request.responseText);
		}
	}
	request.open("GET","http://127.0.0.1/train/train.php?f=getTrack&x="+x+"&y="+y,true);
	request.setRequestHeader("Accept", "application/json");
	request.send();
}

menu=function(){
	this.drawRect = function (x, y, w, h, r,fillColor,lineColor) {
		x=x*width;
		y=y*height;
		w=w*width;
		h=h*height;
		r=r*height;
		if (w < 2 * r) r = w / 2;
		if (h < 2 * r) r = h / 2;
		ctx.beginPath();
		ctx.moveTo(x+r, y);
		ctx.arcTo(x+w, y,   x+w, y+h, r);
		ctx.arcTo(x+w, y+h, x,   y+h, r);
		ctx.arcTo(x,   y+h, x,   y,   r);
		ctx.arcTo(x,   y,   x+w, y,   r);
		ctx.closePath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = lineColor;
		ctx.fillStyle = fillColor;
		ctx.fill();
		ctx.stroke();
	}
	
	this.drawText = function(x,y,h,color,text){
		ctx.font = height*h + 'px Monospace';
		ctx.fillStyle = color;
		ctx.fillText(text,width*x,height*y);
	}
	
	this.hardFlip = function(x,y,w,h,c,chkVar){
		px = mouse.x/width;
		py = mouse.y/height;
		this.drawRect(x,y,w,h,c,"rgba(92, 64, 51, 0.4)",'#331A00');
		if (py > y & py < y+h & px > x & px < x+w & click == 1) {
			if (menuVar != chkVar) {
				menuVar = chkVar;
				click = 0;
			}
			else{
				menuVar = '';
			}
		}
		if (menuVar == chkVar) {
			this.drawRect(x,y,w*.75,h,c,"rgb(180, 180, 180)",'#331A00');
		}
		else {
			this.drawRect((x)+((w)*.25),y,(w)*.75,h,c,"rgb(180, 180, 180)",'#331A00');
		}
	}
	
	this.drawScroll = function (x,y,w,h,c,scrollvar){
		px = mouse.x/width;
		py = mouse.y/height;
		this.drawRect(x,y,w,h,c,"rgba(92, 64, 51, 0.4)",'#331A00');
		if (py > y & py < y+h & px > x & px < x+w & click == 2) {
			scrollvar = (px-(x))/(w);
		}
		this.drawRect((x)+((w)*scrollvar-(w*.075)),y,(w*.15),h,c,"rgb(180, 180, 180)",'#331A00')
		return scrollvar
	}
	
	this.mainMenu = function(){
		this.drawRect(.79,.03,.2,.94,.03,"rgba(166, 128, 100, 0.7)",'#331A00');
		this.drawText(.83,.86,.025,'#331A00','Lay Track');
		this.hardFlip(.83,.87,.12,.03,.01,'layTrack');
		this.drawText(.83,.76,.025,'#331A00','Halt');
		this.hardFlip(.83,.77,.12,.03,.01,'halt');
		this.drawText(.83,.63,.025,'#331A00','Terrain Tools');
		this.drawText(.83,.66,.025,'#331A00','up');
		this.hardFlip(.83,.67,.03,.03,.01,'tup');
		this.drawText(.872,.66,.025,'#331A00','down');
		this.hardFlip(.875,.67,.03,.03,.01,'tdown');
		this.drawText(.918,.66,.025,'#331A00','flat');
		this.hardFlip(.92,.67,.03,.03,.01,'tflat');
		refreshRate = this.drawScroll(.83,.47,.12,.03,.01,refreshRate);
		if (click != 2) {
			click = 0;
		}
	}
}
var menu = new menu;

document.getElementById('c').onclick = function() {
	click = 1;
}
document.getElementById('c').onmousedown = function() {
	click = 2;
}
document.getElementById('c').onmouseup = function() {
	click = 0;
}

//lol hotkeys
document.onkeypress = function(evt) {
    evt = evt || window.event;
		var charCode = evt.keyCode || evt.which;
    var nVar = '';
		//alert(charCode)
		if (charCode == 116 | charCode == 52) {nVar = 'layTrack';}
		else if (charCode == 115) {nVar = 'halt';}
		else if (charCode == 49) {nVar = 'tup';}
		else if (charCode == 50) {nVar = 'tdown';}
		else if (charCode == 51) {nVar = 'tflat';}
		else if (charCode == 113) {nVar = '';}
		
		if (menuVar == nVar) {
			menuVar = '';
		}
		else if (charCode != 99) {
			menuVar = nVar;
		}
		
		if (charCode == 99) {
			chold = 1;
		}
		else {
			chold = 0;
		}
};

window.onresize = function() {
	width = window.innerWidth; 
	height = window.innerHeight;
	c.width = pre_c.width = back_c.width = back_pre_c.width = width;
	c.height = pre_c.height = back_c.height = back_pre_c.height = height;
	mapSize = lastpos = [Math.ceil(width/60),Math.ceil(height/(60*mheight))];
	land.draw();
	track.move();
	
}

lerp = function(v1, v2, v3, v4, t) {
	this.l = function (v_1,v_2,time){
		xlerp = v_1.x + (( v_2.x - v_1.x ) * time); 
		ylerp = v_1.y + (( v_2.y - v_1.y ) * time);
		return new point(xlerp,ylerp);
	}

	v5 = new point;
	v6 = new point;
	v5 = this.l(v1,v2,t);
	v6 = this.l(v3,v4,t);
	var p = this.l(v5,v6,t);
	var p1 = this.l(v5,v6,t-.0001);
	r = Math.atan2((p1.y-p.y),(p1.x-p.x))-Math.PI/2
	
	var tempxy = findMapPos(p.x,p.y,-1);	
	
	if (tempxy[0] > -1 & tempxy[1] > -1 ) {
		var zlerp1 = this.l(new point (0, land.map[tempxy[0]][tempxy[1]]), new point (0, land.map[tempxy[0]+1][tempxy[1]]), (p.x-(tempxy[0]*60))/(60))
		var zlerp2 = this.l(new point (60, land.map[tempxy[0]][tempxy[1]+1]), new point (60, land.map[tempxy[0]+1][tempxy[1]+1]), (p.x-(tempxy[0]*60))/(60))
		var zlerp = this.l(new point(0,zlerp1.y),new point (60,zlerp2.y),(p.y-(tempxy[1]*60))/(60)).y
	}
	else{
		zlerp = 0
	}
	
	return [p.x,p.y,r,zlerp];
}

zbuf = function(v1, v2, v3, v4, x) {
	this.l = function (v_1,v_2,time){
		xlerp = v_1[0] + (( v_2[0] - v_1[0] ) * time); 
		ylerp = v_1[1] + (( v_2[1] - v_1[1] ) * time); 
		zlerp = v_1[2] + (( v_2[2] - v_1[2] ) * time);
		return [xlerp,ylerp,zlerp];
	}
	
	v5 = this.l(v1,v2,((v1[0]+i)/(v1[0]-v2[0])));
	v6 = this.l(v3,v4,((v3[0]+i)/(v3[0]-v4[0])));
	if ((v1[0]+i)/(v1[0]-v2[0]) > 1 | (v1[0]+i)/(v1[0]-v2[0]) < -1 |
			(v3[0]+i)/(v3[0]-v4[0]) > 1 | (v3[0]+i)/(v3[0]-v4[0]) < -1 |
			(v5[0]+i)/(v5[0]-v6[0]) > 1 | (v5[0]+i)/(v5[0]-v6[0]) < -1) {
		return -1;
	}
	else{
		return this.l(v5,v6,((v5[0]+i)/(v5[0]-v6[0])))[2];
	}
}

function drawObject(){
	var start;
	var fin;
	
	this.rotate = function(vec,rz,ry){
		for (i = 0; i < vec.length; i++) {
			nz = ((vec[i][2]*Math.cos(ry))-(vec[i][0]*Math.sin(ry)))
			tx = ((vec[i][2]*Math.sin(ry))+(vec[i][0]*Math.cos(ry)))
			nx = ((tx*Math.cos(rz))-(vec[i][1]*Math.sin(rz)))
			ny = ((tx*Math.sin(rz))+(vec[i][1]*Math.cos(rz)))
			vec[i] = [nx,ny,nz];
		}
		return vec;
	}
	
	this.draw = function(obj,x,y,rz,r){
		
		ry = 0;
		
		while (r > 2*Math.PI) {
			r-=2*Math.PI;
		}
		while (r < 0) {
			r+=2*Math.PI;
		}
		
		if (r >= 0 && r < Math.PI/2) {
			message = 'lf'
			face = obj.obj['lf'];
			norm = this.rotate(obj.obj['nlf'],rz,ry);
		}
		else if (r >= Math.PI/2 && r < Math.PI) {
			message = 'rf'
			face = obj.obj['rf'];
			norm = this.rotate(obj.obj['nrf'],rz,ry);
		}
		else if (r >= Math.PI && r < (1.5*Math.PI)) {
			message = 'rb'
			face = obj.obj['rb'];
			norm = this.rotate(obj.obj['nrb'],rz,ry);
		}
		else {
			message = 'lb'
			face = obj.obj['lb'];
			norm = this.rotate(obj.obj['nlb'],rz,ry);
		}
		
		vec = this.rotate(obj.obj['vec'],rz,ry);
		
		/*
		var drawData = ctx.createImageData(
			Math.abs(obj.obj['xmin'])+Math.abs(obj.obj['xmax']),
			Math.abs(obj.obj['ymin'])+Math.abs(obj.obj['ymax']));
		
		x = 0;
		for (i = obj.obj['xmin']; i <= obj.obj['xmax']; i++) {
			x++;
			y = 0;
			for (j = obj.obj['ymin']; j <= obj.obj['ymax']; j++) {
				col = [-1,-1,-1];
				for (k = 0; k < face.length; k++) {
					//if (dot(new point(i,j+240,120),norm[k]) < 0) {
						nl = vec[face[k][1]]
						nm = vec[face[k][face[k].length-1]]
						z = maxz
						m=face[k].length
						for (l = 1; l <= Math.floor(face[k].length/2); l++) {
							m--;
							ol = nl;
							om = nm;
							nm = vec[face[k][m]]
							nl = vec[face[k][l]]
							//alert( nm+' '+nl)
							//printm();
							if ((Math.min(ol[0],nl[0],om[0],nm[0]) < i
								& (Math.max(ol[0],nl[0],om[0],nm[0]) > i)
								& (Math.min((ol[2]+mheight*ol[1]),(ol[2]+mheight*ol[1]),(ol[2]+mheight*ol[1]),(ol[2]+mheight*ol[1])) < j)
								& (Math.max((ol[2]+mheight*ol[1]),(ol[2]+mheight*ol[1]),(ol[2]+mheight*ol[1]),(ol[2]+mheight*ol[1])) > j))){
								za = zbuf(ol,nl,om,nm,i)
								if (za < z & za != -1) {
									z = za
									col = face[k][0];
									break
								}
							}
						}
					//}
				}
				if (col[0] >= 0) {
					var index = (i + j * Width) * 4;
					drawData.data[index + 0] = col[0];
					drawData.data[index + 1] = col[1];
					drawData.data[index + 2] = col[2];
					drawData.data[index + 3] = 255;
				}
			}
		}
		ctx.putImageData(drawData, dx, dy);
		*/
		
		for (var i=0;i < face.length;i++) {
			var il = face[i].length;
			/*if (obj.obj[i][2][2] == obj.obj[i][0][2] && obj.obj[i][3][2] == obj.obj[i][1][2] && obj.obj[i][2][2] == obj.obj[i][3][2]) {
				ctx.fillStyle = '#ffffff'
			}
			else {
				var dx = ((obj.obj[i][il][1][0]*Math.cos(r))-(obj.obj[i][il][1][1]*Math.sin(r)))-((obj.obj[i][il][0][0]*Math.cos(r))-(obj.obj[i][il][0][1]*Math.sin(r)));
				var dy = ((obj.obj[i][il][1][0]*Math.sin(r))+(obj.obj[i][il][1][1])*Math.cos(r))-((obj.obj[i][il][0][0]*Math.sin(r))+(obj.obj[i][il][0][1])*Math.cos(r));
				var shader = Math.acos((dy)/(Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2))));
				ctx.strokeStyle = '#000000';
				if (shader >= Math.PI/2 && shader<=Math.PI) {
					var shaderv =  (1-(shader/Math.PI))*2;
					ctx.fillStyle = '#'+addHexColor('ffffff',shaderv);
					//printm(shader + '\t ' + shaderv + '\t '+ addHexColor('ffffff',shaderv));
				}
				else{
					ctx.fillStyle = '#ffffff'
				}
			}*/
			
			//if (cross([norm rotated]) / Math.sqrt(Math.pow(norma) ... b) < 90) {
			//if (dot(new point(-2400,0,1200),new point(norm[i][0],norm[i][1],norm[i][2])) < 0) {
				ctx.lineWidth = 3;
				ctx.fillStyle = 'rgba('+face[i][0][0].toString()+','+face[i][0][1].toString()+','+face[i][0][2].toString()+',1)'
				ctx.beginPath();
				ctx.moveTo((vec[face[i][1]][0] + x),
								 (((mheight*vec[face[i][1]][1]) - (vec[face[i][1]][2])) + y));
				for (var j=2; j < il;j++){
					ctx.lineTo((vec[face[i][j]][0] + x),
								 (((mheight*vec[face[i][j]][1]) - (vec[face[i][j]][2])) + y))
				}
				ctx.closePath();
				ctx.lineJoin = 'round';
				ctx.stroke();
				ctx.fill();
			}
		//}
	}
}

findTrackDir = function(base,dir){
	x = dir.x - base.x
	y = dir.y - base.y
	if (y == 0) {
		if (x > 0) {return 'e'}
		else if (x < 0) {return 'w'}
		else {return 'error'};
	}
	else if (y < 0) {
		if (x == 0) {return 'n'}
		else if (x < 0) {return 'nw'}
		else if (x > 0) {return 'ne'}
		else {return 'error'}
	}
	else if (y > 0){
		if (x == 0) {return 's'}
		else if (x < 0) {return 'sw'}
		else if (x > 0) {return 'se'}
		else {return 'error'}
	}
	return 'error'
}

function findMapPos(x,y,type) {
	var di = -1;
	var dj = -1;
	var dz = -1;
	var dz = -1;
	if (type == 1) {
		for (var i = 0; i < mapSize[0]; i++) {
			if (x > (i*60) && x <= ((i+1)*60)) {
				for (var j = 0; j < mapSize[1]; j++) {
					top_z = parseFloat(land.map[i][j])+((parseFloat(land.map[i+1][j])-parseFloat(land.map[i][j]))*((x-(i*60))/60))
					bot_z = parseFloat(land.map[i][j+1])+((parseFloat(land.map[i+1][j+1])-parseFloat(land.map[i][j+1]))*((x-(i*60))/60))
					//yt = ((y)-((j*60)-top_z))/(((((j+1)*60))-bot_z)-(((j*60))-top_z))
					//z = top_z+((bot_z-top_z)*yt)
					if(y+top_z > (j*60)-top_z & y+bot_z < ((j+1) * 60)-bot_z)	{
						//message = (i+' '+j+' '+x+' '+y+' '+z+' | '+eval((j*60)-bot_z)+' '+bot_z +' | '+yt+' '+((j+1)*60)+' '+eval(((j+1)*60)-bot_z))+' | '+((y)-((j*60)-top_z)+' '+(((((j+1)*60))-bot_z)-(((j*60))-top_z)))
						//message = x+' '+ eval((j+1)*60)-(parseFloat(land.map[i][(j+2)+1]+(parseFloat(land.map[i+1][(j+2)+1]-parseFloat(land.map[i][(j+2)+1])*((x-(i*60))/60))
						di = i;
						dj = j;
						//dz = z;
					}
				}
			}
		}
		return [di,dj]
	}
	else{
		
		i = Math.floor(x/60);
		j = Math.floor(y/60);
		if (i>=0 &j >=0) {
			top_z = parseFloat(land.map[i][j])+((parseFloat(land.map[i+1][j])-parseFloat(land.map[i][j]))*((x-(i*60))/60))
			bot_z = parseFloat(land.map[i][j+1])+((parseFloat(land.map[i+1][j+1])-parseFloat(land.map[i][j+1]))*((x-(i*60))/60))
			yt = ((y)-((j*60)-top_z))/(((((j+1)*60))-bot_z)-(((j*60))-top_z))
			z = top_z+((bot_z-top_z)*yt)
			
			
			/*ctx.strokeStyle = '#af4d0e';
			ctx.lineWidth = 2;
			ctx.moveTo(i*60,mheight*((j*60))-parseFloat(land.map[i][j]));
			ctx.lineTo((i+1)*60,mheight*((j*60))-parseFloat(land.map[i+1][j]));
			ctx.moveTo(i*60,mheight*(((j+1)*60))-parseFloat(land.map[i][j+1]));
			ctx.lineTo((i+1)*60,(mheight*((j+1)*60))-parseFloat(land.map[i+1][j+1]));
			ctx.moveTo(x,mheight*((j*60))-top_z);
			ctx.lineTo(x,mheight*(((j+1)*60))-bot_z);
			ctx.stroke();
			
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(x,y*mheight-z);
			ctx.lineTo(x,(mheight*y)+1-z);
			ctx.stroke(); */
			//message = (i+' '+j+' '+x+' '+y+' '+z+' | '+eval((j*60)-bot_z)+' '+bot_z +' | '+yt+' '+((j+1)*60)+' '+eval(((j+1)*60)-bot_z))+' | '+((y)-((j*60)-top_z)+' '+(((((j+1)*60))-bot_z)-(((j*60))-top_z)))
			//message = x+' '+ eval(((j+1)*60)-(parseFloat(land.map[i][(j+2)+1]+(parseFloat(land.map[i+1][(j+2)+1]-parseFloat(land.map[i][(j+2)+1])*((x-(i*60))/60))))))
		}
		return [i,j,z]
	}
}

document.onmousemove=function(evt) {
	evt = (evt || event);
	mouse.x = evt.clientX;
	mouse.y = evt.clientY;
	//if (menuVar == 'layTrack') {
		//mouse.y = Math.round(mouse.y/(mheight*60))*(mheight*60);
		//mouse.x = Math.round(mouse.x/60)*60;
	// }
	if (mouse.x < width*.78 & mouse.x > 0 & mouse.y > 0 & mouse.y < height) {
		mouse_pos = findMapPos(mouse.x,mouse.y/mheight,1);
	}
	else{
		mouse_pos = [-1,-1,0]
	}
}

drawMouse = function(){
	ctx.strokeStyle = '#0B4C5F';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(mouse.x+10,mouse.y);
	ctx.lineTo(mouse.x,mouse.y+10);
	ctx.lineTo(mouse.x,mouse.y);
	ctx.closePath();
	ctx.stroke();
}

designTrack = function() {
	
	this.init = function(){
		this.start = -1;
		this.dir = '';
		this.cur_seg = 0;
		this.curTrack = [];
		this.start_dir=[-1,-1];
		this.switchPos = [-1,-1];
	}
	
	this.op_dir = function(dir){
		if (dir == 'n') {return 's'}
		else if (dir == 's') {return 'n'}
		else if (dir == 'e') {return 'w'}
		else if (dir == 'w') {return 'e'}
		else if (dir == 'ne') {return 'sw'}
		else if (dir == 'se') {return 'nw'}
		else if (dir == 'nw') {return 'se'}
		else if (dir == 'sw') {return 'ne'}
		else return '-1'
	}
	
	this.startTrack = function(trackArray){
		if (this.start == -2 & menuVar == 'layTrack') {
			this.start = -1;
			this.start_dir= [-1,-1];
			this.cur_seg = -1;
			this.switchPos = [-1,-1];
			return this.draw(trackArray);
		}
		else if (this.start != -2 & menuVar == 'layTrack') {
			return this.draw(trackArray);
		}
		else if (menuVar != 'layTrack') {
			this.start = -2;
		}
		return trackArray;
	}
	
	this.boxSwitch = function(x,y,ox,oy){
		/*if (dir == 'n') {ox = 0; oy = -1;}
		else if (dir == 's') {ox = 0; oy = 1;}
		else if (dir == 'e') {ox = 1; oy = 0;}
		else if (dir == 'w') {ox = -1; oy = 0;}
		else if (dir == 'ne') {ox = 1; oy = -1;}
		else if (dir == 'se') {ox = 1; oy = 1;}
		else if (dir == 'nw') {ox = -1; oy = -1;}
		else if (dir == 'sw') {ox = -1; oy = 1;}*/
		box(x+ox,y+oy,'#0B4C5F','rgba(70,150,140,.5)')
		if (mouse_pos[0] == x+ox & mouse_pos[1] == y+oy) {
			box(x,y,'#957A0D','rgba(250,215,110,.5)')
			box(x+ox,y+oy,'#957A0D','rgba(250,215,110,.5)')
			if (click == 1) {
				info = track.addSwitch(this.start_dir[0],this.start_dir[1],ox,oy);
				this.start_dir = [-1,-1]
				this.curTrack = [info[0].x,info[0].y,info[0].z];
				this.cur_seg = info[2]
				this.dir = info[1]
				this.start = 1;
				click = 0;
			}
		}
	}
	
	this.findSwitch = function(trackArray){
		i=this.start_dir[0];
		j=this.start_dir[1];
		tlen = trackArray[i][j].length - 2
		xy = findMapPos(trackArray[i][j][0].x,trackArray[i][j][0].y-trackArray[i][j][0].z,1)
		ptlen = trackArray[i][j-1].length - 2
		box(xy[0],xy[1],'#0B4C5F','rgba(250,215,110,.2)')
		message = trackArray[i][j-1][ptlen] + ' '+ trackArray[i][j][tlen]
		if (trackArray[i][j][tlen] == 'n') {
			if (trackArray[i][j][tlen+1] == 's') {this.boxSwitch(xy[0],xy[1],-1,2); this.boxSwitch(xy[0],xy[1],1,2)}
			else if (trackArray[i][j][tlen+1] == 'se' | trackArray[i][j][tlen+1] == 'e') {this.boxSwitch(xy[0],xy[1],0,1); this.boxSwitch(xy[0],xy[1],-1,2)}
			else if (trackArray[i][j][tlen+1] == 'sw' | trackArray[i][j][tlen+1] == 'w') {this.boxSwitch(xy[0],xy[1],0,1); this.boxSwitch(xy[0],xy[1],1,2)}
			if (trackArray[i][j-1][ptlen] == 'n') {this.boxSwitch(xy[0],xy[1],-1,-2,'nw'); this.boxSwitch(xy[0],xy[1],1,-2)}
			else if (trackArray[i][j-1][ptlen] == 'ne' | trackArray[i][j-1][ptlen] == 'e') {this.boxSwitch(xy[0],xy[1],0,-1); this.boxSwitch(xy[0],xy[1],-1,-2)}
			else if (trackArray[i][j-1][ptlen] == 'nw' | trackArray[i][j-1][ptlen] == 'w') {this.boxSwitch(xy[0],xy[1],0,-1); this.boxSwitch(xy[0],xy[1],1,-2)}
		}
		else if (trackArray[i][j][tlen] == 's') {
			if (trackArray[i][j][tlen+1] == 'n') {this.boxSwitch(xy[0],xy[1],-1,-2); this.boxSwitch(xy[0],xy[1],1,-2)}
			else if (trackArray[i][j][tlen+1] == 'ne' | trackArray[i][j][tlen+1] == 'e') {this.boxSwitch(xy[0],xy[1],0,-1); this.boxSwitch(xy[0],xy[1],-1,-2)}
			else if (trackArray[i][j][tlen+1] == 'nw' | trackArray[i][j][tlen+1] == 'w') {this.boxSwitch(xy[0],xy[1],0,-1); this.boxSwitch(xy[0],xy[1],1,-2)}
			if (trackArray[i][j-1][ptlen] == 's') {this.boxSwitch(xy[0],xy[1],-1,2); this.boxSwitch(xy[0],xy[1],1,2)}
			else if (trackArray[i][j-1][ptlen] == 'se' | trackArray[i][j-1][ptlen] == 'e') {this.boxSwitch(xy[0],xy[1],0,1); this.boxSwitch(xy[0],xy[1],-1,2)}
			else if (trackArray[i][j-1][ptlen] == 'sw' | trackArray[i][j-1][ptlen] == 'w') {this.boxSwitch(xy[0],xy[1],0,1); this.boxSwitch(xy[0],xy[1],1,2)}
		}
		else if (trackArray[i][j][tlen] == 'w') {
			if (trackArray[i][j][tlen+1] == 'e') {this.boxSwitch(xy[0],xy[1],2,1); this.boxSwitch(xy[0],xy[1],2,-1)}
			else if (trackArray[i][j][tlen+1] == 'ne' | trackArray[i][j][tlen+1] == 'n') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],2,1)}
			else if (trackArray[i][j][tlen+1] == 'se' | trackArray[i][j][tlen+1] == 's') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],2,-1)}
			if (trackArray[i][j-1][ptlen] == 'w') {this.boxSwitch(xy[0],xy[1],-2,-1); this.boxSwitch(xy[0],xy[1],-2,1)}
			else if (trackArray[i][j-1][ptlen] == 'nw' | trackArray[i][j-1][ptlen] == 'n') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],-2,-1)}
			else if (trackArray[i][j-1][ptlen] == 'sw' | trackArray[i][j-1][ptlen] == 's') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],-2,1)}
		}
		else if (trackArray[i][j][tlen] == 'e') {
			if (trackArray[i][j][tlen+1] == 'w') {this.boxSwitch(xy[0],xy[1],-2,1); this.boxSwitch(xy[0],xy[1],-2,-1)}
			else if (trackArray[i][j][tlen+1] == 'nw' | trackArray[i][j][tlen+1] == 'n') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],-2,1)}
			else if (trackArray[i][j][tlen+1] == 'sw' | trackArray[i][j][tlen+1] == 's') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],-2,-1)}
			if (trackArray[i][j-1][ptlen] == 'e') {this.boxSwitch(xy[0],xy[1],2,-1); this.boxSwitch(xy[0],xy[1],2,1)}
			else if (trackArray[i][j-1][ptlen] == 'nw' | trackArray[i][j-1][ptlen] == 'n') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],2,-1)}
			else if (trackArray[i][j-1][ptlen] == 'sw' | trackArray[i][j-1][ptlen] == 's') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],2,1)}
		}
		else if (trackArray[i][j][tlen] == 'ne') {
			if (trackArray[i][j][tlen+1] == 'sw') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],0,1)}
			else if (trackArray[i][j][tlen+1] == 'w') {this.boxSwitch(xy[0],xy[1],-1,1); this.boxSwitch(xy[0],xy[1],0,1)}
			else if (trackArray[i][j][tlen+1] == 's') {this.boxSwitch(xy[0],xy[1],-1,1); this.boxSwitch(xy[0],xy[1],-1,0)}
			else if (trackArray[i][j-1][ptlen] == 'ne') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],0,-1)}
			else if (trackArray[i][j-1][ptlen] == 'e') {this.boxSwitch(xy[0],xy[1],0,-1); this.boxSwitch(xy[0],xy[1],1,-1)}
			else if (trackArray[i][j-1][ptlen] == 'n') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],1,-1)}
		}
		else if (trackArray[i][j][tlen] == 'nw') {
			if (trackArray[i][j][tlen+1] == 'se') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],0,1)}
			else if (trackArray[i][j][tlen+1] == 'e') {this.boxSwitch(xy[0],xy[1],1,1); this.boxSwitch(xy[0],xy[1],0,1)}
			else if (trackArray[i][j][tlen+1] == 's') {this.boxSwitch(xy[0],xy[1],1,1); this.boxSwitch(xy[0],xy[1],1,0)}
			if (trackArray[i][j-1][ptlen] == 'nw') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],0,-1)}
			else if (trackArray[i][j-1][ptlen] == 'w') {this.boxSwitch(xy[0],xy[1],0,-1); this.boxSwitch(xy[0],xy[1],-1,-1)}
			else if (trackArray[i][j-1][ptlen] == 'n') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],-1,-1)}
		}
		else if (trackArray[i][j][tlen] == 'se') {
			if (trackArray[i][j][tlen+1] == 'nw') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],0,-1)}
			else if (trackArray[i][j][tlen+1] == 'w') {this.boxSwitch(xy[0],xy[1],-1,-1); this.boxSwitch(xy[0],xy[1],0,-1)}
			else if (trackArray[i][j][tlen+1] == 'n') {this.boxSwitch(xy[0],xy[1],-1,-1); this.boxSwitch(xy[0],xy[1],-1,0)}
			if (trackArray[i][j-1][ptlen] == 'se') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],0,1)}
			else if (trackArray[i][j-1][ptlen] == 'e') {this.boxSwitch(xy[0],xy[1],0,1); this.boxSwitch(xy[0],xy[1],1,1)}
			else if (trackArray[i][j-1][ptlen] == 's') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],1,1)}
		}
		else if (trackArray[i][j][tlen] == 'sw') {
			if (trackArray[i][j][tlen+1] == 'ne') {this.boxSwitch(xy[0],xy[1],1,0); this.boxSwitch(xy[0],xy[1],0,-1)}
			else if (trackArray[i][j][tlen+1] == 'e') {this.boxSwitch(xy[0],xy[1],1,-1); this.boxSwitch(xy[0],xy[1],0,-1)}
			else if (trackArray[i][j][tlen+1] == 'n') {this.boxSwitch(xy[0],xy[1],1,-1); this.boxSwitch(xy[0],xy[1],1,0)}
			if (trackArray[i][j-1][ptlen] == 'sw') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],0,1)}
			else if (trackArray[i][j-1][ptlen] == 'e') {this.boxSwitch(xy[0],xy[1],0,1); this.boxSwitch(xy[0],xy[1],-1,1)}
			else if (trackArray[i][j-1][ptlen] == 's') {this.boxSwitch(xy[0],xy[1],-1,0); this.boxSwitch(xy[0],xy[1],-1,1)}
		}
		
		//if click then make 1 array 2 (overwrite 1 and push 2) then push 3
		//add curve track
		
	}
	
	this.findStart = function(trackArray,i,j){
		xy = findMapPos(trackArray[i][j][0].x,trackArray[i][j][0].y-trackArray[i][j][0].z,1)
		box(xy[0],xy[1],'#0B4C5F','rgba(70,150,140,.5)')
		if (click == 1) {
			click = 0;
			return [i,j];
		}
		else{
			return [-1,-1];
		}
	}
	
	this.draw = function(trackArray){
			
		mx = (mouse_pos[0] * 60) + 30;
		my = (mouse_pos[1] * 60) + 30;
		if (mouse_pos[0] != -1) {
			mz = findMapPos(mx,my,2)[2]
		}
		else{
			mz = -1;
		}
		if (this.start == -1 & mouse_pos[0] >= 0) {
			closer = 30;
			for (i = 0; i < trackArray.length; i++) {
				for (j = 0; j < trackArray[i].length;j++) {
					//message = distance(trackArray[0][0],new point (mouse.x,mouse.y/mheight,mouse.z))
					if (this.start_dir[0] >= 0) {
						
						//if there is a piece before this one
						if (trackArray[this.start_dir[0]][this.start_dir[1]-1] !== undefined) {
							this.findSwitch(trackArray,this.start_dir);
							break;
						}
						this.start_dir=[-1,-1];
					}
					else if (trackArray[i][j].length == 4 & this.start == -1) {
						if (distance(trackArray[i][j][0],new point (mouse.x,mouse.y/mheight,mouse.z)) < closer){
								//and not a switch
								this.start_dir = this.findStart(trackArray,i,j)
						}
						else if (distance(trackArray[i][j][1],new point (mouse.x,mouse.y/mheight,mouse.z)) < closer){
								//and not a switch
							//is it the end of a line?
						}
					}
					else if (trackArray[i][j].length == 5 & this.start == -1) {
						if (distance(trackArray[i][j][0],new point (mouse.x,mouse.y/mheight,mouse.z)) < closer){
								//and not a switch
								this.start_dir = this.findStart(trackArray,i,j)
						}
						else if (distance(trackArray[i][j][2],new point (mouse.x,mouse.y/mheight,mouse.z)) < closer){
								//and not a switch
							//is it the end of a line?
						}
					}
				}
			}
			
			//if it is the end of a section, add track by setting segnum to that segment and trackArray to that trackarray and just let it continue...
			//need a way to lay track in reverse... just create a new track?
			//what about someone who lays track on the intersection of 2 track segments?
			
			if (click == 1 & this.start == -1 & this.start_dir[0] == -1) {
				var nt = new point(mx,my,mz);
				this.dir = 'w';
				trackArray.push([[nt,nt,track.op_dir(this.dir),track.op_dir(this.dir)],[nt,nt,this.dir,this.dir]]);
				this.cur_seg = trackArray.length-1;
				this.curTrack = [nt.x,nt.y,nt.z];
				this.start = 1;
			}
		}
		else if (this.start == 1){
			message = this.cur_seg;
			var cur_t_xy = findMapPos(this.curTrack[0],this.curTrack[1],-1);
			//conditions up down left right dl dr ul ur
			if (this.dir == 'w') {
				box(cur_t_xy[0]-1,cur_t_xy[1],'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-2,cur_t_xy[1]-1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-2,cur_t_xy[1]+1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-3,cur_t_xy[1]-3,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-3,cur_t_xy[1]+3,'#0B4C5F','rgba(70,150,140,.5)')
				//printm(mx+' '+my);
				if (mx == this.curTrack[0]-60 & my == this.curTrack[1]) {
					if (click == 1) {
						track.addStraightTrack(this.cur_seg,mx,my,mz,'w','w')
						this.curTrack=[mx,my,mz];
					}
					else{
						box(cur_t_xy[0]-1,cur_t_xy[1],'#957A0D','rgba(250,215,110,.5)')
					}
				}
				if (mx == this.curTrack[0]-120 ) {
					if (my == this.curTrack [1] - 60) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0]-60,this.curTrack[1],this.curTrack[2],mx,my,mz,this.dir,'nw');
							this.dir = 'nw';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]-2,cur_t_xy[1]-1,'#957A0D','rgba(250,215,110,.5)')
						}	
					}
					else if (my == this.curTrack[1] + 60 ) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0]-60,this.curTrack[1],this.curTrack[2],mx,my,mz,this.dir,'sw');
							this.dir = 'sw';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]-2,cur_t_xy[1]+1,'#957A0D','rgba(250,215,110,.5)')
						}	
					}
				}
				else if (mx == this.curTrack[0]-180 ) {
					if (my == this.curTrack[1] - 180) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,mx,this.curTrack[1],this.curTrack[2],mx,my,mz,this.dir,'n');
							this.dir = 'n';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]-3,cur_t_xy[1]-3,'#957A0D','rgba(250,215,110,.5)')
						}
					}
					else if (my == this.curTrack[1] + 180) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,mx,this.curTrack[1],this.curTrack[2],mx,my,mz,this.dir,'s');
							this.dir = 's';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]-3,cur_t_xy[1]+3,'#957A0D','rgba(250,215,110,.5)')
						}
					}
				}
			}
			else if (this.dir == 'e') {
				box(cur_t_xy[0]+1,cur_t_xy[1],'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+2,cur_t_xy[1]-1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+2,cur_t_xy[1]+1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+3,cur_t_xy[1]-3,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+3,cur_t_xy[1]+3,'#0B4C5F','rgba(70,150,140,.5)')
				//printm(mx+' '+my);
				if (mx == this.curTrack[0]+60 & my == this.curTrack[1]) {
					if (click == 1) {
						track.addStraightTrack(this.cur_seg,mx,my,mz,this.dir,this.dir);
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]+1,cur_t_xy[1],'#957A0D','rgba(250,215,110,.5)')
					}
				}
				if (mx == this.curTrack[0]+120 ) {
					if (my == this.curTrack [1] - 60) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0]+60,this.curTrack[1],this.curTrack[2],mx,my,mz,this.dir,'ne');
							this.dir = 'ne';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]+2,cur_t_xy[1]-1,'#957A0D','rgba(250,215,110,.5)')
						}	
					}
					else if (my == this.curTrack[1] + 60 ) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0]+60,this.curTrack[1],this.curTrack[2],mx,my,mz,this.dir,'se');
							this.dir = 'se';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]+2,cur_t_xy[1]+1,'#957A0D','rgba(250,215,110,.5)')
						}	
					}
				}
				else if (mx == this.curTrack[0]+180 ) {
					if (my == this.curTrack[1] - 180) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,mx,this.curTrack[1],this.curTrack[2],mx,my,mz,this.dir,'n');
							this.dir = 'n';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]+3,cur_t_xy[1]-3,'#957A0D','rgba(250,215,110,.5)')
						}
					}
					else if (my == this.curTrack[1] + 180) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,mx,this.curTrack[1],this.curTrack[2],mx,my,mz,this.dir,'s');
							this.dir = 's';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]+3,cur_t_xy[1]+3,'#957A0D','rgba(250,215,110,.5)')
						}
					}
				}
			}
			else if (this.dir == 's') {
				box(cur_t_xy[0],cur_t_xy[1]+1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+1,cur_t_xy[1]+2,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-1,cur_t_xy[1]+2,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+3,cur_t_xy[1]+3,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-3,cur_t_xy[1]+3,'#0B4C5F','rgba(70,150,140,.5)')
				if (my == this.curTrack[1]+60 & mx == this.curTrack[0]) {
					if (click == 1) {
						track.addStraightTrack(this.cur_seg,mx,my,mz,this.dir,this.dir);
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0],cur_t_xy[1]+1,'#957A0D','rgba(250,215,110,.5)')
					}
				}
				if (my == this.curTrack[1]+120 ) {
					if (mx == this.curTrack [0] - 60) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0],this.curTrack[1]+60,this.curTrack[2],mx,my,mz,this.dir,'sw');
							this.dir = 'sw';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]-1,cur_t_xy[1]+2,'#957A0D','rgba(250,215,110,.5)')
						}	
					}
					else if (mx == this.curTrack[0] + 60) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0],this.curTrack[1]+60,mz,mx,my,mz,this.dir,'se');
							this.dir = 'se';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]+1,cur_t_xy[1]+2,'#957A0D','rgba(250,215,110,.5)')
						}	
					}
				}
				else if (my == this.curTrack[1]+180 ) {
					if (mx == this.curTrack[0] - 180) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0],my,this.curTrack[2],mx,my,mz,this.dir,'w');
							this.dir = 'w';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]-3,cur_t_xy[1]+3,'#957A0D','rgba(250,215,110,.5)')
						}
					}
					else if (mx == this.curTrack[0] + 180) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0],my,this.curTrack[2],mx,my,mz,this.dir,'e');
							this.dir = 'e';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]+3,cur_t_xy[1]+3,'#957A0D','rgba(250,215,110,.5)')
						}
					}
				}
			}
			else if (this.dir == 'n') {
				box(cur_t_xy[0],cur_t_xy[1]-1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+1,cur_t_xy[1]-2,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-1,cur_t_xy[1]-2,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+3,cur_t_xy[1]-3,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-3,cur_t_xy[1]-3,'#0B4C5F','rgba(70,150,140,.5)')
				if (my == this.curTrack[1]-60 & mx == this.curTrack[0]) {
					if (click == 1) {
						track.addStraightTrack(this.cur_seg,mx,my,mz,this.dir,this.dir);
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0],cur_t_xy[1]-1,'#957A0D','rgba(250,215,110,.5)')
					}
				}
				if (my == this.curTrack[1]-120 ) {
					if (mx == this.curTrack [0] - 60) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0],this.curTrack[1]-60,this.curTrack[2],mx,my,mz,this.dir,'nw');
							this.dir = 'nw';
						this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]-1,cur_t_xy[1]-2,'#957A0D','rgba(250,215,110,.5)')
						}	
					}
					else if (mx == this.curTrack[0] + 60) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0],this.curTrack[1]-60,this.curTrack[2],mx,my,mz,this.dir,'ne');
							this.dir = 'ne';
						this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]+1,cur_t_xy[1]-2,'#957A0D','rgba(250,215,110,.5)')
						}	
					}
				}
				else if (my == this.curTrack[1]-180 ) {
					if (mx == this.curTrack[0] - 180) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0],my,this.curTrack[2],mx,my,mz,this.dir,'w');
							this.dir = 'w';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]-3,cur_t_xy[1]-3,'#957A0D','rgba(250,215,110,.5)')
						}
					}
					else if (mx == this.curTrack[0] + 180) {
						if (click == 1) {
							track.addCurveTrack(this.cur_seg,this.curTrack[0],my,this.curTrack[2],mx,my,mz,this.dir,'e');
							this.dir = 'e';
							this.curTrack=[mx,my,mz];
						}
						else{
							box(cur_t_xy[0]+3,cur_t_xy[1]-3,'#957A0D','rgba(250,215,110,.5)')
						}
					}
				}
			}
			
			else if (this.dir == 'ne' ) {
				box(cur_t_xy[0]+1,cur_t_xy[1]-1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+1,cur_t_xy[1]-2,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+2,cur_t_xy[1]-1,'#0B4C5F','rgba(70,150,140,.5)')
				if (mx == this.curTrack[0]+60 & my == this.curTrack[1] -60) {
					if (click == 1) {
						track.addStraightTrack(this.cur_seg,mx,my,mz,this.dir,this.dir);
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]+1,cur_t_xy[1]-1,'#957A0D','rgba(250,215,110,.5)')
					}
				}
				else if (my == this.curTrack[1]-120 & mx == this.curTrack [0] + 60) {
					if (click == 1) {
						track.addCurveTrack(this.cur_seg,this.curTrack[0]+60,this.curTrack[1]-60,mz,mx,my,mz,this.dir,'n');
						this.dir = 'n';
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]+1,cur_t_xy[1]-2,'#957A0D','rgba(250,215,110,.5)')
					}	
				}
				else if (my == this.curTrack[1]-60 & mx == this.curTrack [0] + 120) {
					if (click == 1) {
						track.addCurveTrack(this.cur_seg,this.curTrack[0]+60,this.curTrack[1]-60,mz,mx,my,mz,this.dir,'e');
						this.dir = 'e';
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]+2,cur_t_xy[1]-1,'#957A0D','rgba(250,215,110,.5)')
					}	
				}
			}
			else if (this.dir == 'se' ) {
				box(cur_t_xy[0]+1,cur_t_xy[1]+1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+1,cur_t_xy[1]+2,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]+2,cur_t_xy[1]+1,'#0B4C5F','rgba(70,150,140,.5)')
				if (mx == this.curTrack[0]+60 & my == this.curTrack[1] +60) {
					if (click == 1) {
						track.addStraightTrack(this.cur_seg,mx,my,mz,this.dir,this.dir);
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]+1,cur_t_xy[1]+1,'#957A0D','rgba(250,215,110,.5)')
					}
				}
				else if (my == this.curTrack[1]+120 & mx == this.curTrack [0] + 60) {
					if (click == 1) {
						track.addCurveTrack(this.cur_seg,this.curTrack[0]+60,this.curTrack[1]+60,mz,mx,my,mz,this.dir,'s');
						this.dir = 's';
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]+1,cur_t_xy[1]+2,'#957A0D','rgba(250,215,110,.5)')
					}	
				}
				else if (my == this.curTrack[1]+60 & mx == this.curTrack [0] + 120) {
					if (click == 1) {
						track.addCurveTrack(this.cur_seg,this.curTrack[0]+60,this.curTrack[1]+60,mz,mx,my,mz,this.dir,'e');
						this.dir = 'e';
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]+2,cur_t_xy[1]+1,'#957A0D','rgba(250,215,110,.5)')
					}	
				}
			}
			else if (this.dir == 'nw' ) {
				box(cur_t_xy[0]-1,cur_t_xy[1]-1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-1,cur_t_xy[1]-2,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-2,cur_t_xy[1]-1,'#0B4C5F','rgba(70,150,140,.5)')
				if (mx == this.curTrack[0]-60 & my == this.curTrack[1] -60) {
					if (click == 1) {
						track.addStraightTrack(this.cur_seg,mx,my,mz,this.dir,this.dir);
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]-1,cur_t_xy[1]-1,'#957A0D','rgba(250,215,110,.5)')
					}
				}
				else if (my == this.curTrack[1]-120 & mx == this.curTrack [0] - 60) {
					if (click == 1) {
						track.addCurveTrack(this.cur_seg,this.curTrack[0]-60,this.curTrack[1]-60,mz,mx,my,mz,this.dir,'n');
						this.dir = 'n';
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]-1,cur_t_xy[1]-2,'#957A0D','rgba(250,215,110,.5)')
					}	
				}
				else if (my == this.curTrack[1]-60 & mx == this.curTrack [0] - 120) {
					if (click == 1) {
						track.addCurveTrack(this.cur_seg,this.curTrack[0]-60,this.curTrack[1]-60,mz,mx,my,mz,this.dir,'w');
						this.dir = 'w';
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]-2,cur_t_xy[1]-1,'#957A0D','rgba(250,215,110,.5)')
					}	
				}
			}
			else if (this.dir == 'sw' ) {
				box(cur_t_xy[0]-1,cur_t_xy[1]+1,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-1,cur_t_xy[1]+2,'#0B4C5F','rgba(70,150,140,.5)')
				box(cur_t_xy[0]-2,cur_t_xy[1]+1,'#0B4C5F','rgba(70,150,140,.5)')
				if (mx == this.curTrack[0]-60 & my == this.curTrack[1] +60) {
					if (click == 1) {
						track.addStraightTrack(this.cur_seg,mx,my,mz,this.dir,this.dir);
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]-1,cur_t_xy[1]+1,'#957A0D','rgba(250,215,110,.5)')
					}
				}
				else if (my == this.curTrack[1]+120 & mx == this.curTrack [0] - 60) {
					if (click == 1) {
						track.addCurveTrack(this.cur_seg,this.curTrack[0]-60,this.curTrack[1]+60,mz,mx,my,mz,this.dir,'s');
						this.dir = 's';
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]-1,cur_t_xy[1]+2,'#957A0D','rgba(250,215,110,.5)')
					}	
				}
				else if (my == this.curTrack[1]+60 & mx == this.curTrack [0] - 120) {
					if (click == 1) {
						track.addCurveTrack(this.cur_seg,this.curTrack[0]-60,this.curTrack[1]+60,mz,mx,my,mz,this.dir,'w');
						this.dir = 'w';
						this.curTrack=[mx,my,mz];
					}
					else{
							box(cur_t_xy[0]-2,cur_t_xy[1]+1,'#957A0D','rgba(250,215,110,.5)')
					}	
				}
			}
			
		}
	
		if (click >= 1) {
			land.draw();
			track.move();
			if (trackArray[0].length > 4) {
				engin.init();
			}
			return trackArray;	
		}

		return trackArray;	
	}
}

function layTrack() {
	
	this.op_dir = function(dir){
		if (dir == 'n') {return 's'}
		else if (dir == 's') {return 'n'}
		else if (dir == 'e') {return 'w'}
		else if (dir == 'w') {return 'e'}
		else if (dir == 'ne') {return 'sw'}
		else if (dir == 'se') {return 'nw'}
		else if (dir == 'nw') {return 'se'}
		else if (dir == 'sw') {return 'ne'}
		else return '-1'
	}
	
	this.check_track = function (nxy,new_dir){
		for (i = 0; i < this.trackArray.length; i++) {
			for (j = 1;j < this.trackArray[i].length-1; j++) {
				if (nxy.x == this.trackArray[i][j][0].x & nxy.y == this.trackArray[i][j][0].y){
						//& (new_dir == this.trackArray[i][j][this.trackArray[i][j].length-1] | new_dir == this.op_dir(this.trackArray[i][j][this.trackArray[i][j].length-1]))) {
					alert(new_dir);
				}
			}
		}
	}
	
	this.addStraightTrack = function(i, nx, ny, nz, old_dir, new_dir){
		end = this.trackArray[i].length-1;
		endend = this.trackArray[i][end].length-3;
		var oxy = new point(this.trackArray[i][end][endend].x,this.trackArray[i][end][endend].y,this.trackArray[i][end][endend].z);
		var nxy = new point(nx,ny,nz);
		this.trackArray[i][end] = [oxy,nxy,this.op_dir(old_dir), new_dir];
		this.trackArray[i].push([nxy,nxy, new_dir, new_dir]);
		this.check_track(nxy,new_dir,i);
	}
	
	this.addCurveTrack = function(i, midx, midy, midz, nx, ny, nz, old_dir, new_dir){
		end = this.trackArray[i].length-1;
		endend = this.trackArray[i][end].length-3;
		var oxy = new point(this.trackArray[i][end][endend].x,this.trackArray[i][end][endend].y,this.trackArray[i][end][endend].z);
		var midxy = new point(midx,midy,midz);
		var nxy = new point(nx,ny,nz);
		this.trackArray[i][end] = [oxy,midxy,nxy,this.op_dir(old_dir), new_dir];
		this.trackArray[i].push([nxy,nxy, new_dir, new_dir]);
		this.check_track(nxy,new_dir,i);
	}
	
	this.addSwitch = function(i,j,ox,oy){
		//split up the current track at the switch location, moving the back half to a new trackSegment
		this.trackArray.push(this.trackArray[i].splice(j,this.trackArray[i].length-j));
		//cleanup segment ends - start of 2
		var reposLeftFTrack = this.trackArray[this.trackArray.length-1][0];
		var reposLeftDir = this.op_dir(reposLeftFTrack[reposLeftFTrack.length-2]);
		this.trackArray[this.trackArray.length-1].splice(0,0,[reposLeftFTrack[0],reposLeftFTrack[0],reposLeftDir,reposLeftDir])
		// end of 1
		this.trackArray[i].push([reposLeftFTrack[0],reposLeftFTrack[0],reposLeftDir,reposLeftDir])
		//create 3
		//figure out new direction
		nsta = new point (reposLeftFTrack[0].x,reposLeftFTrack[0].y,reposLeftFTrack[0].z);
		nend = new point (reposLeftFTrack[0].x,reposLeftFTrack[0].y,reposLeftFTrack[0].z);
		nmid = new point (reposLeftFTrack[0].x,reposLeftFTrack[0].y,reposLeftFTrack[0].z);
		nNewDir = '';
		nOldDir = '';
		//alert(ox+' '+oy)
		if (Math.abs(ox) <= 1 & Math.abs(oy) <= 1) {
			alert(3+' '+(oy*60));
			nend.x += (ox * 60);
			nend.y += (oy * 60);
			nend.z = findMapPos(nend.x,nend.y,2)[2]
			nOldDir = findTrackDir(nsta,nend);
			nNewDir = findTrackDir(nsta,nend);
			newRightTrack = [[nsta,nsta,nOldDir,nOldDir],[nsta,nend,this.op_dir(nOldDir),nNewDir],[nend,nend,nNewDir,nNewDir]];
		}
		else if (reposLeftDir == 'e' | reposLeftDir == 'w' | reposLeftDir == 'n' | reposLeftDir == 's') {
			alert(1+' '+(oy*60));
			if (Math.abs(ox) == 1) {nend.x += (ox*60);}
			else if (Math.abs(ox) ==  2) {nend.x += (ox*60); nmid.x += (ox*30);}
			if (Math.abs(oy) == 1) {nend.y += (oy*60);}
			else if (Math.abs(oy) ==  2) {nend.y += (oy*60); nmid.y += (oy*30);}
			nend.z = findMapPos(nend.x,nend.y,2)[2]
			nmid.z = findMapPos(nmid.x,nmid.y,2)[2]
			nNewDir = findTrackDir(nmid,nend);
			nOldDir = findTrackDir(nsta,nmid);
			newRightTrack = [[nsta,nsta,nOldDir,nOldDir],[nsta,nmid,nend,this.op_dir(nOldDir),nNewDir],[nend,nend,nNewDir,nNewDir]];
		}
		else if (reposLeftDir == 'ne' | reposLeftDir == 'nw' | reposLeftDir == 'se' | reposLeftDir == 'sw') {
			alert(2+' '+(oy*60));
			if (Math.abs(ox) == 1) {nend.x += (ox*60);nmid.x += (ox*60);}
			else if (Math.abs(ox) ==  2) {nend.x += (ox*60); nmid.x += (ox*30);}
			if (Math.abs(oy) == 1) {nend.y += (oy*60);nmid.y += (oy*60);}
			else if (Math.abs(oy) ==  2) {nend.y += (oy*60); nmid.y += (oy*30);}
			nend.z = findMapPos(nend.x,nend.y,2)[2]
			nmid.z = findMapPos(nmid.x,nmid.y,2)[2]
			nNewDir = findTrackDir(nmid,nend);
			nOldDir = findTrackDir(nsta,nmid);
			newRightTrack = [[nsta,nsta,nOldDir,nOldDir],[nsta,nmid,nend,this.op_dir(nOldDir),nNewDir],[nend,nend,nNewDir,nNewDir]];
		}
		else{alert('error: missing oldDir');}
		
			alert(nOldDir+' '+nNewDir)
		//console.debug(this.trackArray);
		//throw new Error("my error message");
		//at last push the new segment to the trackarray
		this.trackArray.push(newRightTrack)
		
		//return last member to update curtrack and whatnot
		land.draw();
		this.move();
		return [nend,nNewDir,this.trackArray.length-1];
		// should also push a switch
		// should probably create a switch array... lol [originSegID,segID1,segID2,dir]
	}
	
	this.init = function(){
		tp0 = new point(570,750,0);
		tp1 = new point(570-180,750,0);
		tp2 = new point(570-180,750-180,0);
		tp20 = new point(570-180,750-240)
		tp3 = new point(570-180,750-420,0);
		tp4 = new point(570,750-420,0);
		tp5 = new point(570+180,750-420,0);
		tp60 = new point(570+180,750-240)
		tp6 = new point(570+180,750-180,0);
		tp7 = new point(570+180,750,0);
		tp8 = new point(570,750,0);
		this.trackArray = [[[tp0,tp0,'w','w'],[tp0,tp1,tp2,'e','n'],[tp2,tp20,'s','n'],[tp20,tp3,tp4,'s','e'],[tp4,tp5,tp60,'w','s'],[tp60,tp6,'n','s'],[tp6,tp7,tp8,'n','w'],[tp8,tp8,'e','e']]];
	}
	
	this.reset = function(){
		this.trackCurrentTrack = 0;
		this.trackNextTrack = 1;
		this.trackNextT = .1;
		this.trackCurT = 0;
		this.trackDelta = 8;
		this.moveOnTrack = new moveOnTrack();
	}
	
	this.move = function() {
		p1x = -1; p1y = -1;
		p2x = -1; p2y = -1;
		c1x = 0; c1y = 0;
		c2x = 0; c2y = 0;
		for (var i = 0; i < this.trackArray.length; i++) {
			this.reset();
			while(this.trackCurrentTrack<this.trackArray[i].length-1) {
				var m = this.moveOnTrack.getT(this.trackArray[i],this.trackCurrentTrack,this.trackNextTrack,this.trackCurT,this.trackDelta);
				if (this.trackCurrentTrack == m[0]) {
					this.trackCurT += m[1];
				}
				else{
					this.trackCurrentTrack = m[0];
					this.trackCurT = m[1];
					this.trackNextTrack += 1;
				}
				 
				xy = this.moveOnTrack.getPos(this.trackArray[i],this.trackCurrentTrack,this.trackCurT,this.trackDelta)
				
				if (p1x == -1 & p1y == -1 & p2x == -1 & p2y == -1) {
					c1x = ((10*Math.cos(xy[2]))-(5*Math.sin(xy[2])))+xy[0]
					c1y = -xy[3]+(mheight*(((10*Math.sin(xy[2])+(5*Math.cos(xy[2]))))+xy[1]))
					p1x = ((10*Math.cos(xy[2]))-(-5*Math.sin(xy[2])))+xy[0]
					p1y = -xy[3]+(mheight*(((10*Math.sin(xy[2])+(-5*Math.cos(xy[2]))))+xy[1]))
					c2x = ((-10*Math.cos(xy[2]))-(5*Math.sin(xy[2])))+xy[0]
					c2y = -xy[3]+(mheight*(((-10*Math.sin(xy[2])+(5*Math.cos(xy[2]))))+xy[1]))
					p2x = ((-10*Math.cos(xy[2]))-(-5*Math.sin(xy[2])))+xy[0]
					p2y = -xy[3]+(mheight*(((-10*Math.sin(xy[2])+(-5*Math.cos(xy[2]))))+xy[1]))
				}
				else{
					p1x = c1x
					p1y = c1y
					c1x = (((10*Math.cos(xy[2]))-(-5*Math.sin(xy[2])))+xy[0]);
					c1y = (-xy[3]+(mheight*(((10*Math.sin(xy[2])+(-5*Math.cos(xy[2]))))+xy[1])));
					p2x = c2x
					p2y = c2y
					c2x = (((-10*Math.cos(xy[2]))-(-5*Math.sin(xy[2])))+xy[0]);
					c2y = (-xy[3]+(mheight*(((-10*Math.sin(xy[2])+(-5*Math.cos(xy[2]))))+xy[1])));
				}
				
				back_ctx.strokeStyle = '#624200';
				back_ctx.lineWidth = 2;
				back_ctx.beginPath();
				back_ctx.moveTo((15*Math.cos(xy[2]))+xy[0],-xy[3]+(mheight*((15*Math.sin(xy[2]))+xy[1])));
				back_ctx.lineTo((-15*Math.cos(xy[2])+xy[0]),-xy[3]+(mheight*((-15*Math.sin(xy[2]))+xy[1])));
				back_ctx.stroke();
				back_ctx.strokeStyle = '#222222';
				back_ctx.beginPath();
				back_ctx.moveTo(p1x,p1y);
				back_ctx.lineTo(c1x,c1y);
				back_ctx.moveTo(p2x,p2y);
				back_ctx.lineTo(c2x,c2y);
				back_ctx.stroke();
			}
			
		}	
	
	}
}

function engine(){
	this.init = function(){
		//[face[point[xyz],[n]]]
		this.left = [[[20,40,20],[20,-40,20],[20,-40,0],[20,40,0],[[20,20],[20,0]]]];
		this.top = [[[20,40,20],[-20,40,20],[-20,40,0],[20,40,0],[[-20,20],[20,20]]],
								[[20,40,20],[20,-40,20],[-20,-40,20],[-20,40,20],[0]],
								[[20,-40,20],[-20,-40,20],[-20,-40,0],[20,-40,0],[[20,-20],[-20,0]]]];
		this.right = [[[-20,40,20],[-20,-40,20],[-20,-40,0],[-20,40,0],[[-20,0],[-20,20]]]]       
		//x = x; y = (z * (.5 * y))
		
		this.obj = eng
		
		this.accell = .1;
		this.brake = .2;
		this.topSpeed = 10;
		this.curT = 0;
		this.x = 0;
		this.y = 0;
		this.r = 0;
		this.dr = 0;
		
		this.trainCurrentTrack = 0;
		this.trainNextTrack = 1;
		this.trainNextT = .1;
		this.trainCurT = 0;
		this.trainDelta = 1;
		this.moveOnTrack = new moveOnTrack();
		
		this.trainCurSeg = 0;
		
		this.trackArray = track.trackArray;
	}
	
	this.move = function() {
		if (menuVar == 'halt' & this.trainDelta > 0) {
			this.trainDelta -= (this.brake)
			if (this.trainDelta < 0) {this.trainDelta = 0}
		}
		else if(menuVar != 'halt' & this.trainDelta <= this.topSpeed){
			this.trainDelta += (this.accell)
		}
		var m = this.moveOnTrack.getT(this.trackArray[this.trainCurSeg],this.trainCurrentTrack,this.trainNextTrack,this.trainCurT,this.trainDelta);
		if (this.trainCurrentTrack == m[0]) {
			this.trainCurT += m[1];
		}
		else{
			this.trainCurrentTrack = m[0];
			this.trainCurT = m[1];
			if (this.trainCurrentTrack == this.trackArray[this.trainCurSeg].length-2) {
				this.trainNextTrack = 1;
			}
			else{
				this.trainNextTrack += 1;
			}
		}
		xy = this.moveOnTrack.getPos(this.trackArray[this.trainCurSeg],this.trainCurrentTrack,this.trainCurT,this.trainDelta)
		
		this.x = xy[0];
		this.y = mheight*xy[1]-xy[3];
		this.dr = xy[2]-this.r;
		this.r = xy[2];
		
	}
	
	this.accellerate = function(q){
		if (q == 1){ 
			if (this.speed < this.topSpeed) {
			this.speed += this.accell;
			}
		}
		else{
			if (this.speed > 0) {
				this.speed -= this.brake;
			}
			else{
				this.speed = 0;
			}
		}
	}
}

function moveOnTrack() {
	this.distance = function(x1,x2,y1,y2){
		return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))
	}
	this.getT = function(trackArray,from,to,curT,delta){
		//track array here just wants a segment. so getT(trackarray[i],..,..,..)
		if (trackArray[from].length == 4) {
		
			var fromLength = this.distance(trackArray[from][0].x,trackArray[from][1].x,trackArray[from][0].y,trackArray[from][1].y);
			if (delta < (fromLength - (fromLength*curT))) {
				return [from,(delta/fromLength)];
			}
			else if (trackArray[to].length == 4) {
				var toLength = this.distance(trackArray[to][0].x,trackArray[to][1].x,trackArray[to][0].y,trackArray[to][1].y)
				var curLength = (fromLength - (fromLength * curT));
				delta = delta - curLength;
				return [to,(delta/toLength)];
			}
			else{
				var v1 = lerp(trackArray[to][0],trackArray[to][1],trackArray[to][1],trackArray[to][2],0);
				var v2 = lerp(trackArray[to][0],trackArray[to][1],trackArray[to][1],trackArray[to][2],.2);
				var toLength = this.distance(v1[0],v2[0],v1[1],v2[1]);
				var curLength = (fromLength - (fromLength * curT));
				delta = delta - curLength;
				return [to,(delta * .2)/toLength];
			}
		}
		else{
			var fromLength = 0;
			var v = []; var j = 0;
			v[0] = lerp(trackArray[from][0],trackArray[from][1],trackArray[from][1],trackArray[from][2],0);
			for (var i =1; i<=6; i++) { j += .2;
					//make sure j !> 1
				v[i] = lerp(trackArray[from][0],trackArray[from][1],trackArray[from][1],trackArray[from][2],j);
				fromLength += this.distance(v[i-1][0],v[i][0],v[i-1][1],v[i][1]);
			}
			if (delta < (fromLength - (fromLength*curT))) {
				var v1 = lerp(trackArray[from][0],trackArray[from][1],trackArray[from][1],trackArray[from][2],curT-.1);
				var v2 = lerp(trackArray[from][0],trackArray[from][1],trackArray[from][1],trackArray[from][2],curT+.1);
				var toLength = this.distance(v1[0],v2[0],v1[1],v2[1]);
				return [from,(delta * .2)/toLength];
			}
			else if (trackArray[to].length == 4) {
				var toLength = this.distance(trackArray[to][0].x,trackArray[to][1].x,trackArray[to][0].y,trackArray[to][1].y)
				var curLength = fromLength - (fromLength * curT);
				delta = delta - curLength;
				return [to,(delta/toLength)];
			}
			else{
				var v1 = lerp(trackArray[to][0],trackArray[to][1],trackArray[to][1],trackArray[to][2],0);
				var v2 = lerp(trackArray[to][0],trackArray[to][1],trackArray[to][1],trackArray[to][2],.2);
				var toLength = this.distance(v1[0],v2[0],v1[1],v2[1]);
				var curLength = fromLength - (fromLength * curT);
				delta = delta - curLength;
				return [to,(delta * .2)/toLength];
			}
		}
	}
	this.getPos = function(trackArray,curTrack,curT,delta){
		//track array here just wants a segment. so getT(trackarray[i],..,..,..)
		if (trackArray[curTrack].length == 4) {
			return lerp(trackArray[curTrack][0],trackArray[curTrack][0],trackArray[curTrack][1],trackArray[curTrack][1],curT);
		}
		else{
			return lerp(trackArray[curTrack][0],trackArray[curTrack][1],trackArray[curTrack][1],trackArray[curTrack][2],curT);
		}
	}
}

function map() {
	this.map = [];
	var temp, temp;
	
	this.init  = function(){
		this.h = 0;
		this.hold = 0;
		this.tempi=0;
		this.tempj=0;
		for (var i = 0; i <= mapSize[0] + 0*2 /*buffer*/; i++) {
			temp = [];
			for (var j = 0;j <= mapSize[1] + 0*2 /*buffer*/; j++) {
				temp.push(Math.abs(10+Math.round(15*-(Math.sin(i)+Math.sin(j)))));//z - height
			}
			this.map.push(temp);
		}
	}
	this.draw = function(){
		var fill = '389138';
		back_ctx.lineWidth = 1;
		back_ctx.strokeStyle = '#1F1F1F';
		back_ctx.lineJoin = 'round';
    back_ctx.setLineDash([2,4]);
		for (var j = 0 + 0 /*buffer*/; j <= (mapSize[1] -1) + 0*2 /*buffer*/; j++) {
			for (var i = 0; i <= (mapSize[0] -1) + 0*2 /*buffer*/; i++) {
				fill = '389138';
				if (parseFloat(this.map[i][j]) < parseFloat(this.map[i][j+1])) {
					fill = addHexColor(fill,1-((parseFloat(this.map[i][j+1])-parseFloat(this.map[i][j]))/maxMapHeight)/2);
				}
				if (parseFloat(this.map[i+1][j]) < parseFloat(this.map[i+1][j+1])) {
					fill = addHexColor(fill,1-((parseFloat(this.map[i+1][j+1])-parseFloat(this.map[i+1][j]))/maxMapHeight)/2);
				}
				if (parseFloat(this.map[i][j+1]) > parseFloat(this.map[i+1][j+1])) {
					fill = addHexColor(fill,1-((parseFloat(this.map[i][j+1])-parseFloat(this.map[i+1][j+1]))/maxMapHeight)/2);
				}
				if (parseFloat(this.map[i][j]) > parseFloat(this.map[i+1][j])) {
					fill = addHexColor(fill,1-((parseFloat(this.map[i][j])-parseFloat(this.map[i+1][j]))/maxMapHeight)/2);
				}
				back_ctx.fillStyle = '#'+fill;
				
				back_ctx.beginPath();
				back_ctx.moveTo(i*60,((j*60)*mheight)-parseFloat(this.map[i][j]));
				back_ctx.lineTo((i+1)*60,((j*60)*mheight)-parseFloat(this.map[i+1][j])); //+this.map[i+1][j])*mheight);
				back_ctx.lineTo((i+1)*60,(((j+1)*60)*mheight)-parseFloat(this.map[i+1][j+1])); //+this.map[i+1][j+1])*mheight);
				back_ctx.lineTo(i*60,(((j+1)*60)*mheight)-parseFloat(this.map[i][j+1])); //+this.map[i][j+1])*mheight);		
				back_ctx.closePath();
				back_ctx.stroke();
				back_ctx.fill();
			}
		}
    back_ctx.setLineDash(0);
		back_ctx.drawImage(back_c,0,0);
	}
	this.dcir = function(ox,oy){
		ctx.beginPath(((mouse_pos[0]+ox)*60),((((mouse_pos[1]+oy)*60)*mheight)-parseFloat(this.map[mouse_pos[0]+ox][mouse_pos[1]+oy])));
		ctx.arc(((mouse_pos[0]+ox)*60),((((mouse_pos[1]+oy)*60)*mheight)-parseFloat(this.map[mouse_pos[0]+ox][mouse_pos[1]+oy])), 5, 0, 2 * Math.PI, false);
		ctx.stroke();
	}
	
	this.terraform = function(){
		var i = mouse_pos[0];
		var j = mouse_pos[1];
		if (menuVar == 'tflat' & mouse_pos[0] != -1){
			if (click != 2) {
				ctx.fillStyle = 'rgba(70,150,140,.5)'
				ctx.beginPath();
				ctx.moveTo(mouse_pos[0]*60,((mouse_pos[1]*60)*mheight)-parseFloat(this.map[mouse_pos[0]][mouse_pos[1]]));
				ctx.lineTo((mouse_pos[0]+1)*60,((mouse_pos[1]*60)*mheight)-parseFloat(this.map[mouse_pos[0]+1][mouse_pos[1]])); //+this.map[mouse_pos[0]+1][mouse_pos[1]])*mheight);
				ctx.lineTo((mouse_pos[0]+1)*60,(((mouse_pos[1]+1)*60)*mheight)-parseFloat(this.map[mouse_pos[0]+1][mouse_pos[1]+1])); //+this.map[mouse_pos[0]+1][mouse_pos[1]+1])*mheight);
				ctx.lineTo(mouse_pos[0]*60,(((mouse_pos[1]+1)*60)*mheight)-parseFloat(this.map[mouse_pos[0]][mouse_pos[1]+1])); //+this.map[mouse_pos[0]][mouse_pos[1]+1])*mheight);		
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
			}
			
			if (click == 2) {
				if (this.hold == 0) {
					this.tempi = mouse_pos[0];
					this.tempj = mouse_pos[1];
				}
				if (this.tempi > mouse_pos[0]) {
					imax = this.tempi+1;
					imin = mouse_pos[0];
				}
				else{
					imin = this.tempi;
					imax = mouse_pos[0];
				}
				if (this.tempj > mouse_pos[1]) {
					jmax = this.tempj+1;
					jmin = mouse_pos[1];
				}
				else{
					jmin = this.tempj;
					jmax = mouse_pos[1];
				}
				h=(parseFloat(this.map[this.tempi][this.tempj]) +
					 parseFloat(this.map[this.tempi+1][this.tempj+1]) +
					 parseFloat(this.map[this.tempi][this.tempj+1]) +
					 parseFloat(this.map[this.tempi+1][this.tempj]))/4
				this.hold = 1;
				ctx.fillStyle = 'rgba(70,150,140,.5)'
				ctx.beginPath();
				ctx.moveTo(imin*60,((jmin*60)*mheight)-h);
				ctx.lineTo((imax)*60,((jmin*60)*mheight)-h); //+this.map[imax+1][jmax])*mheight);
				ctx.lineTo((imax)*60,(((jmax+1)*60)*mheight)-h); //+this.map[imax+1][jmin+1])*mheight);
				ctx.lineTo(imin*60,(((jmax+1)*60)*mheight)-h); //+this.map[imax][jmax+1])*mheight);		
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
			}
			
			else if(click == 1) {
				this.h = (parseFloat(this.map[i+1][j]) + parseFloat(this.map[i+1][j+1]) + parseFloat(this.map[i][j+1]) + parseFloat(this.map[i][j]))/4
				this.map[i][j] = this.h
				this.map[i+1][j] = this.h;
				this.map[i+1][j+1] = this.h;
				this.map[i][j+1] = this.h;
				this.draw();
			}
			
			if (this.hold == 1 & click == 0 ) {
				if (this.hold == 0) {
					this.tempi = mouse_pos[0];
					this.tempj = mouse_pos[1];
				}
				if (this.tempi > mouse_pos[0]) {
					imax = this.tempi;
					imin = mouse_pos[0];
				}
				else{
					imin = this.tempi;
					imax = mouse_pos[0];
				}
				if (this.tempj > mouse_pos[1]) {
					jmax = this.tempj;
					jmin = mouse_pos[1];
				}
				else{
					jmin = this.tempj;
					jmax = mouse_pos[1];
				}
				h=(parseFloat(this.map[this.tempi][this.tempj]) +
					 parseFloat(this.map[this.tempi+1][this.tempj+1]) +
					 parseFloat(this.map[this.tempi][this.tempj+1]) +
					 parseFloat(this.map[this.tempi+1][this.tempj]))/4
				for (i = imin; i<=imax+1;i++) {
					for (j = jmin; j<=jmax+1;j++) {
						this.map[i][j] = h;
					}
				}
				this.draw();
				this.hold = 0;
				this.tempi = 0;
				this.tempj = 0;
			}	
		}
		
		if (menuVar == 'tup' & mouse_pos[0] != -1) {
			if (click == 0) {
				wait = 0
			}
			else{
				wait += 1;
			}
			hor = (mouse_pos[0]*60)+30;
			ver = (((mouse_pos[1]*60))+(30-((parseFloat((this.map[mouse_pos[0]+1][mouse_pos[1]])-parseFloat(this.map[mouse_pos[0]][mouse_pos[1]])))/2)))
			if (mouse.x < hor) {
				if (mouse.y/mheight < ver & this.map[i][j] < maxMapHeight-5) {
					this.dcir(0,0)
					if (click == 1 | (click == 2 & wait > 4)) {
						this.map[i][j] -= -5;
						this.draw();
					}
				}
			}
			if (mouse.x > hor) {
				if (mouse.y/mheight < ver & this.map[i+1][j] < maxMapHeight-5 ) {
					this.dcir(1,0)
					if (click == 1 | (click == 2 & wait > 4)) {
						this.map[i+1][j] -= -5;
						this.draw();
					}
				}
			}
			if (mouse.x > hor) {
				if (mouse.y/mheight > ver & this.map[i+1][j+1] < maxMapHeight-5) {
					this.dcir(1,1)
					if (click == 1 | (click == 2 & wait > 4)) {
						this.map[i+1][j+1] -= -5;
						this.draw();
					}
				}
			}
			if (mouse.x < hor) {
				if (mouse.y/mheight > ver & this.map[i][j+1] < maxMapHeight-5) {
					this.dcir(0,1)
					if (click == 1 | (click == 2 & wait > 4)) {
						this.map[i][j+1] -= -5;
						this.draw();
					}
				}
			}
		}
		
		if (menuVar == 'tdown' & mouse_pos[0] != -1) {
			if (click == 0) {
				wait = 0
			}
			else{
				wait += 1;
			}
			hor = (mouse_pos[0]*60)+30;
			ver = (((mouse_pos[1]*60))+(30-(((parseFloat(this.map[mouse_pos[0]][mouse_pos[1]+1])-parseFloat(this.map[mouse_pos[0]][mouse_pos[1]])))/2)))
			if (mouse.x < hor) {
				if (mouse.y/mheight < ver & this.map[mouse_pos[0]][mouse_pos[1]] > 5) {
					this.dcir(0,0)
					if (click == 1 | (click == 2 & wait > 4)) {
						this.map[mouse_pos[0]][mouse_pos[1]] -= 5;
						this.draw();
					}
				}
			}
			if (mouse.x > hor) {
				if (mouse.y/mheight < ver & this.map[mouse_pos[0]+1][mouse_pos[1]] > 5 ) {
					this.dcir(1,0)
					if (click == 1 | (click == 2 & wait > 4)) {
						this.map[mouse_pos[0]+1][mouse_pos[1]] -= 5;
						this.draw();
					}
				}
			}
			if (mouse.x > hor) {
				if (mouse.y/mheight > ver & this.map[mouse_pos[0]+1][mouse_pos[1]+1] > 5) {
					this.dcir(1,1)
					if (click == 1 | (click == 2 & wait > 4)) {
						this.map[mouse_pos[0]+1][mouse_pos[1]+1] -= 5;
						this.draw();
					}
				}
			}
			if (mouse.x < hor) {
				if (mouse.y/mheight > ver & this.map[mouse_pos[0]][mouse_pos[1]+1] > 5) {
					this.dcir(0,1)
					if (click == 1 | (click == 2 & wait > 4)) {
						this.map[mouse_pos[0]][mouse_pos[1]+1] -= 5;
						this.draw();
					}
				}
			}
		if (click == 1) {
			click = 0;
		}
		}
	}
}

land = new map; 
land.init();
land.draw();

var dtrack = new designTrack();
dtrack.init();

var track = new layTrack();
track.init();
track.move();

a1 = new point(0,0);
a2 = new point(width/2,height);
a3 = new point(width,0);

engin = new engine();
engin.init();

var t = 0;

var gameLoop = function(){
	//message = (mouse.x+' '+mouse.y/mheight +' '+(mouse.y/height))
	
	ctx.clearRect(0, 0, width, height);
  pre_ctx.clearRect(0, 0, width, height);
	
	
	//printm(eval(Math.abs(Math.acos((mouse.y-(height/2))/(Math.sqrt(Math.pow(mouse.x-(width/2),2) + Math.pow(mouse.y-(height/2),2)))))))
	/*trackstring =''
	for (i = 0; i <= track.trackArray.length-1; i++) {
		trackstring += ('['+track.trackArray[i][0].x+','+track.trackArray[i][0].y+','+track.trackArray[i][0].z+' : '+
									 track.trackArray[i][1].x+','+track.trackArray[i][1].y+','+track.trackArray[i][1].z	)
		if (typeof track.trackArray[i][2] !== undefined) {
			
			trackstring += ' : '+track.trackArray[i][2].x+','+track.trackArray[i][2].y+','+track.trackArray[i][2].y
		}
		
		trackstring +='], '
	}*/
	//printm(trackstring)
	
	a2 = mouse;
	
	r+=.01;
	if (r > 1) {r = 0}
	pas = lerp(a1,a2,a2,a3,r);
	
	t+=.1
	if (t>=2*Math.PI) {t-=2*Math.PI;}
	render = new drawObject();
	
	
	if (pas[2] + t > 2*Math.PI) {
		g = pas[2]+t-2*Math.PI;
	}
	else{
		g = pas[2]+t;
	}
	
	//getMap(0,0);
	land.terraform();
	track.trackArray = dtrack.startTrack(track.trackArray);
	//track.move();
	engin.move();
	menu.mainMenu();
	render.draw(engin,engin.x,engin.y,engin.dr,engin.r);
	drawMouse();
	printm();
	pre_ctx.drawImage(pre_c,0,0);
	ctx.drawImage(c,0,0);
	
	//if php preference = low cpu
	setTimeout(gameLoop,1000/(1+(140*refreshRate)));//refreshRate);//<--make 30 a variable
	//else
	//window.requestAnimationFrame(gameLoop);
}

gameLoop();