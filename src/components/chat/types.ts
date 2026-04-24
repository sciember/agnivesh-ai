export type Role = "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};
