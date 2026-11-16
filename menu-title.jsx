import React from 'react';
const titles=import.meta.glob('./public/brand/menu-*.svg',{eager:true,query:'?url',import:'default'});
export function MenuTitle({label}){return <img className="menu-title" src={titles[`./public/brand/menu-${label.toLowerCase()}.svg`]} alt={label}/>;}
