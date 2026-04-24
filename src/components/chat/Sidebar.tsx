import { Search, Trash2, MessageSquare, Plus } from "lucide-react";
import { ChatSession } from "./types";

type SidebarProps = {
  chats: ChatSession[];
  activeChatId: string;
  isOpen: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
};

export function Sidebar({
  chats,
  activeChatId,
  isOpen,
  query,
  onQueryChange,
  onClose,
  onNewChat,
  onSelectChat,
  onDeleteChat
}: SidebarProps) {
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-white/5 bg-[var(--bg-secondary)] p-3 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <MessageSquare size={16} className="text-white" />
            </div>
            <span className="gradient-text text-lg font-semibold">Chats</span>
          </div>
          <button
            type="button"
            onClick={onNewChat}
            className="group w-full rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 px-3 py-2.5 text-sm font-medium text-white transition-all hover:border-violet-500/50 hover:from-violet-600/30 hover:to-indigo-600/30 hover:shadow-lg hover:shadow-violet-500/20"
          >
            <Plus size={14} className="mr-2 inline-block transition-transform group-hover:scale-110" />
            New Chat
          </button>
        </div>
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 180px)" }}>
          {filteredChats.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No chats yet
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all ${
                  chat.id === activeChatId 
                    ? "border border-violet-500/30 bg-violet-500/10" 
                    : "hover:bg-white/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className="min-w-0 flex-1 text-left"
                  title={chat.title}
                >
                  <span className="block truncate text-sm text-slate-200">{chat.title}</span>
                  <span className="block truncate text-xs text-slate-500">{chat.lastMessage?.substring(0, 50) || "New conversation"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteChat(chat.id)}
                  className="rounded-lg p-2 text-slate-500 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                  aria-label="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
