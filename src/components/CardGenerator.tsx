'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2 } from 'lucide-react';

const OUTPUT_WIDTH = 1200;

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

type LogoSrc = (typeof LOGO_OPTIONS)[number];

// all fractions of output width
const BORDER_INSET = 0.05; // distance from card edge to border
const BORDER_WIDTH = 0.01; // stroke thickness

// per-logo config (width/inset)
const PER_LOGO: Record<LogoSrc, { width: number; inset: number }> = {
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function renderFramed(
  imageSrc: string,
  croppedArea: Area,
  colour: string,
  logoSrc: string,
  aspect: number,
): Promise<HTMLCanvasElement | null> {
  const width = OUTPUT_WIDTH;
  const height = Math.round(OUTPUT_WIDTH / aspect);
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
    const cfg = PER_LOGO[logoSrc as LogoSrc] ?? PER_LOGO[LOGO_OPTIONS[0]];
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

  return canvas;
}

type FrameItemState = {
  id: string;
  name: string;
  src: string;
  crop: { x: number; y: number };
  zoom: number;
  croppedArea: Area | null;
};

function FrameItem({
  item,
  colour,
  logoSrc,
  aspect,
  onChange,
  onRemove,
}: {
  item: FrameItemState;
  colour: string;
  logoSrc: string;
  aspect: number;
  onChange: (patch: Partial<FrameItemState>) => void;
  onRemove: () => void;
}) {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const render = useCallback(() => {
    if (!item.croppedArea) return Promise.resolve(null);
    return renderFramed(item.src, item.croppedArea, colour, logoSrc, aspect);
  }, [item.src, item.croppedArea, colour, logoSrc, aspect]);

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

  const download = async () => {
    setBusy(true);
    try {
      const canvas = await render();
      if (!canvas) return;
      const blob = await canvasToBlob(canvas);
      if (blob) downloadBlob(blob, `${item.name}-framed.png`);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    setBusy(true);
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': render().then(async (canvas) => {
            const blob = canvas ? await canvasToBlob(canvas) : null;
            if (!blob) throw new Error('No image');
            return blob;
          }),
        }),
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="truncate text-sm text-muted-foreground">
          {item.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative h-[360px] w-full overflow-hidden rounded-lg bg-muted">
          <Cropper
            image={item.src}
            crop={item.crop}
            zoom={item.zoom}
            aspect={aspect}
            onCropChange={(crop) => onChange({ crop })}
            onZoomChange={(zoom) => onChange({ zoom })}
            onCropComplete={(_, pixels) => onChange({ croppedArea: pixels })}
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          {resultUrl ? (
            <img
              src={resultUrl}
              alt="Result"
              className="max-h-[360px] rounded-lg"
            />
          ) : (
            <span className="text-sm text-muted-foreground">Rendering...</span>
          )}
          <div className="flex gap-2">
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
      </div>
    </div>
  );
}

export default function ImageFramer() {
  const [items, setItems] = useState<FrameItemState[]>([]);
  const [busy, setBusy] = useState(false);

  const [colour, setColour] = useState(DEFAULT_COLOUR);
  const [logoSrc, setLogoSrc] = useState<string>(LOGO_OPTIONS[0]);

  const [ratioW, setRatioW] = useState<number>(5);
  const [ratioH, setRatioH] = useState<number>(7);
  const aspect = Math.max(0.0001, ratioW / ratioH); // avoid divide by zero

  const addSources = (sources: { src: string; name: string }[]) => {
    if (sources.length === 0) return;
    setItems((prev) => [
      ...prev,
      ...sources.map((s) => ({
        id: crypto.randomUUID(),
        name: s.name,
        src: s.src,
        crop: { x: 0, y: 0 },
        zoom: 1,
        croppedArea: null,
      })),
    ]);
  };

  const onFiles = async (files: Iterable<File> | null | undefined) => {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;

    const sources = await Promise.all(
      list.map(async (f) => ({
        src: await readFileAsDataUrl(f),
        name: f.name.replace(/\.[^.]+$/, '') || 'image',
      })),
    );

    // dedupe against existing items and within new batch
    const existingSrcs = new Set(items.map((i) => i.src));
    const added = new Set<string>();
    const deduped = sources.filter((s) => {
      if (existingSrcs.has(s.src) || added.has(s.src)) return false;
      added.add(s.src);
      return true;
    });

    addSources(deduped);
  };

  const onPaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const itemsArr = Array.from(e.clipboardData.items);

      // collect image files from clipboard items
      const files = itemsArr
        .filter((it) => it.type.startsWith('image/'))
        .map((it) => it.getAsFile())
        .filter((f): f is File => f !== null);

      if (files.length > 0) {
        e.preventDefault();
        await onFiles(files);
        return;
      }

      // check for data URL in text/plain
      const text = e.clipboardData.getData('text/plain')?.trim();
      if (text?.startsWith('data:image/')) {
        e.preventDefault();
        if (!items.some((it) => it.src === text))
          addSources([{ src: text, name: 'pasted' }]);
        return;
      }

      // possibly a URL to an image
      if (text?.startsWith('http')) {
        try {
          const res = await fetch(text, { mode: 'cors' });
          if (!res.ok) return;
          const blob = await res.blob();
          if (!blob.type.startsWith('image/')) return;
          e.preventDefault();
          const file = new File([blob], 'pasted.png', { type: blob.type });
          await onFiles([file]);
        } catch {
          // ignore
        }
      }
    },
    [items],
  );

  useEffect(() => {
    const handler = (e: ClipboardEvent) => onPaste(e);
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [onPaste]);

  const updateItem = (id: string, patch: Partial<FrameItemState>) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const downloadAll = async () => {
    setBusy(true);
    try {
      for (const item of items) {
        if (!item.croppedArea) continue;
        const canvas = await renderFramed(
          item.src,
          item.croppedArea,
          colour,
          logoSrc,
          aspect,
        );
        if (!canvas) continue;
        const blob = await canvasToBlob(canvas);
        if (blob) downloadBlob(blob, `${item.name}-framed.png`);
        // give the browser a moment between downloads
        await new Promise((r) => setTimeout(r, 300));
      }
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

  const ratioPresets = [
    { label: 'Card 5:7', w: 5, h: 7 },
    { label: 'Square 1:1', w: 1, h: 1 },
  ];

  return (
    <div className="m-4 space-y-6">
      <div
        tabIndex={0}
        onPaste={(e) => onPaste(e.nativeEvent)}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="flex min-h-[140px] cursor-pointer items-center 
                   justify-center rounded-md border border-dashed 
                   bg-muted/30 p-4 text-sm text-muted-foreground"
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.multiple = true;
          input.onchange = () => onFiles(input.files);
          input.click();
        }}
        title="Click to choose images, paste (Ctrl+V), or drop files"
      >
        {items.length > 0 ? (
          <span className="text-foreground">
            {items.length} image{items.length === 1 ? '' : 's'} loaded. Paste,
            drop or click to add more.
          </span>
        ) : (
          <span>Paste images (Ctrl+V), drop files or click to choose.</span>
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
                lightBg ? 'bg-white' : 'bg-black',
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <label className="text-sm">Ratio</label>
          <div className="flex items-center gap-2">
            {ratioPresets.map((p) => {
              const preset = p.w > 0;
              const selected = preset && ratioW === p.w && ratioH === p.h;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    if (p.w > 0) {
                      setRatioW(p.w);
                      setRatioH(p.h);
                    } else {
                      // custom - leave values as-is but focus inputs — simple UX
                      setRatioW((r) => (r === 0 ? 1 : r));
                      setRatioH((r) => (r === 0 ? 1 : r));
                    }
                  }}
                  className={[
                    'rounded-md border px-2 py-1 text-sm',
                    selected ? 'ring-2 ring-offset-2 ring-primary' : '',
                  ].join(' ')}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="ml-4 flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={ratioW}
              onChange={(e) =>
                setRatioW(Math.max(1, Number(e.target.value || 1)))
              }
              className="w-16 rounded border bg-background px-2 py-1 text-sm"
              aria-label="Ratio width"
              title="Ratio width"
            />
            <span className="text-sm">:</span>
            <input
              type="number"
              min={1}
              value={ratioH}
              onChange={(e) =>
                setRatioH(Math.max(1, Number(e.target.value || 1)))
              }
              className="w-16 rounded border bg-background px-2 py-1 text-sm"
              aria-label="Ratio height"
              title="Ratio height"
            />
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setItems([])}
            disabled={busy}
          >
            Clear all
          </Button>
          <Button onClick={downloadAll} disabled={busy} className="gap-2">
            <Download className="h-4 w-4" />
            Download all
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <FrameItem
            key={item.id}
            item={item}
            colour={colour}
            logoSrc={logoSrc}
            aspect={aspect}
            onChange={(patch) => updateItem(item.id, patch)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
