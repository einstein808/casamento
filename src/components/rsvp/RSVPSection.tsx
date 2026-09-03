'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Heart, 
  Search, 
  UserCheck, 
  Users, 
  Sparkles, 
  Utensils, 
  MessageSquare,
  AlertCircle,
  PartyPopper,
  CalendarCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Companion, Guest, GuestStatus } from '@/lib/types';
import { WeddingService } from '@/lib/wedding-service';

interface RSVPSectionProps {
  initialGuest?: Guest | null;
}

export function RSVPSection({ initialGuest }: RSVPSectionProps) {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(initialGuest || null);
  
  // Form state
  const [status, setStatus] = useState<GuestStatus>('confirmed');
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [diet, setDiet] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const list = WeddingService.getGuests();
    setGuestsList(list);

    if (initialGuest) {
      setSelectedGuest(initialGuest);
      setStatus(initialGuest.status === 'declined' ? 'declined' : (initialGuest.status === 'reconfirmed' ? 'reconfirmed' : 'confirmed'));
      setCompanions(initialGuest.confirmedCompanions || []);
      setDiet(initialGuest.dietRestrictions || '');
      setMessage(initialGuest.message || '');
      if (initialGuest.status !== 'pending') {
        setIsCompleted(true);
      }
    }
  }, [initialGuest]);

  const filteredGuests = searchTerm.trim().length > 1
    ? guestsList.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setStatus(guest.status === 'declined' ? 'declined' : (guest.status === 'reconfirmed' ? 'reconfirmed' : 'confirmed'));
    setCompanions(guest.confirmedCompanions || []);
    setDiet(guest.dietRestrictions || '');
    setMessage(guest.message || '');
    setIsCompleted(guest.status !== 'pending');
    setErrorMessage('');
  };

  const handleAddCompanion = () => {
    if (!selectedGuest) return;
    if (companions.length < selectedGuest.maxCompanions) {
      setCompanions([...companions, { name: '', isChild: false }]);
    }
  };

  const handleRemoveCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const handleUpdateCompanion = (index: number, field: keyof Companion, value: any) => {
    const updated = [...companions];
    updated[index] = { ...updated[index], [field]: value };
    setCompanions(updated);
  };

  const handleSubmit = (e: React.FormEvent, forceStatus?: 'confirmed' | 'declined' | 'reconfirmed') => {
    if (e) e.preventDefault();
    if (!selectedGuest) return;

    const targetStatus: 'confirmed' | 'declined' | 'reconfirmed' = forceStatus || (status === 'declined' ? 'declined' : status === 'reconfirmed' ? 'reconfirmed' : 'confirmed');

    // Validate companions have names
    if (targetStatus === 'confirmed' || targetStatus === 'reconfirmed') {
      for (let i = 0; i < companions.length; i++) {
        if (!companions[i].name.trim()) {
          setErrorMessage(`Por favor, preencha o nome do acompanhante ${i + 1}.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      const updated = WeddingService.updateGuestStatus(
        selectedGuest.id,
        targetStatus,
        (targetStatus === 'confirmed' || targetStatus === 'reconfirmed') ? companions : [],
        diet,
        message
      );

      if (updated) {
        setSelectedGuest(updated);
        setStatus(targetStatus);
        setIsCompleted(true);
        setIsSubmitting(false);

        if (targetStatus === 'confirmed' || targetStatus === 'reconfirmed') {
          confetti({
            particleCount: 140,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#1e40af', '#c2847a', '#c5a059', '#fdfbf7', '#2e4057'],
          });
        }
      } else {
        setIsSubmitting(false);
        setErrorMessage('Ocorreu um erro ao salvar sua confirmação.');
      }
    }, 600);
  };

  return (
    <section id="rsvp" className="py-20 sm:py-28 bg-[#F7F2EE] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#C2847A] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <UserCheck className="w-3.5 h-3.5" />
            Confirmação & Reconfirmação de Presença
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2D2422]">
            RSVP - Confirme sua Presença
          </h2>
          <p className="text-sm sm:text-base text-[#8D7B75] max-w-xl mx-auto font-light">
            Sua presença é fundamental para nós! Confirme ou reconfirme sua presença para organizarmos os lugares e buffet.
          </p>
          <div className="w-24 h-0.5 bg-[#C2847A]/40 mx-auto mt-4 rounded-full" />
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#EADBCE]">
          {/* STEP 1: Search */}
          {!selectedGuest ? (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h3 className="font-serif text-2xl font-medium text-[#2D2422]">
                  Encontre o seu Convite
                </h3>
                <p className="text-xs sm:text-sm text-[#8D7B75]">
                  Digite seu nome ou sobrenome para confirmar ou reconfirmar sua presença:
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D7B75]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ex: Carlos Eduardo ou Oliveira..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E8DCD5] focus:outline-none focus:border-[#C2847A] text-sm text-[#2D2422] transition-colors"
                />
              </div>

              {/* Search Results */}
              {searchTerm.trim().length > 1 && (
                <div className="space-y-2 pt-2">
                  {filteredGuests.length > 0 ? (
                    <div className="divide-y divide-gray-100 border border-[#F0E6DF] rounded-2xl overflow-hidden shadow-xs">
                      {filteredGuests.map((guest) => (
                        <button
                          key={guest.id}
                          onClick={() => handleSelectGuest(guest)}
                          className="w-full p-4 text-left hover:bg-[#FAF3EE] flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="font-medium text-[#2D2422] text-sm sm:text-base">
                              {guest.name}
                            </p>
                            <p className="text-xs text-[#8D7B75]">
                              {guest.status === 'reconfirmed'
                                ? '✨ Presença Reconfirmada Definitivamente'
                                : guest.status === 'confirmed'
                                ? '✅ Confirmado (Aguardando reconfirmação final)'
                                : guest.maxCompanions > 0 
                                ? `Permite até ${guest.maxCompanions} acompanhante(s)`
                                : 'Convite Individual'}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF3EE] text-[#C2847A]">
                            Selecionar
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-[#FAF3EE] rounded-2xl text-xs sm:text-sm text-[#8D7B75]">
                      Nenhum convite encontrado com esse nome. Verifique a grafia ou entre em contato com os noivos!
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isCompleted ? (
            /* STEP 3: Completed / Reconfirmation Banner */
            <div className="max-w-md mx-auto text-center space-y-6 py-4">
              <div className="inline-flex p-4 rounded-full bg-[#FAF3EE] text-[#C2847A]">
                {status === 'reconfirmed' ? (
                  <CalendarCheck className="w-12 h-12 text-emerald-600 animate-bounce" />
                ) : status === 'confirmed' ? (
                  <PartyPopper className="w-10 h-10 animate-bounce" />
                ) : (
                  <Heart className="w-10 h-10 text-[#C2847A]" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2D2422]">
                  {status === 'reconfirmed'
                    ? 'Presença Reconfirmada Definitivamente! 💍'
                    : status === 'confirmed'
                    ? 'Presença Confirmada!'
                    : 'Resposta Registrada!'}
                </h3>
                <p className="text-sm text-[#6B5A55]">
                  {status === 'reconfirmed'
                    ? `Obrigado por reconfirmar, ${selectedGuest.name}! Seu lugar e o de seus acompanhantes estão 100% garantidos no buffet!`
                    : status === 'confirmed'
                    ? `Obrigado, ${selectedGuest.name}! Estamos muito felizes em celebrar esse momento inesquecível com você!`
                    : `Sentiremos sua falta, ${selectedGuest.name}. Obrigado por nos avisar com antecedência!`}
                </p>
              </div>

              {/* Quick Reconfirmation Call to Action if only 'confirmed' */}
              {status === 'confirmed' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <CalendarCheck className="w-4 h-4 text-amber-600" />
                    <span>Reconfirmação Final Pré-Evento</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Faltam poucas semanas para o casamento! Clique abaixo para fazer sua <strong>Reconfirmação Definitiva</strong> e garantir seu lugar no buffet:
                  </p>
                  <button
                    onClick={(e) => handleSubmit(e, 'reconfirmed')}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reconfirmar Presença Definitiva Agora</span>
                  </button>
                </div>
              )}

              {(status === 'confirmed' || status === 'reconfirmed') && companions.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#F0E6DF] text-xs sm:text-sm text-left space-y-1">
                  <p className="font-semibold text-[#2D2422]">Acompanhantes confirmados:</p>
                  {companions.map((c, i) => (
                    <p key={i} className="text-[#6B5A55]">
                      • {c.name} {c.isChild ? '(Criança)' : ''}
                    </p>
                  ))}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsCompleted(false)}
                  className="text-xs text-[#C2847A] hover:underline"
                >
                  Alterar dados ou acompanhantes
                </button>
                <button
                  onClick={() => {
                    setSelectedGuest(null);
                    setIsCompleted(false);
                    setSearchTerm('');
                  }}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Buscar outro convite
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: RSVP / Reconfirmation Form */
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              <div className="p-4 rounded-2xl bg-[#FAF3EE] border border-[#EADBCE] flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#C2847A] font-semibold">Convite de:</span>
                  <h4 className="font-serif text-lg sm:text-xl font-medium text-[#2D2422]">
                    {selectedGuest.name}
                  </h4>
                  <p className="text-xs text-[#8D7B75]">
                    {selectedGuest.maxCompanions > 0
                      ? `Você pode confirmar você + até ${selectedGuest.maxCompanions} acompanhante(s)`
                      : 'Convite Individual'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGuest(null);
                    setSearchTerm('');
                  }}
                  className="text-xs text-[#C2847A] hover:underline"
                >
                  Trocar
                </button>
              </div>

              {/* Status Decision */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  Confirmação de Presença:
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setStatus('reconfirmed')}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                      status === 'confirmed' || status === 'reconfirmed'
                        ? 'border-[#C2847A] bg-[#FAF3EE] text-[#C2847A] font-semibold shadow-xs'
                        : 'border-[#E8DCD5] bg-white text-[#6B5A55] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Sim, estarei lá!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                      status === 'declined'
                        ? 'border-gray-400 bg-gray-50 text-gray-800 font-semibold shadow-xs'
                        : 'border-[#E8DCD5] bg-white text-[#6B5A55] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">Não poderei ir</span>
                  </button>
                </div>
              </div>

              {/* If Confirmed, Companions and Diet */}
              {(status === 'confirmed' || status === 'reconfirmed') && (
                <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                  {selectedGuest.maxCompanions > 0 && (
                    <div className="space-y-3 p-5 rounded-2xl bg-[#FDFBF7] border border-[#E8DCD5]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#2D2422]">
                          <Users className="w-4 h-4 text-[#C2847A]" />
                          <span>Acompanhantes ({companions.length}/{selectedGuest.maxCompanions})</span>
                        </div>

                        {companions.length < selectedGuest.maxCompanions && (
                          <button
                            type="button"
                            onClick={handleAddCompanion}
                            className="text-xs font-semibold text-[#C2847A] hover:underline"
                          >
                            + Adicionar Acompanhante
                          </button>
                        )}
                      </div>

                      {companions.length === 0 ? (
                        <p className="text-xs text-[#8D7B75] italic">
                          Nenhum acompanhante adicionado. Clique acima se for acompanhado(a).
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {companions.map((comp, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                              <input
                                type="text"
                                value={comp.name}
                                onChange={(e) => handleUpdateCompanion(idx, 'name', e.target.value)}
                                placeholder={`Nome do acompanhante ${idx + 1}`}
                                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                              />
                              <label className="flex items-center gap-1.5 text-xs text-[#6B5A55] cursor-pointer whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={comp.isChild || false}
                                  onChange={(e) => handleUpdateCompanion(idx, 'isChild', e.target.checked)}
                                  className="rounded border-gray-300 text-[#C2847A] focus:ring-[#C2847A]"
                                />
                                <span>Criança</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveCompanion(idx)}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dietary Restrictions */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                      <Utensils className="w-3.5 h-3.5 text-[#C2847A]" />
                      <span>Restrições Alimentares ou Alergias (Opcional):</span>
                    </label>
                    <input
                      type="text"
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      placeholder="Ex: Vegetariano, intolerância a lactose..."
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                    />
                  </div>
                </div>
              )}

              {/* Message to Couple */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-[#C2847A]" />
                  <span>Mensagem para os Noivos:</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva seus votos de amor e felicidades..."
                  className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A] resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#C2847A] text-white font-medium text-sm sm:text-base hover:bg-[#B07065] shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Reconfirmar Presença Definitiva'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
