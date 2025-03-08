"use client";

import { FC, PropsWithChildren, useCallback, useState } from "react";
import { SpeechContext } from "./speech-context";
import { useMutation } from "@/hooks/use-mutation";
import { Phoneme } from "@/service/rhubarb";

export type TTSResponse = {
  text: string;
  facialExpression:
    | "smile"
    | "sad"
    | "angry"
    | "surprised"
    | "funnyFace"
    | "default";
  animation:
    | "Idle"
    | "TalkingOne"
    | "TalkingThree"
    | "SadIdle"
    | "Defeated"
    | "Angry"
    | "Surprised"
    | "DismissingGesture"
    | "ThoughtfulHeadShake";
  audio: string;
  phonemes: Phoneme;
};

type TTSRequest = {
  message: string;
};

export const SpeechProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [message, setMessage] = useState<TTSResponse | undefined>();
  const { trigger, isMutating } = useMutation<TTSResponse, TTSRequest>(
    "/api/tts",
    "POST",
  );

  const tts = useCallback(
    async (message: string) => {
      const data = await trigger({
        message,
      });

      setMessage(data);
    },
    [trigger],
  );

  const onMessagePlayed = useCallback(() => {
    setMessage(undefined);
  }, []);

  return (
    <SpeechContext.Provider
      value={{
        isLoading: isMutating,
        tts,
        onMessagePlayed,
        message,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};
