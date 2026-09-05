'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { WeddingSettings } from '@/lib/types';
import { getChecklistIconComponent, DEFAULT_CHECKLIST_ITEMS } from '@/lib/checklist-icons';

interface DressCodeProps {
  settings: WeddingSettings;
}

export function DressCode({ settings }: DressCodeProps) {
  const activeChecklist = settings.checklistItems && settings.checklistItems.length > 0 
    ? settings.checklistItems 
    : DEFAULT_CHECKLIST_ITEMS;

  return (
    <section id="orientacoes" className="scroll-mt-24 py-10 sm:py-24 bg-[#FDFBF7] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-3 mb-8 sm:mb-14"
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

        {/* Interactive Checklist dos Convidados */}
        {activeChecklist.length > 0 && (
          <div className="mb-8 sm:mb-16 space-y-4 sm:space-y-6">
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
                    className="bg-white rounded-2xl p-4 sm:p-6 border border-[#F0E6DF] shadow-xs hover:border-[#C2847A]/40 transition-all flex items-start gap-3 sm:gap-4 overflow-hidden w-full max-w-full"
                  >
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF3EE] text-[#C2847A] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-1 sm:gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-[#2D2422] break-words">
                          {item.title}
                        </h4>
                        {item.highlight && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2847A] bg-[#FAF3EE] px-2 py-0.5 rounded-md self-start sm:self-auto shrink-0 max-w-full">
                            {item.highlight}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#6B5A55] leading-relaxed break-words">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
