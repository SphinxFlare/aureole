// ─────────────────────────────────────────────────────────────
//  AVATAR GALLERY — Neon Glow Raya-Style Gallery (Hero + 4 Medium)
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  heroPhoto: string;
  mediumPhotos: string[];
  extraPhotos: string[];
  onOpen: (index: number) => void; // index in modalPhotos array
}

export default function AvatarGallery({
  heroPhoto,
  mediumPhotos,
  extraPhotos,
  onOpen,
}: Props) {
  const [ drawerOpen, setDrawerOpen ] = useState(false);

  // modal indexes:
  // hero = 0
  // medium = 1..4
  // extras = after that
  const mediumStartIndex = 1;
  const extraStartIndex = 1 + mediumPhotos.length;

  return (
    <div className="mb-8">

      {/* ─────────────────────────────────────────────── */}
      {/*  HERO PHOTO (NEON) */}
      {/* ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative rounded-3xl overflow-hidden mb-4 cursor-pointer neon-border group",
          "transition-transform duration-300 hover:scale-[1.015]"
        )}
        onClick={() => onOpen(0)}
      >
        <img
          src={heroPhoto}
          className="w-full h-[360px] object-cover"
        />

        {/* neon glow overlay */}
        <div className="absolute inset-0 pointer-events-none neon-glow" />
      </div>

      {/* ─────────────────────────────────────────────── */}
      {/*  MEDIUM PHOTOS (4 slots) */}
      {/* ─────────────────────────────────────────────── */}
      {mediumPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {mediumPhotos.map((src, i) => (
            <div
              key={i}
              className={cn(
                "relative rounded-2xl overflow-hidden cursor-pointer neon-border",
                "transition-transform duration-300 hover:scale-[1.03]"
              )}
              onClick={() => onOpen(mediumStartIndex + i)}
            >
              <img src={src} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 neon-glow" />
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────── */}
      {/*  EXTRA PHOTOS (DRAWER) */}
      {/* ─────────────────────────────────────────────── */}
      {extraPhotos.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="flex items-center gap-2 mx-auto text-cosmic text-sm mb-2"
          >
            {drawerOpen ? (
              <>
                Hide additional photos <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show additional photos <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>

          {drawerOpen && (
            <div className="grid grid-cols-3 gap-3 mt-3 animate-fade-in">
              {extraPhotos.map((src, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative rounded-xl overflow-hidden cursor-pointer neon-border",
                    "transition-transform duration-300 hover:scale-[1.03]"
                  )}
                  onClick={() => onOpen(extraStartIndex + i)}
                >
                  <img
                    src={src}
                    className="w-full h-28 object-cover"
                  />
                  <div className="absolute inset-0 neon-glow" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
