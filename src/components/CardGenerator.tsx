'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

const OUTPUT_WIDTH = 1200;
const OVERLAY_SRC = '/assets/card_overlay.png';
const ASPECT = 5 / 7;
const CORNER_RADIUS = 45;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function ImageFramer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pasteZoneRef = useRef<HTMLDivElement | null>(null);

  const onFile = (file: File | undefined | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onPaste = useCallback(async (e: ClipboardEvent) => {
    if (!e.clipboardData) return;
    const items = Array.from(e.clipboardData.items);

    // 1. image blob directly from clipboard
    const imgItem = items.find((it) => it.type.startsWith('image/'));
    if (imgItem) {
      const blob = imgItem.getAsFile();
      onFile(blob);
      e.preventDefault();
      return;
    }

    // 2. data URL text
    const text = e.clipboardData.getData('text/plain')?.trim();
    if (text?.startsWith('data:image/')) {
      setImageSrc(text);
      e.preventDefault();
      return;
    }

    // 3. remote URL - attempt fetch (will fail without CORS)
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
    window.addEventListener('paste', handler as EventListener);
    return () => {
      window.removeEventListener('paste', handler as EventListener);
    };
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

    const img = await loadImage(imageSrc);

    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, CORNER_RADIUS * (width / 600));
    ctx.clip();

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

    try {
      const overlay = await loadImage(OVERLAY_SRC);
      ctx.drawImage(overlay, 0, 0, width, height);
    } catch {
      // ignore
    }

    canvasRef.current = canvas;
    return canvas;
  }, [imageSrc, croppedArea]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const canvas = await render();
      if (canvas) setResultUrl(canvas.toDataURL('image/png'));
    }, 150);
    return () => clearTimeout(t);
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

  return (
    <div className="m-4 space-y-6">
      <div
        ref={pasteZoneRef}
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

      {imageSrc && (
        <div className="space-y-3">
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
