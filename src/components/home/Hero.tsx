'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, Gift, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { WeddingSettings } from '@/lib/types';
import { calculateCountdown, formatDate } from '@/lib/utils';

interface HeroProps {
  settings: WeddingSettings;
}

export function Hero({ settings }: HeroProps) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    setCountdown(calculateCountdown(settings.weddingDate));
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(settings.weddingDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.weddingDate]);

  return (
    <section id="inicio" className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Image with subtle zoom motion */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Desktop Hero Image */}
        <motion.div 
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          className="hidden md:block w-full h-full bg-cover bg-no-repeat transition-all duration-500"
          style={{
            backgroundImage: `url('${settings.heroBackgroundImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85'}')`,
            backgroundPosition: settings.heroImagePositionDesktop || 'center 15%',
            opacity: ((settings.heroImageOpacity ?? 100) / 100),
          }}
        />

        {/* Mobile Hero Image */}
        <motion.div 
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          className="block md:hidden w-full h-full bg-cover bg-no-repeat transition-all duration-500"
          style={{
            backgroundImage: `url('${settings.heroBackgroundMobileImageUrl || settings.heroBackgroundImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85'}')`,
            backgroundPosition: settings.heroImagePositionMobile || 'center center',
            opacity: ((settings.heroImageOpacity ?? 100) / 100),
          }}
        />
        {/* Gradients */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85 transition-opacity duration-500" 
          style={{ opacity: ((settings.heroOverlayDarkness ?? 60) / 100) }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/30 to-black/80" />
      </div>

      {/* Floating Animated Particles */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: '100vh', 
              x: `${15 + i * 15}vw`,
              opacity: 0 
            }}
            animate={{ 
              y: '-10vh', 
              opacity: [0, 0.6, 0.8, 0],
              scale: [0.8, 1.2, 0.9]
            }}
            transition={{
              duration: 10 + i * 3,
              repeat: Infinity,
              delay: i * 2,
              ease: 'easeInOut'
            }}
            className="absolute"
          >
            <Heart className="w-4 h-4 text-[#E0A899]/40 fill-[#E0A899]/30" />
          </motion.div>
        ))}
      </div>

      {/* Hero Content with Staggered Framer Motion */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white space-y-6 sm:space-y-8">
        {/* Pre-title badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm tracking-widest uppercase font-medium text-[#F7EBE8]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E0A899]" />
          <span>Celebração do Nosso Casamento</span>
          <Sparkles className="w-3.5 h-3.5 text-[#E0A899]" />
        </motion.div>

        {/* Names */}
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-wide text-white drop-shadow-lg"
          >
            {settings.brideName} <span className="text-[#E0A899] font-serif italic">&</span> {settings.groomName}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-sm sm:text-lg md:text-xl text-[#F0E6DF]/90 font-serif italic max-w-2xl mx-auto drop-shadow"
          >
            &ldquo;{settings.heroSubtitle}&rdquo;
          </motion.p>
        </div>

        {/* Date and Location Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/90"
        >
          <div className="flex items-center gap-2 bg-black/35 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-sm">
            <Calendar className="w-4 h-4 text-[#E0A899]" />
            <span className="font-medium">{formatDate(settings.weddingDate)} • às {settings.ceremonyTime}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/35 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-sm">
            <MapPin className="w-4 h-4 text-[#E0A899]" />
            <span className="font-medium">{settings.ceremonyVenueName}</span>
          </div>
        </motion.div>

        {/* Live Countdown Timer with Motion Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="pt-2 sm:pt-4"
        >
          <p className="text-xs uppercase tracking-widest text-[#E0A899] font-semibold mb-3">
            {countdown.isPast ? 'O grande dia chegou!' : 'Contagem regressiva para o SIM:'}
          </p>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
            <motion.div 
              whileHover={{ scale: 1.06, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center shadow-lg"
            >
              <span className="block font-serif text-2xl sm:text-4xl font-bold text-white">
                {countdown.days}
              </span>
              <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Dias</span>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.06, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center shadow-lg"
            >
              <span className="block font-serif text-2xl sm:text-4xl font-bold text-white">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Horas</span>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.06, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center shadow-lg"
            >
              <span className="block font-serif text-2xl sm:text-4xl font-bold text-white">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Min</span>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.06, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center shadow-lg"
            >
              <span className="block font-serif text-2xl sm:text-4xl font-bold text-[#E0A899]">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Seg</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Link
              href="#rsvp"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#C2847A] text-white font-semibold text-sm sm:text-base hover:bg-[#B07065] shadow-xl shadow-[#C2847A]/40 transition-all border border-white/20"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Presença (RSVP)</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Link
              href="#presentes"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-[#C2847A] to-rose-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 border-2 border-amber-300/60 transition-all hover:scale-105 active:scale-95"
            >
              <Gift className="w-5 h-5 text-white animate-bounce" />
              <span>Lista de Presentes</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Down indicator */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/60"
      >
        <Link href="#historia" aria-label="Rolar para baixo">
          <ChevronDown className="w-6 h-6" />
        </Link>
      </motion.div>
    </section>
  );
}
