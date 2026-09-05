'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { StoryMilestone } from '@/lib/types';

interface LoveStoryProps {
  milestones: StoryMilestone[];
  brideName: string;
  groomName: string;
}

export function LoveStory({ milestones }: LoveStoryProps) {
  // Se não houver marcos cadastrados, oculta a seção completamente sem deixar espaços vazios
  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <section id="historia" className="scroll-mt-24 py-10 sm:py-24 bg-[#FDFBF7] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3 mb-8 sm:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5ECE5] text-[#C2847A] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Nossa Jornada
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2D2422]">
            Como Começou a Nossa História
          </h2>
          <p className="text-sm sm:text-base text-[#8D7B75] max-w-xl mx-auto font-light">
            Cada detalhe do nosso caminho nos trouxe até aqui. Conheça um pouco mais sobre nós!
          </p>
          <div className="w-24 h-0.5 bg-[#C2847A]/40 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Central line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E8DCD5] -translate-x-1/2" />

          <div className="space-y-6 sm:space-y-12">
            {milestones.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.year + item.title + index}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Heart Badge (Center) */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#FDFBF7] border-2 border-[#C2847A] items-center justify-center shadow-md z-10"
                  >
                    <Heart className="w-5 h-5 text-[#C2847A] fill-[#C2847A]" />
                  </motion.div>

                  {/* Content Card with Framer Motion */}
                  <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full md:w-1/2"
                  >
                    <motion.div 
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#F0E6DF] hover:shadow-md transition-shadow ${
                        isEven ? 'md:mr-8 text-left' : 'md:ml-8 text-left'
                      }`}
                    >
                      <span className="inline-block px-3 py-1 rounded-full bg-[#F8EFEA] text-[#C2847A] font-serif text-sm font-bold mb-3">
                        {item.year}
                      </span>
                      <h3 className="font-serif text-2xl font-medium text-[#2D2422] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-[#6B5A55] leading-relaxed">
                        {item.description}
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Photo with Framer Motion */}
                  <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    className="w-full md:w-1/2"
                  >
                    {item.imageUrl && (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                        className={`overflow-hidden rounded-3xl shadow-sm border-4 border-white aspect-[4/3] ${
                          isEven ? 'md:ml-8' : 'md:mr-8'
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
