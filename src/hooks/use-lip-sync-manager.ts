import { useState, useRef, useCallback } from "react";
import { Phoneme } from "@/service/rhubarb";
import { AvatarAnimationType } from "@/components/avatar";
import { FacialExpression } from "@/constants/facial-expressions";
import { usePcmPlayer } from "./use-pcm-player";

type PlaybackItem = {
  audioBase64: string;
  mouthCuesPromise: Promise<Phoneme>;
  sequence: number;
  timestamp: number;
};

type ProcessedItem = {
  audioBase64: string;
  mouthCues: Phoneme;
  sequence: number;
  timestamp: number;
};

type HandleAudioChunkOptions = {
  eventId?: number;
  audioBase64: string;
};

const BUFFER_WINDOW_MS = 1000; // 1 second buffer window
const MAX_BUFFER_SIZE = 5; // Maximum number of chunks to buffer
const PARALLEL_PROCESSING_LIMIT = 2; // Number of chunks to process in parallel

export function useLipSyncManager() {
  const processingQueueRef = useRef<PlaybackItem[]>([]);
  const readyQueueRef = useRef<ProcessedItem[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const firstChunkTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isFirstChunkRef = useRef<boolean>(true);
  const currentEventIdRef = useRef<number | undefined>(undefined);
  const sequenceRef = useRef<number>(0);
  const lastPlayedSequenceRef = useRef<number>(-1);
  const activeProcessesRef = useRef<number>(0);
  const expectedChunksRef = useRef<number>(0); // New counter for expected chunks

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [phonemes, setPhonemes] = useState<Phoneme>();
  const [animation, setAnimation] = useState<AvatarAnimationType>("Idle");
  const [facialExpression, setFacialExpression] =
    useState<FacialExpression>("default");

  const { playAudio, currentTime } = usePcmPlayer({
    onAudioPlayed: () => {
      setFacialExpression("default");
      setPhonemes(undefined);
      setAnimation("Idle");
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

  const processChunk = useCallback(async (item: PlaybackItem) => {
    try {
      console.log("[LipSync] Starting to process chunk:", {
        sequence: item.sequence,
      });
      const mouthCues = await item.mouthCuesPromise;
      readyQueueRef.current.push({
        audioBase64: item.audioBase64,
        mouthCues,
        sequence: item.sequence,
        timestamp: item.timestamp,
      });

      console.log("[LipSync] Chunk processed and added to ready queue:", {
        sequence: item.sequence,
        readyQueueLength: readyQueueRef.current.length,
        expectedChunks: expectedChunksRef.current,
      });

      // Sort ready queue by sequence number
      readyQueueRef.current.sort((a, b) => a.sequence - b.sequence);

      // If we have enough chunks or enough time has passed, start playback
      const now = Date.now();
      const oldestChunk = readyQueueRef.current[0];
      const timeSinceOldest = now - oldestChunk.timestamp;

      console.log("[LipSync] Checking playback conditions:", {
        readyQueueLength: readyQueueRef.current.length,
        expectedChunks: expectedChunksRef.current,
        timeSinceOldest,
        bufferWindow: BUFFER_WINDOW_MS,
      });

      // If this is the first chunk and we know it's the only one coming, or we have enough chunks, or enough time has passed
      if (
        (readyQueueRef.current.length === 1 &&
          expectedChunksRef.current === 1) || // Single chunk case
        readyQueueRef.current.length >= 2 ||
        timeSinceOldest >= BUFFER_WINDOW_MS
      ) {
        console.log("[LipSync] Playback conditions met, starting playback");
        if (firstChunkTimeoutRef.current) {
          clearTimeout(firstChunkTimeoutRef.current);
        }
        maybeStartNextPlayback();
      }
    } catch (error) {
      console.error("[LipSync] Error processing chunk:", error);
    } finally {
      activeProcessesRef.current--;
      console.log("[LipSync] Chunk processing completed:", {
        sequence: item.sequence,
        activeProcesses: activeProcessesRef.current,
        processingQueueLength: processingQueueRef.current.length,
        expectedChunks: expectedChunksRef.current,
      });
      // Try to process more chunks if we have capacity
      if (
        processingQueueRef.current.length > 0 &&
        activeProcessesRef.current < PARALLEL_PROCESSING_LIMIT
      ) {
        processNextChunk();
      }
    }
  }, []);

  const processNextChunk = useCallback(async () => {
    if (
      processingQueueRef.current.length === 0 ||
      activeProcessesRef.current >= PARALLEL_PROCESSING_LIMIT
    ) {
      console.log("[LipSync] Skipping processNextChunk:", {
        queueEmpty: processingQueueRef.current.length === 0,
        activeProcesses: activeProcessesRef.current,
        parallelLimit: PARALLEL_PROCESSING_LIMIT,
      });
      return;
    }

    const nextItem = processingQueueRef.current.shift()!;
    activeProcessesRef.current++;

    console.log("[LipSync] Processing next chunk:", {
      sequence: nextItem.sequence,
      activeProcesses: activeProcessesRef.current,
      isFirstChunk: isFirstChunkRef.current,
    });

    // If this is the first chunk, start a timeout to wait for the second chunk
    if (isFirstChunkRef.current) {
      isFirstChunkRef.current = false;
      console.log("[LipSync] Setting first chunk timeout");
      firstChunkTimeoutRef.current = setTimeout(() => {
        console.log("[LipSync] First chunk timeout triggered");
        if (readyQueueRef.current.length === 1) {
          maybeStartNextPlayback();
        }
      }, 500);
    }

    // Start processing the chunk
    processChunk(nextItem);
  }, [processChunk]);

  const maybeStartNextPlayback = useCallback(async () => {
    if (isPlayingRef.current || readyQueueRef.current.length === 0) {
      console.log("[LipSync] Skipping playback:", {
        isPlaying: isPlayingRef.current,
        readyQueueLength: readyQueueRef.current.length,
      });
      return;
    }

    // Check if the next chunk is in sequence
    const nextItem = readyQueueRef.current[0];
    if (nextItem.sequence !== lastPlayedSequenceRef.current + 1) {
      console.log("[LipSync] Sequence mismatch:", {
        expected: lastPlayedSequenceRef.current + 1,
        actual: nextItem.sequence,
      });
      // If we're not playing and have a gap, try to process more chunks
      if (!isPlayingRef.current && processingQueueRef.current.length > 0) {
        processNextChunk();
      }
      return;
    }

    isPlayingRef.current = true;

    try {
      const { audioBase64, mouthCues, sequence } =
        readyQueueRef.current.shift()!;
      lastPlayedSequenceRef.current = sequence;

      console.log("[LipSync] Starting playback:", { sequence });

      setFacialExpression("smile");
      setPhonemes(mouthCues);
      setAnimation("TalkingTwo");

      // Start processing next chunk while playing current one
      if (
        processingQueueRef.current.length > 0 &&
        activeProcessesRef.current < PARALLEL_PROCESSING_LIMIT
      ) {
        processNextChunk();
      }

      await playAudio(audioBase64);
    } catch (error) {
      console.error("[LipSync] Error playing audio:", error);
      isPlayingRef.current = false;
    }
  }, [playAudio, processNextChunk]);

  const handleAudioChunk = useCallback(
    (options: HandleAudioChunkOptions) => {
      const { eventId, audioBase64 } = options;
      console.log("[LipSync] Received chunk:", {
        eventId,
        sequence: sequenceRef.current,
      });

      // Clear queues if eventId is undefined or different from current
      if (eventId === undefined || eventId !== currentEventIdRef.current) {
        console.log("[LipSync] New event ID detected, clearing queues:", {
          oldEventId: currentEventIdRef.current,
          newEventId: eventId,
        });
        processingQueueRef.current = [];
        readyQueueRef.current = [];
        if (firstChunkTimeoutRef.current) {
          clearTimeout(firstChunkTimeoutRef.current);
        }
        isFirstChunkRef.current = true;
        currentEventIdRef.current = eventId;
        sequenceRef.current = 0;
        lastPlayedSequenceRef.current = -1;
        activeProcessesRef.current = 0;
        expectedChunksRef.current = 0; // Reset expected chunks counter
      }

      // Skip if we have too many chunks in buffer
      if (readyQueueRef.current.length >= MAX_BUFFER_SIZE) {
        console.warn("[LipSync] Buffer full, dropping chunk");
        return;
      }

      expectedChunksRef.current++; // Increment expected chunks counter

      console.log("[LipSync] Starting lip sync API call");
      const mouthCuesPromise = fetch("/api/lip-sync", {
        method: "POST",
        body: JSON.stringify({ audioPayload: audioBase64 }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("[LipSync] Received mouth cues from API");
          return data.mouthCues as Phoneme;
        });

      processingQueueRef.current.push({
        audioBase64,
        mouthCuesPromise,
        sequence: sequenceRef.current++,
        timestamp: Date.now(),
      });

      console.log("[LipSync] Added to processing queue:", {
        queueLength: processingQueueRef.current.length,
        activeProcesses: activeProcessesRef.current,
        parallelLimit: PARALLEL_PROCESSING_LIMIT,
        expectedChunks: expectedChunksRef.current,
      });

      // Start processing if we have capacity
      if (activeProcessesRef.current < PARALLEL_PROCESSING_LIMIT) {
        processNextChunk();
      }
    },
    [processNextChunk]
  );

  return {
    handleAudioChunk,
    phonemes,
    facialExpression,
    animation,
    isSpeaking,
    currentTime,
  };
}
