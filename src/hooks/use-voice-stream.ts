import { useRef, useCallback, useEffect } from "react";

type UseVoiceStreamOptions = {
  onStartStreaming?: () => void;
  onStopStreaming?: () => void;
  onAudioChunked?: (chunkBase64: string) => void;
};

const downsampleBuffer = (
  buffer: Float32Array,
  sampleRate: number,
  outSampleRate: number,
): Int16Array => {
  if (outSampleRate === sampleRate) {
    const result = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return result;
  }
  const sampleRateRatio = sampleRate / outSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Int16Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < newLength) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    const avg = accum / count;
    const s = Math.max(-1, Math.min(1, avg));
    result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7fff;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
};

const int16ArrayToBase64 = (buffer: Int16Array): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer.buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const threshold = 0.01;
const targetSampleRate = 16000;
const bufferSize = 4096;

export const useVoiceStream = (options: UseVoiceStreamOptions) => {
  const { onStartStreaming, onStopStreaming, onAudioChunked } = options;

  const audioContextRef = useRef<AudioContext>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode>(null);
  const isStreamingRef = useRef<boolean>(false);

  const startStreaming = useCallback(async () => {
    if (isStreamingRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      const sampleRate = audioContext.sampleRate;

      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      const scriptProcessor = audioContext.createScriptProcessor(
        bufferSize,
        1,
        1,
      );
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (
        audioProcessingEvent: AudioProcessingEvent,
      ) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const channelData = inputBuffer.getChannelData(0);

        // Compute RMS (root mean square) to detect voice activity.
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sum / channelData.length);

        // If the sound level is below the threshold, treat it as silence.
        if (rms < threshold) {
          return;
        }

        // Downsample the audio buffer to 16kHz and convert to PCM 16-bit.
        const downsampledBuffer = downsampleBuffer(
          channelData,
          sampleRate,
          targetSampleRate,
        );
        // Convert the PCM data to a base64 string.
        const base64Data = int16ArrayToBase64(downsampledBuffer);

        // Invoke the callback with the chunk.
        if (onAudioChunked) {
          onAudioChunked(base64Data);
        }
      };

      // Connect the source to the processor and then to the destination.
      sourceNode.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      isStreamingRef.current = true;
      if (onStartStreaming) {
        onStartStreaming();
      }
    } catch (error) {
      console.error("Error starting voice stream:", error);
    }
  }, [onStartStreaming, onAudioChunked]);

  // Stop streaming and clean up all audio nodes and media tracks.
  const stopStreaming = useCallback(() => {
    if (!isStreamingRef.current) return;

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    isStreamingRef.current = false;

    if (onStopStreaming) {
      onStopStreaming();
    }
  }, [onStopStreaming]);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    startStreaming,
    stopStreaming,
  };
};
