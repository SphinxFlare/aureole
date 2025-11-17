// src/components/onboarding/PersonalityForm.tsx


import React, { useState } from "react";

// Step components
import PersonalityStepBio from "./PersonalityStepBio";
import PersonalityStepPreference from "./PersonalityStepPreference";
import PersonalityStepRelationship from "./PersonalityStepRelationship";
import PersonalityStepLookingFor from "./PersonalityStepLookingFor";
import PersonalityStepDealbreakers from "./PersonalityStepDealbreakers";
import OnboardingSuccess from "./OnboardingSuccess";

interface Props {
  data: any;
  updateData: (updates: Partial<any>) => void;
  onComplete: () => void; // 👈 ADDED
}

const TOTAL_STEPS = 5;

const PersonalityForm: React.FC<Props> = ({ data, updateData, onComplete }) => {
  const [step, setStep] = useState(1);
  const [finished, setFinished] = useState(false);

  const next = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    // 🎉 All 5 internal steps complete
    setFinished(true);

    // ⏳ After success animation → tell parent to move to Selfie Verification
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const back = () => {
    if (finished) return;
    if (step > 1) setStep(step - 1);
  };

  // Success screen overlays the whole form
  if (finished) return <OnboardingSuccess />;

  return (
    <div className="space-y-8 animate-slide-up page-with-bottom-bar">

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-semibold text-cosmic">Complete Your Profile 🌌</h2>
        <p className="text-muted-foreground">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* STEP CONTENT */}
      <div className="min-h-[420px]">
        {step === 1 && <PersonalityStepBio data={data} updateData={updateData} />}
        {step === 2 && <PersonalityStepPreference data={data} updateData={updateData} />}
        {step === 3 && <PersonalityStepRelationship data={data} updateData={updateData} />}
        {step === 4 && <PersonalityStepLookingFor data={data} updateData={updateData} />}
        {step === 5 && <PersonalityStepDealbreakers data={data} updateData={updateData} />}
      </div>

      {/* CONTROLS */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">

        {step > 1 ? (
          <button
            onClick={back}
            className="px-6 py-2 rounded-xl glass-card text-white hover:bg-white/10 transition-all"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={next}
          className="
            px-8 py-2 rounded-xl
            bg-primary text-primary-foreground
            ripple-btn shadow-lg shadow-primary/30
            hover:opacity-90 transition-all
          "
        >
          {step === TOTAL_STEPS ? "Finish" : "Continue"}
        </button>

      </div>
    </div>
  );
};

export default PersonalityForm;
