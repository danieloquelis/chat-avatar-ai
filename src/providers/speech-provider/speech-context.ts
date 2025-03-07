"use client";
import { createContext } from "react";

type SpeechContextValue = {
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
  tts: (message: string) => Promise<void>;
  message: string | undefined;
  onMessagePlayed: () => void;
  isLoading: boolean;
};

export const SpeechContext = createContext<SpeechContextValue>({
  startRecording: () => {},
  stopRecording: () => {},
  isRecording: false,
  tts: async () => {},
  message: undefined,
  onMessagePlayed: () => {},
  isLoading: false,
});
