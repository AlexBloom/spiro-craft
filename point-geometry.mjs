export const MAX_RINGS=6, MAX_CONNECTIONS=2048;
export const pointDefaults=Object.freeze({kind:'polygon',count:5,step:2,outerDiameter:100,innerDiameter:40,ringOffset:0,connection:'within',rings:Object.freeze([{count:12,diameter:100,offset:0},{count:12,diameter:65,offset:15},{count:12,diameter:30,offset:0}].map(Object.freeze))});
export function validatePoints(data=pointDefaults){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid point geometry.');
 const s={...pointDefaults,...data};
 if(!['polygon','star','rings'].includes(s.kind)||!['within','matching','stepped','all'].includes(s.connection))throw Error('Invalid point construction.');
 const number=(v,min,max,integer=false)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isInteger(v)))throw Error('Invalid point geometry value.');return v;};
 number(s.count,3,64,true);number(s.step,1,s.kind==='rings'?63:s.count-1,true);number(s.outerDiameter,10,100);number(s.innerDiameter,0,s.outerDiameter);number(s.ringOffset,0,360);
 if(!Array.isArray(s.rings)||s.rings.length<2||s.rings.length>MAX_RINGS)throw Error('Use 2–6 rings.');
 s.rings=s.rings.map(r=>{if(!r||typeof r!=='object')throw Error('Invalid ring.');return {count:number(r.count,3,64,true),diameter:number(r.diameter,1,100),offset:number(r.offset,0,360)};});
 if(connectionCount(s)>MAX_CONNECTIONS)throw Error(`This construction exceeds ${MAX_CONNECTIONS.toLocaleString()} connections. Reduce the point counts.`);
 return {kind:s.kind,count:s.count,step:s.step,outerDiameter:s.outerDiameter,innerDiameter:s.innerDiameter,ringOffset:s.ringOffset,connection:s.connection,rings:s.rings};
}
const gcd=(a,b)=>b?gcd(b,a%b):a;
export function connectionCount(s){
 if(s.kind!=='rings')return s.kind==='star'?s.count*2:s.count;
 if(s.connection==='within')return s.rings.reduce((n,r)=>n+r.count,0);
 return s.rings.slice(1).reduce((n,r,i)=>n+(s.connection==='all'?s.rings[i].count*r.count:Math.max(s.rings[i].count,r.count)),0);
}
export function generatePoints(state){
 const s=state.pointGeometry,scale=state.size*5/100;
 const circle=(count,diameter,offset=0)=>Array.from({length:count},(_,i)=>{const t=(i/count+offset/360)*2*Math.PI-Math.PI/2;return [Math.cos(t)*diameter*scale,Math.sin(t)*diameter*scale];});
 const paths=[],guideRings=[];
 const cycles=(vertices,step)=>{const seen=new Set();for(let start=0;start<vertices.length;start++){if(seen.has(start))continue;const path=[];let i=start;do{seen.add(i);path.push(vertices[i]);i=(i+step)%vertices.length;}while(i!==start);path.push(vertices[start]);paths.push(path);}};
 if(s.kind==='polygon'){const ring=circle(s.count,s.outerDiameter);guideRings.push(ring);cycles(ring,s.step);}
 if(s.kind==='star'){const outer=circle(s.count,s.outerDiameter),inner=circle(s.count,s.innerDiameter,180/s.count+s.ringOffset);guideRings.push(outer,inner);const vertices=outer.flatMap((p,i)=>[p,inner[i]]);paths.push([...vertices,vertices[0]]);}
 if(s.kind==='rings'){
  const rings=s.rings.map(r=>circle(r.count,r.diameter*s.outerDiameter/100,r.offset+s.ringOffset));guideRings.push(...rings);
  if(s.connection==='within')rings.forEach(r=>cycles(r,1+(s.step-1)%(r.length-1)));
  else rings.slice(1).forEach((ring,i)=>{const previous=rings[i];if(s.connection==='all')previous.forEach(a=>ring.forEach(b=>paths.push([a,b])));else for(let j=0;j<Math.max(previous.length,ring.length);j++)paths.push([previous[j%previous.length],ring[(s.connection==='stepped'?j*s.step:j)%ring.length]]);});
 }
 const points=paths.flatMap((path,i)=>i?[null,...path]:path);
 const path=paths.map(vertices=>vertices.map(([x,y],i)=>(i?'L':'M')+x.toFixed(3)+','+y.toFixed(3)).join('')).join('');
 const components=s.kind==='polygon'?gcd(s.count,s.step):paths.length;
 const summary=s.kind==='polygon'?`${s.count} points · connect every ${s.step} · ${components} ${components===1?'path':'paths'}`:s.kind==='star'?`${s.count} tips · alternating inner and outer points`:`${s.rings.length} rings · ${connectionCount(s).toLocaleString()} connections`;
 const guides=guideRings.map(r=>`<circle r="${Math.hypot(...r[0])}"/>`+r.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#a3a897"/>`).join('')).join('');
 return {points,path,closed:false,count:connectionCount(s),scale,p:{pointGeometry:true,kind:s.kind,connections:connectionCount(s),numerator:s.kind==='rings'?s.rings.length:s.count,denominator:s.kind==='rings'?connectionCount(s):s.kind==='star'?2:s.step,R:s.outerDiameter,r:s.innerDiameter,fold:s.count,turns:paths.length,summary,components},guides:`<g fill="none" stroke="#a3a897" stroke-width="1" stroke-dasharray="4 5">${guides}</g>`};
}
