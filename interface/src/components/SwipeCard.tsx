// src/components/SwipeCard.tsx
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { MapPin, Info, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { Profile } from "@/types/types";

interface SwipeCardProps {
  profile: Profile;
  index: number;
  total: number;
  onLike: () => void;
  onPass: () => void;
  onSuperLike?: () => void;
}

const SwipeCard = (
  { profile, index, total, onLike, onPass, onSuperLike }: SwipeCardProps,
  ref: any
) => {
  // CARD SWIPE STATE
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [type, setType] = useState<"like" | "pass" | "superlike" | null>(null);

  // IMAGE CAROUSEL STATE
  const [photoIndex, setPhotoIndex] = useState(0);

  // FULL-INFO OVERLAY
  const [isRevealed, setIsRevealed] = useState(false);

  const start = useRef({ x: 0, y: 0 });
  const isTop = index === total - 1;
  const stackIndex = total - index - 1;

  const scale = 1 - stackIndex * 0.05;
  const translateY = stackIndex * 22;

  // CAROUSEL HANDLERS
  const nextPhoto = () => {
    if (profile.photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % profile.photos.length);
  };

  const prevPhoto = () => {
    if (profile.photos.length <= 1) return;
    setPhotoIndex((i) => (i === 0 ? profile.photos.length - 1 : i - 1));
  };

  // BUTTON TRIGGER SWIPE
  useImperativeHandle(ref, () => ({
    triggerAnimation: (t: "like" | "pass" | "superlike") => {
      if (!isTop || animating) return;
      setType(t);

      const drift = 1200;
      if (t === "like") setPos({ x: drift, y: 0 });
      if (t === "pass") setPos({ x: -drift, y: 0 });
      if (t === "superlike") setPos({ x: 0, y: -drift });
    },
  }));

  // SWIPE COMPLETE
  useEffect(() => {
    if (!type) return;
    setAnimating(true);

    const timer = setTimeout(() => {
      if (type === "like") onLike();
      if (type === "pass") onPass();
      if (type === "superlike") onSuperLike?.();

      setAnimating(false);
      setType(null);
      setPos({ x: 0, y: 0 });
    }, 600);

    return () => clearTimeout(timer);
  }, [type]);

  // DRAG HANDLERS
  const startDrag = (x: number, y: number) => {
    if (!isTop || animating) return;
    start.current = { x: x - pos.x, y: y - pos.y };
    setDragging(true);
  };

  const moveDrag = (x: number, y: number) => {
    if (!dragging || !isTop || animating) return;
    setPos({ x: x - start.current.x, y: y - start.current.y });
  };

  const endDrag = () => {
    if (!dragging || animating || !isTop) return;
    setDragging(false);

    const threshold = 130;
    if (Math.abs(pos.x) > threshold) {
      if (pos.x > 0) setType("like");
      else setType("pass");

      const glide = pos.x > 0 ? 1200 : -1200;
      setPos({ x: glide, y: pos.y });
    } else {
      setPos({ x: 0, y: 0 });
    }
  };

  // VISUAL EFFECTS
  const rotation = pos.x / 16;
  const parallaxX = pos.x * 0.012;
  const parallaxY = pos.y * 0.012;

  const likeOpacity = Math.min(Math.max(pos.x / 120, 0), 1);
  const passOpacity = Math.min(Math.max(-pos.x / 120, 0), 1);

  const transform =
    type === "like"
      ? "translateX(120%) rotate(14deg)"
      : type === "pass"
      ? "translateX(-120%) rotate(-14deg)"
      : type === "superlike"
      ? "translateY(-120%) scale(1.06)"
      : `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg)`;

  return (
    <div
      className={cn(
        "absolute inset-0 rounded-3xl overflow-hidden soft-depth-card",
        "cursor-grab active:cursor-grabbing select-none transition-all duration-500"
      )}
      style={{
        transform: `${transform} scale(${scale}) translateY(${translateY}px)`,
        zIndex: 200 - stackIndex,
      }}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={endDrag}
      onClick={() => setIsRevealed(true)}
    >
      {/* ==== IMAGE CAROUSEL ==== */}
      <img
        key={photoIndex} // forces fade animation
        src={profile.photos[photoIndex] || "/fallback.jpg"}
        alt={profile.name}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 fade-image"
        style={{
          transform: `translate(${parallaxX}px, ${parallaxY}px) scale(1.08)`,
          transition: dragging ? "none" : "transform 0.45s ease, opacity 0.35s ease",
        }}
      />

      {/* ==== TAP ZONES FOR CAROUSEL ==== */}
      <div className="absolute inset-0 z-30 flex">
        <div
          className="w-1/2 h-full"
          onClick={(e) => {
            e.stopPropagation();
            prevPhoto();
          }}
        />
        <div
          className="w-1/2 h-full"
          onClick={(e) => {
            e.stopPropagation();
            nextPhoto();
          }}
        />
      </div>

      {/* ==== PHOTO INDICATORS ==== */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 z-40">
        {profile.photos.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              i === photoIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* ==== SPARKLES ==== */}
      <div className="sparkle-layer pointer-events-none"></div>

      {/* ==== OVERLAY BEFORE "REVEAL" ==== */}
      {!isRevealed && <div className="full-glass-cover"></div>}

      {/* ==== INFO BUTTON ==== */}
      <button
        className="reveal-button z-40"
        onClick={(e) => {
          e.stopPropagation();
          setIsRevealed(true);
        }}
      >
        <Info className="w-4 h-4 text-black" />
      </button>

      {/* ==== BOTTOM DETAILS ==== */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-40">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-3xl font-semibold text-white drop-shadow-sm">
            {profile.name},{" "}
            <span className="text-gray-200 font-light">{profile.age}</span>
          </h2>

          <PawPrint className="w-3.5 h-3.5 text-grey-300" strokeWidth={3.5} />
        </div>

        {profile.distance && (
          <p className="flex items-center gap-1.5 text-sm text-gray-200/90">
            <MapPin className="w-4 h-4 text-cyan-300" />
            {profile.distance}
          </p>
        )}

        <p className="text-md text-gray-200 mt-3 line-clamp-3">
          {profile.bio}
        </p>
      </div>

      {/* ==== LIKE / PASS OVERLAYS ==== */}
      <div className="absolute inset-0 flex justify-between px-8 pt-8 pointer-events-none z-40">
        <div
          className="text-6xl font-black text-red-400 opacity-0 drop-shadow-lg"
          style={{ opacity: passOpacity }}
        >
          ✖
        </div>
        <div
          className="text-6xl font-black text-emerald-400 opacity-0 drop-shadow-lg"
          style={{ opacity: likeOpacity }}
        >
          ❤
        </div>
      </div>
    </div>
  );
};

export default forwardRef(SwipeCard);