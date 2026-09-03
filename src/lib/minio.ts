import { 
  S3Client, 
  PutObjectCommand, 
  CreateBucketCommand, 
  HeadBucketCommand, 
  PutBucketPolicyCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { WeddingSettings } from './types';

export function getMinioClient(settings?: Partial<WeddingSettings>) {
  const endpoint = settings?.minioEndpoint || process.env.MINIO_ENDPOINT || 'https://s3.gabryelamaro.com';
  const accessKeyId = settings?.minioAccessKey || process.env.MINIO_ACCESS_KEY || '3Lut3Uey3fSGdVb8gL6b';
  const secretAccessKey = settings?.minioSecretKey || process.env.MINIO_SECRET_KEY || 'nNN4YwBcJPtiwvRimGTDiJZp1W6SP0jKjsM46PlI';

  return new S3Client({
    endpoint: endpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Necessário para MinIO
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 300000,
      socketTimeout: 300000,
    }),
  });
}

export async function uploadToMinio(
  buffer: Buffer,
  filename: string,
  contentType: string,
  settings?: Partial<WeddingSettings>
): Promise<{ success: boolean; url?: string; signedUrl?: string; error?: string }> {
  try {
    const bucket = settings?.minioBucketName || process.env.MINIO_BUCKET_NAME || 'casamento';
    const client = getMinioClient(settings);

    // Verify or create bucket
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
      } catch (err) {
        console.warn('Bucket note in MinIO:', err);
      }
    }

    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: cleanFilename,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Generate both internal streaming URL and presigned S3 URL
    const mediaProxyUrl = `/api/media/${cleanFilename}`;
    
    let signedUrl = mediaProxyUrl;
    try {
      signedUrl = await getSignedUrl(
        client, 
        new GetObjectCommand({ Bucket: bucket, Key: cleanFilename }), 
        { expiresIn: 604800 } // 7 days
      );
    } catch (e) {
      console.warn('Could not presign url, using media proxy');
    }

    return { 
      success: true, 
      url: mediaProxyUrl,
      signedUrl 
    };
  } catch (err: any) {
    console.error('Erro no upload para o MinIO:', err);
    return { success: false, error: err?.message || 'Falha ao enviar arquivo para o MinIO' };
  }
}
