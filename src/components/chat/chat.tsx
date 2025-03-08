"use client";

import { FC, FormEvent, useCallback, useRef } from "react";
import { ChatProps } from "./chat-common";
import { useSpeech } from "@/providers/speech-provider";
import { PromptInput } from "@/components/prompt-input";

export const Chat: FC<ChatProps> = (props) => {
  const { hidden } = props;
  const { tts, isLoading, isSpeaking } = useSpeech();
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

      await tts(text);
      input.current.value = "";
    },
    [isLoading, isSpeaking, tts],
  );

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col">
      <div className="w-full flex flex-col items-end justify-center gap-4"></div>
      <PromptInput
        ref={input}
        isLoading={isLoading}
        isRecording={false}
        startRecording={() => {}}
        stopRecording={() => {}}
        handleSubmit={submit}
      />
    </div>
  );
};
