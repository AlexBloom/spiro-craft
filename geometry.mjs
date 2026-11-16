export const defaults = Object.freeze({mode:'guided',fold:12,winding:5,outer:120,inner:50,curve:'inside',offset:85,size:82,stroke:0.8,color:'#c92e32',guides:false,paperGrain:false,paper:'cold-press',grainAmount:45,rotation:0,opacity:100});
export function gcd(a,b){a=Math.abs(Math.round(a));b=Math.abs(Math.round(b));while(b){[a,b]=[b,a%b];}return a;}
export function validWindings(fold){return Array.from({length:fold-1},(_,i)=>i+1);}
export function parameters(s){
 const R=s.mode==='guided'?s.fold*10:s.outer;
 const r=s.mode==='guided'?s.winding*10:s.inner;
 const d=r*s.offset/100;
 const outside=s.mode==='free'&&s.curve==='outside';
 const base=outside?R+r:R-r;
 const g=gcd(R,r);
 return {R,r,d,base,outside,numerator:R/g,denominator:r/g,turns:d===0?1:r/g,fold:d===0?Infinity:R/g,bound:Math.abs(base)+d};
}
export function pointAt(p,t){const k=p.base/p.r;return [p.base*Math.cos(t)+p.d*Math.cos(k*t),p.base*Math.sin(t)+(p.outside?-1:1)*(-p.d*Math.sin(k*t))];}
export function generate(s){
 const p=parameters(s);
 const cycles=p.d===0?1:Math.max(p.turns,Math.abs(p.base)/gcd(p.R,p.r));
 const count=Math.min(60000,Math.max(1800,Math.ceil(cycles*220)));
 const scale=(s.size*5)/p.bound;
 const rotation=-Math.PI/2;
 const cos=Math.cos(rotation),sin=Math.sin(rotation);
 const points=[];
 for(let i=0;i<=count;i++){
  const [x,y]=pointAt(p,i/count*Math.PI*2*p.turns);
  points.push([(x*cos-y*sin)*scale,(x*sin+y*cos)*scale]);
 }
 return {p,points,path:points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(3)+','+y.toFixed(3)).join('')+'Z',scale,count};
}
export function validateDesign(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Choose a Spiro Craft design file.');
 const s={...defaults};
 for(const key of ['mode','curve'])if(data[key]!==undefined)s[key]=data[key];
 if(!['guided','free'].includes(s.mode)||!['inside','outside'].includes(s.curve))throw new Error('Invalid geometry mode.');
 const limits={fold:[6,24],winding:[1,23],outer:[25,240],inner:[5,120],offset:[0,220],size:[30,94],stroke:[.3,10],grainAmount:[0,100],rotation:[0,360],opacity:[0,100]};
 for(const [key,[min,max]] of Object.entries(limits))if(data[key]!==undefined){if(typeof data[key]!=='number'||!Number.isFinite(data[key])||data[key]<min||data[key]>max)throw new Error('Invalid '+key+' setting.');s[key]=data[key];}
 // Accept older files up to the former 10 pt limit, then apply the current cap.
 s.stroke=Math.min(s.stroke,5);
 for(const key of ['fold','winding','outer','inner','offset','size'])if(!Number.isInteger(s[key]))throw new Error('Invalid '+key+' setting.');
 if(![6,12,24].includes(s.fold)||s.winding>=s.fold)throw new Error('Invalid symmetry ratio.');
 if(s.mode==='free'&&s.curve==='inside'&&s.inner>=s.outer)throw new Error('The rolling gear must fit inside the fixed gear.');
 if(data.color!==undefined){if(typeof data.color!=='string'||!/^#[0-9a-f]{6}$/i.test(data.color))throw new Error('Invalid ink color.');s.color=data.color;}
 if(data.guides!==undefined)s.guides=Boolean(data.guides);
 if(data.paperGrain!==undefined){if(typeof data.paperGrain!=='boolean')throw new Error('Invalid paper grain setting.');s.paperGrain=data.paperGrain;}
 if(data.paper!==undefined){if(!['hot-press','cold-press','rough'].includes(data.paper))throw new Error('Invalid paper finish.');s.paper=data.paper;}
 return s;
}
