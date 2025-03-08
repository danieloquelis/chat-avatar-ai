export type GetPhonemesOptions = {
  audioFilePath: string;
  audioFileName: string;
};

export type Phoneme = {
  metadata: {
    soundFile: string;
    duration: number;
  };
  mouthCues: { start: number; end: number; value: string }[];
};
