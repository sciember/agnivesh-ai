"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
};
type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

type SpeechRecognitionEventLike = Event & {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const ASSISTANT_NAME = "Agnivesh AI";
const WELCOME_MESSAGE =
  "Namaste! Main hoon Agnivesh AI - Your Prsnl Intelligence.";
const CHAT_STORAGE_KEY = "agnivesh_ai_chat_history_v2";

function createDefaultSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    updatedAt: Date.now(),
    messages: [{ role: "assistant", content: WELCOME_MESSAGE }]
  };
}

function buildTitleFromMessages(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === "user")?.content.trim();
  if (!firstUser) return "New chat";
  return firstUser.length > 38 ? `${firstUser.slice(0, 38)}...` : firstUser;
}

export default function HomePage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastTranscriptRef = useRef("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) {
        const initial = createDefaultSession();
        setChats([initial]);
        setCurrentChatId(initial.id);
        return;
      }
      const parsed = JSON.parse(raw) as ChatSession[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const initial = createDefaultSession();
        setChats([initial]);
        setCurrentChatId(initial.id);
        return;
      }
      const sanitized = parsed.map((chat) => ({
        ...chat,
        messages: chat.messages?.length ? chat.messages : [{ role: "assistant", content: WELCOME_MESSAGE }]
      }));
      setChats(sanitized.sort((a, b) => b.updatedAt - a.updatedAt));
      setCurrentChatId(sanitized[0].id);
    } catch {
      const initial = createDefaultSession();
      setChats([initial]);
      setCurrentChatId(initial.id);
    }
  }, []);

  useEffect(() => {
    if (chats.length === 0) return;
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  const currentChat = chats.find((chat) => chat.id === currentChatId) ?? chats[0];
  const messages = currentChat?.messages ?? [];

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const canSend = useMemo(
    () => !isLoading && textInput.trim().length > 0,
    [isLoading, textInput]
  );

  function updateCurrentChatMessages(nextMessages: Message[]) {
    setChats((prev) =>
      prev
        .map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: nextMessages,
                title: buildTitleFromMessages(nextMessages),
                updatedAt: Date.now()
              }
            : chat
        )
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }

  function startNewChat() {
    const next = createDefaultSession();
    setChats((prev) => [next, ...prev]);
    setCurrentChatId(next.id);
    setTextInput("");
    setStatus("Started a new chat");
    setIsMenuOpen(false);
  }

  async function sendMessage(nextUserText: string) {
    if (!currentChatId) return;
    const nextMessages = [...messages, { role: "user" as const, content: nextUserText }];
    updateCurrentChatMessages(nextMessages);
    setIsLoading(true);
    setStatus("Streaming response...");
    const controller = new AbortController();
    activeRequestRef.current = controller;

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Chat request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No stream received");
      }
      const decoder = new TextDecoder();
      let assistantText = "";

      const withPlaceholder = [...nextMessages, { role: "assistant" as const, content: "" }];
      updateCurrentChatMessages(withPlaceholder);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        const partial = [...nextMessages, { role: "assistant" as const, content: assistantText }];
        updateCurrentChatMessages(partial);
      }

      const finalized = assistantText.trim() || "I could not generate a response.";
      updateCurrentChatMessages([...nextMessages, { role: "assistant", content: finalized }]);

      setStatus("Ready");
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        setStatus("Generation stopped");
        return;
      }
      console.error(error);
      updateCurrentChatMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Sorry, request fail ho gaya. Network check karo aur 1 baar phir try karo. Agar issue rahe to thodi der baad retry karo."
        }
      ]);
      setStatus(`Error: ${(error as Error).message || "Request failed"}`);
    } finally {
      activeRequestRef.current = null;
      setIsLoading(false);
    }
  }

  async function handleTextSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    const toSend = textInput.trim();
    setTextInput("");
    await sendMessage(toSend);
  }

  function handleComposerKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!canSend) return;
      void sendMessage(textInput.trim());
      setTextInput("");
    }
  }

  function stopGeneration() {
    activeRequestRef.current?.abort();
  }

  async function startRecording() {
    const speechCtor = (
      window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }
    ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition;

    if (!speechCtor) {
      setStatus("Speech recognition not supported in this browser");
      return;
    }

    try {
      const recognition = new speechCtor();
      lastTranscriptRef.current = "";
      recognition.lang = "hi-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const result = event.results[0]?.[0]?.transcript ?? "";
        lastTranscriptRef.current = result.trim();
      };
      recognition.onerror = () => {
        setStatus("Voice recognition failed");
      };
      recognition.onend = async () => {
        setIsRecording(false);
        const transcript = lastTranscriptRef.current;
        if (!transcript) {
          setStatus("No speech detected");
          return;
        }
        setStatus(`Heard: "${transcript}"`);
        await sendMessage(transcript);
      };
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setStatus("Listening in Hindi/Hinglish...");
    } catch (error) {
      console.error(error);
      setStatus("Microphone permission denied or unavailable");
    }
  }

  function stopRecording() {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } finally {
      setIsRecording(false);
    }
  }

  return (
    <main className="appShell">
      <section className="chatPanel">
        <header className="chatHeader">
          <button
            type="button"
            className="menuBtn"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <div>
            <h1>{ASSISTANT_NAME}</h1>
            <p className="small">Built by Agnivesh Maurya | Personal assistant mode</p>
          </div>
          <div className="headerActions">
            <span className="small">{status}</span>
            <button
              type="button"
              className="secondaryBtn"
              onClick={startNewChat}
              disabled={isLoading}
            >
              + New Chat
            </button>
            {isLoading ? (
              <button type="button" className="secondaryBtn" onClick={stopGeneration}>
                Stop
              </button>
            ) : null}
          </div>
        </header>

        {isMenuOpen ? (
          <div className="menuSheet">
            <button type="button" className="secondaryBtn" onClick={startNewChat} disabled={isLoading}>
              + New Chat
            </button>
            <div className="historyList">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className={`historyItem ${chat.id === currentChatId ? "active" : ""}`}
                  onClick={() => {
                    setCurrentChatId(chat.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <span>{chat.title}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="messages" ref={listRef}>
          {messages.map((m, idx) => (
            <div key={`${m.role}-${idx}`} className={`msgRow ${m.role}`}>
              <div className="msgMeta">{m.role === "user" ? "You" : ASSISTANT_NAME}</div>
              <div className={`msg ${m.role}`}>{m.content || (m.role === "assistant" ? "..." : "")}</div>
            </div>
          ))}
          {isLoading ? (
            <div className="small" style={{ padding: "0 4px 8px" }}>
              {ASSISTANT_NAME} is thinking...
            </div>
          ) : null}
        </div>

        <form onSubmit={handleTextSubmit} className="composerWrap">
          {textInput.trim().length === 0 ? (
            <div className="quickPrompts">
              {[
                "Mere liye aaj ka plan banao",
                "Ek professional email draft karo",
                "Coding me help chahiye",
                "Hindi me explain karo"
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="chipBtn"
                  disabled={isLoading}
                  onClick={() => {
                    setTextInput(prompt);
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          <textarea
            rows={3}
            placeholder={`Message ${ASSISTANT_NAME}...`}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            disabled={isLoading}
          />
          <div className="controls">
            <button type="submit" disabled={!canSend} aria-label="Send message" title="Send">
              <span className="iconOnly">➤</span>
            </button>
            {!isRecording ? (
              <button
                type="button"
                onPointerDown={startRecording}
                onPointerUp={stopRecording}
                onPointerLeave={stopRecording}
                onTouchEnd={stopRecording}
                onMouseUp={stopRecording}
                disabled={isLoading}
                className="secondaryBtn"
                title="Hold to talk"
                aria-label="Hold to talk"
              >
                <span className="iconOnly">🎤</span>
              </button>
            ) : (
              <button type="button" onClick={stopRecording} className="secondaryBtn">
                Listening... Release
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
