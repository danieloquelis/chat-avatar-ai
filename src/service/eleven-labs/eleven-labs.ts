import { ElevenLabsClient } from "elevenlabs";
import { ConvertTextToSpeechOptions } from "./eleven-labs-common";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
});

const convertTextToSpeech = async (options: ConvertTextToSpeechOptions) => {
  const { text } = options;
  const voiceId = process.env.ELVEN_LABS_VOICE_ID!;
  return client.textToSpeech.convertAsStream(voiceId, {
    text,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 1,
      use_speaker_boost: true,
    },
  });
};

export const ElevenLabs = {
  convertTextToSpeech,
};
