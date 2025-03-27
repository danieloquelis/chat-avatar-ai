import { useState, useRef, useCallback } from "react";
import { Phoneme } from "@/service/rhubarb";
import { AvatarAnimationType } from "@/components/avatar";
import { FacialExpression } from "@/constants/facial-expressions";
import { usePcmPlayer } from "./use-pcm-player";

type PlaybackItem = {
  audioBase64: string;
  mouthCuesPromise: Promise<Phoneme>;
  order: number;
};

type ProcessedItem = {
  audioBase64: string;
  mouthCues: Phoneme;
  order: number;
};

type HandleAudioChunkOptions = {
  eventId?: number;
  audioBase64: string;
};

export function useLipSyncManager() {
  const processingQueueRef = useRef<PlaybackItem[]>([]);
  const readyQueueRef = useRef<ProcessedItem[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const firstChunkTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isFirstChunkRef = useRef<boolean>(true);
  const currentEventIdRef = useRef<number | undefined>(undefined);
  const chunkOrderRef = useRef<number>(0);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [phonemes, setPhonemes] = useState<Phoneme>();
  const [animation, setAnimation] = useState<AvatarAnimationType>("Idle");
  const [facialExpression, setFacialExpression] =
    useState<FacialExpression>("default");
  const [audioBase64, setAudioBase64] = useState<string>();

  const { playAudio, isPlaying, stopAudio, currentTime } = usePcmPlayer({
    onAudioPlayed: () => {
      setFacialExpression("default");
      setPhonemes(undefined);
      setAnimation("Idle");
      setAudioBase64(undefined);
      setIsSpeaking(false);
      isPlayingRef.current = false;

      // Try to play next chunk if available
      if (readyQueueRef.current.length > 0) {
        maybeStartNextPlayback();
      }
    },
    onAudioPlaying: () => {
      setIsSpeaking(true);
    },
  });

  const processNextChunk = useCallback(async () => {
    if (processingQueueRef.current.length === 0) return;

    const nextItem = processingQueueRef.current.shift()!;
    const { audioBase64, mouthCuesPromise, order } = nextItem;

    try {
      const mouthCues = await mouthCuesPromise;
      readyQueueRef.current.push({ audioBase64, mouthCues, order });

      // Sort ready queue by order
      readyQueueRef.current.sort((a, b) => a.order - b.order);

      // If this is the first chunk, start a timeout to wait for the second chunk
      if (isFirstChunkRef.current) {
        isFirstChunkRef.current = false;
        firstChunkTimeoutRef.current = setTimeout(() => {
          // If we still only have one chunk after 1 second, play it
          if (readyQueueRef.current.length === 1) {
            maybeStartNextPlayback();
          }
        }, 500);
      }

      // If we have at least 2 chunks ready, start playback
      if (readyQueueRef.current.length >= 2) {
        if (firstChunkTimeoutRef.current) {
          clearTimeout(firstChunkTimeoutRef.current);
        }
        maybeStartNextPlayback();
      }
    } catch (error) {
      console.error("Error processing chunk:", error);
    }

    // Process next chunk if available
    if (processingQueueRef.current.length > 0) {
      processNextChunk();
    }
  }, []);

  const handleAudioChunk = useCallback(
    (options: HandleAudioChunkOptions) => {
      const { eventId, audioBase64 } = options;

      // Clear queues if eventId is undefined or different from current
      if (eventId === undefined || eventId !== currentEventIdRef.current) {
        processingQueueRef.current = [];
        readyQueueRef.current = [];
        if (firstChunkTimeoutRef.current) {
          clearTimeout(firstChunkTimeoutRef.current);
        }
        isFirstChunkRef.current = true;
        currentEventIdRef.current = eventId;
        chunkOrderRef.current = 0; // Reset order counter
      }

      const mouthCuesPromise = fetch("/api/lip-sync", {
        method: "POST",
        body: JSON.stringify({ audioPayload: audioBase64 }),
      })
        .then((res) => res.json())
        .then((data) => data.mouthCues as Phoneme);

      processingQueueRef.current.push({
        audioBase64,
        mouthCuesPromise,
        order: chunkOrderRef.current++,
      });

      // Start processing if not already processing
      if (processingQueueRef.current.length === 1) {
        processNextChunk();
      }
    },
    [processNextChunk]
  );

  const maybeStartNextPlayback = useCallback(async () => {
    if (isPlayingRef.current || readyQueueRef.current.length === 0) return;
    isPlayingRef.current = true;

    try {
      const nextItem = readyQueueRef.current.shift()!;
      const { audioBase64, mouthCues } = nextItem;

      setFacialExpression("smile");
      setPhonemes(mouthCues);
      setAnimation("TalkingTwo");
      setAudioBase64(audioBase64);

      await playAudio(audioBase64);
    } catch (error) {
      console.error("Error playing audio:", error);
      isPlayingRef.current = false;
    }
  }, [playAudio]);

  return {
    handleAudioChunk,
    phonemes,
    facialExpression,
    animation,
    isSpeaking,
    currentTime,
  };
}
