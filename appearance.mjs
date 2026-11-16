export const BLEND_MODES=Object.freeze({multiply:'Multiply',darken:'Darken',screen:'Screen',overlay:'Overlay',lighten:'Lighten',difference:'Difference'});
export const INKS = Object.freeze([
 {name:'Red',color:'#c92e32'},
 {name:'Green',color:'#167447'},
 {name:'Blue',color:'#2356b2'},
 {name:'Black',color:'#202124'},
]);
export const PAPERS = Object.freeze({
 'hot-press':{name:'Hot press',texture:'Smooth',frequency:'0.72 0.85',octaves:3,edge:0.25},
 'cold-press':{name:'Cold press',texture:'Medium',frequency:'0.28 0.38',octaves:3,edge:0.9},
 rough:{name:'Rough',texture:'Coarse',frequency:'0.095 0.15',octaves:4,edge:1.8},
});
// Paper tooth acts only on SourceGraphic (the ink), never the canvas background.
export function inkTextureSvg(state,{prefix='ink'}={}){
 if(!state.paperGrain||!state.grainAmount)return '';
 const paper=PAPERS[state.paper]||PAPERS['cold-press'];
 const strength=state.grainAmount/100;
 return `<filter id="${prefix}-tooth" x="-550" y="-550" width="1100" height="1100" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${paper.frequency}" numOctaves="${paper.octaves}" seed="17" result="tooth"/><feDisplacementMap in="SourceGraphic" in2="tooth" scale="${(paper.edge*strength).toFixed(3)}" xChannelSelector="R" yChannelSelector="G" result="ink"/><feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0"/><feComponentTransfer><feFuncA type="linear" slope="${(2.8*strength).toFixed(3)}" intercept="${(1-1.9*strength).toFixed(3)}"/></feComponentTransfer><feComposite in="ink" operator="in"/></filter>`;
}
export function artworkSvg(state,result,pixels,{transparent=false}={}){
 const texture=inkTextureSvg(state);
 const background=transparent?'':'<rect x="-500" y="-500" width="1000" height="1000" fill="#f8f7f2"/>';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels}" height="${pixels}" viewBox="-500 -500 1000 1000"><title>Spiro Craft — ${result.p.numerator}:${result.p.denominator}</title>${texture?'<defs>'+texture+'</defs>':''}${background}<path d="${result.path}" fill="none" stroke="${state.color}" stroke-width="${state.stroke*2}" stroke-linecap="round" stroke-linejoin="round"${texture?' filter="url(#ink-tooth)"':''}/></svg>`;
}
