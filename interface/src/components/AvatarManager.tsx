// src/components/AvatarManager.tsx
import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setUserAvatar } from "@/redux/slices/userSlice";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface MediaItem {
  id: string;
  file_path: string;
  media_type: string;
}

interface Props {
  media: MediaItem[];
  currentAvatar?: string;
}

export default function AvatarManager({ media, currentAvatar }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  if (!media || media.length === 0) {
    return <div className="text-sm text-muted-foreground">No photos yet</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {media.map((m) => {
        const isSelected = currentAvatar && currentAvatar === m.file_path;
        return (
          <div key={m.id} className="relative rounded-lg overflow-hidden border border-white/6">
            <img src={m.file_path} className="w-full h-24 object-cover" />
            <div className="p-2 flex items-center justify-between">
              <Button size="sm" onClick={() => dispatch(setUserAvatar(m.id))}>
                Set
              </Button>
              {isSelected ? (
                <div className="text-green-400 flex items-center gap-1 text-xs">
                  <CheckCircle className="w-4 h-4" /> Selected
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}