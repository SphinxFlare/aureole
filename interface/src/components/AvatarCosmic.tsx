// src/components/AvatarCosmic.tsx


import { Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarCosmicProps {
  src?: string;
  size?: number;
  online?: boolean;
  verified?: boolean;
  fallback?: string;
}

const AvatarCosmic = ({
  src,
  size = 72,
  online = false,
  verified = false,
  fallback = "U",
}: AvatarCosmicProps) => {
  return (
    <div
      className="relative group"
      style={{ width: size, height: size }}
    >
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full 
                   bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 
                   blur-xl opacity-40 
                   group-hover:opacity-70 transition-opacity"
      />

      {/* Your EXISTING Radix Avatar */}
      <Avatar
        className="relative rounded-full border border-white/20 shadow-lg 
                   transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <AvatarImage src={src} />
        <AvatarFallback className="bg-gray-800 text-white">
          {fallback}
        </AvatarFallback>
      </Avatar>

      
      {/* Verified badge */}
      {verified && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full 
                     bg-gradient-to-tr from-yellow-400 to-purple-500
                     flex items-center justify-center animate-pulse shadow-md"
        >
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default AvatarCosmic;