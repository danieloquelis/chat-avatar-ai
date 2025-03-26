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

type UsePcmPlayerOptions = {
  onAudioPlaying?: () => void;
  onAudioPlayed?: () => void;
};

export const usePcmPlayer = (options: UsePcmPlayerOptions = {}) => {
  const { onAudioPlaying, onAudioPlayed } = options;

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const queue = useRef<string[]>([]);
  const isProcessing = useRef(false);
  const currentSource = useRef<AudioBufferSourceNode | null>(null);

  // Store the total duration of the current PCM chunk (in seconds).
  const [chunkDuration, setChunkDuration] = useState(0);

  // Store how far along the current chunk we are in playback (in seconds).
  const [currentTime, setCurrentTime] = useState(0);

  // Remember when the current chunk started playing.
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const context = new window.AudioContext({ sampleRate: 16000 });
    setAudioContext(context);

    // Close the context on unmount (optional).
    return () => {
      context.close();
    };
  }, []);

  /**
   * Poll the currentTime at a fixed interval if we're playing something.
   */
  useEffect(() => {
    if (!isPlaying || !audioContext || startTimeRef.current == null) {
      return;
    }

    const updateInterval = setInterval(() => {
      if (!audioContext || startTimeRef.current == null) return;
      const elapsed = audioContext.currentTime - startTimeRef.current;
      setCurrentTime(Math.min(elapsed, chunkDuration));
    }, 100); // update every 100 ms

    return () => clearInterval(updateInterval);
  }, [isPlaying, audioContext, chunkDuration]);

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
      audioBuffer.byteLength / 2, // 16-bit => 2 bytes
      16000
    );
    const dataView = new DataView(audioBuffer);
    const float32Array = buffer.getChannelData(0);

    for (let i = 0; i < float32Array.length; i++) {
      float32Array[i] = dataView.getInt16(i * 2, true) / 32768.0;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    // Keep a reference to the source so we can stop it if needed.
    currentSource.current = source;

    // Set durations for the chunk
    setChunkDuration(buffer.duration);
    setCurrentTime(0);

    // Mark the start time
    startTimeRef.current = audioContext.currentTime;

    // Start playback
    source.start();
    setIsPlaying(true);
    onAudioPlaying?.();

    source.onended = () => {
      setIsPlaying(false);

      // Reset
      startTimeRef.current = null;
      setCurrentTime(0);
      setChunkDuration(0);

      currentSource.current = null;
      isProcessing.current = false;
      onAudioPlayed?.();

      // Process next chunk
      processQueue();
    };
  }, [audioContext, onAudioPlaying, onAudioPlayed]);

  const playAudio = useCallback(
    (base64Audio: string) => {
      queue.current.push(base64Audio);
      if (!isProcessing.current) {
        processQueue();
      }
    },
    [processQueue]
  );

  const stopAudio = useCallback(() => {
    // Clear the queue and any ongoing playback
    queue.current = [];
    isProcessing.current = false;
    setIsPlaying(false);

    startTimeRef.current = null;
    setCurrentTime(0);
    setChunkDuration(0);

    if (currentSource.current) {
      currentSource.current.stop();
      currentSource.current.disconnect();
      currentSource.current = null;
    }

    onAudioPlayed?.();
  }, [onAudioPlayed]);

  return {
    playAudio,
    stopAudio,
    isPlaying,
    chunkDuration,
    currentTime,
  };
};
