// Adapted from shadcn/ui new-york Switch (MIT), with project-specific CSS tokens.
import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import {cn} from '../../lib/utils.js';
const Switch=React.forwardRef(({className,...props},ref)=>(
 <SwitchPrimitive.Root ref={ref} className={cn('ui-switch',className)} {...props}>
  <SwitchPrimitive.Thumb className="ui-switch-thumb"/>
 </SwitchPrimitive.Root>
));
Switch.displayName=SwitchPrimitive.Root.displayName;
export {Switch};
