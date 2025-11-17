// src/components/onboarding/PersonalityStepPreference.tsx


import { useState } from "react";
import { Heart, HeartHandshake, Sparkles, Wand2 } from "lucide-react";

interface StepProps {
  data: { preference: string };
  updateData: (updates: Partial<any>) => void;
}

const PRESET_PREF = [
  { id: "men", label: "Men", icon: Heart },
  { id: "women", label: "Women", icon: Heart },
  { id: "everyone", label: "Everyone", icon: HeartHandshake },
  { id: "lgbtq", label: "LGBTQ+", icon: Sparkles },
];

const PersonalityStepPreference = ({ data, updateData }: StepProps) => {
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");

  const selectPref = (value: string) => updateData({ preference: value });

  const addCustom = () => {
    if (!input.trim()) return;
    setCustomItems([...customItems, input.trim()]);
    updateData({ preference: input.trim() });
    setInput("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">

      <h2 className="text-2xl font-bold text-center">Who Are You Into?</h2>
      <p className="text-muted-foreground text-center mb-4">
        Choose who you feel attracted to
      </p>

      {/* PRESET */}
      <div className="grid grid-cols-2 gap-4">
        {PRESET_PREF.map((p, i) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => selectPref(p.label)}
              className={`p-4 rounded-2xl glass-card text-center transition-all ${
                data.preference === p.label ? "ring-2 ring-primary cosmic-glow" : ""
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Icon className="w-6 h-6 text-cyan-300 mx-auto mb-2" />
              <p className="font-semibold">{p.label}</p>
            </button>
          );
        })}
      </div>

      {/* CUSTOM SECTION */}
      {customItems.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-cyan-300 font-medium">
            ✨ Your Custom Constellations
          </p>

          <div className="grid grid-cols-2 gap-4">
            {customItems.map((c, i) => (
              <button
                key={i}
                onClick={() => selectPref(c)}
                className={`p-4 rounded-2xl glass-card text-center transition-all ${
                  data.preference === c ? "ring-2 ring-primary cosmic-glow" : ""
                }`}
              >
                <Wand2 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="font-semibold">{c}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom */}
      <button
        onClick={() => setShowModal(true)}
        className="p-4 glass-card rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
      >
        <Wand2 className="w-5 h-5 text-muted-foreground" />
        <span>Add Custom</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl w-[90%] max-w-md space-y-4">

            <h3 className="text-lg font-semibold">Add Custom Preference</h3>

            <input
              className="glass-input p-2 w-full rounded-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Who are you attracted to?"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-white/10">
                Cancel
              </button>
              <button onClick={addCustom} className="px-4 py-2 bg-primary rounded-lg text-primary-foreground">
                Add
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PersonalityStepPreference;