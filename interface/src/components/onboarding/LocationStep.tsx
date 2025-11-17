// src/components/onboarding/LocationStep.tsx


// src/components/onboarding/LocationStep.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Crosshair, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onLocationCaptured: (data: {
    latitude: number;
    longitude: number;
    share_location: boolean;
  }) => void;
}

const LocationStep: React.FC<Props> = ({ onLocationCaptured }) => {
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });

  const [shareLocation, setShareLocation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getLocation = async () => {
    setLoading(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation not supported.");
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
        toast.success("Location captured successfully 🌍");
      },
      () => {
        setErrorMsg("Unable to fetch your location.");
        setLoading(false);
        toast.error("Failed to get location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleConfirm = () => {
    if (!location.latitude || !location.longitude) {
      toast.error("Please enable location first.");
      return;
    }

    onLocationCaptured({
      latitude: location.latitude,
      longitude: location.longitude,
      share_location: shareLocation,
    });
  };

  return (
    <div className="flex flex-col items-center space-y-8 animate-fadeIn">
      <h2 className="text-2xl font-semibold text-center text-cosmic">
        Share Your Location 📍
      </h2>
      <p className="text-muted-foreground text-center max-w-sm">
        We use your approximate location to show nearby matches.
      </p>

      {/* RADAR HOLOGRAM CARD */}
      <div className="relative w-[260px] h-[260px] rounded-full mb-4">
        {/* Outer Circle */}
        <div className="absolute inset-0 rounded-full border border-cyan-400/20 shadow-[0_0_40px_#0ae2ff55] backdrop-blur-md overflow-hidden">

          {/* Radar Grid */}
          <div className="absolute inset-0 radar-grid pointer-events-none"></div>

          {/* Sweep Arm */}
          {!loading && !errorMsg && location.latitude && (
            <div className="absolute inset-0 animate-radar-scan pointer-events-none"></div>
          )}

          {/* Pulsing Location Dot */}
          {!loading && !errorMsg && location.latitude && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-5 h-5 rounded-full bg-cyan-300 shadow-[0_0_25px_#0ae2ff] animate-ping"></div>
              <div className="w-3 h-3 rounded-full bg-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          )}

          {/* Noise Overlay */}
          <div className="absolute inset-0 radar-noise pointer-events-none opacity-25"></div>

          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-7 w-7 animate-spin text-cosmic mb-2" />
              <p className="text-sm text-muted-foreground">Fetching location…</p>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <XCircle className="h-7 w-7 text-red-500 mb-2" />
              <p className="text-sm text-red-400 px-3">{errorMsg}</p>
              <Button variant="outline" className="mt-3" onClick={getLocation}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Coordinates */}
      {location.latitude && (
        <div className="text-center text-sm text-cyan-200 space-y-1">
          <p>Latitude: {location.latitude.toFixed(4)}</p>
          <p>Longitude: {location.longitude.toFixed(4)}</p>
        </div>
      )}

      {/* Location Toggle */}
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={shareLocation}
          onChange={() => setShareLocation(!shareLocation)}
          className="h-4 w-4 rounded border border-white/20"
        />
        <span className="text-sm text-muted-foreground">
          Share my location with matches
        </span>
      </label>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <Button variant="outline" onClick={getLocation}>
          <Crosshair className="mr-2 h-4 w-4" /> Retry
        </Button>

        <Button
          onClick={handleConfirm}
          className="cosmic-glow px-8"
          disabled={!location.latitude}
        >
          Confirm
        </Button>
      </div>

      {/* INLINE ANIMATIONS */}
      <style>{`
        /* Radar Grid */
        .radar-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 25px 25px;
        }

        /* Radar Sweep Arm */
        @keyframes radarScan {
          0% { transform: rotate(0deg); opacity: 0.4; }
          50% { opacity: 0.7; }
          100% { transform: rotate(360deg); opacity: 0.4; }
        }
        .animate-radar-scan {
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(0, 200, 255, 0.25) 90deg,
            transparent 150deg
          );
          animation: radarScan 5s linear infinite;
        }

        /* Noise Texture */
        .radar-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='.5'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
        }
      `}</style>
    </div>
  );
};

export default LocationStep;