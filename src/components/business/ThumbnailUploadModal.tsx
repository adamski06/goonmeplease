import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ThumbnailUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (croppedBlob: Blob) => void;
  saving?: boolean;
  aspectRatio?: number; // width/height, default 9/14
}

const ThumbnailUploadModal: React.FC<ThumbnailUploadModalProps> = ({
  open,
  onClose,
  onSave,
  saving = false,
  aspectRatio = 9 / 14,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const CANVAS_WIDTH = 270;
  const CANVAS_HEIGHT = CANVAS_WIDTH / aspectRatio;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) { setImageEl(null); return; }
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      // Fit image to cover canvas
      const scaleX = CANVAS_WIDTH / img.width;
      const scaleY = CANVAS_HEIGHT / img.height;
      const fitScale = Math.max(scaleX, scaleY);
      setScale(fitScale);
      setOffset({
        x: (CANVAS_WIDTH - img.width * fitScale) / 2,
        y: (CANVAS_HEIGHT - img.height * fitScale) / 2,
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(
      imageEl,
      offset.x,
      offset.y,
      imageEl.width * scale,
      imageEl.height * scale,
    );
  }, [imageEl, scale, offset]);

  useEffect(() => { draw(); }, [draw]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = () => setDragging(false);

  const adjustScale = (delta: number) => {
    setScale(prev => {
      const next = Math.max(0.1, prev + delta);
      return next;
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Draw at higher resolution for quality
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 540;
    exportCanvas.height = 540 / aspectRatio;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx || !imageEl) return;
    const ratio = exportCanvas.width / CANVAS_WIDTH;
    ctx.drawImage(
      imageEl,
      offset.x * ratio,
      offset.y * ratio,
      imageEl.width * scale * ratio,
      imageEl.height * scale * ratio,
    );
    exportCanvas.toBlob(
      (blob) => { if (blob) onSave(blob); },
      'image/jpeg',
      0.9,
    );
  };

  const reset = () => {
    setImageSrc(null);
    setImageEl(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-[24px]">
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-foreground font-montserrat">Ad Thumbnail</h2>
            <p className="text-sm text-muted-foreground mt-1">Upload and position your image</p>
          </div>

          {!imageSrc ? (
            /* Upload drop zone */
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/14] max-h-[420px] rounded-[20px] border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-foreground/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Upload image</p>
                <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or WebP</p>
              </div>
            </button>
          ) : (
            /* Crop area */
            <div className="space-y-4">
              <div
                className="relative mx-auto rounded-[20px] overflow-hidden cursor-grab active:cursor-grabbing"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  maxHeight: 420,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--muted))',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="block"
                  style={{ touchAction: 'none' }}
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                  <Move className="h-3 w-3 text-white/60" />
                  <span className="text-[10px] text-white/60 font-medium">Drag to position</span>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => adjustScale(-0.05)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ZoomOut className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/40 transition-all"
                    style={{ width: `${Math.min(scale * 50, 100)}%` }}
                  />
                </div>
                <button
                  onClick={() => adjustScale(0.05)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Change image link */}
              <button
                onClick={() => { reset(); fileInputRef.current?.click(); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto block underline underline-offset-2"
              >
                Choose different image
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!imageSrc || saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThumbnailUploadModal;
