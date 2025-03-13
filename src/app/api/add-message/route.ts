import { db } from "@/lib/db";
import { messages as _messages } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { chatId, content, role } = await req.json();
    
    // Validate input
    if (!chatId || !content || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert the message
    const message = await db.insert(_messages).values({
      chatId,
      content,
      role,
    }).returning();

    return NextResponse.json(message[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}