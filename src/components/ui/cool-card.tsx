import React, { useEffect, useRef } from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

const useMousePosition = () => {
  const el = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const boundingRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    // Cache the element's bounding rectangle initially and on resize
    const updateRect = () => {
      if (el.current) {
        boundingRect.current = el.current.getBoundingClientRect();
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);

    const handleMouseMove = (e: MouseEvent) => {
      if (!el.current || !boundingRect.current) return;

      // Use requestAnimationFrame to throttle updates to the browser's refresh rate
      if (rafId.current !== null) return;
      rafId.current = window.requestAnimationFrame(() => {
        const { left, top } = boundingRect.current!;
        const x = e.clientX - left;
        const y = e.clientY - top;
        el.current!.style.setProperty('--mouse-x', `${x}px`);
        el.current!.style.setProperty('--mouse-y', `${y}px`);
        rafId.current = null;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateRect);
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
    };
  }, []);

  return el;
};

export const Separator = ({ className }: { className?: string }) => {
  const el = useMousePosition();

  return (
    <SeparatorPrimitive.Root
      ref={el}
      className={
        cn('h-[1px] w-full bg-border rounded my-2', className) +
        ' bg-radial-gradient-border'
      }
    />
  );
};

export const Card = ({ children }: { children: React.ReactNode }) => {
  const el = useMousePosition();

  return (
    <div
      className="relative bg-border rounded-lg bg-radial-gradient-border p-[2px]"
      ref={el}
    >
      <div className="bg-background rounded-[calc(theme(borderRadius.lg)-2px)] inset-0.5 absolute z-10 bg-radial-gradient-content">
        {children}
      </div>
      <div className="invisible">{children}</div>
    </div>
  );
};
