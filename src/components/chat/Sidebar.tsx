import { ChatSession } from "./types";

type SidebarProps = {
  chats: ChatSession[];
  activeChatId: string;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
};

export function Sidebar({
  chats,
  activeChatId,
  isOpen,
  onClose,
  onNewChat,
  onSelectChat
}: SidebarProps) {
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
          isOpen ? "translate-x-0" : "-translate-x-full"
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
        <div className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelectChat(chat.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                chat.id === activeChatId
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              title={chat.title}
            >
              <span className="block truncate">{chat.title}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
