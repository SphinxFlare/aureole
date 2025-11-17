// // src/components/NeonWrapper.tsx
// import React from "react";

// interface NeonWrapperProps {
//   children: React.ReactNode;
//   className?: string;
//   radius?: string; // e.g. "1rem"
// }

// export default function NeonWrapper({ children, className = "", radius = "1rem" }: NeonWrapperProps) {
//   return (
//     <div
//       className={`relative rounded-2xl ${className}`}
//       style={{
//         borderRadius: radius,
//       }}
//     >
//       <div
//         aria-hidden
//         className="absolute inset-0 rounded-2xl pointer-events-none"
//         style={{
//           padding: 2,
//           background: `linear-gradient(90deg, rgba(63,94,251,0.18), rgba(0,212,255,0.12))`,
//           WebkitMask:
//             "linear-gradient(#fff 0 0) padding-box, linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2)) border-box",
//           boxShadow: "0 8px 30px rgba(0,140,255,0.06), 0 2px 8px rgba(0,0,0,0.6)",
//         }}
//       />
//       {/* inner content area */}
//       <div
//         className="relative rounded-2xl overflow-hidden"
//         style={{
//           borderRadius: radius,
//           background: "linear-gradient(180deg, rgba(10,15,25,0.75), rgba(6,10,15,0.6))",
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }
