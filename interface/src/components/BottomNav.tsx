// src/components/BottomNav.tsx


import { Compass, Heart, Bell, User, Power } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { clearAuth } from "@/redux/slices/authSlice";
import { logoutAll } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const unread = useSelector((s: RootState) => s.notifications.unread);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = useSelector((s: RootState) => s.auth.token);

  const handleLogout = async () => {
    try {
      await logoutAll(token);
    } catch (err) {
      console.warn("logout error", err);
    }

    dispatch(clearAuth());
    toast({
      title: "Logged out",
      description: "Session cleared.",
    });
    navigate("/auth");
  };

  const navItems = [
    { to: "/discovery", icon: Compass, label: "Discovery", type: "nav" },
    { to: "/matches", icon: Heart, label: "Matches", type: "nav" },
    { to: "/notification", icon: Bell, label: "Alerts", type: "nav" },
    { to: "/profile", icon: User, label: "Profile", type: "nav" },

    // 🚀 NEW: Logout
    { icon: Power, label: "Logout", type: "action", onClick: handleLogout },
  ];

  return (
    <nav className="fixed bottom-20 left-0 right-0 z-50 pb-safe select-none">
      <div
        className="
          relative mx-auto max-w-lg 
          backdrop-blur-xl bg-black/30 
          border-t border-white/10
          h-20 rounded-t-3xl overflow-hidden
        "
      >

        <div
          className="
            absolute top-0 left-0 h-[2px] w-full opacity-40
            bg-gradient-to-r from-transparent via-cyan-300 to-transparent
            animate-[galaxySlide_5s_linear_infinite]
          "
        />

        <div className="flex justify-between items-center h-full px-7">
          {navItems.map((item, i) => {
            const isAction = item.type === "action";
            const isAlerts = item.label === "Alerts";
            const badge = isAlerts ? unread : 0;

            return isAction ? (
              // ACTION BUTTON (Logout)
              <button
                key={i}
                onClick={item.onClick}
                onMouseEnter={() => setHoverLabel(item.label)}
                onMouseLeave={() => setHoverLabel(null)}
                className="relative flex flex-col items-center justify-center group"
              >
                <div className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 ease-out">
                  <item.icon
                    className="
                      w-7 h-7 text-red-400 
                      group-hover:text-red-300 
                      transition-all duration-300
                    "
                  />
                </div>

                {hoverLabel === item.label && (
                  <div
                    className="
                      absolute bottom-[-26px] text-xs font-semibold
                      text-red-300 opacity-100 translate-y-0
                      transition-all duration-300
                    "
                  >
                    Logout
                  </div>
                )}
              </button>
            ) : (
              // NORMAL NAV LINK
              <NavLink
                key={item.to}
                to={item.to!}
                className="relative flex flex-col items-center justify-center group"
                activeClassName="text-cyan-300"
                onMouseEnter={() => setHoverLabel(item.label)}
                onMouseLeave={() => setHoverLabel(null)}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "relative flex items-center justify-center w-12 h-12",
                        "transition-all duration-300 ease-out",
                        isActive &&
                          "scale-125 drop-shadow-[0_0_12px_rgba(0,255,255,0.8)]"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-7 h-7 transition-all duration-300",
                          "text-gray-300 group-hover:text-white",
                          isActive && "text-cyan-300"
                        )}
                      />

                      {badge > 0 && (
                        <div
                          className="
                            absolute -top-1 -right-1 
                            min-w-[16px] h-[16px] px-[3px]
                            text-[10px] font-bold
                            flex items-center justify-center
                            rounded-full bg-pink-500 text-white
                            animate-pingSlow
                          "
                        >
                          {badge > 9 ? "9+" : badge}
                        </div>
                      )}
                    </div>

                    {isActive || hoverLabel === item.label ? (
                      <div
                        className="
                          absolute bottom-[-26px] text-xs font-semibold
                          text-cyan-200
                          opacity-100 translate-y-0
                          transition-all duration-300
                        "
                      >
                        {item.label}
                      </div>
                    ) : (
                      <div
                        className="
                          absolute bottom-[-22px] text-xs opacity-0
                          translate-y-2 transition-all duration-300
                        "
                      >
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes galaxySlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pingSlow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;