"use client";

import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { SpeechContext } from "./speech-context";

export const SpeechProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const chunksRef = useRef<BlobPart[]>([]);

  const sendAudioData = async (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      setIsLoading(true);
      if (typeof reader.result !== "string") {
        return;
      }
      const base64Audio = reader.result.split(",")[1] || "";
      const response = await fetch(`/api/sts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      const json = await response.json();
      setMessages((messages) => [...messages, ...json.messages]);
      setIsLoading(true);
    };
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const getUserMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newMediaRecorder = new MediaRecorder(stream);
      newMediaRecorder.onstart = () => {
        chunksRef.current = [];
      };
      newMediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      newMediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          await sendAudioData(audioBlob);
        } catch (error) {
          console.error(error);
        }
      };
      setMediaRecorder(newMediaRecorder);
    };

    getUserMedia();
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaRecorder) return;
    mediaRecorder.start();
    setIsRecording(true);
  }, [mediaRecorder]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setIsRecording(false);
  }, [mediaRecorder]);

  const tts = useCallback(async (message: string) => {
    setIsLoading(true);

    const data = await fetch(`/api/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const response = (await data.json()).messages;

    setMessages((messages) => [...messages, ...response]);
    setIsLoading(false);
  }, []);

  const onMessagePlayed = useCallback(() => {
    setMessages((messages) => messages.slice(1));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(undefined);
    }
  }, [messages]);

  return (
    <SpeechContext.Provider
      value={{
        isLoading,
        isRecording,
        startRecording,
        stopRecording,
        tts,
        onMessagePlayed,
        message,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};
