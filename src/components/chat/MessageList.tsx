import { Message } from "./types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600">
        <Bot size={16} className="text-white" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

function CopyCodeButton({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(value)}
      className="absolute right-2 top-2 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-slate-300 transition-all hover:bg-white/20"
    >
      Copy
    </button>
  );
}

export function MessageList({ messages, isLoading, listRef }: MessageListProps) {
  return (
    <div ref={listRef} className="flex-1 space-y-6 overflow-y-auto px-3 py-4 md:px-6 md:pb-36 pb-44">
      {messages.map((m, idx) => (
        <div key={`${m.role}-${idx}`} className="mx-auto w-full max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-2 flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${m.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-violet-600 to-indigo-600"}`}>
              {m.role === "user" ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            <span className="text-xs font-medium text-slate-400">{m.role === "user" ? "You" : "Stezix AI"}</span>
          </div>
          <div
            className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "border-blue-500/30 bg-blue-500/10 text-slate-100"
                : "border-white/10 bg-white/5 text-slate-100"
            }`}
          >
            {m.role === "assistant" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className } = props;
                    const value = String(children ?? "");
                    const isInline = !className;
                    if (isInline) {
                      return <code className="rounded-lg bg-white/10 px-2 py-1 text-violet-300">{children}</code>;
                    }
                    return (
                      <div className="relative">
                        <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 pr-12">
                          <code>{value}</code>
                        </pre>
                        <CopyCodeButton value={value} />
                      </div>
                    );
                  }
                }}
              >
                {m.content || "..."}
              </ReactMarkdown>
            ) : (
              m.content || "..."
            )}
          </div>
        </div>
      ))}
      {isLoading ? <TypingIndicator /> : null}
    </div>
  );
}
