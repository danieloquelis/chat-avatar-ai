import React, { forwardRef, useState } from "react";
import { PromptInputProps } from "./prompt-input-common";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
  (props, ref) => {
    const {
      isLoading,
      isRecording,
      startRecording,
      stopRecording,
      handleSubmit,
    } = props;
    const [input, setInput] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl mx-auto"
      >
        <div className="relative border rounded-lg bg-background shadow-sm">
          <Textarea
            ref={ref}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message v0..."
            className="min-h-[80px] resize-none pr-20 py-4 bg-transparent"
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={isRecording ? stopRecording : startRecording}
              className={`rounded-full ${isRecording ? "text-red-500" : ""}`}
              disabled={isLoading}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="rounded-full"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    );
  },
);

PromptInput.displayName = "PromptInput";
