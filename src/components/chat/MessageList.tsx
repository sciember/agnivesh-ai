import { Message } from "./types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
};

export function MessageList({ messages, isLoading, listRef }: MessageListProps) {
  function CopyCodeButton({ value }: { value: string }) {
    return (
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(value)}
        className="absolute right-2 top-2 rounded bg-slate-700 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-600"
      >
        Copy
      </button>
    );
  }

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
            {m.role === "assistant" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className } = props;
                    const value = String(children ?? "");
                    const isInline = !className;
                    if (isInline) {
                      return <code className="rounded bg-slate-900 px-1 py-0.5">{children}</code>;
                    }
                    return (
                      <div className="relative">
                        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 pr-12">
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
      {isLoading ? (
        <div className="mx-auto w-full max-w-4xl text-xs text-slate-400">Agnivesh AI is thinking...</div>
      ) : null}
    </div>
  );
}
