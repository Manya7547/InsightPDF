import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File) {
  if (!process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
    throw new Error("S3 bucket name is missing");
  }

  const fileKey = `uploads/${Date.now()}_${file.name.replace(/\s/g, "-")}`;

  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Key: fileKey,
    Body: file,
    ContentType: file.type,
  };

  try {
    const parallelUpload = new Upload({
      client: s3Client,
      params,
    });

    parallelUpload.on("httpUploadProgress", (progress) => {
      console.log(
        `Upload progress: ${Math.round(
          ((progress.loaded || 0) * 100) / (progress.total || 1) // Fixed parentheses
        )}%`
      );
    });

    await parallelUpload.done();
    console.log("Upload completed:", fileKey);
    
    return {
      file_key: fileKey,
      file_name: file.name,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
}

export function getS3Url(fileKey: string): string {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${fileKey}`;
}