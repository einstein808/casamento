'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Sparkles } from 'lucide-react';
import { WeddingSettings } from '@/lib/types';

interface FAQSectionProps {
  settings: WeddingSettings;
}

export function FAQSection({ settings }: FAQSectionProps) {
  const defaultFaqs = [
    {
      q: 'Posso levar acompanhante que não está no meu convite?',
      a: 'Nosso espaço e buffet têm capacidade estritamente limitada para os convidados listados. Pedimos que respeitem a quantidade de pessoas indicada no seu link de confirmação.',
    },
    {
      q: 'Tem estacionamento no local?',
      a: 'Sim! Ambos os locais contam com serviço de valet e estacionamento privativo gratuito para os nossos convidados.',
    },
    {
      q: 'Haverá opções vegetarianas / sem glúten no menu?',
      a: 'Com certeza! No momento da confirmação de presença, você pode informar qualquer restrição alimentar que nossa equipe do buffet providenciará.',
    },
  ];

  const activeFaqs = settings.faqs !== undefined ? settings.faqs : defaultFaqs;

  if (!activeFaqs || activeFaqs.length === 0) return null;

  return (
    <section id="duvidas" className="scroll-mt-24 py-10 sm:py-24 bg-[#FAF3EE]/40 relative border-t border-[#F0E6DF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3 mb-8 sm:mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#C2847A] text-xs font-semibold tracking-wider uppercase shadow-xs border border-[#EADBCE]">
            <Sparkles className="w-3.5 h-3.5" />
            Tire Suas Dúvidas
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2D2422]">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base text-[#8D7B75] max-w-xl mx-auto font-light">
            Reunimos as respostas para as principais dúvidas sobre o nosso grande dia
          </p>
          <div className="w-24 h-0.5 bg-[#C2847A]/40 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* FAQs Accordion / Cards List */}
        <div className="space-y-4">
          {activeFaqs.map((faq, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#F0E6DF] shadow-xs hover:border-[#C2847A]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#FAF3EE] text-[#C2847A] shrink-0 mt-0.5">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-[#2D2422] text-base sm:text-lg">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5A55] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
