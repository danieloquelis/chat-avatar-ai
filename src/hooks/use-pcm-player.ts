import { useEffect, useState, useCallback } from "react";

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const usePcmPlayer = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const context = new window.AudioContext({
      sampleRate: 16000,
    });
    setAudioContext(context);
  }, []);

  const playAudio = useCallback(
    (base64Audio: string) => {
      if (!audioContext || !base64Audio) return;

      const audioBuffer = base64ToArrayBuffer(base64Audio);
      const buffer = audioContext.createBuffer(
        1,
        audioBuffer.byteLength / 2,
        16000,
      );
      const dataView = new DataView(audioBuffer);
      const float32Array = buffer.getChannelData(0);

      for (let i = 0; i < float32Array.length; i++) {
        float32Array[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
      setIsPlaying(true);

      source.onended = () => {
        setIsPlaying(false);
      };
    },
    [audioContext],
  );

  return { playAudio, isPlaying };
};
