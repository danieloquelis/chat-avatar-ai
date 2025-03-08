"use client";

import { FC, useCallback, useRef } from "react";
import { ChatProps } from "./chat-common";
import { useSpeech } from "@/providers/speech-provider";

export const Chat: FC<ChatProps> = (props) => {
  const { hidden } = props;
  const { tts, isLoading, isSpeaking } = useSpeech();
  const input = useRef<HTMLInputElement>(null);

  const submit = useCallback(async () => {
    if (isLoading || isSpeaking || !input.current) {
      return;
    }

    const text = input.current.value;
    await tts(text);
    input.current.value = "";
  }, [isLoading, tts]);

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
      <div className="w-full flex flex-col items-end justify-center gap-4"></div>
      <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
        <input
          className="w-full placeholder:text-gray-800 p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
          placeholder="Type a message..."
          ref={input}
          disabled={isLoading || isSpeaking}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              await submit();
            }
          }}
        />
        <button
          disabled={isLoading || isSpeaking}
          onClick={submit}
          className={`bg-gray-500 hover:bg-gray-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
            isLoading || isSpeaking ? "cursor-not-allowed opacity-30" : ""
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};
