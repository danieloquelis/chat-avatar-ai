import { FC } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { ChatConversationProps } from "./chat-conversation-common";
import { FadingContainer } from "@/components/ui/fading-container";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

export const ChatConversation: FC<ChatConversationProps> = (props) => {
  const { messages } = props;
  const [chatContainerRef, chatEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div className="relative w-full max-w-xl mx-auto flex-1">
      <div className="flex flex-col sm:p-4 pb-2 min-h-full justify-end">
        <FadingContainer>
          <div
            ref={chatContainerRef}
            className="max-h-64 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar hover:scrollbar-thumb-primary/40 scrollbar-thumb-transparent scrollbar-track-transparent"
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={{
                  role: message.role,
                  content: message.content,
                }}
              />
            ))}
            <div ref={chatEndRef} />
          </div>
        </FadingContainer>
      </div>
    </div>
  );
};
