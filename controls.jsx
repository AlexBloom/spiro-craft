import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Slider} from './components/ui/slider.jsx';
import {Switch} from './components/ui/switch.jsx';
import {Button} from './components/ui/button.jsx';
// Small React roots keep the existing SVG workspace and geometry engine intact.
export function mountControls(){
 const renders=[];
 for(const input of document.querySelectorAll('input[type="range"]')){
  const label=document.querySelector(`label[for="${input.id}"]`);
  const mount=document.createElement('div');mount.className='slider-mount';input.after(mount);input.hidden=true;input.tabIndex=-1;
  const thumbId=input.id+'-thumb';if(label)label.htmlFor=thumbId;
  const root=createRoot(mount);
  renders.push(()=>root.render(<Slider thumbId={thumbId} aria-label={label?.textContent||input.id} min={Number(input.min)} max={Number(input.max)} step={Number(input.step)} value={[Number(input.value)]} onValueChange={([value])=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}}/>));
 }
 for(const input of document.querySelectorAll('input[role="switch"]')){
  const mount=document.createElement('span');input.after(mount);input.hidden=true;
  const label=document.querySelector(`label[for="${input.id}"]`),id=input.id+'-control';
  if(label)label.htmlFor=id;
  const root=createRoot(mount);
  renders.push(()=>root.render(<Switch id={id} aria-label={label?.textContent||input.id} checked={input.checked} onCheckedChange={checked=>{input.checked=checked;input.dispatchEvent(new Event('change',{bubbles:true}));}}/>));
 }
 // Mount action buttons before the existing controller attaches listeners.
 for(const button of document.querySelectorAll('button.button')){
  const mount=document.createElement('span');mount.style.display='contents';button.replaceWith(mount);
  const variant=button.classList.contains('primary')?'default':button.classList.contains('secondary')?'outline':'ghost';
  flushSync(()=>createRoot(mount).render(<Button id={button.id} aria-label={button.getAttribute('aria-label')||undefined} title={button.getAttribute('title')||undefined} variant={variant} className={button.className} dangerouslySetInnerHTML={{__html:button.innerHTML}}/>));
 }
 const sync=()=>renders.forEach(render=>render());
 document.addEventListener('spiro:update',sync);sync();
}
