import { useEffect, useState, useCallback, useRef } from "react";

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
  const queue = useRef<string[]>([]);
  const isProcessing = useRef<boolean>(false);
  const currentSource = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const context = new window.AudioContext({ sampleRate: 16000 });
    setAudioContext(context);
  }, []);

  const processQueue = useCallback(() => {
    if (isProcessing.current || !audioContext || queue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    const base64Audio = queue.current.shift();
    if (!base64Audio) {
      isProcessing.current = false;
      return;
    }

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
    currentSource.current = source;
    source.start();
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
      isProcessing.current = false;
      processQueue(); // Play next audio in queue
    };
  }, [audioContext]);

  const playAudio = useCallback(
    (base64Audio: string) => {
      queue.current.push(base64Audio);
      if (!isProcessing.current) {
        processQueue();
      }
    },
    [processQueue],
  );

  const clearStream = useCallback(() => {
    queue.current = [];
    isProcessing.current = false;
    setIsPlaying(false);
    if (currentSource.current) {
      currentSource.current.stop();
      currentSource.current.disconnect();
      currentSource.current = null;
    }
  }, []);

  return { playAudio, isPlaying, clearStream };
};
