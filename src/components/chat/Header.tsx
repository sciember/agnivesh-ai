import { Menu } from "lucide-react";

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="z-20 flex h-14 items-center border-b border-slate-800 bg-slate-950/90 px-3 backdrop-blur md:px-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
      >
        <Menu size={18} />
      </button>

      <div className="mx-auto text-center">
        <h1 className="text-sm font-semibold md:text-base">Agnivesh AI</h1>
        <p className="hidden text-[11px] text-slate-400 md:block">
          Built by Agnivesh Maurya | Personal assistant mode
        </p>
      </div>

      <div className="w-9" aria-hidden={isSidebarOpen} />
    </header>
  );
}
