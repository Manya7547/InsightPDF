import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { file_key, file_name } = body;
    
    if (!file_key || !file_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log('Starting Pinecone upload for file:', file_key);
    try {
      // Load document into Pinecone
      await loadS3IntoPinecone(file_key);
    } catch (error) {
      console.error('Pinecone upload failed:', error);
      return NextResponse.json(
        { error: "Failed to process document" },
        { status: 500 }
      );
    }

    console.log('Creating chat record in database');
    try {
      // Create chat in database
      const chat = await db
        .insert(chats)
        .values({
          fileKey: file_key,
          pdfName: file_name,
          pdfUrl: getS3Url(file_key),
          userID: user.id,
        })
        .returning({
          id: chats.id,
        });

      return NextResponse.json(
        { chat_id: chat[0].id },
        { status: 200 }
      );
    } catch (error) {
      console.error('Database operation failed:', error);
      return NextResponse.json(
        { error: "Failed to create chat record" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in create-chat:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}