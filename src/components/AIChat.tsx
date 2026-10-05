import API_BASE_URL from "../config/api";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Trash2,
  MessageCircle,
  RotateCcw,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialMessage: Message = {
  role: "assistant",
  content:
    "Welcome to I-Cinema. I'm your AI cinema assistant. Ask me about movies, shows, timings, theatres, seats, bookings, or anything about your cinema experience.",
};

export default function AIChat() {
  const [open, setOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("iCinemaToken")
  );

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    initialMessage,
  ]);

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const chatWindowRef = useRef<HTMLDivElement | null>(null);
  const chatButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleAuthChanged = () => {
      const token = localStorage.getItem("iCinemaToken");

      setIsLoggedIn(!!token);

      requestIdRef.current += 1;

      setOpen(false);
      setMessage("");
      setMessages([initialMessage]);
      setLoading(false);
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChanged
      );
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!open) {
        return;
      }

      const target = event.target as Node;

      const clickedInsideChat =
        chatWindowRef.current?.contains(target);

      const clickedChatButton =
        chatButtonRef.current?.contains(target);

      if (!clickedInsideChat && !clickedChatButton) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const clearChat = () => {
    requestIdRef.current += 1;

    setMessages([initialMessage]);
    setMessage("");
    setLoading(false);
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading || !isLoggedIn) {
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    const userMessage: Message = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        API_BASE_URL + "/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("AI service request failed");
      }

      const data = await response.text();

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data,
        },
      ]);
    } catch {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm unable to connect right now. Please try again.",
        },
      ]);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes aiChatOpen {
            0% {
              opacity: 0;
              transform: translateY(28px) scale(0.94);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes aiMessageIn {
            0% {
              opacity: 0;
              transform: translateY(8px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes aiPulse {
            0%, 100% {
              box-shadow:
                0 0 0 0 rgba(182, 75, 42, 0.25),
                0 10px 35px rgba(0, 0, 0, 0.20);
            }

            50% {
              box-shadow:
                0 0 0 9px rgba(182, 75, 42, 0),
                0 14px 42px rgba(0, 0, 0, 0.25);
            }
          }

          @keyframes aiSparkle {
            0%, 100% {
              transform: rotate(0deg) scale(1);
            }

            50% {
              transform: rotate(8deg) scale(1.08);
            }
          }

          @keyframes aiDot {
            0%, 80%, 100% {
              transform: translateY(0);
              opacity: 0.35;
            }

            40% {
              transform: translateY(-4px);
              opacity: 1;
            }
          }

          .ai-chat-open {
            animation:
              aiChatOpen
              0.32s
              cubic-bezier(0.22, 1, 0.36, 1);
          }

          .ai-message {
            animation:
              aiMessageIn
              0.25s
              ease-out
              both;
          }

          .ai-message:nth-child(2) {
            animation-delay: 0.04s;
          }

          .ai-message:nth-child(3) {
            animation-delay: 0.08s;
          }

          .ai-message:nth-child(4) {
            animation-delay: 0.12s;
          }

          .ai-message:nth-child(5) {
            animation-delay: 0.16s;
          }

          .ai-pulse {
            animation:
              aiPulse
              2.8s
              ease-in-out
              infinite;
          }

          .ai-sparkle {
            animation:
              aiSparkle
              2.2s
              ease-in-out
              infinite;
          }

          .ai-dot-1 {
            animation:
              aiDot
              1.2s
              infinite;
          }

          .ai-dot-2 {
            animation:
              aiDot
              1.2s
              infinite
              0.15s;
          }

          .ai-dot-3 {
            animation:
              aiDot
              1.2s
              infinite
              0.3s;
          }
        `}
      </style>

      <div
        ref={chatWindowRef}
        className={`fixed bottom-24 right-4 z-[60] w-[calc(100vw-32px)] max-w-[420px] origin-bottom-right transition-all duration-300 sm:right-6 ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-90 opacity-0"
        }`}
      >
        <div
          className={`flex h-[min(650px,calc(100vh-120px))] flex-col overflow-hidden rounded-[26px] border border-black/10 bg-[#f4f0e8] shadow-[0_25px_80px_rgba(0,0,0,0.22)] ${
            open ? "ai-chat-open" : ""
          }`}
        >
          <div className="relative overflow-hidden bg-[#171717] px-5 py-5 text-white">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#b64b2a]/20 blur-2xl" />

            <div className="absolute -bottom-16 -left-10 h-28 w-28 rounded-full bg-[#b64b2a]/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b64b2a] shadow-lg">
                  <Sparkles
                    size={20}
                    className="ai-sparkle"
                  />

                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#171717] bg-green-500" />
                </div>

                <div>
                  <h3 className="font-serif text-lg tracking-wide">
                    I-Cinema AI
                  </h3>

                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />

                    <p className="text-[11px] text-white/60">
                      Online · Cinema Assistant
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="group flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  <Trash2
                    size={16}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                </button>

                <button
                  onClick={() => setOpen(false)}
                  title="Close AI assistant"
                  className="group flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  <X
                    size={19}
                    className="transition-transform duration-300 group-hover:rotate-90"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#f4f0e8] px-4 py-5">
            {messages.length === 1 && (
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <MessageCircle
                    size={21}
                    className="text-[#b64b2a]"
                  />
                </div>

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/40">
                  How can I help?
                </p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((item, index) => {
                const isUser = item.role === "user";

                return (
                  <div
                    key={index}
                    className={`ai-message flex items-end gap-2 ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white shadow-sm">
                        <Bot size={14} />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] whitespace-pre-wrap break-words text-[13px] leading-6 shadow-sm transition-transform duration-200 ${
                        isUser
                          ? "rounded-[20px] rounded-br-md bg-[#b64b2a] px-4 py-3 text-white hover:-translate-y-0.5"
                          : "rounded-[20px] rounded-bl-md border border-black/10 bg-white px-4 py-3 text-[#171717] hover:-translate-y-0.5"
                      }`}
                    >
                      {item.content}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-end gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white">
                    <Bot size={14} />
                  </div>

                  <div className="rounded-[20px] rounded-bl-md border border-black/10 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="ai-dot-1 h-1.5 w-1.5 rounded-full bg-black/40" />
                      <span className="ai-dot-2 h-1.5 w-1.5 rounded-full bg-black/40" />
                      <span className="ai-dot-3 h-1.5 w-1.5 rounded-full bg-black/40" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-black/10 bg-white/70 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[10px] uppercase tracking-[0.15em] text-black/35">
                I-Cinema Assistant
              </span>

              {messages.length > 1 && (
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1 text-[10px] font-medium text-black/40 transition hover:text-[#b64b2a]"
                >
                  <RotateCcw size={11} />
                  New chat
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white p-1.5 shadow-sm transition-all duration-200 focus-within:border-[#b64b2a]/50 focus-within:ring-2 focus-within:ring-[#b64b2a]/10">
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask about movies, shows, seats..."
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13px] outline-none placeholder:text-black/35 disabled:opacity-50"
              />

              <button
                onClick={sendMessage}
                disabled={
                  loading || !message.trim()
                }
                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#171717] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b64b2a] disabled:cursor-not-allowed disabled:opacity-25"
                aria-label="Send message"
              >
                <Send
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>

            <p className="mt-2 text-center text-[9px] text-black/30">
              Press Enter to send
            </p>
          </div>
        </div>
      </div>

      <div className="group fixed bottom-6 right-5 z-[60] sm:right-6">
        {!open && (
          <div className="pointer-events-none absolute bottom-1/2 right-[calc(100%+12px)] translate-y-1/2 whitespace-nowrap rounded-xl bg-[#171717] px-3.5 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            <div className="flex items-center gap-2">
              <Sparkles
                size={13}
                className="text-[#d97845]"
              />
              Ask I-Cinema AI
            </div>

            <span className="absolute right-0 top-1/2 h-2 w-2 translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#171717]" />
          </div>
        )}

        <button
          ref={chatButtonRef}
          onClick={() => setOpen((prev) => !prev)}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-110 ${
            open
              ? "bg-[#b64b2a]"
              : "ai-pulse bg-[#171717] hover:bg-[#b64b2a]"
          }`}
          aria-label={
            open
              ? "Close I-Cinema AI"
              : "Open I-Cinema AI"
          }
        >
          <span
            className={`absolute inset-0 rounded-full border border-white/20 transition-transform duration-500 ${
              open
                ? "scale-90 opacity-0"
                : "scale-100 opacity-100"
            }`}
          />

          {open ? (
            <X
              size={22}
              className="transition-transform duration-300 hover:rotate-90"
            />
          ) : (
            <>
              <Bot
                size={23}
                className="relative z-10 transition-transform duration-300 group-hover:scale-110"
              />

              <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-[#f4f0e8] bg-green-500" />
            </>
          )}
        </button>
      </div>
    </>
  );
}