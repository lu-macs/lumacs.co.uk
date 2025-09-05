import React, { useEffect, useRef } from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

/**
 * Proximity pointer coordinator
 * - Single global pointer/scroll/resize listeners
 * - Updates all visible elements within outRadius of the pointer
 * - Keeps rects fresh via ResizeObserver and rAF'd scroll/resize updates
 * - Skips off-screen with IntersectionObserver (with generous rootMargin)
 */

type ElemState = {
  rect: DOMRect | null;
  outRadius: number;
  visible: boolean;
  ro: ResizeObserver | null;
  lastSetX: number; // last CSS px written (NaN means nothing written yet)
  lastSetY: number;
};

const registry = new Map<HTMLElement, ElemState>();
let listening = false;

let lastClientX = -9999;
let lastClientY = -9999;

let moveRaf: number | null = null;
let measureRaf: number | null = null;

let io: IntersectionObserver | null = null;

const HIDDEN_PX = -9999;

const hideVars = (el: HTMLElement, s?: ElemState) => {
  el.style.setProperty('--mouse-x', `${HIDDEN_PX}px`);
  el.style.setProperty('--mouse-y', `${HIDDEN_PX}px`);
  if (s) {
    s.lastSetX = HIDDEN_PX;
    s.lastSetY = HIDDEN_PX;
  }
};

const ensureIO = () => {
  if (io) return;
  try {
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const st = registry.get(el);
          if (!st) continue;
          st.visible = entry.isIntersecting;
          // Prime rect when becoming visible
          if (st.visible) {
            st.rect = el.getBoundingClientRect();
          } else {
            // Hide when off-screen to avoid stale glow
            hideVars(el, st);
          }
        }
      },
      {
        // Start tracking a bit before entering viewport so the effect
        // looks responsive as you approach
        root: null,
        rootMargin: '400px',
        threshold: 0,
      }
    );
  } catch {
    io = null; // Older browsers - we will update all elements
  }
};

const measureVisibleRects = () => {
  if (measureRaf != null) return;
  measureRaf = requestAnimationFrame(() => {
    measureRaf = null;
    for (const [el, st] of registry) {
      if (io && !st.visible) continue;
      st.rect = el.getBoundingClientRect();
    }
  });
};

const onPointerMove = (e: PointerEvent) => {
  // Only act on fine pointers to reduce work on touch devices
  if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
    return;
  }
  lastClientX = e.clientX;
  lastClientY = e.clientY;
  scheduleTick();
};

const onPointerOut = (e: PointerEvent) => {
  // When leaving the window (relatedTarget == null), hide effects
  if (e.relatedTarget == null) {
    lastClientX = -1e6;
    lastClientY = -1e6;
    scheduleTick(true);
  }
};

const onScroll = () => {
  measureVisibleRects();
};

const onResize = () => {
  measureVisibleRects();
};

const ensureListeners = () => {
  if (listening) return;
  document.addEventListener('pointermove', onPointerMove, {
    passive: true,
  });
  document.addEventListener('pointerout', onPointerOut, {
    passive: true,
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  listening = true;
};

const removeListenersIfIdle = () => {
  if (registry.size > 0) return;
  if (!listening) return;
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerout', onPointerOut);
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onResize);
  listening = false;
};

const scheduleTick = (force = false) => {
  if (!force && moveRaf != null) return;
  moveRaf = requestAnimationFrame(tick);
};

const tick = () => {
  moveRaf = null;
  if (registry.size === 0) return;

  for (const [el, st] of registry) {
    if (io && !st.visible) continue;
    const rect = st.rect;
    if (!rect) continue;

    // Distance from the pointer to the rectangle (0 if inside)
    const cx = Math.max(rect.left, Math.min(lastClientX, rect.right));
    const cy = Math.max(rect.top, Math.min(lastClientY, rect.bottom));
    const dx = lastClientX - cx;
    const dy = lastClientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist <= st.outRadius) {
      const lx = Math.round(lastClientX - rect.left);
      const ly = Math.round(lastClientY - rect.top);
      if (lx !== st.lastSetX) {
        el.style.setProperty('--mouse-x', `${lx}px`);
        st.lastSetX = lx;
      }
      if (ly !== st.lastSetY) {
        el.style.setProperty('--mouse-y', `${ly}px`);
        st.lastSetY = ly;
      }
    } else {
      // Hide when outside radius
      if (st.lastSetX !== HIDDEN_PX) {
        el.style.setProperty('--mouse-x', `${HIDDEN_PX}px`);
        st.lastSetX = HIDDEN_PX;
      }
      if (st.lastSetY !== HIDDEN_PX) {
        el.style.setProperty('--mouse-y', `${HIDDEN_PX}px`);
        st.lastSetY = HIDDEN_PX;
      }
    }
  }
};

function useProximityMouseVars<T extends HTMLElement>(opts?: {
  outRadius?: number; // px beyond the element where the effect is active
}) {
  const ref = useRef<T | null>(null);
  const outRadius = opts?.outRadius ?? 200;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    ensureListeners();
    ensureIO();

    const st: ElemState = {
      rect: null,
      outRadius,
      visible: true,
      ro: null,
      lastSetX: NaN,
      lastSetY: NaN,
    };

    registry.set(el, st);
    hideVars(el, st);

    // Observe visibility
    if (io) io.observe(el);

    // Keep rect updated when the element itself resizes
    st.ro = new ResizeObserver(() => {
      st.rect = el.getBoundingClientRect();
    });
    st.ro.observe(el);

    // Initial rect
    st.rect = el.getBoundingClientRect();

    // Prime a tick so nearby elements react immediately
    scheduleTick(true);

    return () => {
      if (io) io.unobserve(el);
      st.ro?.disconnect();
      registry.delete(el);
      hideVars(el, st);
      removeListenersIfIdle();
    };
  }, [outRadius]);

  return ref;
}

/**
 * Components
 */

export const Separator = ({ className }: { className?: string }) => {
  const ref = useProximityMouseVars<HTMLDivElement>({ outRadius: 160 });

  return (
    <SeparatorPrimitive.Root asChild>
      <div
        ref={ref}
        className={cn(
          'my-2 block h-px w-full shrink-0 border-0 rounded !bg-border bg-radial-gradient-border',
          className
        )}
        style={{ contain: 'paint' }}
      />
    </SeparatorPrimitive.Root>
  );
};

export const Card = ({ children }: { children: React.ReactNode }) => {
  const ref = useProximityMouseVars<HTMLDivElement>({ outRadius: 220 });

  return (
    <div
      ref={ref}
      className="relative isolate overflow-visible rounded-lg bg-border bg-radial-gradient-border p-[2px]"
    >
      <div className="relative rounded-[calc(theme(borderRadius.lg)-2px)] bg-background bg-radial-gradient-content">
        {children}
      </div>
    </div>
  );
};
