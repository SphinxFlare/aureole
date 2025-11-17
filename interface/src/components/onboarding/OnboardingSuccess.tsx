// src/components/onboarding/OnboardingSuccess.tsx



import { Sparkles } from "lucide-react";

const OnboardingSuccess = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">

      {/* Particle Field */}
      <div className="absolute inset-0 animate-cosmicBurst pointer-events-none" />

      {/* Glow Pulse */}
      <div className="absolute w-[300px] h-[300px] bg-cyan-400/40 blur-[120px] rounded-full animate-pulse" />

      <div className="relative z-10 text-center space-y-4">
        <Sparkles className="w-16 h-16 text-cyan-300 animate-float" />
        <h1 className="text-4xl font-bold text-white animate-fadeUp">
          Profile Complete
        </h1>
        <p className="text-lg text-cyan-200 animate-fadeUpSlow">
          You’re ready for cosmic connections ✨
        </p>
      </div>
    </div>
  );
};

export default OnboardingSuccess;