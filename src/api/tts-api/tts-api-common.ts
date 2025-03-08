import { Phoneme } from "@/service/rhubarb";

export type TTSApiResponse = {
  text: string;
  facialExpression:
    | "smile"
    | "sad"
    | "angry"
    | "surprised"
    | "funnyFace"
    | "default";
  animation:
    | "Idle"
    | "TalkingOne"
    | "TalkingThree"
    | "SadIdle"
    | "Defeated"
    | "Angry"
    | "Surprised"
    | "DismissingGesture"
    | "ThoughtfulHeadShake";
  audio: string;
  phonemes: Phoneme;
};

export type TTSApiRequest = {
  message: string;
};
