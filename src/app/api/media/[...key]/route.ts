import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getMinioClient } from '@/lib/minio';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const rawKey = resolvedParams.key ? resolvedParams.key.join('/') : '';
    const key = decodeURIComponent(rawKey);

    if (!key) {
      return new NextResponse('Key not provided', { status: 400 });
    }

    const client = getMinioClient();
    const bucket = process.env.MINIO_BUCKET_NAME || 'casamento';

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await client.send(command);

    if (!response.Body) {
      return new NextResponse('File not found in S3', { status: 404 });
    }

    // Convert stream to Buffer for rock-solid Node.js response
    const byteArray = await response.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);

    const contentType = response.ContentType || 'image/jpeg';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Erro ao servir mídia do MinIO:', error?.message || error);
    return new NextResponse(`Error loading image: ${error?.message || error}`, { status: 500 });
  }
}
