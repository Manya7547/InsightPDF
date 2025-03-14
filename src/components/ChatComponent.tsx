"use client";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
import { toast } from "react-hot-toast";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const queryClient = useQueryClient();

  const { data: initialMessages, refetch } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: initialMessages || [],
    onResponse: async (response) => {
      // Immediately refetch messages when we get a response
      await refetch();
    },
    onFinish: async (message) => {
      await axios.post("/api/add-message", {
        chatId,
        content: message.content,
        role: "assistant",
      });
      // Refetch after the message is saved
      await refetch();
    },
  });

  // Update messages when initialMessages changes
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage = {
      content: trimmedInput,
      role: "user" as const,
    };

    try {
      // Save message to database first
      await axios.post("/api/add-message", {
        chatId,
        content: trimmedInput,
        role: "user",
      });

      // Update UI optimistically
      setMessages((current) => [...current, userMessage as Message]);

      // Submit to AI
      await handleSubmit(e);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.response?.data?.error || "Failed to send message");

      // Revert optimistic update
      setMessages((current) =>
        current.filter((msg) => msg.content !== userMessage.content)
      );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit border-b border-slate-200">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="sticky bottom-0 inset-x-0 px-4 py-3 bg-white border-t border-slate-200"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
            disabled={isLoading}
          />
          <Button
            className="ml-2"
            disabled={isLoading || !input.trim()}
            type="submit"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
