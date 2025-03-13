import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// /api/create-chat
export async function POST(req: Request, res: Response) {
    const user = await currentUser(); // New Clerk authentication method
    const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(file_key, file_name);
    await loadS3IntoPinecone(file_key);
    // creating a chat 
    const insertedChat = await db.insert(chats).values({
    fileKey: file_key,
    pdfName: file_name,
    pdfUrl: getS3Url(file_key),
    userID: userId,
  })
  .returning({ 
    id: chats.id // Correct syntax for Drizzle
  }); 

      // returning chat id 
      return NextResponse.json({
        chat_id: insertedChat[0].id 
      });
      
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}