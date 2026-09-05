import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bride = searchParams.get('bride') || 'Fernanda';
    const groom = searchParams.get('groom') || 'Gabryel';
    const photoUrl = searchParams.get('photo') || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

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
            backgroundImage: 'radial-gradient(circle at 50% 50%, #FAF3EE 0%, #F3E5DC 100%)',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Couple Photo Circle / Frame */}
          <div
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '140px',
              border: '6px solid #C2847A',
              boxShadow: '0 12px 30px rgba(194, 132, 122, 0.35)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt="Noivos"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              padding: '6px 20px',
              borderRadius: '20px',
              border: '1px solid #EADBCE',
              color: '#C2847A',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Celebração de Casamento
          </div>

          {/* Names */}
          <div
            style={{
              fontSize: '38px',
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
              fontSize: '16px',
              color: '#8D7B75',
              fontStyle: 'italic',
            }}
          >
            Nosso Convite Especial de Casamento
          </div>
        </div>
      ),
      {
        width: 600,
        height: 600,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
