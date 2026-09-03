'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Sparkles
} from 'lucide-react';
import { WeddingSettings } from '@/lib/types';
import { getChecklistIconComponent, DEFAULT_CHECKLIST_ITEMS } from '@/lib/checklist-icons';

interface DressCodeProps {
  settings: WeddingSettings;
}

export function DressCode({ settings }: DressCodeProps) {
  const activeChecklist = settings.checklistItems && settings.checklistItems.length > 0 
    ? settings.checklistItems 
    : DEFAULT_CHECKLIST_ITEMS;

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
      a: 'Com certeza! No momento da confirmação de presença (RSVP), você pode informar qualquer restrição alimentar que nossa equipe do buffet providenciará.',
    },
  ];

  const activeFaqs = settings.faqs !== undefined ? settings.faqs : defaultFaqs;

  return (
    <section id="orientacoes" className="scroll-mt-24 py-20 sm:py-28 bg-[#FDFBF7] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3 mb-14 sm:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EE] text-[#C2847A] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Informações Importantes
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2D2422]">
            Orientações aos Convidados
          </h2>
          <p className="text-sm sm:text-base text-[#8D7B75] max-w-xl mx-auto font-light">
            Dicas essenciais e checklist completo para você aproveitar cada segundo desse grande dia com a gente!
          </p>
          <div className="w-24 h-0.5 bg-[#C2847A]/40 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Dress Code & Guidelines Card */}
        {settings.dressCodeDescription && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-[#F0E6DF] mb-12 hover:shadow-md transition-shadow"
          >
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#FAF3EE] text-[#C2847A] font-serif text-lg font-semibold">
                {settings.dressCodeTitle || 'Traje Sugerido: Esporte Fino / Passeio Completo'}
              </div>

              <p className="text-sm sm:text-base text-[#6B5A55] leading-relaxed">
                {settings.dressCodeDescription}
              </p>
            </div>
          </motion.div>
        )}

        {/* Interactive Checklist dos Convidados */}
        {activeChecklist.length > 0 && (
          <div className="mb-16 space-y-6">
            <div className="text-center space-y-1">
              <h3 className="font-serif text-2xl font-medium text-[#2D2422]">
                ✅ Checklist do Convidado
              </h3>
              <p className="text-xs sm:text-sm text-[#8D7B75]">
                Tudo o que você precisa lembrar para curtir a festa sem preocupações
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChecklist.map((item, idx) => {
                const Icon = getChecklistIconComponent(item.iconName);
                return (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-[#F0E6DF] shadow-xs hover:border-[#C2847A]/40 transition-all flex items-start gap-4"
                  >
                    <div className="p-3 rounded-2xl bg-[#FAF3EE] text-[#C2847A] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-[#2D2422]">
                          {item.title}
                        </h4>
                        {item.highlight && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2847A] bg-[#FAF3EE] px-2 py-0.5 rounded-md shrink-0">
                            {item.highlight}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B5A55] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQs with Motion */}
        {activeFaqs.length > 0 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-center text-[#2D2422] mb-6">
              Perguntas Frequentes & Dúvidas
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {activeFaqs.map((faq, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl p-6 border border-[#F0E6DF] shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-[#C2847A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-[#2D2422] text-sm sm:text-base mb-1.5">
                        {faq.q}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#6B5A55] leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
