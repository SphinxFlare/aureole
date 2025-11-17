// src/components/onboarding/PersonalityStepLookingFor.tsx


import { useState } from "react";
import {
  Heart,
  Stars,
  Users,
  Sparkles,
  Wand2,
  HeartHandshake
} from "lucide-react";

interface StepProps {
  data: { looking_for: string };
  updateData: (updates: Partial<any>) => void;
}

const PRESET_LOOKING = [
  { id: "long-term", label: "Long-Term", sub: "Deep Connection", icon: Heart },
  { id: "short-term", label: "Short-Term", sub: "Casual & Fun", icon: Stars },
  { id: "friends", label: "New Friends", sub: "Social Orbit", icon: Users },
  { id: "figuring", label: "Still Figuring It Out", sub: "Undefined Path", icon: Sparkles },
  { id: "open", label: "Open to Anything", sub: "Flow With The Cosmos", icon: HeartHandshake },
];

const PersonalityStepLookingFor = ({ data, updateData }: StepProps) => {
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");

  const selectLF = (value: string) => updateData({ looking_for: value });

  const addCustom = () => {
    if (!input.trim()) return;
    setCustomItems([...customItems, input.trim()]);
    updateData({ looking_for: input.trim() });
    setInput("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">

      <h2 className="text-2xl font-bold text-center">
        What Are You Looking For?
      </h2>
      <p className="text-muted-foreground text-center mb-4">
        Choose what aligns with your heart
      </p>

      {/* PRESET */}
      <div className="grid grid-cols-2 gap-4">
        {PRESET_LOOKING.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => selectLF(opt.label)}
              className={`p-4 rounded-2xl glass-card text-center transition-all ${
                data.looking_for === opt.label ? "ring-2 ring-primary cosmic-glow" : ""
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Icon className="w-6 h-6 text-cyan-300 mx-auto" />
              <p className="font-semibold mt-2">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.sub}</p>
            </button>
          );
        })}
      </div>

      {/* CUSTOM SECTION */}
      {customItems.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-cyan-300 font-medium">✨ Your Custom Constellations</p>

          <div className="grid grid-cols-2 gap-4">
            {customItems.map((c, i) => (
              <button
                key={i}
                onClick={() => selectLF(c)}
                className={`p-4 rounded-2xl glass-card text-center transition-all ${
                  data.looking_for === c
                    ? "ring-2 ring-primary cosmic-glow"
                    : ""
                }`}
              >
                <Wand2 className="w-6 h-6 text-cyan-400 mx-auto" />
                <p className="font-semibold mt-2">{c}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ADD CUSTOM */}
      <button
        onClick={() => setShowModal(true)}
        className="p-4 rounded-2xl glass-card flex items-center justify-center gap-2 hover:scale-105 transition-all"
      >
        <Wand2 className="w-5 h-5 text-muted-foreground" />
        <span>Add Custom</span>
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl w-[90%] max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Custom Intention</h3>

            <input
              className="glass-input p-2 w-full rounded-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your intention…"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={addCustom}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
              >
                Add
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalityStepLookingFor;