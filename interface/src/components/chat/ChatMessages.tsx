// src/components/Chat/ChatMessages.tsx

import ChatMessageBubble from "./ChatMessageBubble";
import React from "react";

interface Props {
  messages: any[];
  lastIncoming: any;
  aiSuggestions: string[];
  formatTime: (ts: string) => string;
  reqAI: () => void;
  sendAI: (content: string) => void;
  setZoomedImage: (src: string) => void;
  endRef: React.RefObject<HTMLDivElement>;

  handleDelete: (id: string) => void;
  handleReact: (id: string, rect: DOMRect) => void;

  currentUserId?: string;

  // 🔥 ADD THIS
  isTyping?: boolean;
}

const ChatMessages = ({
  messages,
  lastIncoming,
  aiSuggestions,
  formatTime,
  reqAI,
  sendAI,
  setZoomedImage,
  endRef,
  handleDelete,
  handleReact,
  currentUserId,

  // 🔥 ADD THIS
  isTyping,
}: Props) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 pt-28 pb-40 space-y-7 relative">

      {messages.map((msg) => (
        <ChatMessageBubble
          key={msg.id}
          msg={msg}
          formatTime={formatTime}
          isLastOther={msg.id === lastIncoming?.id && msg.sender === "other"}
          reqAI={reqAI}
          setZoomedImage={setZoomedImage}
          onDelete={handleDelete}
          onReact={handleReact}
          currentUserId={currentUserId}
        />
      ))}

      {/* AI SUGGESTIONS */}
      {aiSuggestions.length > 0 && (
        <div className="ai-suggestions-wrapper pl-2">
          {aiSuggestions.map((s, i) => (
            <button key={i} onClick={() => sendAI(s)} className="ai-pill">
              <div className="halo" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Typing bubble BEFORE the scroll bottom anchor */}
{isTyping && (
  <div className="flex justify-start pl-2 mb-4 mt-[-10px]">
    <div
      className="
        inline-flex items-center gap-2 px-4 py-2
        bg-white/10 backdrop-blur-md text-white
        rounded-2xl shadow-lg
        animate-[fadeIn_0.2s_ease-out]
      "
    >
      <div className="flex gap-[4px]">
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.15s]" />
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.3s]" />
      </div>
    </div>
  </div>
)}

      <div ref={endRef} />

    </div>
  );
};

export default React.memo(ChatMessages);