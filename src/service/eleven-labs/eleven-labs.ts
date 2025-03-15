"use client";
import { ElevenLabsClient } from "elevenlabs";
import {
  AgentConversationStatus,
  ConvertTextToSpeechOptions,
  ElevenLabsWebSocketEvent,
  ElevenLabsWebSocketRequest,
  UseAgentConversationOptions,
} from "./eleven-labs-common";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceStream } from "@/hooks/use-voice-stream";
import { usePcmPlayer } from "@/hooks/use-pcm-player";

const getClient = () => {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  return new ElevenLabsClient({
    apiKey,
  });
};

const convertTextToSpeech = async (options: ConvertTextToSpeechOptions) => {
  const { text } = options;
  const voiceId = process.env.ELVEN_LABS_VOICE_ID!;
  return getClient().textToSpeech.convertAsStream(voiceId, {
    text,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 1,
      use_speaker_boost: true,
    },
  });
};

const sendMessage = (
  websocket: WebSocket,
  request: ElevenLabsWebSocketRequest,
) => {
  websocket.send(JSON.stringify(request));
};

const getAgentWebsocketUrl = (agentId: string) => {
  const agentWebsocketUrl = process.env.ELEVEN_LABS_AGENT_WEBSOCKET_URL;
  if (!agentWebsocketUrl) {
    throw new Error("[getAgentWebsocketUrl] Cannot find websocket url");
  }
  return agentWebsocketUrl + `?agent_id=${agentId}`;
};

const useAgentConversation = (options: UseAgentConversationOptions) => {
  const { agentId, onConnected, onUserEvent, onAgentEvent, onClosed } = options;
  const websocketRef = useRef<WebSocket>(null);
  const eventIdRef = useRef<number>(null);
  const [status, setStatus] = useState<AgentConversationStatus>("disconnected");
  const { playAudio, isPlaying, clearStream } = usePcmPlayer();
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

    const websocketUrl = getAgentWebsocketUrl(agentId);
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
        clearStream();
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
      clearStream();
      if (!!onClosed) await onClosed();
    };
  }, [
    agentId,
    clearStream,
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

export const ElevenLabs = {
  convertTextToSpeech,
  useAgentConversation,
};
