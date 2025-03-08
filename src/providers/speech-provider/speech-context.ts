"use client";
import { createContext } from "react";
import { TTSResponse } from "./speech-provider";

type SpeechContextValue = {
  tts: (message: string) => Promise<void>;
  message: TTSResponse | undefined;
  onMessagePlayed: () => void;
  isLoading: boolean;
};

export const SpeechContext = createContext<SpeechContextValue>({
  tts: async () => {},
  message: undefined,
  onMessagePlayed: () => {},
  isLoading: false,
});
