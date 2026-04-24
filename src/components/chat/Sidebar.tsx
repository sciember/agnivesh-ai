import { Search, Trash2 } from "lucide-react";
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
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-800 bg-slate-900 p-3 shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 mb-3 space-y-2 bg-slate-900 pb-2">
          <p className="text-xs font-medium text-slate-400">Chats</p>
          <button
            type="button"
            onClick={onNewChat}
            className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            + New Chat
          </button>
        </div>
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5">
          <Search size={14} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-2 rounded-lg px-2 py-1 ${
                chat.id === activeChatId ? "bg-slate-700" : "hover:bg-slate-800"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className="min-w-0 flex-1 text-left text-sm text-slate-200"
                title={chat.title}
              >
                <span className="block truncate">{chat.title}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteChat(chat.id)}
                className="rounded p-1 text-slate-400 hover:bg-slate-900 hover:text-red-300"
                aria-label="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
