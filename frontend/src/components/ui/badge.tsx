import { cn } from '@/lib/utils';
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-widest border border-current',
        className,
      )}
      {...props}
    />
  );
}
