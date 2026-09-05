'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Copy, Check, Navigation, CalendarHeart } from 'lucide-react';
import { WeddingSettings } from '@/lib/types';

interface EventDetailsProps {
  settings: WeddingSettings;
}

export function EventDetails({ settings }: EventDetailsProps) {
  const [copiedCeremony, setCopiedCeremony] = useState(false);
  const [copiedReception, setCopiedReception] = useState(false);

  const hasCeremony = settings.hasCeremony !== false && Boolean(settings.ceremonyVenueName?.trim());
  const hasReception = settings.hasReception !== false && Boolean(settings.receptionVenueName?.trim());

  // Se ambos os locais estiverem desativados/vazios, oculta a seção
  if (!hasCeremony && !hasReception) {
    return null;
  }

  const handleCopy = (text: string, type: 'ceremony' | 'reception') => {
    navigator.clipboard.writeText(text);
    if (type === 'ceremony') {
      setCopiedCeremony(true);
      setTimeout(() => setCopiedCeremony(false), 2500);
    } else {
      setCopiedReception(true);
      setTimeout(() => setCopiedReception(false), 2500);
    }
  };

  const sectionTitle = hasCeremony && hasReception
    ? 'Cerimônia & Recepção'
    : hasCeremony
    ? 'Cerimônia do Casamento'
    : 'Recepção & Celebração';

  const sectionSubtitle = hasCeremony && hasReception
    ? 'Preparamos cada detalhe com muito carinho para receber você. Veja onde e quando tudo acontecerá!'
    : hasCeremony
    ? 'Veja onde e quando celebraremos o momento do nosso SIM!'
    : 'Confira o local da nossa festa para comemorarmos juntos essa grande alegria!';

  const isSingleCard = (hasCeremony && !hasReception) || (!hasCeremony && hasReception);

  return (
    <section id="local" className="scroll-mt-24 py-10 sm:py-24 bg-[#F7F2EE] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3 mb-8 sm:mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#C2847A] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <CalendarHeart className="w-3.5 h-3.5" />
            O Grande Dia
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2D2422]">
            {sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#8D7B75] max-w-xl mx-auto font-light">
            {sectionSubtitle}
          </p>
          <div className="w-24 h-0.5 bg-[#C2847A]/40 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Cards Grid with Dynamic Layout */}
        <div className={isSingleCard ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-10'}>
          {/* Cerimônia (Opcional) */}
          {hasCeremony && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#EADBCE] flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full bg-[#FAF3EE] text-[#C2847A] font-serif text-xs font-semibold uppercase tracking-wider">
                    Cerimônia do Casamento
                  </span>
                  <div className="p-2.5 rounded-full bg-[#FAF3EE] text-[#C2847A]">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2D2422] mb-1">
                    {settings.ceremonyVenueName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#C2847A] font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Início pontual às {settings.ceremonyTime}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#F0E6DF] space-y-2 text-sm text-[#6B5A55]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#C2847A] shrink-0 mt-0.5" />
                    <p>{settings.ceremonyAddress}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F0E6DF] flex flex-wrap gap-3">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={settings.ceremonyMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(settings.ceremonyAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2847A] text-white text-xs sm:text-sm font-medium hover:bg-[#B07065] transition-colors shadow-xs"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Abrir no Google Maps</span>
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCopy(settings.ceremonyAddress, 'ceremony')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F7F2EE] text-[#6B5A55] hover:bg-[#EFE6E0] text-xs sm:text-sm font-medium transition-colors border border-[#E8DCD5]"
                >
                  {copiedCeremony ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Recepção & Festa (Opcional) */}
          {hasReception && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: hasCeremony ? 0.15 : 0 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#EADBCE] flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full bg-[#FAF3EE] text-[#C2847A] font-serif text-xs font-semibold uppercase tracking-wider">
                    Recepção & Comemoração
                  </span>
                  <div className="p-2.5 rounded-full bg-[#FAF3EE] text-[#C2847A]">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2D2422] mb-1">
                    {settings.receptionVenueName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#C2847A] font-medium">
                    <Clock className="w-4 h-4" />
                    <span>A partir das {settings.receptionTime}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#F0E6DF] space-y-2 text-sm text-[#6B5A55]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#C2847A] shrink-0 mt-0.5" />
                    <p>{settings.receptionAddress}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F0E6DF] flex flex-wrap gap-3">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={settings.receptionMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(settings.receptionAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2847A] text-white text-xs sm:text-sm font-medium hover:bg-[#B07065] transition-colors shadow-xs"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Abrir no Google Maps</span>
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCopy(settings.receptionAddress, 'reception')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F7F2EE] text-[#6B5A55] hover:bg-[#EFE6E0] text-xs sm:text-sm font-medium transition-colors border border-[#E8DCD5]"
                >
                  {copiedReception ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
