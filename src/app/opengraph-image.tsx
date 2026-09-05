import { ImageResponse } from 'next/og';
import { db, COLLECTIONS } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { DEFAULT_SETTINGS } from '@/lib/default-data';
import { WeddingSettings } from '@/lib/types';
import { getMinioClient } from '@/lib/minio';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = 'Fernanda & Gabryel | Nosso Casamento 💍';
export const size = {
  width: 600,
  height: 600,
};
export const contentType = 'image/png';

async function fetchImageBase64(url: string, settings?: Partial<WeddingSettings>): Promise<string | null> {
  if (!url) return null;

  // 1. MinIO / S3 internal storage
  if (url.startsWith('/api/media/') || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:'))) {
    try {
      const cleanKey = decodeURIComponent(url.replace(/^\/api\/media\//, ''));
      if (cleanKey) {
        const client = getMinioClient(settings);
        const bucket = settings?.minioBucketName || process.env.MINIO_BUCKET_NAME || 'casamento';
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: cleanKey,
        });
        const response = await client.send(command);
        if (response.Body) {
          const byteArray = await response.Body.transformToByteArray();
          const buffer = Buffer.from(byteArray);
          const contentType = response.ContentType || 'image/jpeg';
          return `data:${contentType};base64,${buffer.toString('base64')}`;
        }
      }
    } catch (err) {
      console.warn('Could not fetch image from MinIO for opengraph-image:', err);
    }
  }

  // 2. Data URL
  if (url.startsWith('data:')) {
    return url;
  }

  // 3. External HTTP/HTTPS URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        return `data:${contentType};base64,${buffer.toString('base64')}`;
      }
    } catch (err) {
      console.warn('Could not fetch image from external URL for opengraph-image:', err);
    }
  }

  return null;
}

export default async function OpenGraphImage() {
  try {
    let currentSettings: WeddingSettings = DEFAULT_SETTINGS;
    if (db) {
      try {
        const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'main_settings'));
        if (snap.exists()) {
          currentSettings = { ...DEFAULT_SETTINGS, ...(snap.data() as WeddingSettings) };
        }
      } catch (err) {
        console.warn('Error reading settings for opengraph-image:', err);
      }
    }

    const bride = currentSettings.brideName || 'Fernanda';
    const groom = currentSettings.groomName || 'Gabryel';
    const rawPhotoUrl = 
      currentSettings.heroBackgroundMobileImageUrl ||
      currentSettings.heroBackgroundImageUrl || 
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

    let photoDataUrl = await fetchImageBase64(rawPhotoUrl, currentSettings);

    if (!photoDataUrl && rawPhotoUrl !== 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80') {
      photoDataUrl = await fetchImageBase64('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', currentSettings);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF3EE',
            backgroundImage: 'radial-gradient(circle at 50% 40%, #FAF3EE 0%, #F5E7DF 100%)',
            padding: '30px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Couple Photo Circle */}
          <div
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '140px',
              border: '6px solid #C2847A',
              boxShadow: '0 12px 32px rgba(194, 132, 122, 0.35)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              backgroundColor: '#FFFFFF',
            }}
          >
            {photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoDataUrl}
                alt="Noivos"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                💍
              </div>
            )}
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
              padding: '6px 20px',
              borderRadius: '20px',
              border: '1.5px solid #EADBCE',
              color: '#C2847A',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Celebração de Casamento
          </div>

          {/* Names */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 700,
              color: '#2D2422',
              letterSpacing: '-0.5px',
              marginBottom: '6px',
            }}
          >
            {bride} & {groom} 💍
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
              color: '#8D7B75',
              fontStyle: 'italic',
            }}
          >
            Acesse nosso convite de casamento
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e: any) {
    console.error('Error generating opengraph-image:', e);
    return new Response(`Failed to generate the image: ${e?.message || e}`, {
      status: 500,
    });
  }
}
