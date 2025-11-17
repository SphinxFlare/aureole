// ─────────────────────────────────────────────────────────────
//  UPLOAD FLOATING BUTTON — Neon Cosmic Pulse
// ─────────────────────────────────────────────────────────────

import { useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onUpload: (file: File) => void;
}

export default function UploadFloatingButton({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <>
      {/* Hidden file picker */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Floating neon button */}
      <button
        onClick={openPicker}
        className={cn(
          "fixed bottom-24 right-6 z-[99]",
          "w-14 h-14 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-cyan-500/80 to-purple-500/80",
          "shadow-[0_0_18px_rgba(0,255,255,0.6)]",
          "hover:shadow-[0_0_26px_rgba(0,255,255,0.9)]",
          "backdrop-blur-md border border-white/20 neon-border",
          "transition-all duration-300 hover:scale-110 active:scale-95 animate-glow-pulse"
        )}
      >
        <Upload className="w-6 h-6 text-white" />
      </button>
    </>
  );
}