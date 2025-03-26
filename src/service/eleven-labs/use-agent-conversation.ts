"use client";

import {
  AgentConversationStatus,
  ElevenLabsWebSocketEvent,
  ElevenLabsWebSocketRequest,
  UseAgentConversationOptions,
} from "@/service/eleven-labs/eleven-labs-common";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePcmPlayer } from "@/hooks/use-pcm-player";
import { ElevenLabs } from "./eleven-labs";
import { useVoiceStream } from "voice-stream";

const sendMessage = (
  websocket: WebSocket,
  request: ElevenLabsWebSocketRequest
) => {
  if (websocket.readyState !== WebSocket.OPEN) {
    return;
  }
  websocket.send(JSON.stringify(request));
};

export const useAgentConversation = (options: UseAgentConversationOptions) => {
  const {
    agentId,
    agentUrl,
    onConnected,
    onUserEvent,
    onAgentEvent,
    onClosed,
  } = options;
  const websocketRef = useRef<WebSocket>(null);
  const eventIdRef = useRef<number>(null);
  const [status, setStatus] = useState<AgentConversationStatus>("disconnected");
  const { playAudio, isPlaying, stopAudio } = usePcmPlayer();
  const { startStreaming, stopStreaming } = useVoiceStream({
    onAudioChunked: (audioData) => {
      if (!websocketRef.current) return;

      sendMessage(websocketRef.current, {
        user_audio_chunk: audioData,
      });
    },
  });

  const startConversation = useCallback(async () => {
    if (status === "connected") return;

    const websocketUrl =
      agentUrl ??
      (await ElevenLabs.getAgentWebsocketUrl(
        agentId ?? process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID!
      ));

    const websocket = new WebSocket(websocketUrl);

    websocket.onopen = async () => {
      setStatus("connected");
      console.info("[AgentWebsocket]", "Connection opened...");
      sendMessage(websocket, {
        type: "conversation_initiation_client_data",
      });
      await startStreaming();
      if (!!onConnected) await onConnected();
    };

    websocket.onmessage = async (event) => {
      const data = JSON.parse(event.data) as ElevenLabsWebSocketEvent;

      if (data.type === "ping") {
        setTimeout(() => {
          sendMessage(websocket, {
            type: "pong",
            event_id: data.ping_event.event_id,
          });
        }, data.ping_event.ping_ms);
      }

      if (data.type === "user_transcript" && onUserEvent) {
        const { user_transcription_event } = data;
        await onUserEvent({
          transcription: user_transcription_event.user_transcript,
        });
      }

      if (data.type === "agent_response" && onAgentEvent) {
        const { agent_response_event } = data;
        await onAgentEvent({
          type: "transcription",
          transcription: agent_response_event.agent_response,
        });
      }

      if (data.type === "interruption") {
        stopAudio();
      }

      if (data.type === "audio") {
        const { audio_event } = data;

        eventIdRef.current = audio_event.event_id;
        playAudio(audio_event.audio_base_64);

        if (onAgentEvent) {
          await onAgentEvent({
            type: "audio",
            audioBase64: audio_event.audio_base_64,
          });
        }
      }
    };

    websocketRef.current = websocket;

    websocket.onclose = async () => {
      websocketRef.current = null;
      setStatus("disconnected");
      console.info("[AgentWebsocket]", "Connection closed...");
      stopStreaming();
      stopAudio();
      if (!!onClosed) await onClosed();
    };
  }, [
    stopAudio,
    onAgentEvent,
    onClosed,
    onConnected,
    onUserEvent,
    playAudio,
    startStreaming,
    status,
    stopStreaming,
  ]);

  const stopConversation = useCallback(async () => {
    if (!websocketRef.current) return;
    setStatus("disconnecting");
    websocketRef.current.close();
  }, []);

  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  return {
    startConversation,
    stopConversation,
    status,
    isListening: !isPlaying,
  };
};
