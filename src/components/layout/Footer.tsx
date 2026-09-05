import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { WeddingSettings } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface FooterProps {
  settings: WeddingSettings;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-[#2D2422] text-[#EFE6E0] pt-16 pb-12 relative overflow-hidden border-t border-[#4A3E3D]">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C2847A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 mb-6">
          <Heart className="w-6 h-6 text-[#C2847A] fill-[#C2847A] animate-pulse" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-wide mb-3">
          {settings.brideName} <span className="text-[#C2847A] font-serif italic">&</span> {settings.groomName}
        </h2>

        <p className="text-sm sm:text-base text-[#D9C5B2] font-serif italic max-w-xl mx-auto mb-6">
          &ldquo;O amor não se vê com os olhos, mas com o coração.&rdquo;
        </p>

        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white/60 tracking-widest uppercase mb-10">
          <span>{formatDate(settings.weddingDate)}</span>
          <span>•</span>
          <span>
            {(settings.hasCeremony !== false && settings.ceremonyVenueName?.trim()) 
              ? settings.ceremonyVenueName 
              : (settings.receptionVenueName?.trim() || settings.ceremonyVenueName || 'Local a Definir')}
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#D9C5B2]/80 mb-12">
          <Link href="#inicio" className="hover:text-white transition-colors">Início</Link>
          <Link href="#historia" className="hover:text-white transition-colors">Nossa História</Link>
          <Link href="#local" className="hover:text-white transition-colors">Cerimônia & Festa</Link>
          <Link href="#rsvp" className="hover:text-white transition-colors">Confirmar Presença</Link>
          <Link href="#presentes" className="hover:text-white transition-colors">Lista de Presentes (PIX)</Link>
          <Link href="#fotos" className="hover:text-white transition-colors">Mural de Fotos</Link>
          <Link href="/admin" className="hover:text-white flex items-center gap-1 transition-colors">
            <ShieldCheck className="w-3 h-3" />
            Painel Admin
          </Link>
        </div>

        <div className="pt-8 border-t border-white/10 text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {settings.brideName} & {settings.groomName}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-[#C2847A] fill-[#C2847A]" /> para celebrar este momento especial.
          </p>
        </div>
      </div>
    </footer>
  );
}
