// ─────────────────────────────────────────────────────────────
//  PHOTO VIEWER MODAL — Fullscreen Neon Viewer (Zoom + Swipe)
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  photos: string[];
  index: number;
  onClose: () => void;
  onSetAvatar: (src: string) => void;
  onDelete: (src: string) => void;
}

export default function PhotoViewerModal({
  photos,
  index,
  onClose,
  onSetAvatar,
  onDelete,
}: Props) {
  const [current, setCurrent] = useState(index);
  const [scale, setScale] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement>(null);

  // ───────────────────────────────────────────────
  // Close on ESC
  // ───────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // ───────────────────────────────────────────────
  // SWIPE LOGIC (mobile)
  // ───────────────────────────────────────────────
  const touchStart = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (delta > 60) prev();
    if (delta < -60) next();
  };

  // ───────────────────────────────────────────────
  // NAVIGATION
  // ───────────────────────────────────────────────
  const prev = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      resetTransform();
    }
  };

  const next = () => {
    if (current < photos.length - 1) {
      setCurrent((c) => c + 1);
      resetTransform();
    }
  };

  const resetTransform = () => {
    setScale(1);
    setDrag({ x: 0, y: 0 });
  };

  // ───────────────────────────────────────────────
  // ZOOM (scroll wheel)
  // ───────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent) => {
    let newScale = scale + (e.deltaY > 0 ? -0.1 : 0.1);
    newScale = Math.min(3, Math.max(1, newScale));
    setScale(newScale);
  };

  // ───────────────────────────────────────────────
  // DRAG FOR ZOOMED IMAGE
  // ───────────────────────────────────────────────
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    dragging.current = true;
    dragStart.current = { x: e.clientX - drag.x, y: e.clientY - drag.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setDrag({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  // ───────────────────────────────────────────────
  // DOUBLE CLICK → RESET ZOOM
  // ───────────────────────────────────────────────
  const onDoubleClick = () => resetTransform();

  // ───────────────────────────────────────────────
  // DELETE CONFIRM
  // ───────────────────────────────────────────────
  const confirmDelete = () => {
    const src = photos[current];
    onDelete(src);
    if (current > 0) setCurrent((c) => c - 1);
    else if (photos.length === 1) onClose();
  };

  // ───────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[999] flex flex-col justify-center items-center animate-fade-in"
      onWheel={handleWheel}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* CLOSE BUTTON */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 transition text-white"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      {/* LEFT NAV */}
      {current > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 transition text-white"
          onClick={prev}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* RIGHT NAV */}
      {current < photos.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 transition text-white"
          onClick={next}
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* IMAGE */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onDoubleClick={onDoubleClick}
      >
        <img
          ref={imgRef}
          src={photos[current]}
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) scale(${scale})`,
            transition: dragging.current ? "none" : "transform 0.25s ease",
          }}
          className="max-w-none max-h-none"
        />
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md neon-border">
        <button
          className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition flex items-center gap-2"
          onClick={() => onSetAvatar(photos[current])}
        >
          <Star className="w-4 h-4" /> Set Avatar
        </button>

        <button
          className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 transition flex items-center gap-2"
          onClick={confirmDelete}
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
}