import { Menu, Sparkles } from "lucide-react";

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="z-20 flex h-14 items-center border-b border-white/5 bg-[var(--bg-glass)] px-3 backdrop-blur-md md:px-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="rounded-lg border border-white/10 p-2 text-slate-200 transition-all hover:bg-white/10 hover:border-white/20"
      >
        <Menu size={18} />
      </button>

      <div className="mx-auto flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <h1 className="text-sm font-semibold md:text-base">
          <span className="gradient-text">Agnivesh AI</span>
        </h1>
      </div>

      <div className="w-9" aria-hidden={isSidebarOpen} />
    </header>
  );
}
