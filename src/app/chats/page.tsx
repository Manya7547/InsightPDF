import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ChatSideBar from "@/components/ChatSideBar";

export default async function ChatsPage() {
  const user = await currentUser();
  if (!user) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userID, user.id));

  return (
    <div className="flex h-screen">
      {/* chat sidebar */}
      <div className="flex-[1] max-w-xs">
        <ChatSideBar chats={_chats} chatId={0} isPro={false} />
      </div>

      {/* Main content */}
      <div className="flex-[5] bg-gradient-to-l from-cyan-300 via-amber-200 to-purple-300">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Select a chat</h1>
            <p className="text-lg text-gray-600">
              Choose a chat from the sidebar or create a new one
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
