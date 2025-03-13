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
    if (!input.trim()) return;

    // Save user message
    const userMessage = {
      content: input.trim(),
      role: "user",
    };

    // Optimistically update UI
    setMessages((current) => [...current, userMessage as Message]);

    try {
      // Save to database
      await axios.post("/api/add-message", {
        chatId,
        content: input.trim(),
        role: "user",
      });

      // Submit to AI
      await handleSubmit(e);

      // Refetch messages
      await refetch();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="relative max-h-screen overflow-scroll">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      <form
        onSubmit={handleFormSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="ml-2" disabled={isLoading} type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
