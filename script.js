const body=document.getElementsByTagName("body").item(0);
body.style.background="#000";
const TP=2*Math.PI;
const HE=2*Math.tan(TP/12);
const CSIZE=400;

const ctx=(()=>{
  let d=document.createElement("div");
  d.style.textAlign="center";
  body.append(d);
  let c=document.createElement("canvas");
  c.width=c.height=2*CSIZE;
  d.append(c);
  return c.getContext("2d");
})();
ctx.translate(CSIZE,CSIZE);

onresize=()=>{ 
  let D=Math.min(window.innerWidth,window.innerHeight)-40; 
  ctx.canvas.style.width=D+"px";
  ctx.canvas.style.height=D+"px";
}

const getRandomInt=(min,max,low)=>{
  if (low) return Math.floor(Math.random()*Math.random()*(max-min))+min;
  else return Math.floor(Math.random()*(max-min))+min;
}

let Circle=function(x,y,r,radius) {
  this.x=x;
  this.y=y;
  this.radius=radius;
  this.r=r;
}

const radii=[8,20,40,72];

const rps={};	// radii paths
for (let i of radii) {
  rps[i]=new Path2D();
  rps[i].arc(0,0,i,0,TP);
}

const hexInPath=(path,x,y,rad)=>{
  for (let j=0; j<6; j++) {
    let x2=x+HE*rad*Math.cos(j*TP/6);
    let y2=y+HE*rad*Math.sin(j*TP/6);
    if (ctx.isPointInPath(path,x2+CSIZE,y2+CSIZE)) {
      return true;
    }
  }
  return false;
}

const RP=CSIZE-100;
let createPointArray=()=>{
  let pointArray=[];
  for (let i=0; i<RP; i+=8) {
    for (let j=0; j<RP; j+=8) {
      let r=Math.pow(i*i+j*j,0.5);
      if (r<8) continue;
      if (r>RP-8) continue;
      pointArray.splice(getRandomInt(0,pointArray.length+1),0,{"x":i,"y":j,"r":r});
    }
  }
  return pointArray;
}

let generateCircles=()=>{
  let pointArray=createPointArray();
  let ca=[];
  let dm=new DOMMatrix([1,0,0,1,0,0]);
  let p=new Path2D();
  let idx=0;
  let ri=3;
  for (let i=0; i<80000; i++) {
    if (pointArray.length==0) {
      ca.sort((a,b)=>{ return a.r-b.r; });
      return ca;
    }
    if (idx>120) {
      ri=Math.max(0,--ri);
      idx=0;
    }
    let radius=radii[ri];
    let x=pointArray[idx].x;
    let y=pointArray[idx].y;
    if (pointArray[idx].r+radius>RP) {
      if (ri==0) {
        pointArray.splice(idx,1);
        idx=0;
      } else idx++;
      continue;
    }
    if (x<radius) {
      if (ri==0) {
        pointArray.splice(idx,1);
        idx=0;
      } else idx++;
      continue;
    }
    if (y<radius) {
      if (ri==0) {
        pointArray.splice(idx,1);
        idx=0;
      } else idx++;
      continue;
    }
    if (ctx.isPointInPath(p,x+CSIZE,y+CSIZE)) {
      pointArray.splice(idx,1);
      idx=0;
      continue;
    }
    if (hexInPath(p,x,y,radius)) {
      if (ri==0) {
        pointArray.splice(idx,1);
        idx=0;
      } else idx++;
      continue;
    }
    dm.e=x;
    dm.f=y;
    p.addPath(rps[radius],dm);
    ca.push(new Circle(x,y,pointArray[idx].r,radius));
    ca.push(new Circle(x,-y,pointArray[idx].r,radius));
    ca.push(new Circle(-x,y,pointArray[idx].r,radius));
    ca.push(new Circle(-x,-y,pointArray[idx].r,radius));
    pointArray.splice(idx,1);
    idx=0;
  }
return ca;
}

let hue=getRandomInt(200,300);

const draw2=()=>{
  ctx.fillStyle="#00000010";
  ctx.fillRect(-CSIZE,-CSIZE,2*CSIZE,2*CSIZE);
  let circleArray=ca;
  for (let i=0; i<92; i+=4) {
    ctx.beginPath();
    let r=(1-f)*circleArray[i].radius+f*ca2[i].radius;
    r=Math.max(4,r*Math.pow(Math.cos(TP*f/2),2));
for (let j=0; j<4; j++) {
    let x2=(1-f)*circleArray[i+j].x+f*ca2[i+j].x;
    let y2=(1-f)*circleArray[i+j].y+f*ca2[i+j].y;
    let sf=1+1.2*Math.pow(Math.sin(TP*f/2),2);
    x2*=sf;
    y2*=sf;
    ctx.moveTo(x2+r,y2,r,0,TP);
    ctx.arc(x2,y2,r,0,TP);
}
    ctx.fillStyle="hsl("+((hue+Math.round(40*Math.pow(r,0.5)))%360)+",100%,50%)";
    ctx.fill();
  } 
}

function start() {
  if (stopped) {
    requestAnimationFrame(animate);
    stopped=false;
  } else {
    stopped=true;
  }
}
ctx.canvas.addEventListener("click", start, false);

let stopped=true;
let t=0;
let f=0;
function animate(ts) {
  if (stopped) return;
  t++;
  draw2();
  if (t==200) ca=generateCircles();
  if (t==400) { ca2=generateCircles(); t=0; }
  f=Math.pow(Math.sin(TP*t/800),2);
  if (t%10==0) hue=(++hue%360);
  requestAnimationFrame(animate);
}

onresize();

let ca=generateCircles();
let ca2=generateCircles();

start();
