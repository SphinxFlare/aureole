// src/components/onboarding/PersonalityStepRelationship.tsx


import { useState } from "react";
import { Sparkles, HeartCrack, HeartHandshake, Wand2 } from "lucide-react";

interface StepProps {
  data: { relationship_status: string };
  updateData: (updates: Partial<any>) => void;
}

const PRESET_STATUS = [
  { id: "single", label: "Single", icon: Sparkles },
  { id: "taken", label: "Taken", icon: HeartHandshake },
  { id: "its-complicated", label: "It's Complicated", icon: HeartCrack },
];

const PersonalityStepRelationship = ({ data, updateData }: StepProps) => {
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");

  const selectStatus = (value: string) =>
    updateData({ relationship_status: value });

  const addCustom = () => {
    if (!input.trim()) return;
    setCustomItems([...customItems, input.trim()]);
    updateData({ relationship_status: input.trim() });
    setInput("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">

      <h2 className="text-2xl font-bold text-center">Relationship Status</h2>
      <p className="text-muted-foreground text-center mb-4">
        Tell us where you stand
      </p>

      {/* PRESET */}
      <div className="grid grid-cols-2 gap-4">
        {PRESET_STATUS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => selectStatus(s.label)}
              className={`p-4 rounded-2xl glass-card text-center transition-all ${
                data.relationship_status === s.label
                  ? "ring-2 ring-primary cosmic-glow"
                  : ""
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Icon className="w-6 h-6 text-cyan-300 mx-auto mb-2" />
              <p className="font-semibold">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* CUSTOM SECTION */}
      {customItems.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-cyan-300 font-medium">
            ✨ Your Custom Constellations
          </p>

          <div className="grid grid-cols-2 gap-4">
            {customItems.map((c, i) => (
              <button
                key={i}
                onClick={() => selectStatus(c)}
                className={`p-4 rounded-2xl glass-card text-center transition-all ${
                  data.relationship_status === c
                    ? "ring-2 ring-primary cosmic-glow"
                    : ""
                }`}
              >
                <Wand2 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="font-semibold">{c}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOM ADD */}
      <button
        onClick={() => setShowModal(true)}
        className="p-4 glass-card rounded-2xl flex items-center justify-center gap-2 hover:scale-105"
      >
        <Wand2 className="w-5 h-5 text-muted-foreground" />
        <span>Add Custom</span>
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center">
          <div className="glass-card p-6 rounded-2xl w-[90%] max-w-md space-y-4">

            <h3 className="text-lg font-semibold">Custom Relationship Status</h3>

            <input
              className="glass-input p-2 w-full rounded-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your relationship status"
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
                className="px-4 py-2 bg-primary rounded-lg text-primary-foreground"
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

export default PersonalityStepRelationship;