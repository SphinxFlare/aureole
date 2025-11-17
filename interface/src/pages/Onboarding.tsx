// src/pages/Onboarding.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CosmicBackground from "@/components/CosmicBackground";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setupProfile, updateLocation } from "@/services/profileService";

// Components
import GenderSelection from "@/components/onboarding/GenderSelection";
import BasicInfoStep from "@/components/onboarding/BasicInfoStep";
import PersonalityTags from "@/components/onboarding/PersonalityTags";
import PersonalityForm from "@/components/onboarding/PersonalityForm";
import SelfieVerification from "@/pages/SelfieVerification";
import AILoadingScreen from "@/components/onboarding/AILoadingScreen";
import AnimatedAISummary from "@/components/onboarding/AnimatedAISummary";
import LocationStep from "@/components/onboarding/LocationStep";

const STEPS = [
  "Gender Selection",
  "Basic Info",
  "Interests",
  "Personality Details",
  "Selfie Verification",
  "AI Summary",
  "Location",
];

const TOTAL_STEPS = STEPS.length;

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    age: null as number | null,
    gender: "",
    bio: "",
    preference: "",
    relationship_status: "",
    about: "",
    looking_for: "",
    interests: [] as string[],
    dealbreakers: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null,
    share_location: true,
  });

  const updateData = (updates: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const handleNext = async () => {
    // STEP VALIDATION

    if (step === 1 && !formData.gender)
      return toast({ title: "Please select your gender" });

    if (step === 2) {
      if (!formData.dob) return toast({ title: "Please choose your date of birth" });
      if (!formData.about.trim()) return toast({ title: "Tell us a bit about yourself" });

      if (!formData.age || isNaN(formData.age))
        return toast({ title: "Invalid age calculation" });
    }

    if (step === 3 && formData.interests.length < 1)
      return toast({ title: "Select at least one interest" });

    // TRIGGER BACKEND PROFILE SETUP
    if (step === 6) {
      setLoading(true);

      try {
        const response = await setupProfile({
          full_name: formData.full_name,
          age: formData.age,
          gender: formData.gender,
          bio: formData.bio,
          preference: formData.preference,
          relationship_status: formData.relationship_status,
          about: formData.about,
          looking_for: formData.looking_for,
          interests: formData.interests,
          dealbreakers: formData.dealbreakers,
          latitude: formData.latitude,
          longitude: formData.longitude,
          share_location: formData.share_location,
        });

        setAiData(response);
        toast({ title: "Profile AI summary created ✨" });

      } catch {
        toast({ title: "Failed to generate AI summary", variant: "destructive" });
      } finally {
        setLoading(false);
      }

      setStep(step + 1);
      return;
    }

    if (step === 7) {
      navigate("/discovery");
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleLocationCaptured = async (data: {
    latitude: number;
    longitude: number;
    share_location: boolean;
  }) => {
    updateData(data);

    try {
      await updateLocation(data);
      toast({ title: "Location shared successfully 🌍" });
    } catch {
      toast({ title: "Failed to update location", variant: "destructive" });
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen relative">
      <CosmicBackground />

      <div className="relative z-10 container mx-auto px-4 py-10 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold text-cosmic">Create Your Cosmic Profile</h1>
            <span className="text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="glass-card rounded-3xl p-8 mb-6 min-h-[520px] flex flex-col justify-center">

          {step === 1 && (
            <GenderSelection
              selected={formData.gender}
              onSelect={(gender) => updateData({ gender })}
            />
          )}

          {step === 2 && (
            <BasicInfoStep
              data={{
                full_name: formData.full_name,
                dob: formData.dob,
                about: formData.about,
                age: formData.age,
              }}
              updateData={updateData}
            />
          )}

          {step === 3 && (
            <PersonalityTags
              selected={formData.interests}
              onUpdate={(interests) => updateData({ interests })}
            />
          )}

          {step === 4 && (
            <PersonalityForm
              data={formData}
              updateData={updateData}
              onComplete={() => setStep(5)}
            />
          )}

          {step === 5 && (
            <SelfieVerification
              onVerified={() => {
                toast({ title: "Verification completed ✅" });
                setStep(6);
              }}
            />
          )}

          {step === 6 &&
            (loading ? <AILoadingScreen /> : <AnimatedAISummary aiData={aiData} />)}

          {step === 7 && (
            <LocationStep onLocationCaptured={handleLocationCaptured} />
          )}

        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <Button
            onClick={handleNext}
            className="cosmic-glow"
            size="lg"
            disabled={loading}
          >
            {step === TOTAL_STEPS ? "Finish" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;