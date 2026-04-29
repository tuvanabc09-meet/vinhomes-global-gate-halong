import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { getImage } from "@/lib/images";

export interface LightboxItem {
  slotId: string;
  title: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const STEP = 0.5;

export const Lightbox = ({ items, index, onClose, onChange }: LightboxProps) => {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const draggingRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const item = items[index];

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const next = useCallback(() => {
    onChange((index + 1) % items.length);
    reset();
  }, [index, items.length, onChange, reset]);

  const prev = useCallback(() => {
    onChange((index - 1 + items.length) % items.length);
    reset();
  }, [index, items.length, onChange, reset]);

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(s + delta).toFixed(2)));
      if (next === 1) setPos({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Reset whenever the slide changes
  useEffect(() => {
    reset();
  }, [index, reset]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "+" || e.key === "=") zoomBy(STEP);
      else if (e.key === "-" || e.key === "_") zoomBy(-STEP);
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, zoomBy, reset, onClose]);

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomBy(e.deltaY > 0 ? -STEP : STEP);
  };

  // Pan
  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = draggingRef.current;
    if (!d) return;
    setPos({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
  };
  const onPointerUp = () => {
    draggingRef.current = null;
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-b from-black/70 to-transparent text-white">
        <div className="min-w-0">
          <h3 className="font-bold text-base sm:text-lg truncate text-secondary">{item.title}</h3>
          <p className="text-xs text-white/60 truncate">
            {index + 1} / {items.length} · slot: <span className="font-mono">{item.slotId}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-smooth flex-shrink-0"
          aria-label="Đóng"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Image stage */}
      <div
        className="relative flex-1 overflow-hidden select-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: scale > 1 ? (draggingRef.current ? "grabbing" : "grab") : "zoom-in" }}
        onClick={(e) => {
          if (scale === 1 && e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={getImage(item.slotId)}
          alt={item.title}
          draggable={false}
          className="absolute inset-0 m-auto max-w-full max-h-full object-contain transition-transform duration-200 ease-out will-change-transform"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
        />

        {/* Prev / Next */}
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur transition-smooth"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur transition-smooth"
              aria-label="Ảnh kế"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-center gap-2 p-3 sm:p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
        <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur rounded-full p-1.5">
          <button onClick={() => zoomBy(-STEP)} disabled={scale <= MIN_SCALE} className="p-2 rounded-full hover:bg-white/15 disabled:opacity-40 transition-smooth" aria-label="Thu nhỏ">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="px-2 text-sm font-mono tabular-nums min-w-[3.5rem] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => zoomBy(STEP)} disabled={scale >= MAX_SCALE} className="p-2 rounded-full hover:bg-white/15 disabled:opacity-40 transition-smooth" aria-label="Phóng to">
            <ZoomIn className="w-5 h-5" />
          </button>
          <span className="w-px h-5 bg-white/20 mx-1" />
          <button onClick={reset} className="p-2 rounded-full hover:bg-white/15 transition-smooth" aria-label="Đặt lại">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={() => setScale(MAX_SCALE)} className="p-2 rounded-full hover:bg-white/15 transition-smooth" aria-label="Phóng tối đa">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
        <div className="hidden sm:block text-xs text-white/50 ml-3">
          ← / → chuyển ảnh · +/− zoom · 0 reset · Esc đóng
        </div>
      </div>
    </div>
  );
};
