'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { InfoIcon, Download } from 'lucide-react';

export default function QRCodeGenerator() {
  const [baseUrl, setBaseUrl] = useState('https://lumacs.co.uk');
  const [ref, setRef] = useState('');
  const [finalUrl, setFinalUrl] = useState('https://lumacs.co.uk');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.trim()) {
      const url = new URL(baseUrl);
      url.searchParams.set('ref', ref.trim());
      setFinalUrl(url.toString());
    } else {
      setFinalUrl(baseUrl);
    }
  }, [baseUrl, ref]);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 20;
    const qrSize = 1000; // Higher resolution for better quality
    canvas.width = qrSize + padding * 2;
    canvas.height = qrSize + padding * 2;

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const qrImage = new Image();
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    qrImage.onload = () => {
      // Draw QR code
      ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);
      URL.revokeObjectURL(svgUrl);

      // Load and draw logo on top
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoSize = 200;
        const logoX = padding + (qrSize - logoSize) / 2;
        const logoY = padding + (qrSize - logoSize) / 2;

        // Draw logo with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) return;
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `qr-code-${ref || 'lumacs'}.png`;
          link.click();
          URL.revokeObjectURL(downloadUrl);
        });
      };
      logo.src = '/qr_logo.png';
    };

    qrImage.src = svgUrl;
  };

  return (
    <div className="space-y-8 m-4">
      <Card>
        <CardHeader>
          <CardTitle>URL Configuration</CardTitle>
          <CardDescription>
            Enter your URL and optional tracking reference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Base URL</Label>
            <Input
              id="url"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref">Reference (ref)</Label>
            <Input
              id="ref"
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g., poster-campaign-2024"
            />
            <div className="flex gap-2 rounded-lg bg-muted p-3 text-sm">
              <InfoIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">What are refs?</strong> A
                reference (ref) is a tracking parameter added to your URL. It
                helps you identify where your traffic is coming from. For
                example, use different refs for posters, flyers, or social media
                to track which marketing materials are most effective.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Generated URL</Label>
            <div className="rounded-md bg-muted p-3 font-mono text-sm break-all">
              {finalUrl}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
          <CardDescription>Scan this code to visit your URL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div
              ref={qrRef}
              className="relative inline-block rounded-lg bg-white p-2"
            >
              <QRCodeSVG
                value={finalUrl}
                size={300}
                level="H"
                marginSize={0}
                imageSettings={{
                  src: '/qr_logo.png',
                  height: 60,
                  width: 60,
                  excavate: false,
                }}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={downloadQRCode} className="gap-2">
              <Download className="h-4 w-4" />
              Download as PNG
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
