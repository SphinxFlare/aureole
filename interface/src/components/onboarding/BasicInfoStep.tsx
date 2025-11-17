// src/components/onboarding/BasicInfoStep.tsx

import { Calendar, User, PencilLine } from "lucide-react";

interface BasicInfoProps {
  data: {
    full_name: string;
    dob: string;     // YYYY-MM-DD
    about: string;
    age: number | ""; // derived
  };
  updateData: (updates: Partial<any>) => void;
}

const BasicInfoStep = ({ data, updateData }: BasicInfoProps) => {
  
  // Auto-convert DOB → age (backend requires numeric age)
  const handleDOB = (dob: string) => {
    if (!dob) {
      updateData({ dob, age: "" });
      return;
    }

    const birth = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    updateData({ dob, age });
  };

  return (
    <div className="animate-slide-up space-y-8">
      <h2 className="text-2xl font-bold text-center text-foreground">
        Tell Us About You 🌙
      </h2>

      {/* FULL NAME */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-300" />
          Full Name
        </label>

        <input
          type="text"
          placeholder="Your full name"
          value={data.full_name}
          onChange={(e) => updateData({ full_name: e.target.value })}
          className="
            w-full glass-input rounded-xl px-4 py-3
            text-white
            bg-white/5 border border-white/10
            focus:border-cyan-400/60 focus:ring-0
          "
        />
      </div>

      {/* DATE OF BIRTH → auto age */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-300" />
          Date of Birth
        </label>

        <input
          type="date"
          value={data.dob || ""}
          onChange={(e) => handleDOB(e.target.value)}
          className="
            w-full glass-input rounded-xl px-4 py-3
            text-white
            bg-white/5 border border-white/10
            focus:border-cyan-400/60 focus:ring-0
          "
        />

        {/* AGE PREVIEW */}
        {data.age !== "" && (
          <p className="text-xs text-cyan-300 mt-1">
            Age: <span className="font-semibold">{data.age}</span>
          </p>
        )}
      </div>

      {/* ABOUT YOU */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground flex items-center gap-2">
          <PencilLine className="w-4 h-4 text-cyan-300" />
          About You
        </label>

        <textarea
          value={data.about}
          onChange={(e) => updateData({ about: e.target.value })}
          placeholder="Describe yourself in a few lines..."
          className="
            w-full glass-input rounded-xl px-4 py-3
            min-h-[90px] text-white
            bg-white/5 border border-white/10
            focus:border-cyan-400/60 focus:ring-0
          "
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;