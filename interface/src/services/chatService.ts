// // src/services/chatService.ts


// import { useEffect, useRef } from "react";

// export type EventMessage =
//   | { type: "message"; message_id: string; sender_id: string; content: string; timestamp: string }
//   | { type: "delivery_receipt"; message_id: string } // NEW: handle delivery notifications
//   | { type: "read_receipt"; message_ids: string[] }
//   | { type: "ai_suggestions"; original_message_id: string; replies: string[]; remaining_today?: number }
//   | { type: "error"; message: string };

// export class PersistentChatService {
//   private ws: WebSocket | null = null;
//   private userId: string;
//   private listeners: ((event: EventMessage) => void)[] = [];
//   private reconnectInterval = 3000;
//   private reconnectTimeout: NodeJS.Timeout | null = null;
//   private isManuallyClosed = false;
//   private isReconnecting = false;

//   constructor(userId: string) {
//     this.userId = userId;
//   }

//   connect() {
//     // prevent duplicate sockets
//     if (this.ws || this.isReconnecting) return;

//     const wsUrl = `ws://127.0.0.1:8000/ws/chat/${this.userId}`;
//     console.log("🔌 Connecting:", wsUrl);
//     this.ws = new WebSocket(wsUrl);
//     this.isManuallyClosed = false;

//     // --- on open ---
//     this.ws.onopen = () => {
//       console.log("✅ WS connected");
//       this.isReconnecting = false;

//       if (this.reconnectTimeout) {
//         clearTimeout(this.reconnectTimeout);
//         this.reconnectTimeout = null;
//       }
//     };

//     // --- on message ---
//     this.ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         this.listeners.forEach((cb) => cb(data));
//       } catch (err) {
//         console.error("❌ Invalid WS payload:", event.data, err);
//       }
//     };

//     // --- on close ---
//     this.ws.onclose = (event) => {
//       console.warn("🔌 WS closed:", event.code, event.reason);
//       this.ws = null;

//       // Auto-reconnect only if not manually closed
//       if (!this.isManuallyClosed) {
//         if (!this.isReconnecting) {
//           this.isReconnecting = true;
//           console.log(`🔄 Reconnecting in ${this.reconnectInterval / 1000}s...`);
//           this.reconnectTimeout = setTimeout(() => {
//             this.reconnectTimeout = null;
//             this.connect();
//           }, this.reconnectInterval);
//         }
//       }
//     };

//     // --- on error ---
//     this.ws.onerror = (err) => {
//       console.error("❌ WS error:", err);
//       // avoid crashing — socket will trigger onclose after
//     };
//   }

//   disconnect() {
//     console.log("👋 Manually closing WS");
//     this.isManuallyClosed = true;
//     this.isReconnecting = false;

//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//       this.reconnectTimeout = null;
//     }

//     if (this.ws) {
//       this.ws.close();
//       this.ws = null;
//     }
//   }

//   onMessage(cb: (event: EventMessage) => void) {
//     this.listeners.push(cb);
//   }

//   private safeSend(payload: any) {
//     if (this.ws?.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify(payload));
//     } else {
//       console.warn("⚠️ Tried to send while WS not open:", payload);
//     }
//   }

//   sendMessage(receiverId: string, content: string) {
//     this.safeSend({ type: "message", receiver_id: receiverId, content });
//   }

//   sendSelectedAIReply(receiverId: string, content: string) {
//     this.safeSend({ type: "ai_selected", receiver_id: receiverId, content });
//   }

//   requestAISuggestions(originalMessageId: string, tone: string = "flirty") {
//     this.safeSend({ type: "ai_request", original_message_id: originalMessageId, tone });
//   }

//   sendReadReceipts(messageIds: string[]) {
//     this.safeSend({ type: "read_receipt", message_ids: messageIds });
//   }

//   isConnected(): boolean {
//     return this.ws?.readyState === WebSocket.OPEN;
//   }
// }

// // React hook (unchanged)
// export function usePersistentChat(userId: string) {
//   const chatRef = useRef<PersistentChatService | null>(null);

//   useEffect(() => {
//     if (!userId) return;
//     const chat = new PersistentChatService(userId);
//     chat.connect();
//     chatRef.current = chat;
//     return () => chat.disconnect();
//   }, [userId]);

//   return chatRef.current;
// }

// -----------------------------
// src/services/chatService.ts
// -----------------------------


export type EventMessage =
  | { type: "message"; message_id: string; sender_id: string; receiver_id?: string; content: string; timestamp?: string }
  | { type: "delivery_receipt"; message_id: string }
  | { type: "read_receipt"; message_ids: string[] }
  | { type: "ai_suggestions"; original_message_id: string; replies: string[]; remaining_today?: number }
  | { type: "error"; message: string };

export class PersistentChatService {
  private ws: WebSocket | null = null;
  private userId: string;
  private listeners: ((event: EventMessage) => void)[] = [];
  private reconnectInterval = 3000;
  private reconnectTimer: number | null = null;
  private isManuallyClosed = false;
  private host: string;

  constructor(userId: string, options?: { host?: string; reconnectIntervalMs?: number }) {
    this.userId = userId;
    this.host = options?.host || "ws://127.0.0.1:8000"; // default ws://host or wss://host
    if (options?.reconnectIntervalMs) this.reconnectInterval = options.reconnectIntervalMs;
  }

  connect() {
    if (!this.userId) return;
    if (this.ws) return; // already connected

    const url = `${this.host.replace(/^http/, "ws")}/ws/chat/${encodeURIComponent(this.userId)}`;
    console.log("🔌 Connecting WS to", url);

    this.isManuallyClosed = false;
    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      console.error("Failed to construct WebSocket:", err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log("✅ WS open");
      if (this.reconnectTimer) { window.clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    };

    this.ws.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data);

        // Basic validation -> ensure type exists
        if (!parsed || typeof parsed.type !== "string") {
          throw new Error("missing_type");
        }

        // For message type ensure required fields exist
        if (parsed.type === "message") {
          if (!parsed.message_id || !parsed.sender_id || !parsed.content) {
            throw new Error("invalid_message_shape");
          }
          // Cast to EventMessage safely
          this.listeners.forEach((cb) => cb(parsed as EventMessage));
          return;
        }

        // For read/delivery ensure payload shapes
        if (parsed.type === "delivery_receipt" && !parsed.message_id) throw new Error("invalid_delivery_shape");
        if (parsed.type === "read_receipt" && !Array.isArray(parsed.message_ids)) throw new Error("invalid_read_shape");

        // pass through other types
        this.listeners.forEach((cb) => cb(parsed as EventMessage));
      } catch (err) {
        console.error("Invalid WS payload", ev.data, err);
        // Inform listeners about the error so that UI/reducers can decide what to do
        this.listeners.forEach((cb) => cb({ type: "error", message: "invalid_payload" }));
      }
    };

    this.ws.onclose = (ev) => {
      console.warn("🔌 WS closed", ev.code, ev.reason);
      this.ws = null;
      if (!this.isManuallyClosed) this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error("WS error", err);
      // errors trigger close -> reconnect flow
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.isManuallyClosed) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      console.log(`🔄 Reconnecting...`);
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    this.isManuallyClosed = true;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(1000, "client_closing"); } catch (e) { /* ignore */ }
      this.ws = null;
    }
  }

  onMessage(cb: (event: EventMessage) => void) {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(x => x !== cb); };
  }

  private safeSend(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
      } catch (err) {
        console.warn("WS send failed:", err, payload);
      }
    } else {
      console.warn("WS not open, cannot send:", payload);
    }
  }

  sendMessage(receiverId: string, content: string) {
    this.safeSend({ type: "message", receiver_id: receiverId, content });
  }

  sendSelectedAIReply(receiverId: string, content: string) {
    this.safeSend({ type: "ai_selected", receiver_id: receiverId, content });
  }

  requestAISuggestions(originalMessageId: string, tone: string = "flirty") {
    this.safeSend({ type: "ai_request", original_message_id: originalMessageId, tone });
  }

  sendReadReceipts(messageIds: string[]) {
    this.safeSend({ type: "read_receipt", message_ids: messageIds });
  }

  isConnected() {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}