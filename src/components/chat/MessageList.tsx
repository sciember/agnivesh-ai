import { Message } from "./types";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
};

export function MessageList({ messages, isLoading, listRef }: MessageListProps) {
  return (
    <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-3 py-4 md:px-6 md:pb-36 pb-44">
      {messages.map((m, idx) => (
        <div key={`${m.role}-${idx}`} className="mx-auto w-full max-w-4xl">
          <div className="mb-1 text-xs text-slate-400">{m.role === "user" ? "You" : "Agnivesh AI"}</div>
          <div
            className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "border-blue-700 bg-blue-900/40 text-slate-100"
                : "border-slate-700 bg-slate-800/70 text-slate-100"
            }`}
          >
            {m.content || "..."}
          </div>
        </div>
      ))}
      {isLoading ? (
        <div className="mx-auto w-full max-w-4xl text-xs text-slate-400">Agnivesh AI is thinking...</div>
      ) : null}
    </div>
  );
}
