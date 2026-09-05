'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Gift, Heart, Sparkles } from 'lucide-react';
import { WeddingSettings } from '@/lib/types';

interface BottomActionCTAProps {
  settings: WeddingSettings;
}

export function BottomActionCTA({ settings }: BottomActionCTAProps) {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      const id = href.replace('#', '');
      const elem = document.getElementById(id);
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <section className="py-10 sm:py-20 bg-gradient-to-b from-[#FAF3EE]/60 to-[#FDFBF7] border-t border-[#F0E6DF] relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C2847A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#C2847A] text-xs font-semibold uppercase tracking-wider shadow-xs border border-[#EADBCE]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Celebre com a Gente</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2D2422]"
        >
          Mal podemos esperar para viver esse momento com você!
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-[#6B5A55] max-w-xl mx-auto font-light leading-relaxed"
        >
          {settings.showRsvpSection !== false 
            ? 'Confirme sua presença com antecedência para nos ajudar na organização e confira nossa lista de presentes com carinho.'
            : 'Confira nossa lista de presentes com carinho e celebre conosco esse momento inesquecível.'}
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md sm:max-w-none mx-auto"
        >
          {settings.showRsvpSection !== false && (
            <Link
              href="#rsvp"
              onClick={(e) => handleAnchorClick(e, '#rsvp')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#C2847A] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#C2847A]/30 hover:bg-[#B07065] transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Presença</span>
            </Link>
          )}

          <Link
            href="#presentes"
            onClick={(e) => handleAnchorClick(e, '#presentes')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-[#C2847A] to-rose-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/35 transition-all hover:scale-105 active:scale-95 ring-2 ring-amber-300/40"
          >
            <Gift className="w-5 h-5 text-white animate-bounce" />
            <span>Ver Lista de Presentes</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
