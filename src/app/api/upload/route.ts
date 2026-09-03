import { NextResponse } from 'next/server';
import { uploadToMinio } from '@/lib/minio';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const settingsStr = formData.get('settings') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado.' },
        { status: 400 }
      );
    }

    const settings = settingsStr ? JSON.parse(settingsStr) : undefined;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try MinIO S3 upload
    const minioResult = await uploadToMinio(
      buffer,
      file.name,
      file.type || 'image/jpeg',
      settings
    );

    if (minioResult.success && minioResult.url) {
      return NextResponse.json({
        success: true,
        url: minioResult.url,
        provider: 'minio',
      });
    }

    // Graceful fallback to Data URL
    const base64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      url: base64,
      provider: 'local_fallback',
      warning: minioResult.error,
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro no upload da imagem' },
      { status: 500 }
    );
  }
}
