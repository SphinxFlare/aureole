// src/pages/SelfieVerification.tsx


import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CosmicBackground from "@/components/CosmicBackground";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { uploadVerification } from "@/redux/slices/profileSlice";
import { RootState, AppDispatch } from "@/redux/store";

interface SelfieVerificationProps {
  onVerified?: () => void;
}

const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
};

const SelfieVerification = ({ onVerified }: SelfieVerificationProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const profileState = useSelector((s: RootState) => s.profile);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(true);
  };

  const retake = () => setCaptured(false);

  const verify = async () => {
    if (!canvasRef.current) return;
    setLoadingLocal(true);

    try {
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
      const blob = dataURLtoBlob(dataUrl);

      const result = await dispatch(
        uploadVerification({ file: blob, filename: "selfie.jpg" })
      ).unwrap();

      if (stream) stream.getTracks().forEach((t) => t.stop());

      toast({
        title: "Photo uploaded",
        description: result.is_verified
          ? "Photo verified successfully"
          : "Verification submitted",
      });

      onVerified?.();
      navigate("/onboarding", { state: { showAiConfetti: true } });
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err?.detail || err?.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <CosmicBackground />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-cosmic mb-4 text-center">
          Face Verification
        </h1>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Align your face within the hologram circle to continue
        </p>

        {/* HOLOGRAM SCANNER FRAME */}
        <div className="relative w-[320px] h-[320px] mb-8">
          {/* Circular Mask Container */}
          <div className="absolute inset-0 rounded-full overflow-hidden border border-cyan-400/20 shadow-[0_0_40px_#0ae2ff55]">
            {/* LIVE VIDEO */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${captured ? "hidden" : "block"}`}
            />

            {/* CAPTURED IMAGE */}
            <canvas
              ref={canvasRef}
              className={`w-full h-full object-cover ${captured ? "block" : "hidden"}`}
            />
          </div>

          {/* OUTER ORBIT RING */}
          <div className="absolute inset-0 rounded-full border border-cyan-300/20 animate-orbit opacity-70"></div>

          {/* INNER CYAN GLOW RING */}
          <div className="absolute inset-6 rounded-full border border-cyan-300/40 animate-softpulse shadow-[0_0_25px_#0ae2ff55]"></div>

          {/* SCAN GRID */}
          {!captured && (
            <div className="absolute inset-0 mask-grid pointer-events-none opacity-40"></div>
          )}

          {/* RADIAL SCAN SWEEP */}
          {!captured && (
            <div className="absolute inset-0 animate-scansweep rounded-full pointer-events-none"></div>
          )}

          {/* SPARKLES */}
          <div className="absolute inset-0 pointer-events-none animate-sparkles"></div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 w-full max-w-md">
          {!captured ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/auth")}
              >
                Back
              </Button>
              <Button
                className="flex-1 cosmic-glow"
                onClick={capturePhoto}
                disabled={!stream}
              >
                Capture
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={retake}
                disabled={loadingLocal}
              >
                Retake
              </Button>
              <Button
                className="flex-1 cosmic-glow"
                onClick={verify}
                disabled={loadingLocal}
              >
                {loadingLocal ? "Uploading…" : "Verify & Continue"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* INLINE ANIMATIONS */}
      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-orbit { animation: orbit 8s linear infinite; }

        @keyframes softpulse {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        .animate-softpulse { animation: softpulse 3s ease-in-out infinite; }

        @keyframes scansweep {
          0% { opacity: 0; transform: rotate(0deg); }
          20% { opacity: 0.6; }
          100% { opacity: 0; transform: rotate(360deg); }
        }
        .animate-scansweep {
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(0, 200, 255, 0.3) 60deg,
            transparent 120deg
          );
          animation: scansweep 4s linear infinite;
        }

        .mask-grid {
          background-image: 
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @keyframes sparkles {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-sparkles {
          background-image: radial-gradient(circle at 15% 20%, #0ae2ff55 2px, transparent 2px),
                            radial-gradient(circle at 70% 80%, #0ae2ff55 2px, transparent 2px),
                            radial-gradient(circle at 40% 60%, #0ae2ff55 2px, transparent 2px);
          animation: sparkles 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SelfieVerification;

// import { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import CosmicBackground from '@/components/CosmicBackground';
// import { getAuth, saveAuth } from '@/utils/auth';
// import { useToast } from '@/hooks/use-toast';

// const SelfieVerification = () => {
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [captured, setCaptured] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   useEffect(() => {
//     const { token } = getAuth();
//     if (!token) {
//       navigate('/auth');
//       return;
//     }

//     startCamera();
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   const startCamera = async () => {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({ 
//         video: { facingMode: 'user' },
//         audio: false 
//       });
//       setStream(mediaStream);
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//     } catch (error) {
//       toast({
//         title: "Camera access denied",
//         description: "Please allow camera access to verify your identity",
//         variant: "destructive",
//       });
//     }
//   };

//   const capturePhoto = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
    
//     const ctx = canvas.getContext('2d');
//     if (ctx) {
//       ctx.drawImage(video, 0, 0);
//       setCaptured(true);
//     }
//   };

//   const retake = () => {
//     setCaptured(false);
//   };

//   const verify = async () => {
//     setLoading(true);
    
//     // Simulate verification delay
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     const { user, token } = getAuth();
//     if (user && token) {
//       const selfieUrl = canvasRef.current?.toDataURL();
//       const updatedUser = { ...user, verified: true, selfieUrl };
//       saveAuth(token, updatedUser);
//     }

//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//     }

//     toast({
//       title: "Verification successful! ✨",
//       description: "Welcome to Aureole",
//     });

//     navigate('/onboarding');
//   };

//   return (
//     <div className="min-h-screen relative flex items-center justify-center p-4">
//       <CosmicBackground />
      
//       <div className="relative z-10 w-full max-w-2xl">
//         <div className="glass-card p-8 rounded-2xl border border-white/10">
//           {/* Header */}
//           <div className="text-center mb-6">
//             <h1 className="text-3xl font-bold text-cosmic mb-2">Let's make sure you're really you 🌟</h1>
//             <p className="text-muted-foreground">Take a live selfie to verify your identity</p>
//           </div>

//           {/* Camera View */}
//           <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-black/50">
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               muted
//               className={`w-full h-full object-cover ${captured ? 'hidden' : 'block'}`}
//             />
//             <canvas
//               ref={canvasRef}
//               className={`w-full h-full object-cover ${captured ? 'block' : 'hidden'}`}
//             />
            
//             {/* Starfield Overlay */}
//             <div className="absolute inset-0 pointer-events-none">
//               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
//               {[...Array(20)].map((_, i) => (
//                 <div
//                   key={i}
//                   className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
//                   style={{
//                     left: `${Math.random() * 100}%`,
//                     top: `${Math.random() * 100}%`,
//                     animationDelay: `${Math.random() * 3}s`,
//                     opacity: Math.random() * 0.7 + 0.3,
//                   }}
//                 />
//               ))}
//             </div>

//             {/* Guide Frame */}
//             {!captured && (
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <div className="w-64 h-64 border-2 border-primary/50 rounded-full"></div>
//               </div>
//             )}
//           </div>

//           {/* Instructions */}
//           {!captured && (
//             <div className="text-center mb-6 space-y-2">
//               <p className="text-sm text-muted-foreground">• Center your face in the circle</p>
//               <p className="text-sm text-muted-foreground">• Make sure you're well-lit</p>
//               <p className="text-sm text-muted-foreground">• Look directly at the camera</p>
//             </div>
//           )}

//           {/* Actions */}
//           <div className="flex gap-3">
//             {!captured ? (
//               <>
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => navigate('/auth')}
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   className="flex-1 cosmic-glow"
//                   onClick={capturePhoto}
//                   disabled={!stream}
//                 >
//                   Capture Photo
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   onClick={retake}
//                   disabled={loading}
//                 >
//                   Retake
//                 </Button>
//                 <Button
//                   className="flex-1 cosmic-glow"
//                   onClick={verify}
//                   disabled={loading}
//                 >
//                   {loading ? 'Verifying...' : 'Verify & Continue'}
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SelfieVerification;
