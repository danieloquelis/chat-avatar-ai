"use client";

import { FC, PropsWithChildren, useCallback, useState } from "react";
import { SpeechContext } from "./speech-context";
import { useTTSApi } from "@/api/tts-api";
import { Phoneme } from "@/service/rhubarb";
import { FacialExpression } from "@/constants/facial-expressions";
import { AvatarAnimationType } from "@/components/avatar";

export const SpeechProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [audioBase64, setAudioAudioBase64] = useState<string>();
  const [phonemes, setPhonemes] = useState<Phoneme | undefined>();
  const [animation, setAnimation] = useState<AvatarAnimationType>("Idle");
  const [facialExpression, setFacialExpression] =
    useState<FacialExpression>("default");

  const { trigger, isMutating } = useTTSApi();

  const tts = useCallback(
    async (message: string) => {
      const { facialExpression, phonemes, animation, audio } = await trigger({
        message,
      });

      setFacialExpression(facialExpression);
      setPhonemes(phonemes);
      setAnimation(animation);
      setAudioAudioBase64(audio);
    },
    [trigger],
  );

  const onMessagePlayed = useCallback(() => {
    setAnimation("Idle");
    setPhonemes(undefined);
    setFacialExpression("default");
    setAudioAudioBase64(undefined);
  }, []);

  return (
    <SpeechContext.Provider
      value={{
        isLoading: isMutating,
        tts,
        onMessagePlayed,
        facialExpression,
        phonemes,
        animation,
        audioBase64,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};
