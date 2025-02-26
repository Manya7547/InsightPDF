import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export async function downloadFromS3(file_key: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    });

    const { Body } = await s3Client.send(command);
    
    if (!Body) {
      throw new Error("Empty response body from S3");
    }

    // Create a temporary file path
    const filePath = join(tmpdir(), `pdf-${Date.now()}.pdf`);
    
    // Convert ReadableStream to Buffer
    const bytes = await Body.transformToByteArray();
    await writeFile(filePath, Buffer.from(bytes));
    
    return filePath;
  } catch (error) {
    console.error("S3 Download Error:", error);
    return null;
  }
}