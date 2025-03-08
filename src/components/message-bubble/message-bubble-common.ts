export type MessageBubbleProps = {
  message: {
    role: "user" | "assistant" | string;
    content: string;
  };
};
