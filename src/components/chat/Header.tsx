import { Menu, Sparkles, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenAuth: () => void;
};

export function Header({ isSidebarOpen, onToggleSidebar, onOpenAuth }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="z-20 flex h-14 items-center justify-between border-b border-white/5 bg-[var(--bg-glass)] px-3 backdrop-blur-md md:px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-lg border border-white/10 p-2 text-slate-200 transition-all hover:bg-white/10 hover:border-white/20"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h1 className="text-sm font-semibold md:text-base">
            <span className="gradient-text">Agnivesh AI</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 md:flex">
              <UserIcon size={14} className="text-violet-400" />
              <span className="text-sm text-slate-300">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition-all hover:bg-white/10 hover:text-red-400"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-600/20 px-3 py-1.5 text-sm text-white transition-all hover:border-violet-500/50 hover:bg-violet-600/30"
          >
            <LogIn size={16} />
            <span className="hidden md:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
