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
  "Namaste! Main Agnivesh AI hoon. Main Hindi, Hinglish, aur English mein naturally baat kar sakti hoon. Aaj kya kaam karna hai?";

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastTranscriptRef = useRef("");
  const listRef = useRef<HTMLDivElement | null>(null);

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

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
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
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I hit an error. Please try again."
        }
      ]);
      setStatus("Error while handling request");
    } finally {
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
      <aside className="sidebar">
        <div className="brand">Agnivesh AI</div>
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
        <p className="small">Voice: Hindi/Hinglish support enabled with Indian accent preference.</p>
        <p className="small">Privacy mode: chat history is not saved in browser.</p>
      </aside>

      <section className="chatPanel">
        <header className="chatHeader">
          <h1>{ASSISTANT_NAME}</h1>
          <span className="small">{status}</span>
        </header>

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
