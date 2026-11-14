// Adapted from shadcn/ui new-york Slider (MIT), with project-specific CSS tokens.
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../lib/utils.js';
const Slider = React.forwardRef(({className,thumbId,...props},ref)=>(
 <SliderPrimitive.Root ref={ref} className={cn('ui-slider',className)} {...props}>
  <SliderPrimitive.Track className="ui-slider-track"><SliderPrimitive.Range className="ui-slider-range"/></SliderPrimitive.Track>
  <SliderPrimitive.Thumb id={thumbId} aria-label={props['aria-label']} className="ui-slider-thumb"/>
 </SliderPrimitive.Root>
));
Slider.displayName=SliderPrimitive.Root.displayName;
export {Slider};
