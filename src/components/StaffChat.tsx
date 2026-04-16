"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  LayoutPanelLeft,
} from "lucide-react";
import ChatMessageComponent from "./ChatMessage";
import DecisionPanel from "./DecisionPanel";
import type { ChatMessage } from "@/types/chat";
import type { StarterPrompt } from "@/types/chat";

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    label: "Weekly Planning Focus",
    message:
      "What should the planning team focus on this week across our Kuwait stores?",
  },
  {
    label: "Inventory Risk Review",
    message:
      "Are there any SKUs below safety stock or overstocked items that need transfer action?",
  },
  {
    label: "Campaign Readiness",
    message:
      "What should we emphasize in a Ramadan premium accessories campaign for our Kuwait stores?",
  },
  {
    label: "Workforce Planning",
    message:
      "Do we have adequate staffing for weekend peak traffic across Marina Mall and Avenues?",
  },
];

export default function StaffChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive latest assistant message for the right-side DecisionPanel
  const latestAssistantMessage = useMemo(() => {
    return [...messages]
      .reverse()
      .find((m) => m.role === "assistant")?.content || "";
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();

        if (!res.ok || data.success === false) {
          if (data.reply) {
            const fallbackMessage: ChatMessage = {
              id: `msg-${Date.now()}-ai`,
              role: "assistant",
              content: data.reply,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, fallbackMessage]);
            return;
          }
          throw new Error(data.error || "Request failed");
        }

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: data.reply,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      {/* ── Left: Chat UI ─────────────────────────────────── */}
      <div className="flex flex-col h-[720px] rounded-2xl border border-[#E8E0D2] bg-white overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-[#E8E0D2] px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2F7D5C]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              Internal Copilot
            </span>
            <span className="text-[10px] text-[#9A9590]">— Live via OpenAI</span>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] text-[#9A9590] hover:text-[#6B6B6B] hover:bg-[#F3F0E9] transition-all"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Sparkles className="h-8 w-8 text-[#DDD5C8] mb-3" />
              <p className="text-sm text-[#6B6B6B] mb-1">
                Ask a planning question
              </p>
              <p className="text-xs text-[#9A9590] mb-6">
                Or select a starter prompt below
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.message)}
                    className="rounded-xl border border-[#E8E0D2] bg-[#F8F5EF] px-3 py-2.5 text-left text-xs text-[#6B6B6B] hover:text-[#1F1F1F] hover:border-[#DDD5C8] transition-all"
                  >
                    <span className="font-medium text-[#B8954B]">
                      {prompt.label}
                    </span>
                    <br />
                    <span className="text-[#9A9590] line-clamp-2">
                      {prompt.message}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChatMessageComponent message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#B8954B] to-[#A07F3E]">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 rounded-full bg-[#B8954B] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#B8954B] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#B8954B] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs text-[#9A9590]">
                Seraya is thinking...
              </span>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 rounded-xl border border-[#B85C38]/15 bg-[#B85C38]/5 px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 text-[#B85C38] shrink-0" />
              <p className="text-xs text-[#B85C38]">{error}</p>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-[#E8E0D2] px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a planning question..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-[#E8E0D2] bg-[#F8F5EF] px-4 py-2.5 text-sm text-[#1F1F1F] placeholder-[#9A9590] focus:border-[#B8954B]/40 focus:outline-none disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B8954B] to-[#A07F3E] text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ── Right: Decision Panel ─────────────────────────── */}
      <div className="h-[720px] overflow-y-auto rounded-2xl border border-[#E8E0D2] bg-white p-5">
        {latestAssistantMessage ? (
          <motion.div
            key={latestAssistantMessage.slice(0, 40)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <DecisionPanel responseText={latestAssistantMessage} />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LayoutPanelLeft className="h-10 w-10 text-[#DDD5C8] mb-4" />
            <p className="text-sm font-medium text-[#6B6B6B]">Decision View</p>
            <p className="mt-1 text-xs text-[#9A9590] max-w-[240px]">
              Structured planning guidance will appear here after Seraya responds
              to a question.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
