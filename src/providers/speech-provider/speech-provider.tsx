"use client";

import { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { SpeechContext } from "./speech-context";
import { useTTSApi } from "@/api/tts-api";
import { Phoneme } from "@/service/rhubarb";
import { FacialExpression } from "@/constants/facial-expressions";
import { AvatarAnimationType } from "@/components/avatar";
import { useChat } from "@ai-sdk/react";
import { generateId } from "ai";
import { Role, useConversation } from "@11labs/react";

export const SpeechProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [audioBase64, setAudioAudioBase64] = useState<string>();
  const [phonemes, setPhonemes] = useState<Phoneme | undefined>();
  const [animation, setAnimation] = useState<AvatarAnimationType>("Idle");
  const [facialExpression, setFacialExpression] =
    useState<FacialExpression>("default");

  const { trigger, isMutating } = useTTSApi();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const { append, setMessages, messages } = useChat();
  const conversation = useConversation({
    onConnect: () => setIsConversationStarted(true),
    onMessage: async (payload: { message: string; source: Role }) => {
      const { message, source } = payload;
      await append({
        role: source === "ai" ? "system" : "user",
        content: message,
      });
    },
    onDisconnect: () => setIsConversationStarted(false),
  });

  useEffect(() => {
    if (conversation.status !== "connected") return;
    setIsSpeaking(conversation.isSpeaking);
  }, [conversation.isSpeaking, conversation.status]);

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: process.env.ELEVEN_LABS_AGENT_ID,
      });
    } catch (error) {
      console.error(
        "[startConversation]",
        `Failed to start conversation: ${error}`,
      );
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

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
        isConversationStarted,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};
