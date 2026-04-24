"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
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

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
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
    setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
    // Privacy-first mode: do not persist chat history locally.
    localStorage.removeItem("agnivesh_voice_bot_messages_v1");
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const canSend = useMemo(
    () => !isLoading && textInput.trim().length > 0,
    [isLoading, textInput]
  );

  async function sendMessage(nextUserText: string) {
    const nextMessages = [...messages, { role: "user" as const, content: nextUserText }];
    setMessages(nextMessages);
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

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const cloned = [...prev];
          const lastIdx = cloned.length - 1;
          if (lastIdx >= 0 && cloned[lastIdx].role === "assistant") {
            cloned[lastIdx] = {
              ...cloned[lastIdx],
              content: assistantText
            };
          }
          return cloned;
        });
      }

      const finalized = assistantText.trim() || "I could not generate a response.";
      setMessages((prev) => {
        const cloned = [...prev];
        const lastIdx = cloned.length - 1;
        if (lastIdx >= 0 && cloned[lastIdx].role === "assistant") {
          cloned[lastIdx] = { role: "assistant", content: finalized };
        }
        return cloned;
      });

      setStatus("Ready");
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        setStatus("Generation stopped");
        return;
      }
      console.error(error);
      setMessages((prev) => [
        ...prev,
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
              onClick={() => {
                setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
                setStatus("Started a new chat");
              }}
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
            <button
              type="button"
              className="secondaryBtn"
              onClick={() => {
                setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
                setStatus("Started a new chat");
                setIsMenuOpen(false);
              }}
              disabled={isLoading}
            >
              + New Chat
            </button>
            <p className="small">Privacy mode: chat history is not saved in browser.</p>
            <p className="small">Voice input: hold and release to send.</p>
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
          <textarea
            rows={3}
            placeholder={`Message ${ASSISTANT_NAME}...`}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            disabled={isLoading}
          />
          <div className="controls">
            <button type="submit" disabled={!canSend}>
              Send
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
              >
                Hold To Talk
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
