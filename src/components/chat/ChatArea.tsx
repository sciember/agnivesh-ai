import { FormEvent, KeyboardEvent } from "react";
import { Message } from "./types";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";

type ChatAreaProps = {
  messages: Message[];
  isLoading: boolean;
  isRecording: boolean;
  textInput: string;
  canSend: boolean;
  showPrompts: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  onChangeText: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPromptClick: (prompt: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export function ChatArea(props: ChatAreaProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <MessageList messages={props.messages} isLoading={props.isLoading} listRef={props.listRef} />
      <InputBar
        textInput={props.textInput}
        isLoading={props.isLoading}
        isRecording={props.isRecording}
        showPrompts={props.showPrompts}
        canSend={props.canSend}
        onChangeText={props.onChangeText}
        onSubmit={props.onSubmit}
        onKeyDown={props.onKeyDown}
        onPromptClick={props.onPromptClick}
        onStartRecording={props.onStartRecording}
        onStopRecording={props.onStopRecording}
      />
    </section>
  );
}
