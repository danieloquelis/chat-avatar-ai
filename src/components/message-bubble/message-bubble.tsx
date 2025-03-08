import { FC } from "react";
import { MessageBubbleProps } from "./message-bubble-common";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

export const MessageBubble: FC<MessageBubbleProps> = (props) => {
  const { message } = props;
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 py-4",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <User className="h-5 w-5 text-primary-foreground" />
        </Avatar>
      )}
    </div>
  );
};
