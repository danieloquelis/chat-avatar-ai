"use client";
import { createContext } from "react";
import { TTSApiResponse } from "@/api/tts-api";

type SpeechContextValue = {
  tts: (message: string) => Promise<void>;
  message: TTSApiResponse | undefined;
  onMessagePlayed: () => void;
  isLoading: boolean;
};

export const SpeechContext = createContext<SpeechContextValue>({
  tts: async () => {},
  message: undefined,
  onMessagePlayed: () => {},
  isLoading: false,
});
