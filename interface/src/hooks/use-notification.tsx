// src/hooks/use-notification.tsx


// src/hooks/use-notification.tsx
import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "sonner";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { PersistentNotificationService } from "@/services/notificationService";
import { notificationReceived } from "@/redux/slices/notificationSlice";

interface NotificationContextType {
  sendTest?: (type: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const userId = useSelector((s: RootState) => s.auth.user?.id);
  const dispatch = useDispatch();

  const makeId = () =>
    crypto.randomUUID?.() || `nid-${Date.now()}`;

  const showToast = (type: string, message: string) => {
    const Icon =
      type === "match" ? Heart :
      type === "message" ? MessageCircle :
      Eye;

    toast(message, {
      icon: <Icon className="w-5 h-5 text-primary" />,
      duration: 3000,
    });
  };

  useEffect(() => {
    if (!userId) return;

    const service = PersistentNotificationService.getInstance(userId);
    service.connect();

    service.onNotification((event) => {
      if (event.event !== "notification" || !event.data) return;

      const backend = event.data.type?.toLowerCase();

      const mapped =
        backend === "match" ? "match" :
        backend === "message" ? "message" :
        backend === "like" ? "like" :
        backend === "system" ? "system" :
        "visit";

      const payload = {
        id: makeId(),
        type: mapped as any,
        title: event.data.title || mapped.toUpperCase(),
        message: event.data.meta?.note || event.data.message || "You have a notification",
        timestamp: new Date().toISOString(),
        read: false,
        meta: event.data.meta || {},
      };

      dispatch(notificationReceived(payload));
      showToast(mapped, payload.message);
    });

  }, [userId]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
};
