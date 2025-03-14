import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai'; 
import { getContextFromEdge } from "@/lib/context-edge";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.messages?.length || !body.chatId) {
      return NextResponse.json(
        { error: "Missing messages or chatId" },
        { status: 400 }
      );
    }

    const { messages, chatId } = body;
    const lastMessage = messages[messages.length - 1];

    // Get chat details
    const chatExists = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId))
      .execute();

    if (!chatExists.length) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const fileKey = chatExists[0].fileKey;

    // Get context (with fallback to empty string)
    const context = await getContextFromEdge(lastMessage.content, fileKey) || '';

    // Create the stream using AI SDK
    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      system: `You are a helpful AI assistant. Use this context to answer questions: ${context}. ` +
             `If you can't find the answer in the context, say "I don't have enough information ` +
             `to answer that question."`,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    // Convert to proper streaming response
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to process chat request",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}