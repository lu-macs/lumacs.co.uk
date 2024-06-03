import React, { useEffect, useRef } from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

export const Separator = ({ className }: { className?: string }) => (
  <SeparatorPrimitive.Root
    className={
      cn('h-[1px] w-full bg-border rounded my-2', className) +
      ' bg-radial-gradient-border'
    }
  />
);

export const Card = ({ children }: { children: React.ReactNode }) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (el.current) {
        const rect = el.current.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;
        el.current.style.setProperty('--mouse-x', x.toString() + 'px');
        el.current.style.setProperty('--mouse-y', y.toString() + 'px');
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="relative bg-border rounded-lg bg-radial-gradient-border p-[2px]"
      ref={el}
    >
      <div className="bg-background rounded-lg inset-0.5 absolute z-10 bg-radial-gradient-content">
        {children}
      </div>
      <div className="invisible">{children}</div>
    </div>
  );
};
