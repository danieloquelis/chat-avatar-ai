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
  audioBase64: string | undefined;
  phonemes: Phoneme | undefined;
  onAudioPlayed: () => void;
  onAudioPlaying: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  chatMessages: UIMessage[];
  startConversation: () => Promise<void>;
  stopConversation: () => Promise<void>;
  isConversationStarted: boolean;
};

export const SpeechContext = createContext<SpeechContextValue>({
  tts: async () => {},
  facialExpression: "default",
  animation: "Idle",
  audioBase64: undefined,
  phonemes: undefined,
  onAudioPlayed: () => {},
  onAudioPlaying: () => {},
  isSpeaking: false,
  isLoading: false,
  chatMessages: [],
  startConversation: async () => {},
  stopConversation: async () => {},
  isConversationStarted: false,
});
