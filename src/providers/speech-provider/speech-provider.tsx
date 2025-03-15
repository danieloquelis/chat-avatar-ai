"use client";

import { FC, PropsWithChildren, useCallback, useState } from "react";
import { SpeechContext } from "./speech-context";
import { useTTSApi } from "@/api/tts-api";
import { Phoneme } from "@/service/rhubarb";
import { FacialExpression } from "@/constants/facial-expressions";
import { AvatarAnimationType } from "@/components/avatar";
import { useChat } from "@ai-sdk/react";
import { generateId } from "ai";
import { ElevenLabs } from "@/service/eleven-labs";

export const SpeechProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [audioBase64, setAudioAudioBase64] = useState<string>();
  const [phonemes, setPhonemes] = useState<Phoneme | undefined>();
  const [animation, setAnimation] = useState<AvatarAnimationType>("Idle");
  const [facialExpression, setFacialExpression] =
    useState<FacialExpression>("default");

  const { trigger, isMutating } = useTTSApi();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { append, setMessages, messages } = useChat();

  const { startConversation, stopConversation, status } =
    ElevenLabs.useAgentConversation({
      agentId: process.env.ELEVEN_LABS_AGENT_ID!,
      onAgentEvent: async (event) => {
        if (event.type === "transcription") {
          await append({
            role: "system",
            content: event.transcription,
          });
        }
      },
      onUserEvent: async (event) => {
        await append({
          role: "user",
          content: event.transcription,
        });
      },
    });

  const tts = useCallback(
    async (message: string) => {
      setMessages([
        ...messages,
        {
          id: generateId(),
          role: "user",
          content: message,
        },
      ]);
      const { facialExpression, phonemes, animation, audio, text } =
        await trigger({ message });

      await append({
        role: "system",
        content: text,
      });

      setFacialExpression(facialExpression);
      setPhonemes(phonemes);
      setAnimation(animation);
      setAudioAudioBase64(audio);
    },
    [append, messages, setMessages, trigger],
  );

  const onAudioPlayed = useCallback(() => {
    setIsSpeaking(false);
    setAnimation("Idle");
    setPhonemes(undefined);
    setFacialExpression("default");
    setAudioAudioBase64(undefined);
  }, []);

  const onAudioPlaying = useCallback(() => {
    setIsSpeaking(true);
  }, []);

  return (
    <SpeechContext.Provider
      value={{
        isLoading: isMutating,
        tts,
        onAudioPlayed,
        onAudioPlaying,
        isSpeaking,
        facialExpression,
        phonemes,
        animation,
        audioBase64,
        chatMessages: messages,
        startConversation,
        stopConversation,
        hasConversationStarted: status === "connected",
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};
