import { Mic, Send } from "lucide-react";
import { FormEvent, KeyboardEvent } from "react";

type InputBarProps = {
  textInput: string;
  isLoading: boolean;
  isRecording: boolean;
  showPrompts: boolean;
  canSend: boolean;
  onChangeText: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPromptClick: (prompt: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

const prompts = ["Coding me help chahiye", "Hindi me explain karo", "Mere liye aaj ka plan banao"];

export function InputBar({
  textInput,
  isLoading,
  isRecording,
  showPrompts,
  canSend,
  onChangeText,
  onSubmit,
  onKeyDown,
  onPromptClick,
  onStartRecording,
  onStopRecording
}: InputBarProps) {
  return (
    <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_35px_rgba(2,6,23,0.6)] backdrop-blur">
      {showPrompts ? (
        <div className="mx-auto mb-2 flex w-full max-w-4xl flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPromptClick(prompt)}
              disabled={isLoading}
              className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-4xl items-end gap-2">
        <textarea
          rows={2}
          value={textInput}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          placeholder="Message Agnivesh AI..."
          className="max-h-36 min-h-12 flex-1 resize-y rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-blue-400 placeholder:text-slate-500 focus:ring-2"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-xl bg-blue-600 p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
        {!isRecording ? (
          <button
            type="button"
            onPointerDown={onStartRecording}
            onPointerUp={onStopRecording}
            onPointerLeave={onStopRecording}
            onMouseUp={onStopRecording}
            onTouchEnd={onStopRecording}
            disabled={isLoading}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Hold to talk"
          >
            <Mic size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopRecording}
            className="rounded-xl border border-red-700 bg-red-900/60 px-3 py-2 text-xs text-red-100"
          >
            Stop
          </button>
        )}
      </form>
    </div>
  );
}
