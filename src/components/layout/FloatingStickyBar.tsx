'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Gift, Heart, Sparkles } from 'lucide-react';
import { WeddingSettings } from '@/lib/types';

interface FloatingStickyBarProps {
  settings: WeddingSettings;
}

export function FloatingStickyBar({ settings }: FloatingStickyBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past 350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-5 left-0 right-0 z-50 flex items-center justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-4 p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-[#EADBCE] shadow-2xl shadow-black/15">
            {/* Couple Initials Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF3EE] text-[#C2847A] text-xs font-serif font-bold">
              <span>{settings.coupleInitials || 'F & G'}</span>
              <Heart className="w-3 h-3 fill-[#C2847A]" />
            </div>

            {/* RSVP / Reconfirmation Button */}
            <Link
              href="#rsvp"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C2847A] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#C2847A]/30 hover:bg-[#B07065] transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar / Reconfirmar</span>
            </Link>

            {/* Gift List Button */}
            <Link
              href="#presentes"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-[#C2847A] to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 transition-all hover:scale-105 active:scale-95 ring-2 ring-amber-300/40"
            >
              <Gift className="w-4 h-4 text-white animate-bounce" />
              <span>Lista de Presentes</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
