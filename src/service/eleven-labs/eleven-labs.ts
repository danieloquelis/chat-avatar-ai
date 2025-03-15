import { ElevenLabsClient } from "elevenlabs";
import { ConvertTextToSpeechOptions } from "./eleven-labs-common";

const getClient = () => {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    throw new Error("[getClient] Cannot find api key");
  }
  return new ElevenLabsClient({
    apiKey,
  });
};

const convertTextToSpeech = async (options: ConvertTextToSpeechOptions) => {
  const { text } = options;
  const voiceId = process.env.ELVEN_LABS_VOICE_ID;
  if (!voiceId) {
    throw new Error("[convertTextToSpeech] Cannot find voiceId");
  }

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

const getAgentWebsocketUrl = async (agentId: string) => {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    throw new Error("[getAgentWebsocketUrl] Cannot find api key");
  }

  const url = `${process.env.ELEVEN_LABS_SIGNED_WEBSOCKET_URL}?agent_id=${agentId}`;
  const response = await fetch(url, {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error("[getAgentWebsocketUrl] Cannot get signed url");
  }

  const { signed_url } = await response.json();

  return signed_url as string;
};

export const ElevenLabs = {
  convertTextToSpeech,
  getAgentWebsocketUrl,
};
