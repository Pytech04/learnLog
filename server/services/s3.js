import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Upload a file buffer to S3.
 * @param {Buffer} fileBuffer - The file content
 * @param {string} key - The S3 object key (e.g., courses/1/React/intro.mp4)
 * @param {string} contentType - MIME type of the file
 * @returns {string} The public URL of the uploaded object
 */
export async function uploadToS3(fileBuffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
}

export default s3Client;
