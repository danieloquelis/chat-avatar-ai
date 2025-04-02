"use client";
import { createContext } from "react";
import { FacialExpression } from "@/constants/facial-expressions";
import { Phoneme } from "@/service/rhubarb";
import { AvatarAnimationType } from "@/components/avatar";
import { UIMessage } from "ai";

type SpeechContextValue = {
  tts: (message: string) => Promise<void>;
  facialExpression: FacialExpression;
  animation: AvatarAnimationType;
  phonemes: Phoneme | undefined;
  isSpeaking: boolean;
  isLoading: boolean;
  chatMessages: UIMessage[];
  startConversation: () => Promise<void>;
  stopConversation: () => Promise<void>;
  hasConversationStarted: boolean;
  currentTime: number;
};

export const SpeechContext = createContext<SpeechContextValue>({
  tts: async () => {},
  facialExpression: "default",
  animation: "Idle",
  phonemes: undefined,
  currentTime: 0,
  isSpeaking: false,
  isLoading: false,
  chatMessages: [],
  startConversation: async () => {},
  stopConversation: async () => {},
  hasConversationStarted: false,
});
