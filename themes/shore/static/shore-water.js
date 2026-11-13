// Procedural water for the cover, following arcanist.sh's lightweight shader approach.
// Draw at bounded resolution, stop outside the viewport, and keep a still bay when motion is off.
(() => {
  const canvas = document.querySelector('.bay-water-canvas');
  if (!canvas) return;
  const root = document.documentElement;
  const host = canvas.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power', premultipliedAlpha: true });
  if (!gl) return;
  const fragment = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float night;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,-.6,.6,.8);for(int i=0;i<4;i++){v+=a*noise(p);p=r*p*2.03+3.1;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/resolution;uv.y=1.-uv.y;
 float aspect=resolution.x/resolution.y;
 float mobile=1.-smoothstep(.7,1.25,aspect);
 float horizon=mix(.46,.52,mobile);
 float depth=max(0.,(uv.y-horizon)/(1.-horizon));
 vec2 p=vec2(uv.x*3.5,uv.y*5.);
 // A wide concave bay, with a small irregular tide along its edge.
 float coast=1.03-.31*pow(uv.x,1.7)+.045*sin(uv.x*8.+.4);
 float shoreline=coast+.012*sin(time*.45+uv.x*5.)+.009*noise(vec2(uv.x*18.,time*.12));
 float distance=shoreline-uv.y;
 float water=smoothstep(-.006,.012,distance)*smoothstep(horizon-.004,horizon+.006,uv.y);
 // Two moving noise fields warp the ripples into liquid contours.
 vec2 warp=vec2(fbm(p+vec2(time*.035,-time*.04)),fbm(p+vec2(4.,time*.025)));
 float field=fbm(p*2.1+warp*2.5+vec2(time*.025,-time*.07));
 float ripple=sin(uv.y*mix(360.,100.,depth)+field*9.-time*1.2+uv.x*8.);
 float fine=sin(uv.y*620.+field*18.-time*1.8);
 vec3 deep=mix(vec3(.30,.49,.45),vec3(.07,.22,.21),night);
 vec3 shallow=mix(vec3(.61,.75,.65),vec3(.23,.44,.38),night);
 vec3 sea=mix(deep,shallow,(1.-smoothstep(-.02,.25,distance))*.7+field*.25);
 sea+=vec3(.08,.10,.07)*ripple*.22+vec3(.06)*fine*.12;
 // Light breaks into short strokes down from the sun.
 float reflectionX=(uv.x-.79)/(.032+depth*.10);
 float reflection=exp(-reflectionX*reflectionX);
 float light=pow(max(0.,sin(uv.y*280.+field*15.-time*.9)),7.);
 sea+=vec3(.32,.30,.19)*reflection*light*.55;
 // Receding bands travel toward the shore, fragmenting into fine foam.
 float surf=0.;
 for(int i=0;i<4;i++){
   float phase=fract(time*.055+float(i)*.25);
   float offset=(1.-phase)*.21;
   float line=distance-offset+.008*sin(uv.x*32.+field*5.+time*.3);
   float width=.0018+.0022*phase;
   float foamDistance=line/width;
   float foam=exp(-foamDistance*foamDistance)*sin(phase*3.14159);
   surf+=foam*(.55+.45*noise(vec2(uv.x*150.,depth*60.+time*.2)));
 }
 vec3 foam=mix(vec3(.94,.95,.85),vec3(.64,.80,.69),night);
 sea=mix(sea,foam,clamp(surf*.85,0.,.85));
 // A wet-sand edge makes the coast readable even with animation paused.
 float edgeDistance=distance/.011;
 float edge=exp(-edgeDistance*edgeDistance);
 sea=mix(sea,foam,edge*.55);
 vec3 sand=mix(vec3(.83,.82,.69),vec3(.22,.29,.24),night);
 float wetDistance=(distance+.015)/.028;
 float wet=exp(-wetDistance*wetDistance)*.30;
 vec3 colour=mix(sand,sea,water);
 colour-=wet*vec3(.13,.12,.08)*(1.-water);
 float seaArea=smoothstep(horizon-.01,horizon+.005,uv.y);
 float beachFade=1.-smoothstep(.025,.14,-distance);
 float alpha=seaArea*beachFade;
 gl_FragColor=vec4(colour*alpha,alpha);
}`;
  let program, buffer, locations, lost = false;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  }
  function setup() {
    const vertex = compile(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
    const pixel = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vertex || !pixel) return false;
    program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, pixel); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(pixel);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    locations = Object.fromEntries(['resolution','time','night'].map(name=>[name,gl.getUniformLocation(program,name)]));
    host.classList.add('water-ready');
    return true;
  }
  if (!setup()) return;
  let frame = 0, visible = true, elapsed = 19, last = 0, painted = 0;
  const moving = () => visible && !document.hidden && !reduced.matches && root.dataset.motion !== 'off' && !lost;
  function draw() {
    if (lost) return;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 1.5) * .65;
    const width = Math.max(1,Math.min(1440,Math.round(rect.width*scale)));
    const height = Math.max(1,Math.round(rect.height*width/Math.max(1,rect.width)));
    if (canvas.width!==width || canvas.height!==height) { canvas.width=width; canvas.height=height; gl.viewport(0,0,width,height); }
    const isNight = root.dataset.theme === 'dark' || (!root.dataset.theme && dark.matches);
    gl.uniform2f(locations.resolution,width,height); gl.uniform1f(locations.time,elapsed); gl.uniform1f(locations.night,isNight?1:0);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function loop(now) {
    frame=0;
    if (!moving()) { last=0; return; }
    if (last) elapsed+=Math.min((now-last)/1000,.1);
    last=now;
    if (now-painted>=40) { draw(); painted=now; }
    frame=requestAnimationFrame(loop);
  }
  function refresh() {
    if (frame) cancelAnimationFrame(frame);
    frame=0;last=0;draw();
    if (moving()) frame=requestAnimationFrame(loop);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();}).observe(canvas);
  new ResizeObserver(refresh).observe(canvas);
  new MutationObserver(refresh).observe(root,{attributes:true,attributeFilter:['data-theme','data-motion']});
  reduced.addEventListener('change',refresh);dark.addEventListener('change',refresh);
  document.addEventListener('visibilitychange',refresh);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;host.classList.remove('water-ready');});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;if(setup())refresh();});
  refresh();
})();
