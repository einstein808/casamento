'use client';

import React, { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { LoveStory } from '@/components/home/LoveStory';
import { EventDetails } from '@/components/home/EventDetails';
import { DressCode } from '@/components/home/DressCode';
import { RSVPSection } from '@/components/rsvp/RSVPSection';
import { GiftCatalog } from '@/components/gifts/GiftCatalog';
import { GuestGallery } from '@/components/gallery/GuestGallery';
import { FAQSection } from '@/components/home/FAQSection';
import { BottomActionCTA } from '@/components/layout/BottomActionCTA';
import { Footer } from '@/components/layout/Footer';
import { ThemeInjector } from '@/components/layout/ThemeInjector';
import { WeddingSettings, Guest, SectionId } from '@/lib/types';
import { WeddingService } from '@/lib/wedding-service';

interface InvitePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const resolvedParams = use(params);
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = WeddingService.getSettings();
    setSettings(s);

    if (resolvedParams.slug) {
      const g = WeddingService.getGuestBySlug(resolvedParams.slug);
      setGuest(g || null);
    }
    setLoading(false);

    // Sync from Firestore in background
    WeddingService.syncAllFromCloud().then(() => {
      setSettings(WeddingService.getSettings());
      if (resolvedParams.slug) {
        const g = WeddingService.getGuestBySlug(resolvedParams.slug);
        setGuest(g || null);
      }
    });
  }, [resolvedParams.slug]);

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#C2847A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#8D7B75]">Carregando Convite...</p>
        </div>
      </div>
    );
  }

  const defaultOrder: SectionId[] = ['historia', 'local', 'orientacoes', 'rsvp', 'presentes', 'fotos', 'duvidas'];
  const activeOrder = settings.sectionOrder && settings.sectionOrder.length > 0 ? settings.sectionOrder : defaultOrder;

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'historia':
        return settings.showLoveStorySection !== false && settings.loveStory && settings.loveStory.length > 0 ? (
          <LoveStory 
            key="historia"
            milestones={settings.loveStory} 
            brideName={settings.brideName} 
            groomName={settings.groomName} 
          />
        ) : null;
      case 'local':
        return <EventDetails key="local" settings={settings} />;
      case 'orientacoes':
        return <DressCode key="orientacoes" settings={settings} />;
      case 'rsvp':
        return <RSVPSection key="rsvp" initialGuest={guest} />;
      case 'presentes':
        return <GiftCatalog key="presentes" settings={settings} />;
      case 'fotos':
        return <GuestGallery key="fotos" />;
      case 'duvidas':
        return <FAQSection key="duvidas" settings={settings} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#FDFBF7] relative">
      <ThemeInjector colors={settings.themeColors} />
      <Navbar 
        initials={settings.coupleInitials || `${settings.brideName[0]} & ${settings.groomName[0]}`} 
        showLoveStory={settings.showLoveStorySection !== false && settings.loveStory && settings.loveStory.length > 0}
        sectionOrder={activeOrder}
      />

      {/* Hero Section */}
      <Hero settings={settings} />

      {/* Guest Personalized Greeting Card */}
      <section className="py-12 bg-gradient-to-b from-[#FAF3EE] to-[#FDFBF7] border-b border-[#F0E6DF] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#C2847A] text-xs font-semibold uppercase tracking-wider shadow-xs border border-[#EADBCE]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Convite Especial</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-3xl sm:text-5xl font-medium text-[#2D2422]"
          >
            {guest ? `Olá, ${guest.name}!` : 'Seja Bem-vindo(a)!'}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm sm:text-base text-[#6B5A55] max-w-xl mx-auto leading-relaxed"
          >
            {guest ? (
              <>
                Temos a enorme alegria de convidar você {guest.maxCompanions > 0 ? `e sua família (${guest.maxCompanions + 1} lugares reservados)` : ''} para celebrar o dia mais importante de nossas vidas!
              </>
            ) : (
              'Você é nosso convidado muito especial para a celebração do nosso casamento!'
            )}
          </motion.p>
        </div>
      </section>

      {/* Dynamic Ordered Sections */}
      {activeOrder.map((sectionId) => renderSection(sectionId))}

      {/* Prominent Bottom Action Call-To-Action Banner */}
      <BottomActionCTA settings={settings} />

      {/* Footer */}
      <Footer settings={settings} />
    </main>
  );
}
