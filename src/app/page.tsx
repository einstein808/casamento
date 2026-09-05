'use client';

import React, { useState, useEffect } from 'react';
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
import { WeddingSettings, SectionId } from '@/lib/types';
import { WeddingService } from '@/lib/wedding-service';

export default function HomePage() {
  const [settings, setSettings] = useState<WeddingSettings | null>(null);

  useEffect(() => {
    // Initial local read
    setSettings(WeddingService.getSettings());

    // Sync from Firebase Firestore and update
    WeddingService.syncAllFromCloud().then(() => {
      setSettings(WeddingService.getSettings());
    });
  }, []);

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="animate-pulse text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#C2847A]/20 mx-auto" />
          <p className="font-serif text-lg text-[#C2847A]">Carregando os preparativos...</p>
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
        return <RSVPSection key="rsvp" />;
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
      <Hero settings={settings} />

      {/* Dynamic Ordered Sections */}
      {activeOrder.map((sectionId) => renderSection(sectionId))}

      {/* Prominent Bottom Action Call-To-Action Banner */}
      <BottomActionCTA settings={settings} />

      <Footer settings={settings} />
    </main>
  );
}
