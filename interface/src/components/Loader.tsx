// src/components/Loader.tsx


import loaderGif from "@/assets/loader.gif";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <img src={loaderGif} alt="loading" className="w-16 h-16" />
    </div>
  );
}
