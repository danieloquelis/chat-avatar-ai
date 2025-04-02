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
  audioBase64: string;
};

export type TTSApiRequest = {
  message: string;
};
