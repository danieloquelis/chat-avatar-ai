import { useMutation } from "@/hooks/use-mutation";
import { TTSApiRequest, TTSApiResponse } from "./tts-api-common";

export const useTTSApi = () => {
  return useMutation<TTSApiResponse, TTSApiRequest>(
    "/api/text-to-speech",
    "POST",
  );
};
