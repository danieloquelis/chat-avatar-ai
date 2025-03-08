import { FormEvent } from "react";

export type PromptInputProps = {
  isLoading: boolean;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
