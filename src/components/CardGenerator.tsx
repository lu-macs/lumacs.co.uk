'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

const OUTPUT_WIDTH = 1200;
const ASPECT = 5 / 7;

// corner radii (scaled from a 600px baseline)
const CARD_CORNER_RADIUS = 30; // outer image clip
const BORDER_CORNER_RADIUS = 30; // inset border radius

// defaults
const DEFAULT_COLOUR = '#dc2626';

// selectable logos
const LOGO_OPTIONS = [
  '/assets/branding/logo/light.png',
  '/assets/branding/logo/dark.png',
  '/assets/branding/logoandhoop/light.png',
  '/assets/branding/logoandhoop/dark.png',
  '/assets/branding/logoandtext/light.png',
  '/assets/branding/logoandtext/dark.png',
] as const;

// all fractions of output width
const BORDER_INSET = 0.05; // distance from card edge to border
const BORDER_WIDTH = 0.01; // stroke thickness

// per-logo config (width/inset)
const PER_LOGO: Record<
  (typeof LOGO_OPTIONS)[number],
  { width: number; inset: number }
> = {
  '/assets/branding/logo/light.png': { width: 0.2, inset: 0.06 },
  '/assets/branding/logo/dark.png': { width: 0.2, inset: 0.06 },
  '/assets/branding/logoandhoop/light.png': { width: 0.16, inset: 0.08 },
  '/assets/branding/logoandhoop/dark.png': { width: 0.16, inset: 0.08 },
  '/assets/branding/logoandtext/light.png': { width: 0.18, inset: 0.07 },
  '/assets/branding/logoandtext/dark.png': { width: 0.18, inset: 0.07 },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const logoCache = new Map<string, Promise<HTMLImageElement>>();
function loadLogo(src: string) {
  let p = logoCache.get(src);
  if (!p) {
    p = loadImage(src);
    p.catch(() => logoCache.delete(src));
    logoCache.set(src, p);
  }
  return p;
}

export default function ImageFramer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [colour, setColour] = useState(DEFAULT_COLOUR);
  const [logoSrc, setLogoSrc] = useState<string>(LOGO_OPTIONS[0]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onFile = (file: File | undefined | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onPaste = useCallback(async (e: ClipboardEvent) => {
    if (!e.clipboardData) return;
    const items = Array.from(e.clipboardData.items);

    const imgItem = items.find((it) => it.type.startsWith('image/'));
    if (imgItem) {
      onFile(imgItem.getAsFile());
      e.preventDefault();
      return;
    }

    const text = e.clipboardData.getData('text/plain')?.trim();
    if (text?.startsWith('data:image/')) {
      setImageSrc(text);
      e.preventDefault();
      return;
    }

    if (text?.startsWith('http')) {
      try {
        const res = await fetch(text, { mode: 'cors' });
        if (!res.ok) return;
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) return;
        onFile(new File([blob], 'pasted.png', { type: blob.type }));
        e.preventDefault();
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const handler = (e: ClipboardEvent) => onPaste(e);
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [onPaste]);

  const render = useCallback(async () => {
    if (!imageSrc || !croppedArea) return null;

    const width = OUTPUT_WIDTH;
    const height = Math.round(OUTPUT_WIDTH / ASPECT);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // clip to card shape
    {
      const r = CARD_CORNER_RADIUS * (width / 600);
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, r);
      ctx.clip();
    }

    const img = await loadImage(imageSrc);

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      width,
      height,
    );

    // inset border
    {
      const inset = width * BORDER_INSET;
      const lineWidth = width * BORDER_WIDTH;
      const x = inset + lineWidth / 2;
      const y = inset + lineWidth / 2;
      const w = width - inset * 2 - lineWidth;
      const h = height - inset * 2 - lineWidth;
      const desired = BORDER_CORNER_RADIUS * (width / 600);
      const radius = Math.min(desired, Math.min(w, h) / 2);

      ctx.save();
      ctx.strokeStyle = colour;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.stroke();
      ctx.restore();
    }

    // logos - size and inset per-logo
    try {
      const cfg =
        PER_LOGO[logoSrc as (typeof LOGO_OPTIONS)[number]] ??
        PER_LOGO['/assets/branding/logo/light.png'];
      const logo = await loadLogo(logoSrc);
      const lw = width * cfg.width;
      const lh = lw * (logo.naturalHeight / logo.naturalWidth);
      const insetPx = width * cfg.inset;

      // top-left
      ctx.drawImage(logo, insetPx, insetPx, lw, lh);

      // bottom-right rotated 180deg
      ctx.save();
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      ctx.drawImage(logo, insetPx, insetPx, lw, lh);
      ctx.restore();
    } catch {
      // ignore logo load issues
    }

    canvasRef.current = canvas;
    return canvas;
  }, [imageSrc, croppedArea, colour, logoSrc]);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const canvas = await render();
      if (canvas && !cancelled) setResultUrl(canvas.toDataURL('image/png'));
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [render]);

  const toBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      if (!canvasRef.current) return resolve(null);
      canvasRef.current.toBlob((b) => resolve(b), 'image/png');
    });

  const download = async () => {
    setBusy(true);
    await render();
    const blob = await toBlob();
    setBusy(false);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'framed.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    setBusy(true);
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': render().then(async () => {
            const blob = await toBlob();
            if (!blob) throw new Error('No image');
            return blob;
          }),
        }),
      ]);
    } finally {
      setBusy(false);
    }
  };

  const isLightLogo = (src: string) => src.includes('/light');

  const presetColours = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#dc2626' },
  ];

  return (
    <div className="m-4 space-y-6">
      <div
        tabIndex={0}
        onPaste={(e) => onPaste(e.nativeEvent)}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="flex min-h-[140px] cursor-pointer items-center 
                   justify-center rounded-md border border-dashed 
                   bg-muted/30 p-4 text-sm text-muted-foreground"
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = () => onFile(input.files?.[0] ?? null);
          input.click();
        }}
        title="Click to choose an image, paste (Ctrl+V), or drop a file"
      >
        {imageSrc ? (
          <span className="text-foreground">
            Image loaded. Paste again to replace or drop/click to change.
          </span>
        ) : (
          <span>Paste an image (Ctrl+V), drop a file or click to choose.</span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm">Colour</span>
          <div className="flex items-center gap-2">
            {presetColours.map((c) => {
              const selected = colour.toLowerCase() === c.value.toLowerCase();
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColour(c.value)}
                  className={[
                    'h-8 w-8 rounded-md border',
                    selected ? 'ring-2 ring-offset-2 ring-primary' : '',
                  ].join(' ')}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  aria-label={c.name}
                />
              );
            })}
            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
              <input
                type="color"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded border bg-background"
                aria-label="Custom colour"
                title="Custom colour"
              />
              <input
                type="text"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="w-28 bg-transparent text-sm outline-none"
                spellCheck={false}
                aria-label="Hex colour"
                title="Hex colour"
                placeholder="#rrggbb"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {LOGO_OPTIONS.map((src) => {
          const selected = src === logoSrc;
          const lightBg = isLightLogo(src);
          return (
            <button
              key={src}
              type="button"
              onClick={() => setLogoSrc(src)}
              className={[
                'rounded-md border p-1 transition',
                selected
                  ? 'ring-2 ring-offset-2 ring-primary border-transparent'
                  : 'hover:border-foreground/40',
                lightBg ? 'bg-white' : 'bg-transparent',
              ].join(' ')}
              title={src.split('/').slice(-2).join('/')}
            >
              <img
                src={src}
                alt="Logo option"
                className="h-14 w-full rounded object-contain"
              />
            </button>
          );
        })}
      </div>

      {imageSrc && (
        <div className="relative h-[500px] w-full overflow-hidden rounded-lg bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedArea(pixels)}
          />
        </div>
      )}

      {resultUrl && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={resultUrl}
              alt="Result"
              className="max-h-[500px] rounded-lg"
            />
          </div>
          <div className="flex justify-center gap-2">
            <Button onClick={download} disabled={busy} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={copy}
              disabled={busy}
              variant="secondary"
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
