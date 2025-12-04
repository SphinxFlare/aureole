// src/services/chatManager.ts


import { PersistentChatService } from "./chatService";

export let chatService: PersistentChatService | null = null;

export function initChatService(userId: string) {
  chatService = new PersistentChatService(userId);
  chatService.connect();
}

export function stopChatService() {
  if (chatService) {
    chatService.disconnect();   // <-- closes WebSocket correctly
    chatService = null;
  }
}