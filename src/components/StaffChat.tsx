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
    label: "Eid Gift Guidance",
    message:
      "Customer needs an Eid gift for a female recipient, around 150 KWD, elegant but not flashy. What should staff recommend?",
  },
  {
    label: "Corporate Gift Decision",
    message:
      "Customer is unsure whether to choose watches or accessories for a premium corporate gift. How should we guide them?",
  },
  {
    label: "Hesitant VIP Approach",
    message:
      "Suggest the best staff approach for a hesitant high-value customer in Kuwait who is browsing alone.",
  },
  {
    label: "Ramadan Campaign Strategy",
    message:
      "What should we emphasize in a Ramadan premium accessories campaign for our Kuwait stores?",
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
          throw new Error(data.error || "Chat request failed");
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
      <div className="flex flex-col h-[720px] rounded-xl border border-[#2a2a2a] bg-[#0e0e0e] overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">
              Staff Intelligence Chat
            </span>
            <span className="text-[10px] text-[#555]">— Live via OpenAI</span>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] text-[#666] hover:text-[#999] hover:bg-[#1a1a1a] transition-all"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Sparkles className="h-8 w-8 text-[#333] mb-3" />
              <p className="text-sm text-[#555] mb-1">
                Ask a retail intelligence question
              </p>
              <p className="text-xs text-[#444] mb-6">
                Or select a starter prompt below
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.message)}
                    className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2.5 text-left text-xs text-[#888] hover:text-white hover:border-[#3a3a3a] transition-all"
                  >
                    <span className="font-medium text-[#c9a84c]">
                      {prompt.label}
                    </span>
                    <br />
                    <span className="text-[#666] line-clamp-2">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#a08838]">
                <Loader2 className="h-4 w-4 text-black animate-spin" />
              </div>
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 rounded-full bg-[#c9a84c] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#c9a84c] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#c9a84c] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs text-[#666]">
                Seraya is thinking...
              </span>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0" />
              <p className="text-xs text-[#ef4444]">{error}</p>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-[#2a2a2a] px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a retail intelligence question..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#c9a84c]/40 focus:outline-none disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#a08838] text-black transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ── Right: Decision Panel ─────────────────────────── */}
      <div className="h-[720px] overflow-y-auto rounded-xl border border-[#2a2a2a] bg-[#0e0e0e] p-5">
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
            <LayoutPanelLeft className="h-10 w-10 text-[#222] mb-4" />
            <p className="text-sm font-medium text-[#555]">Decision View</p>
            <p className="mt-1 text-xs text-[#444] max-w-[240px]">
              Structured retail guidance will appear here after Seraya responds
              to a staff question.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
