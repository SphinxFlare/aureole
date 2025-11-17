// src/components/onboarding/PersonalityStepDealbreakers.tsx


import { useState } from "react";
import { ShieldAlert, Ban, Frown, AlertTriangle, Wand2, X } from "lucide-react";

interface StepProps {
  data: {
    dealbreakers: string[];
  };
  updateData: (updates: Partial<any>) => void;
}

const PRESET_DEALBREAKERS = [
  { id: "dishonesty", label: "Dishonesty", icon: ShieldAlert },
  { id: "smoking", label: "Smoking", icon: Ban },
  { id: "disrespect", label: "Disrespect", icon: Frown },
  { id: "poor-communication", label: "Poor Communication", icon: AlertTriangle },
  { id: "negativity", label: "Negativity", icon: AlertTriangle },
  { id: "no-ambition", label: "No Ambition", icon: Frown },
];

const PersonalityStepDealbreakers = ({ data, updateData }: StepProps) => {
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState("");
  const [showModal, setShowModal] = useState(false);

  const toggle = (value: string) => {
    if (data.dealbreakers.includes(value)) {
      updateData({
        dealbreakers: data.dealbreakers.filter((v) => v !== value),
      });
    } else {
      updateData({
        dealbreakers: [...data.dealbreakers, value],
      });
    }
  };

  const addCustom = () => {
    if (!customValue.trim()) return;

    const val = customValue.trim();

    // Add to local custom list (so it appears!)
    setCustomItems((prev) => [...prev, val]);

    // Also update parent state
    updateData({
      dealbreakers: [...data.dealbreakers, val],
    });

    setCustomValue("");
    setShowModal(false);
  };

  return (
    <div className="animate-slide-up space-y-6">
      <h2 className="text-2xl font-bold text-center text-foreground">
        Dealbreakers
      </h2>
      <p className="text-muted-foreground text-center mb-4">
        Select the things you absolutely cannot tolerate
      </p>

      {/* PRESET CHIPS */}
      <div className="flex flex-wrap gap-3">
        {PRESET_DEALBREAKERS.map((d, i) => {
          const Icon = d.icon;
          const selected = data.dealbreakers.includes(d.label);

          return (
            <button
              key={d.id}
              onClick={() => toggle(d.label)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm border backdrop-blur-md
                ${
                  selected
                    ? "bg-primary/20 border-primary text-primary cosmic-glow"
                    : "border-white/10 text-muted-foreground hover:border-white/30"
                }
              `}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Icon
                className={`w-4 h-4 ${
                  selected ? "text-primary" : "text-muted-foreground"
                }`}
              />
              {d.label}
              {selected && <X className="w-3 h-3 opacity-70 text-primary" />}
            </button>
          );
        })}

        {/* Custom Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-muted-foreground hover:border-white/30 backdrop-blur-md transition-all"
        >
          <Wand2 className="w-4 h-4" />
          Custom
        </button>
      </div>

      {/* CUSTOM SECTION */}
      {customItems.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-cyan-300 font-medium">
            ✨ Your Custom Constellations
          </p>

          <div className="flex flex-wrap gap-3">
            {customItems.map((c, idx) => {
              const selected = data.dealbreakers.includes(c);

              return (
                <button
                  key={idx}
                  onClick={() => toggle(c)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm border backdrop-blur-md
                    ${
                      selected
                        ? "bg-primary/20 border-primary text-primary cosmic-glow"
                        : "border-white/10 text-muted-foreground hover:border-white/30"
                    }
                  `}
                >
                  <Wand2
                    className={`w-4 h-4 ${
                      selected ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {c}
                  {selected && <X className="w-3 h-3 text-primary opacity-80" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CUSTOM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl w-[90%] max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Add Custom Dealbreaker</h3>

            <input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="glass-input w-full p-2 rounded-lg"
              placeholder="Type a dealbreaker…"
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

      <p className="text-center text-sm text-muted-foreground mt-4">
        Selected:{" "}
        <span className="text-primary font-semibold">
          {data.dealbreakers.length}
        </span>
      </p>
    </div>
  );
};

export default PersonalityStepDealbreakers;