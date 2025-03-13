import React from "react";
import { Message } from "ai";
import { cn } from "@/lib/utils";

type Props = {
  messages: Message[];
  isLoading?: boolean;
};

const MessageList = ({ messages, isLoading }: Props) => {
  return (
    <div className="flex flex-col gap-2 px-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex w-full",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "rounded-lg px-3 py-2 max-w-[80%]",
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            )}
          >
            {message.content}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-lg px-3 py-2 max-w-[80%] bg-gray-200 text-gray-700">
            <div className="animate-pulse">Thinking...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
