'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift as GiftIcon, 
  Sparkles, 
  Heart, 
  Search, 
  DollarSign
} from 'lucide-react';
import { Gift, WeddingSettings } from '@/lib/types';
import { WeddingService } from '@/lib/wedding-service';
import { formatCurrency } from '@/lib/utils';
import { PixModal } from './PixModal';

interface GiftCatalogProps {
  settings: WeddingSettings;
}

export function GiftCatalog({ settings }: GiftCatalogProps) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeGiftModal, setActiveGiftModal] = useState<Gift | null>(null);

  const loadGifts = () => {
    setGifts(WeddingService.getGifts());
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos os Presentes' },
    { id: 'brincadeiras', label: '🎉 Brincadeiras & Cotas Divertidas' },
    { id: 'casa', label: 'Cama, Mesa & Banho' },
    { id: 'cozinha', label: 'Cozinha & Eletros' },
    { id: 'lua-de-mel', label: 'Lua de Mel' },
    { id: 'experiencias', label: 'Experiências & Passeios' },
  ];

  const getDisplayGifts = () => {
    const baseList = gifts.filter((gift) => {
      const matchesCategory = selectedCategory === 'all' || gift.category === selectedCategory;
      const matchesSearch = gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            gift.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Em "Todos os Presentes", intercala: 1 sério, 1 brincadeira, 1 sério, 1 brincadeira...
    if (selectedCategory === 'all' && !searchTerm.trim()) {
      const seriousGifts = baseList.filter(g => g.category !== 'brincadeiras');
      const jokeGifts = baseList.filter(g => g.category === 'brincadeiras');

      const interleaved: Gift[] = [];
      const maxLength = Math.max(seriousGifts.length, jokeGifts.length);

      for (let i = 0; i < maxLength; i++) {
        if (i < seriousGifts.length) interleaved.push(seriousGifts[i]);
        if (i < jokeGifts.length) interleaved.push(jokeGifts[i]);
      }

      return interleaved;
    }

    return baseList;
  };

  const filteredGifts = getDisplayGifts();

  const handleCustomGift = () => {
    const custom: Gift = {
      id: 'custom-amount',
      title: 'Presente Livre / Valor Personalizado',
      description: 'Escolha qualquer quantia que desejar para abençoar a nova jornada dos noivos!',
      category: 'experiencias',
      price: 150.00,
      imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      active: true,
    };
    setActiveGiftModal(custom);
  };

  return (
    <section id="presentes" className="scroll-mt-24 py-20 sm:py-28 bg-[#FDFBF7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Framer Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3 mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EE] text-[#C2847A] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <GiftIcon className="w-3.5 h-3.5" />
            Lista de Casamento
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2D2422]">
            Lista de Presentes dos Noivos
          </h2>
          <p className="text-sm sm:text-base text-[#8D7B75] max-w-2xl mx-auto font-light">
            Preparamos uma seleção especial de presentes para o nosso novo lar e lua de mel. Escolha um item abaixo para nos presentear!
          </p>
          <div className="w-24 h-0.5 bg-[#C2847A]/40 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Category Tabs & Search Filter */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#C2847A] text-white shadow-md'
                    : 'bg-white text-[#6B5A55] border border-[#F0E6DF] hover:bg-[#FAF3EE]'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>

          <div className="max-w-md mx-auto relative pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D7B75]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar presentes por nome (ex: Roupa de Cama, Cafeteira...)"
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A] shadow-xs"
            />
          </div>
        </div>

        {/* Gifts Grid with Framer Motion Layout & Animation */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
        >
          <AnimatePresence>
            {filteredGifts.map((gift) => (
              <motion.div
                key={gift.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-3xl overflow-hidden border border-[#F0E6DF] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={gift.imageUrl}
                    alt={gift.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#2D2422] font-bold text-xs shadow-sm">
                    {formatCurrency(gift.price)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#C2847A]">
                      {categories.find(c => c.id === gift.category)?.label || 'Presente'}
                    </span>
                    <h3 className="font-serif text-lg font-medium text-[#2D2422] group-hover:text-[#C2847A] transition-colors">
                      {gift.title}
                    </h3>
                    <p className="text-xs text-[#8D7B75] line-clamp-2">
                      {gift.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-[#F5ECE5]">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveGiftModal(gift)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-[#C2847A] to-rose-500 text-white font-bold text-xs hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Presentear via PIX</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Optional Custom Amount Card at the end */}
          <motion.div 
            layout
            whileHover={{ y: -6 }}
            className="group bg-gradient-to-b from-[#FAF3EE] to-white rounded-3xl p-6 border border-[#EADBCE] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between text-center space-y-4"
          >
            <div className="space-y-3 pt-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C2847A]/15 text-[#C2847A] flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#2D2422]">
                Outro Valor Personalizado
              </h3>
              <p className="text-xs text-[#8D7B75]">
                Deseja contribuir com uma quantia livre de sua preferência?
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCustomGift}
              className="w-full py-2.5 rounded-xl bg-[#C2847A] text-white font-semibold text-xs hover:bg-[#B07065] transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Escolher Valor Livre</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* PIX Modal */}
      <PixModal
        gift={activeGiftModal}
        settings={settings}
        isOpen={Boolean(activeGiftModal)}
        onClose={() => setActiveGiftModal(null)}
        onSuccess={loadGifts}
      />
    </section>
  );
}
