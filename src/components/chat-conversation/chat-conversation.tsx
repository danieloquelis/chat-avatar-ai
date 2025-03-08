import { FC } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { ChatConversationProps } from "./chat-conversation-common";
import { FadingContainer } from "@/components/ui/fading-container";

export const ChatConversation: FC<ChatConversationProps> = (props) => {
  const {} = props;
  return (
    <div className="relative w-full max-w-xl mx-auto flex-1">
      <div className="flex flex-col p-4 pb-2 min-h-full justify-end">
        <FadingContainer>
          <div className="max-h-80 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar hover:scrollbar-thumb-primary/40 scrollbar-thumb-transparent scrollbar-track-transparent">
            <MessageBubble
              message={{ role: "user", content: "Hey how are you" }}
            />
            <MessageBubble
              message={{
                role: "assistant",
                content:
                  "Sure, I'm here to help! Please go ahead and ask your question.",
              }}
            />
            <MessageBubble
              message={{ role: "user", content: "How can I do this and that?" }}
            />
            <MessageBubble
              message={{
                role: "assistant",
                content:
                  "Sure, I'm here to help! Please go ahead and ask your question.",
              }}
            />
            <MessageBubble
              message={{ role: "user", content: "How can I do this and that?" }}
            />
            <MessageBubble
              message={{
                role: "assistant",
                content:
                  "Sure, I'm here to help! Please go ahead and ask your question.",
              }}
            />
          </div>
        </FadingContainer>
      </div>
    </div>
  );
};
