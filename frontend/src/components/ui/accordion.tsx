'use client';
import * as React from 'react';
import * as A from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = A.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof A.Item>,
  React.ComponentPropsWithoutRef<typeof A.Item>
>(({ className, ...props }, ref) => (
  <A.Item ref={ref} className={cn('border-b border-border', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof A.Trigger>,
  React.ComponentPropsWithoutRef<typeof A.Trigger>
>(({ className, children, ...props }, ref) => (
  <A.Header className="flex">
    <A.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-5 text-left font-medium transition-all hover:text-denim-rust',
        '[&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </A.Trigger>
  </A.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof A.Content>,
  React.ComponentPropsWithoutRef<typeof A.Content>
>(({ className, children, ...props }, ref) => (
  <A.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-5 pt-0 text-muted-foreground leading-relaxed', className)}>{children}</div>
  </A.Content>
));
AccordionContent.displayName = 'AccordionContent';
