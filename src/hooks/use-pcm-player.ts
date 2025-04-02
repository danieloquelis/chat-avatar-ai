import { useEffect, useRef, useState, useCallback } from "react";

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

type UsePcmPlayerOptions = {
  onAudioPlaying?: () => void;
  onAudioPlayed?: () => void;
};

export const usePcmPlayer = (options: UsePcmPlayerOptions = {}) => {
  const { onAudioPlaying, onAudioPlayed } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [chunkDuration, setChunkDuration] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const context = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = context;

    return () => {
      context.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const playAudio = useCallback(
    async (base64Audio: string): Promise<void> => {
      const context = audioContextRef.current;
      if (!context) return;

      const audioBuffer = base64ToArrayBuffer(base64Audio);
      const buffer = context.createBuffer(1, audioBuffer.byteLength / 2, 16000);
      const dataView = new DataView(audioBuffer);
      const float32Array = buffer.getChannelData(0);

      for (let i = 0; i < float32Array.length; i++) {
        float32Array[i] = dataView.getInt16(i * 2, true) / 32768;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      sourceRef.current = source;

      setChunkDuration(buffer.duration);
      setCurrentTime(0);
      startTimeRef.current = context.currentTime;
      setIsPlaying(true);
      onAudioPlaying?.();

      source.start();

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current != null && audioContextRef.current) {
          const elapsed =
            audioContextRef.current.currentTime - startTimeRef.current;
          setCurrentTime(Math.min(elapsed, buffer.duration));
        }
      }, 100);

      return new Promise<void>((resolve) => {
        source.onended = () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          setIsPlaying(false);
          setCurrentTime(0);
          setChunkDuration(0);
          startTimeRef.current = null;
          sourceRef.current = null;

          onAudioPlayed?.();
          resolve();
        };
      });
    },
    [onAudioPlaying, onAudioPlayed]
  );

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setChunkDuration(0);
    startTimeRef.current = null;

    onAudioPlayed?.();
  }, [onAudioPlayed]);

  return {
    playAudio,
    stopAudio,
    isPlaying,
    currentTime,
    chunkDuration,
  };
};
