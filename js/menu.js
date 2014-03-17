function outline(octx,x,y,w,h,r){
  octx.beginPath();
  octx.moveTo(x+r, y);
  octx.arcTo(x+w, y,   x+w, y+h, r);
  octx.arcTo(x+w, y+h, x,   y+h, r);
  octx.arcTo(x,   y+h, x,   y,   r);
  octx.arcTo(x,   y,   x+w, y,   r);
  octx.closePath();
}

function makeBackground(id){
  var menuCanvas = document.createElement('canvas');
  menuCanvas.style.position = 'absolute';
  menuCanvas.style.top = '1px'
  menuCanvas.style.left = '1px'
  menuCanvas.style.zIndex='2';
  menuCanvas.style.opacity = .7;
  
  var mc = menuCanvas.getContext("2d");
  mc.lw = mc.lineWidth = 2;
  menuCanvas.width = screen.width;
  menuCanvas.height = screen.height;
  
  draw = function(drc,doctx,x,y,w,h,r,backcolor,outlinecolor){
    drc.width = x+w+doctx.lw*2;
    drc.height = y+h+doctx.lw*2;
    doctx.clearRect(x,y,screen.width,screen.height);
    outline(doctx,x,y,w,h,r);
    doctx.fillStyle = backcolor;
    doctx.fill();
    doctx.lineWidth = doctx.lw;
    doctx.strokeStyle = outlinecolor;
    doctx.stroke();
    
    menuHW = {x:x+w, y:y+h};    
  }
  
  document.body.appendChild(menuCanvas);
  return {type: "background", c: menuCanvas, ctx: mc, t: 0, countElements: 1, x: 0, y: 0,
    draw: draw, clicked: 0, parent: id, id: id}
}

function makeMenu( str, id, parent, order){
  var posx = 1000, posy = 1000;
  var menuCanvas = document.createElement('canvas');
  menuCanvas.style.position = 'absolute';
  menuCanvas.style.top = '1px'
  menuCanvas.style.left = '1px'
  menuCanvas.style.zIndex='2';
  
  var fontSize = 12;
  var font = fontSize + 'px ' + 'Monospace';
  var lightBrown = "#c37547";
  var darkBrown = '#473119';
  
  var mc = menuCanvas.getContext("2d");
  mc.f = mc.font = font;
  mc.lw = mc.lineWidth = 2;
  mc.fs = fontSize;
  mc.pad = 10;
  mc.mw = mc.measureText(str).width+(mc.pad*2);
  mc.mh = (fontSize+(mc.pad*2));
  mc.str = str;
  menuCanvas.width = mc.mw+(mc.lw*2);
  menuCanvas.height = mc.mh+mc.lw*2;
  
  var menu = document.createElement("div");
  menu.style.display = 'none';
  menu.id = id;
  menu.style.position = 'fixed';
  menu.style.top = posy+'px';
  menu.style.left = posx+'px';
  menu.style.width = (mc.mw+2)+'px'
  menu.style.height = (mc.mh+2)+'px';
  menu.style.zIndex = '3';
  document.body.appendChild(menu);
  menu.appendChild(menuCanvas);
  
  drawMenu(mc,lightBrown,darkBrown);
  drawMenu(mc,lightBrown,darkBrown);
  
  var retMenu = {e: menu, c: menuCanvas, ctx: mc, t: 0, clicked: -1,
    x: posx, y: posy, parent: parent, id: id, order: order, type: "menu"}
  return retMenu;
}

function drawMenu(doctx,backcolor, outlinecolor){
  var black = '#222211';
  doctx.clearRect(0,0,doctx.mw,doctx.mh);
  outline(doctx, doctx.lineWidth, doctx.lw, doctx.mw - doctx.lw*2,doctx.mh - doctx.lw*2,doctx.fs/2);
  doctx.fillStyle = backcolor;
  doctx.fill();
  doctx.font = doctx.f;
  doctx.fillStyle = black;
  doctx.fillText(doctx.str, doctx.pad ,doctx.fs+doctx.pad-2);
  doctx.lineWidth = doctx.lw;
  doctx.strokeStyle = outlinecolor;
  doctx.stroke();  
}

function moveMenu(member,x,y){
  m[member].e.style.top = y+'px';
  m[member].e.style.left = x+'px';
  m[member].posx=x;
  m[member].posy=y;
}

function checkClick(){
  var pad = 2;
  var mLeft = 16;
  var min = 5;
  var new_height = 0, new_width = 0;
  for(var cur_m in m){
    if (m[cur_m].type == "menu" & (m[m[cur_m].parent].clicked == 1 | m[cur_m].id == m[cur_m].parent)) {
      var found = 0;
      for(var oth_m in m){
        if (oth_m != cur_m & m[oth_m].parent == m[cur_m].parent & m[oth_m].clicked == 1
        &  m[cur_m].id != m[cur_m].parent & m[oth_m].id != m[cur_m].parent) {
          found = 1;
        }
      }
      if (found == 0) {
        if (m[cur_m].order != 0 & m[cur_m].clicked != 1) {
          moveMenu(cur_m,m[m[cur_m].parent].posx + mLeft, m[m[cur_m].parent].posy + (m[cur_m].order*(m[cur_m].ctx.mh+2)))
        }
        else if(m[cur_m].order == 0){
          moveMenu(cur_m,min,min)
        }
        new_height+=m[cur_m].ctx.mh+2;
        tWidth = m[cur_m].posx + m[cur_m].ctx.mw - min;
        new_width = tWidth > new_width ? tWidth : new_width;
        m[cur_m].e.style.display = 'block';
      }
      else{
        m[cur_m].e.style.display = 'none';
      }
    }
    else{
      if (m[cur_m].type == "menu"){
        m[cur_m].e.style.display = 'none';
      }
    }
  }
  m['background'].draw(m['background'].c,m['background'].ctx,min-pad,min-pad,new_width+pad*2,new_height+pad*2,3,'#444444','#aaaaaa')
}

function setAllMenu(){
  for(var cur_m in m){
    if(m[cur_m].type == "menu"){
      m[cur_m].e.onmouseover = Function('drawMenu(m["'+cur_m+'"].ctx,"#c37547","#FF9933");');
      m[cur_m].e.onmouseout = Function('drawMenu(m["'+cur_m+'"].ctx,"#c37547","#473119")');
      m[cur_m].e.onclick = Function(
        ' for(var oth_m in m){'+
          ' if (m["'+cur_m+'"].type == "menu" & (oth_m != "'+cur_m+'" & m[oth_m].parent == m["'+cur_m+'"].parent'+
          ' & m[oth_m].clicked == 1 & m[oth_m].id != m[oth_m].parent)) {'+
            ' m[oth_m].clicked = -1'+
          ' }'+
        ' }'+
        ' m["'+cur_m+'"].clicked *= -1;'+
        ' moveMenu("'+cur_m+'",m[m["'+cur_m+'"].parent].posx + 16, m[m["'+cur_m+'"].parent].posy + m["'+cur_m+'"].ctx.mh+2);'+
        ' for(var oth_m in m){'+
          ' if (m["'+cur_m+'"].type == "menu" & (m[m[oth_m].parent].clicked == -1 & m[oth_m].id != m[oth_m].parent)) {'+
            ' m[oth_m].clicked = -1'+
          ' }'+
        ' }'+
        ' checkClick();'
      );
    }
  }
}

var menuHW = {x:0, y:0};

var m = [];
m['background'] = makeBackground('background');
m['main'] = makeMenu('Tool Kit', 'main', 'main',0);

m['m_ter'] = makeMenu('Terraform Tools', 'm_ter', 'main',1);
m['m_tra'] = makeMenu('Track Tools', 'm_tra', 'main',2);
m['m_tad'] = makeMenu('Add Train', 'm_tad', 'main',3);

m['m_ter_raise'] = makeMenu('Raise Ground', 'm_ter_raise', 'm_ter',1);
m['m_ter_lower'] = makeMenu('Lower Ground', 'm_ter_lower', 'm_ter',2);

m['m_tra_lay'] = makeMenu('Lay Track', 'm_tra_lay', 'm_tra',1);
m['m_tra_remove'] = makeMenu('Remove Track', 'm_tra_remove', 'm_tra',2);

setAllMenu();
m['main'].e.click();

//--

function checkMenus(){
  if (m['m_tad'].clicked == 1) {
    
  }
}

function lowerLeftMenu(){
  
}