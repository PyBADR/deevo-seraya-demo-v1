"use client";

import { User, Bot } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-[#1f1f1f] border border-[#2a2a2a]"
            : "bg-gradient-to-br from-[#c9a84c] to-[#a08838]"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-[#999]" />
        ) : (
          <Bot className="h-4 w-4 text-black" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 ${
          isUser
            ? "bg-[#1f1f1f] border border-[#2a2a2a] text-white"
            : "bg-[#141414] border border-[#c9a84c]/15 text-[#ddd]"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p className="mt-1.5 text-[10px] text-[#555]">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
