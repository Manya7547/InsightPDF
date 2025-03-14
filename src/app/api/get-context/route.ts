import { getContext } from "@/lib/context";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, fileKey } = await req.json();
    const context = await getContext(query, fileKey);
    return NextResponse.json({ context });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get context" }, { status: 500 });
  }
}