"use client";

import { FC, FormEvent, useCallback, useEffect, useRef } from "react";
import { ChatProps } from "./chat-common";
import { useSpeech } from "@/providers/speech-provider";
import { PromptInput } from "@/components/prompt-input";
import { ChatConversation } from "@/components/chat-conversation";

export const Chat: FC<ChatProps> = (props) => {
  const { hidden } = props;
  const { tts, isLoading, isSpeaking, chatMessages } = useSpeech();
  const input = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isLoading || isSpeaking || !input.current) {
        return;
      }

      const text = input.current.value;
      if (!text.trim()) {
        return;
      }

      input.current.value = "";
      await tts(text);
    },
    [isLoading, isSpeaking, tts],
  );

  useEffect(() => {
    if (!isSpeaking && input.current) {
      input.current.focus();
    }
  }, [isSpeaking]);

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col">
      <div className="w-full flex flex-col items-end justify-center gap-4"></div>

      <ChatConversation messages={chatMessages} />

      <PromptInput
        ref={input}
        isLoading={isLoading}
        isSpeaking={isSpeaking}
        isRecording={false}
        startRecording={() => {}}
        stopRecording={() => {}}
        handleSubmit={submit}
      />
    </div>
  );
};
