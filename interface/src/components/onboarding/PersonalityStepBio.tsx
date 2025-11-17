// src/components/onboarding/PersonalityStepBio.tsx


import { useState } from "react";
import { Sparkles, PenLine } from "lucide-react";

interface StepProps {
  data: { bio: string };
  updateData: (updates: Partial<any>) => void;
}

const PRESET_BIOS = [
  { id: "kind-soul", label: "Kind, calm, and curious" },
  { id: "adventure", label: "Adventurous & loves new experiences" },
  { id: "romantic", label: "Hopeless romantic with a soft heart" },
  { id: "ambitious", label: "Driven & constantly growing" },
  { id: "funny", label: "Funny & easygoing" },
];

const PersonalityStepBio = ({ data, updateData }: StepProps) => {
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");

  const selectBio = (value: string) => {
    updateData({ bio: value });
  };

  const addCustom = () => {
    if (!input.trim()) return;
    setCustomItems([...customItems, input.trim()]);
    updateData({ bio: input.trim() });
    setInput("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">

      <h2 className="text-2xl font-bold text-center text-foreground">
        Describe Yourself
      </h2>
      <p className="text-muted-foreground text-center mb-3">
        Choose the line that fits you best — or create your own
      </p>

      {/* PRESET BIOS */}
      <div className="grid grid-cols-1 gap-4">
        {PRESET_BIOS.map((b, i) => (
          <button
            key={b.id}
            onClick={() => selectBio(b.label)}
            className={`p-4 rounded-xl glass-card text-left transition-all ${
              data.bio === b.label ? "ring-2 ring-primary cosmic-glow" : ""
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <p className="font-medium">{b.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* CUSTOM SECTION */}
      {customItems.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-cyan-300 font-medium">
            ✨ Your Custom Constellations
          </p>

          <div className="grid grid-cols-1 gap-4">
            {customItems.map((c, i) => (
              <button
                key={i}
                onClick={() => selectBio(c)}
                className={`p-4 rounded-xl glass-card text-left transition-all ${
                  data.bio === c ? "ring-2 ring-primary cosmic-glow" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <PenLine className="w-5 h-5 text-cyan-400" />
                  <p className="font-medium">{c}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOM ADD BOX */}
      <button
        onClick={() => setShowModal(true)}
        className="p-4 rounded-xl glass-card flex items-center justify-center gap-2 hover:scale-105 transition-all"
      >
        <PenLine className="w-5 h-5 text-muted-foreground" />
        <span>Add Custom</span>
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl w-[90%] max-w-md space-y-4">
            <h3 className="text-lg font-semibold">New Custom Bio</h3>
            <input
              className="glass-input p-2 w-full rounded-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a short line about yourself"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
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

export default PersonalityStepBio;