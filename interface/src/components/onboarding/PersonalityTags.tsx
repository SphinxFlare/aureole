// src/componenets/onboarding/PersonalityTags


import { useState } from 'react';
import {
  Sparkles,
  Mountain,
  Palette,
  Music,
  Plane,
  Dumbbell,
  BookOpen,
  ChefHat,
  Camera,
  Gamepad2,
  Leaf,
  Clapperboard,
  Coffee,
  CircleDot,
  Cpu
} from 'lucide-react';

interface PersonalityTagsProps {
  selected: string[];
  onUpdate: (interests: string[]) => void;
}

const interestIcons: Record<string, any> = {
  adventure: Mountain,
  art: Palette,
  music: Music,
  travel: Plane,
  fitness: Dumbbell,
  reading: BookOpen,
  cooking: ChefHat,
  photography: Camera,
  gaming: Gamepad2,
  nature: Leaf,
  movies: Clapperboard,
  coffee: Coffee,
  yoga: CircleDot,
  dancing: Sparkles,
  tech: Cpu,
};

const baseInterests = [
  { id: 'adventure', label: 'Adventure', constellation: 'Orion' },
  { id: 'art', label: 'Art', constellation: 'Lyra' },
  { id: 'music', label: 'Music', constellation: 'Cygnus' },
  { id: 'travel', label: 'Travel', constellation: 'Phoenix' },
  { id: 'fitness', label: 'Fitness', constellation: 'Hercules' },
  { id: 'reading', label: 'Reading', constellation: 'Libra' },
  { id: 'cooking', label: 'Cooking', constellation: 'Crater' },
  { id: 'photography', label: 'Photography', constellation: 'Triangulum' },
  { id: 'gaming', label: 'Gaming', constellation: 'Draco' },
  { id: 'nature', label: 'Nature', constellation: 'Ursa' },
  { id: 'movies', label: 'Movies', constellation: 'Cassiopeia' },
  { id: 'coffee', label: 'Coffee', constellation: 'Corona' },
  { id: 'yoga', label: 'Yoga', constellation: 'Aquarius' },
  { id: 'dancing', label: 'Dancing', constellation: 'Pisces' },
  { id: 'tech', label: 'Technology', constellation: 'Andromeda' },
];

const PersonalityTags = ({ selected, onUpdate }: PersonalityTagsProps) => {
  const [customInterest, setCustomInterest] = useState('');
  const [customInterests, setCustomInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      onUpdate(selected.filter(i => i !== id));
    } else {
      onUpdate([...selected, id]);
    }
  };

  const addCustomInterest = () => {
    if (!customInterest.trim()) return;
    const id = customInterest.toLowerCase().replace(/\s+/g, '-');

    if (selected.includes(id)) return;

    setCustomInterests([...customInterests, customInterest]);
    onUpdate([...selected, id]);

    setCustomInterest('');
  };

  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-center mb-3 text-foreground">
        Select Your Cosmic Interests
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Choose at least 3 constellations that resonate with your soul
      </p>

      {/* Interest grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...baseInterests, ...customInterests.map(i => ({
          id: i.toLowerCase().replace(/\s+/g, '-'),
          label: i,
          constellation: "Custom"
        }))].map((interest, index) => {
          const isSelected = selected.includes(interest.id);
          const Icon =
            interestIcons[interest.id] || Sparkles;

          return (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`
                relative group p-4 rounded-2xl transition-all duration-300
                ${isSelected 
                  ? 'glass-card ring-2 ring-primary cosmic-glow' 
                  : 'glass-card hover:scale-105'
                }
              `}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  relative w-12 h-12 flex items-center justify-center
                  ${isSelected ? 'animate-twinkle' : ''}
                `}>
                  <Icon className={`
                    w-6 h-6 transition-colors
                    ${isSelected ? 'text-primary' : 'text-muted-foreground'}
                  `} />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  )}
                </div>

                <div className="text-center">
                  <p className={`
                    font-semibold text-sm
                    ${isSelected ? 'text-primary' : 'text-foreground'}
                  `}>
                    {interest.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interest.constellation}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                    <span className="text-xs text-primary-foreground font-bold">
                      {selected.indexOf(interest.id) + 1}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom interest bar */}
      <div className="mt-8">
        <div className="glass-card p-3 rounded-xl flex gap-3 items-center border border-white/10 focus-within:border-primary/50 transition-all">
          <input
            value={customInterest}
            onChange={e => setCustomInterest(e.target.value)}
            className="bg-transparent outline-none text-white flex-1"
            placeholder="✨ Add your own cosmic interest..."
          />
          <button
            onClick={addCustomInterest}
            className="px-4 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected count */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Selected: <span className="text-primary font-bold">{selected.length}</span> / 15
        </p>
      </div>
    </div>
  );
};

export default PersonalityTags;