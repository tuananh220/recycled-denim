'use client';
import * as React from 'react';
import * as L from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
export const Label = React.forwardRef<
  React.ElementRef<typeof L.Root>, React.ComponentPropsWithoutRef<typeof L.Root>
>(({ className, ...props }, ref) => (
  <L.Root ref={ref} className={cn('text-xs font-medium uppercase tracking-widest', className)} {...props} />
));
Label.displayName = 'Label';
