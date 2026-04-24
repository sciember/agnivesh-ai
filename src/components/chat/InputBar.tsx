import { Mic, Send, Sparkles } from "lucide-react";
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
    <div className="sticky bottom-0 border-t border-white/5 bg-[var(--bg-glass)] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      {showPrompts ? (
        <div className="mx-auto mb-3 flex w-full max-w-4xl flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPromptClick(prompt)}
              disabled={isLoading}
              className="group rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-violet-500/50 hover:bg-white/10 hover:text-white"
            >
              <Sparkles size={10} className="mr-1.5 inline-block text-violet-400 transition-transform group-hover:scale-110" />
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-4xl items-end gap-2">
        <div className="relative flex-1">
          <textarea
            rows={2}
            value={textInput}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isLoading}
            placeholder="Message Agnivesh AI..."
            className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
          />
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-500/50" />
          </div>
        </div>
        <button
          type="submit"
          disabled={!canSend}
          className="group relative rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-3 text-white transition-all hover:shadow-lg hover:shadow-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={18} className="transition-transform group-hover:scale-110" />
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
            className="group rounded-xl border border-white/10 bg-white/5 p-3 text-slate-300 transition-all hover:border-red-500/50 hover:bg-white/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Hold to talk"
          >
            <Mic size={18} className="transition-transform group-hover:scale-110" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopRecording}
            className="animate-pulse rounded-xl border border-red-500/50 bg-red-500/20 px-4 py-3 text-xs font-medium text-red-400 transition-all hover:bg-red-500/30"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Stop
            </span>
          </button>
        )}
      </form>
    </div>
  );
}
