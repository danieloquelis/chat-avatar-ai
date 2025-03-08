"use client";

import { FC, PropsWithChildren, useCallback, useState } from "react";
import { SpeechContext } from "./speech-context";
import { TTSApiResponse, useTTSApi } from "@/api/tts-api";

export const SpeechProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [message, setMessage] = useState<TTSApiResponse | undefined>();
  const { trigger, isMutating } = useTTSApi();

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
