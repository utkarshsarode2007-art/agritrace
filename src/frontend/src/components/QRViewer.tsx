import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import type { Batch } from "../lib/supply-chain-types";

interface QRViewerProps {
  batch: Batch;
}

export function QRViewer({ batch }: QRViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/scan/${batch.id}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Draw QR-like pattern
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const cellSize = 8;
    const cols = Math.floor(size / cellSize);
    const rows = Math.floor(size / cellSize);

    // Seeded pseudo-random from batch id
    let seed = batch.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0x100000000;
    };

    ctx.fillStyle = "#1a1a1a";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Corner finder patterns
        const inTopLeft = r < 7 && c < 7;
        const inTopRight = r < 7 && c >= cols - 7;
        const inBottomLeft = r >= rows - 7 && c < 7;

        if (inTopLeft || inTopRight || inBottomLeft) {
          const lr = inTopLeft ? r : inTopRight ? r : r - (rows - 7);
          const lc = inTopLeft ? c : inTopRight ? c - (cols - 7) : c;
          const isOuterBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const isInnerFill = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          if (isOuterBorder || isInnerFill) {
            ctx.fillRect(
              c * cellSize,
              r * cellSize,
              cellSize - 1,
              cellSize - 1,
            );
          }
        } else {
          if (rand() > 0.5) {
            ctx.fillRect(
              c * cellSize,
              r * cellSize,
              cellSize - 1,
              cellSize - 1,
            );
          }
        }
      }
    }
  }, [batch.id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="p-4 bg-white border-2 border-border rounded-xl shadow-card">
        <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Scan URL</p>
        <code className="text-xs bg-muted px-3 py-1.5 rounded-lg block max-w-xs truncate">
          {url}
        </code>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        data-ocid="qr.copy_button"
        className="gap-2"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  );
}
