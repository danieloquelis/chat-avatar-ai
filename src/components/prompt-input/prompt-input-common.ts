import { FormEvent } from "react";

export type PromptInputProps = {
  isDisabled: boolean;
  hasConversationStarted: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
