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
            ? "bg-[#F3F0E9] border border-[#E8E0D2]"
            : "bg-gradient-to-br from-[#B8954B] to-[#A07F3E]"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-[#6B6B6B]" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[#F3F0E9] border border-[#E8E0D2] text-[#1F1F1F]"
            : "bg-white border border-[#B8954B]/12 text-[#1F1F1F]"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p className="mt-1.5 text-[10px] text-[#9A9590]">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
