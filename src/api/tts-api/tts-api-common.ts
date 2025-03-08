import { Phoneme } from "@/service/rhubarb";
import { FacialExpression } from "@/constants/facial-expressions";

export type TTSApiResponse = {
  text: string;
  facialExpression: FacialExpression;
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
