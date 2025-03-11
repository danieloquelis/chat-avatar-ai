import { FormEvent } from "react";

export type PromptInputProps = {
  isDisabled: boolean;
  isConversationStarted: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
