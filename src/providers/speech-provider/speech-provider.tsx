"use client";

import { FC, PropsWithChildren, useCallback } from "react";
import { SpeechContext } from "./speech-context";
import { useTTSApi } from "@/api/tts-api";
import { useChat } from "@ai-sdk/react";
import { generateId } from "ai";
import { useAgentConversation } from "@/service/eleven-labs";
import { useAgentWebsocketApi } from "@/api/agent-websocket-api";
import { useLipSyncManager } from "@/hooks/use-lip-sync-manager";

export const SpeechProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const { trigger, isMutating, error } = useTTSApi();
  const { data } = useAgentWebsocketApi();
  const { append, setMessages, messages } = useChat();
  const {
    handleAudioChunk,
    phonemes,
    animation,
    facialExpression,
    isSpeaking,
    currentTime,
  } = useLipSyncManager();

  const { startConversation, stopConversation, status } = useAgentConversation({
    agentUrl: data?.url,
    onAgentEvent: async (event) => {
      if (event.type === "transcription") {
        await append({
          role: "system",
          content: event.transcription,
        });
      }

      if (event.type === "audio") {
        handleAudioChunk({
          audioBase64: event.audioBase64,
          eventId: event.eventId,
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
      const { facialExpression, animation, audioBase64, text } = await trigger({
        message,
      });

      if (error) {
        console.error("[tts]", error);
        return;
      }

      handleAudioChunk({
        audioBase64: audioBase64,
      });

      await append({
        role: "system",
        content: text,
      });
    },
    [append, error, messages, setMessages, trigger]
  );

  return (
    <SpeechContext.Provider
      value={{
        isLoading: isMutating,
        tts,
        isSpeaking,
        facialExpression,
        phonemes,
        animation,
        chatMessages: messages,
        startConversation,
        stopConversation,
        hasConversationStarted: status === "connected",
        currentTime,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};
