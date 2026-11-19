// محرك WebGL صغير: مجسمات ملونة + إضاءة + اختيار بالضغط. بلا مكتبات خارجية.
const box=()=>{const a=[];for(const[n,u,v]of[[[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[1,0,0],[0,0,-1]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]])for(const[s,t]of[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]])a.push(...[0,1,2].map(k=>(n[k]+s*u[k]+t*v[k])/2),...n);return a};
const cyl=()=>{const a=[],N=24;for(let i=0;i<N;i++){const p=i/N*6.2832,q=(i+1)/N*6.2832,c0=Math.cos(p)/2,s0=Math.sin(p)/2,c1=Math.cos(q)/2,s1=Math.sin(q)/2,m=[Math.cos((p+q)/2),0,Math.sin((p+q)/2)];
 for(const v of[[c0,-.5,s0],[c1,-.5,s1],[c1,.5,s1],[c0,-.5,s0],[c1,.5,s1],[c0,.5,s0]])a.push(...v,...m);
 a.push(0,.5,0,0,1,0,c0,.5,s0,0,1,0,c1,.5,s1,0,1,0,0,-.5,0,0,-1,0,c1,-.5,s1,0,-1,0,c0,-.5,s0,0,-1,0)}return a};
const sph=()=>{const a=[],A=12,B=16,P=(i,j)=>{const t=i/A*Math.PI,f=j/B*6.2832,x=Math.sin(t)*Math.cos(f),y=Math.cos(t),z=Math.sin(t)*Math.sin(f);return[x/2,y/2,z/2,x,y,z]};
 for(let i=0;i<A;i++)for(let j=0;j<B;j++)for(const[p,q]of[[i,j],[i+1,j],[i+1,j+1],[i,j],[i+1,j+1],[i,j+1]])a.push(...P(p,q));return a};
const mul=(a,b)=>{const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o};
const nrm=v=>{const l=Math.hypot(...v);return v.map(x=>x/l)},crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const look=(e,c)=>{const z=nrm(e.map((x,i)=>x-c[i])),x=nrm(crs([0,1,0],z)),y=crs(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]};
const persp=(a,n=.1,r=50)=>{const f=1/Math.tan(.4);return[f/a,0,0,0,0,f,0,0,0,0,(r+n)/(n-r),-1,0,0,2*r*n/(n-r),0]};
const rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255);

class Engine{
 constructor(cv){this.cv=cv;const gl=this.gl=cv.getContext('webgl',{antialias:true});if(!gl)throw 0;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw 0;return o};
  const pr=this.pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec3 n;uniform mat4 M;uniform mat4 V;uniform vec3 L;varying float d;void main(){d=max(dot(normalize((M*vec4(n,0.)).xyz),normalize(L)),0.);gl_Position=V*M*vec4(p,1.);}'));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,'precision mediump float;uniform vec4 C;uniform float K;varying float d;void main(){gl_FragColor=K>.5?C:vec4(C.rgb*(.55+.5*d),1.);}'));
  gl.linkProgram(pr);gl.useProgram(pr);gl.enable(gl.DEPTH_TEST);
  this.u=n=>gl.getUniformLocation(pr,n);gl.uniform3f(this.u('L'),.4,1,.6);
  this.g={};for(const[k,f]of[['box',box],['cyl',cyl],['sph',sph]]){const b=gl.createBuffer(),d=new Float32Array(f());gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);this.g[k]=[b,d.length/6]}
  this.objs=[];this.eye=[0,2.4,4.6];this.tg=[0,1,-1.2]}
 set(objs){this.objs=objs.map(o=>({sc1:1,...o,col:rgb(o.c)}));objs.forEach((o,i)=>this.objs[i].id=i+1);this.resize()}
 resize(){const c=this.cv,d=window.devicePixelRatio||1,w=c.clientWidth*d|0,h=c.clientHeight*d|0;if(!w||!h)return;c.width=w;c.height=h;this.gl.viewport(0,0,w,h);
  this.VP=mul(persp(w/h),look(this.eye,this.tg));this.gl.uniformMatrix4fv(this.u('V'),false,this.VP);this.draw()}
 draw(pick){const gl=this.gl,pr=this.pr;gl.clearColor(.93,.95,.94,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  for(const o of this.objs){const[b,n]=this.g[o.s],r=o.ry||0,c=Math.cos(r),s=Math.sin(r),k=o.sc1,S=o.sc.map(x=>x*k);
   gl.bindBuffer(gl.ARRAY_BUFFER,b);const pl=gl.getAttribLocation(pr,'p'),nl=gl.getAttribLocation(pr,'n');
   gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(nl);gl.vertexAttribPointer(nl,3,gl.FLOAT,false,24,12);
   gl.uniformMatrix4fv(this.u('M'),false,[c*S[0],0,-s*S[0],0,0,S[1],0,0,s*S[2],0,c*S[2],0,...o.p,1]);
   gl.uniform4f(this.u('C'),...(pick?[(o.id&255)/255,(o.id>>8)/255,0]:o.col),1);gl.uniform1f(this.u('K'),pick?1:0);gl.drawArrays(gl.TRIANGLES,0,n)}}
 pick(x,y){const gl=this.gl,p=new Uint8Array(4);this.draw(1);gl.readPixels(x|0,this.cv.height-(y|0)-1,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);this.draw();return this.objs[(p[0]+p[1]*256)-1]}
 bounce(o){const t0=performance.now(),f=()=>{const k=(performance.now()-t0)/450;o.sc1=k<1?1+.15*Math.sin(k*Math.PI):1;this.draw();if(k<1)requestAnimationFrame(f)};f()}}

const B=(x,y,z,w,h,d,c,item)=>({s:'box',p:[x,y,z],sc:[w,h,d],c,item}),Y=(x,y,z,w,h,d,c,item)=>({s:'cyl',p:[x,y,z],sc:[w,h,d],c,item}),S=(x,y,z,w,h,d,c,item)=>({s:'sph',p:[x,y,z],sc:[w,h,d],c,item});
const shell=(f,w,w2)=>[B(0,-.05,0,9,.1,7,f),B(0,1.6,-3.2,9,3.2,.2,w),B(-4.5,1.6,0,.2,3.2,7,w2),B(4.5,1.6,0,.2,3.2,7,w2),B(0,2.55,-3.08,9,.16,.05,'#c99a3b'),B(2.6,1.7,-3.05,1,1.3,.05,'#7fb0c0'),B(-2.6,1.7,-3.05,1,1.3,.05,'#7fb0c0')];
const SCENES={
 kitchen:[...shell('#d9cdb4','#efe6d2','#e2d6bd'),B(0,.5,-2.2,5.4,1,1.3,'#8a6a45'),B(0,1.04,-2.2,5.5,.1,1.4,'#d8d2c4'),Y(-1,1.45,-2,.9,.9,.9,'#7fc7e8','water'),S(1,1.5,-2,.95,.95,.95,'#c62828','apple'),B(3.6,1.3,-2.3,1.2,2.6,1.1,'#eceff1'),Y(-2.3,1.45,-2.1,.6,.7,.6,'#c99a3b'),Y(-2.3,1.2,-2.1,.9,.1,.9,'#8a6a45')],
 majlis:[...shell('#b9a98c','#efe6d2','#e2d6bd'),B(0,.03,0,6.4,.06,4.4,'#9b2d2d'),B(0,.07,0,5.6,.02,3.6,'#c99a3b'),B(-2.1,.4,-2.6,2,.8,.9,'#6b2a2a'),B(0,.4,-2.6,2,.8,.9,'#7a3535'),B(2.1,.4,-2.6,2,.8,.9,'#6b2a2a'),B(0,.3,-.4,1.8,.6,1.1,'#6b4a2b'),B(0,.68,-.4,1.1,.18,.8,'#2e5f8a','book'),S(1.9,.55,.6,1.1,1.1,1.1,'#1e88e5','ball'),Y(-2.4,.5,.4,.6,1,.6,'#c99a3b')],
 bedroom:[...shell('#cdbf9f','#dfeadf','#d3e0d3'),B(1.5,.03,.3,2.6,.05,2.2,'#c99a3b'),B(-1.6,.35,-1.9,3.2,.7,2.6,'#8a6a45'),B(-1.6,.85,-1.9,3,.3,2.4,'#f1ede4'),B(-2.4,1.1,-2.6,1.2,.28,.75,'#ffffff'),B(-1.1,1.1,-1.5,2.4,.32,1.7,'#2a8a8a','blanket'),B(1.2,.45,-2.7,1,.9,.85,'#8a6a45'),B(1.2,1.0,-2.7,.7,.14,.5,'#2e5f8a','book'),S(2,.55,.4,1.1,1.1,1.1,'#1e88e5','ball')]};
