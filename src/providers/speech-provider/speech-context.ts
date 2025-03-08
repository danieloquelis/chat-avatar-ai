"use client";
import { createContext } from "react";
import { FacialExpression } from "@/constants/facial-expressions";
import { Phoneme } from "@/service/rhubarb";
import { AvatarAnimationType } from "@/components/avatar";

type SpeechContextValue = {
  tts: (message: string) => Promise<void>;
  facialExpression: FacialExpression;
  animation: AvatarAnimationType;
  audioBase64: string | undefined;
  phonemes: Phoneme | undefined;
  onMessagePlayed: () => void;
  isLoading: boolean;
};

export const SpeechContext = createContext<SpeechContextValue>({
  tts: async () => {},
  facialExpression: "default",
  animation: "Idle",
  audioBase64: undefined,
  phonemes: undefined,
  onMessagePlayed: () => {},
  isLoading: false,
});
