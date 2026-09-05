'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Menu, X, Gift, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SectionId } from '@/lib/types';

interface NavbarProps {
  initials?: string;
  isLightHeader?: boolean;
  showLoveStory?: boolean;
  sectionOrder?: SectionId[];
}

export function Navbar({ 
  initials = 'F & G', 
  isLightHeader = false, 
  showLoveStory = true,
  sectionOrder
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkMap: Record<SectionId, { name: string; href: string; visible: boolean }> = {
    historia: { name: 'Nossa História', href: '#historia', visible: showLoveStory },
    local: { name: 'O Casamento', href: '#local', visible: true },
    orientacoes: { name: 'Orientações', href: '#orientacoes', visible: true },
    rsvp: { name: 'Presença (RSVP)', href: '#rsvp', visible: true },
    presentes: { name: 'Lista de Presentes', href: '#presentes', visible: true },
    fotos: { name: 'Mural de Fotos', href: '#fotos', visible: true },
    duvidas: { name: 'Dúvidas (FAQ)', href: '#duvidas', visible: true },
  };

  const defaultOrder: SectionId[] = ['historia', 'local', 'orientacoes', 'rsvp', 'presentes', 'fotos', 'duvidas'];
  const activeOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    ...activeOrder.map(id => linkMap[id]).filter(l => l && l.visible)
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      const id = href.replace('#', '');
      const elem = document.getElementById(id);
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
        setMobileMenuOpen(false);
      }
    }
  };

  const isLight = isScrolled || isLightHeader;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLight
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#F0E6DF] py-3'
          : 'bg-gradient-to-b from-black/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo / Initials */}
        <Link
          href="/"
          className={`flex items-center gap-2 font-serif text-2xl sm:text-3xl font-bold tracking-wider transition-colors ${
            isLight ? 'text-[#2D2422]' : 'text-white'
          }`}
        >
          <span>{initials}</span>
          <Heart className="w-4 h-4 text-[#C2847A] fill-[#C2847A]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className={`text-sm font-medium transition-colors hover:text-[#C2847A] ${
                isLight ? 'text-[#4A3E3D]' : 'text-white/90 drop-shadow-sm'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons & Admin */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="#presentes"
            onClick={(e) => handleAnchorClick(e, '#presentes')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 via-[#C2847A] to-rose-500 text-white shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Gift className="w-4 h-4 text-white animate-bounce" />
            <span>Lista de Presentes</span>
          </Link>

          <Link
            href="#rsvp"
            onClick={(e) => handleAnchorClick(e, '#rsvp')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C2847A] text-white hover:bg-[#B07065] shadow-sm transition-all hover:scale-105"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmar / Reconfirmar
          </Link>

          <Link
            href="/admin"
            title="Painel dos Noivos"
            className={`p-1.5 rounded-full transition-colors ${
              isLight ? 'text-gray-400 hover:text-[#2D2422]' : 'text-white/70 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            isLight ? 'text-[#2D2422]' : 'text-white'
          }`}
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-xl border-b border-[#F0E6DF] px-6 py-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="text-base font-medium text-[#2D2422] hover:text-[#C2847A] py-1 border-b border-gray-100"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="#rsvp"
              onClick={(e) => handleAnchorClick(e, '#rsvp')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C2847A] text-white font-medium text-sm shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar / Reconfirmar Presença
            </Link>

            <Link
              href="#presentes"
              onClick={(e) => handleAnchorClick(e, '#presentes')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#C2847A] text-white font-bold text-sm shadow-md"
            >
              <Gift className="w-4 h-4 text-white" />
              <span>Ver Lista de Presentes</span>
            </Link>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-gray-500 hover:text-[#2D2422]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Acesso Restrito dos Noivos
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
