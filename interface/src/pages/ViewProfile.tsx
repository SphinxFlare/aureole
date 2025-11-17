// src/pages/ViewProfile.tsx


import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, PawPrint, MapPin } from "lucide-react";

interface RecommendedProfileData {
  id: string;
  full_name: string;
  age: number;
  gender?: string;
  bio?: string;
  preference?: string;
  relationship_status?: string;
  distance_km?: number;
  is_verified: boolean;
  verified_photo_path?: string;
  profile_photo: string;
  last_active: string;
  created_at: string;
}

const ViewProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<RecommendedProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // ALWAYS LOAD DUMMY DATA (NO ID REQUIRED)
  useEffect(() => {
    const dummy: RecommendedProfileData = {
      id: "dummy",
      full_name: "Nova Stellaris",
      age: 28,
      gender: "Female",
      bio: "Quiet cosmic soul with a playful heart. Loves music, night walks, and deep chats.",
      preference: "Straight",
      relationship_status: "Single",
      distance_km: 12.7,
      is_verified: true,
      profile_photo:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&q=80",
      verified_photo_path: "",
      last_active: new Date().toISOString(),
      created_at: "2022-01-12T00:00:00Z",
    };

    setTimeout(() => {
      setProfile(dummy);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) return <div className="text-white p-6">Loading…</div>;
  if (!profile) return <div className="text-white p-6">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07070a] via-[#0b0e13] to-black text-white relative pb-28">

      {/* HERO SECTION */}
      <div className="relative w-full px-4 pt-6">
        <div className="rounded-[48px] overflow-hidden shadow-2xl relative h-[420px]">

          <img
            src={profile.profile_photo}
            alt={profile.full_name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80"></div>

          <div className="sparkle-layer pointer-events-none"></div>

          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="glass-icon-btn">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {profile.is_verified && (
              <div className="neon-paw">
                <PawPrint className="w-4 h-4 text-cyan-300" />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-6">

        {/* IDENTITY CARD */}
        <div className="glass-section">
          <h1 className="text-3xl font-semibold">
            {profile.full_name}, {profile.age}
          </h1>

          {profile.distance_km && (
            <p className="flex items-center gap-2 text-sm text-gray-300 mt-1">
              <MapPin className="w-4 h-4 text-cyan-300" />
              {profile.distance_km.toFixed(1)} km away
            </p>
          )}

          {profile.bio && (
            <p className="text-gray-200 mt-3 leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* GRID DETAILS */}
        <div className="grid grid-cols-2 gap-4">
          {profile.gender && (
            <div className="glass-tile">
              <p className="text-sm text-gray-300">Gender</p>
              <p className="text-lg font-medium">{profile.gender}</p>
            </div>
          )}

          {profile.preference && (
            <div className="glass-tile">
              <p className="text-sm text-gray-300">Preference</p>
              <p className="text-lg font-medium">{profile.preference}</p>
            </div>
          )}

          {profile.relationship_status && (
            <div className="glass-tile">
              <p className="text-sm text-gray-300">Status</p>
              <p className="text-lg font-medium">
                {profile.relationship_status}
              </p>
            </div>
          )}

          {profile.created_at && (
            <div className="glass-tile">
              <p className="text-sm text-gray-300">Member Since</p>
              <p className="text-lg font-medium">
                {new Date(profile.created_at).getFullYear()}
              </p>
            </div>
          )}
        </div>

        {/* ACTIVITY */}
        <div className="glass-section">
          <h2 className="text-xl font-semibold mb-2">Activity</h2>
          <p className="text-gray-300 text-sm">
            Last active: {new Date(profile.last_active).toLocaleString()}
          </p>
        </div>

      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-5 flex justify-center">
        <div className="glass-action-bar">
          <button className="action-btn pass">✖</button>
          <button className="action-btn super">★</button>
          <button className="action-btn like">❤</button>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;