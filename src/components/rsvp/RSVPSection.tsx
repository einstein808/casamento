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
  const [isDirectForm, setIsDirectForm] = useState(false);

  // Direct guest form fields
  const [directName, setDirectName] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  
  // Form state
  const [status, setStatus] = useState<GuestStatus>('confirmed');
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [diet, setDiet] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setGuestsList(WeddingService.getGuests());

    WeddingService.syncAllFromCloud().then(() => {
      setGuestsList(WeddingService.getGuests());
    });

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
    setIsDirectForm(false);
    setStatus(guest.status === 'declined' ? 'declined' : (guest.status === 'reconfirmed' ? 'reconfirmed' : 'confirmed'));
    setCompanions(guest.confirmedCompanions || []);
    setDiet(guest.dietRestrictions || '');
    setMessage(guest.message || '');
    setIsCompleted(guest.status !== 'pending');
    setErrorMessage('');
  };

  const handleStartDirectForm = (prefillName?: string) => {
    setIsDirectForm(true);
    setSelectedGuest(null);
    if (prefillName) setDirectName(prefillName);
    setStatus('confirmed');
    setCompanions([]);
    setDiet('');
    setMessage('');
    setIsCompleted(false);
    setErrorMessage('');
  };

  const handleAddCompanion = () => {
    if (isDirectForm) {
      setCompanions([...companions, { name: '', isChild: false }]);
      return;
    }
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

  const handleSubmit = async (e: React.FormEvent, forceStatus?: 'confirmed' | 'declined' | 'reconfirmed') => {
    if (e) e.preventDefault();

    const targetStatus: 'confirmed' | 'declined' | 'reconfirmed' = forceStatus || (status === 'declined' ? 'declined' : 'confirmed');

    // If direct form, validate directName
    if (isDirectForm) {
      if (!directName.trim()) {
        setErrorMessage('Por favor, informe o seu nome completo.');
        return;
      }
    } else if (!selectedGuest) {
      setErrorMessage('Por favor, selecione seu convite na lista ou informe seu nome.');
      return;
    }

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

    try {
      let savedGuest: Guest | null = null;

      if (isDirectForm) {
        savedGuest = await WeddingService.saveGuestAsync({
          name: directName.trim(),
          phone: directPhone.trim(),
          maxCompanions: companions.length,
          status: targetStatus,
          confirmedCompanions: (targetStatus === 'confirmed' || targetStatus === 'reconfirmed') ? companions : [],
          dietRestrictions: diet,
          message: message,
        });
      } else if (selectedGuest) {
        savedGuest = await WeddingService.updateGuestStatusAsync(
          selectedGuest.id,
          targetStatus,
          (targetStatus === 'confirmed' || targetStatus === 'reconfirmed') ? companions : [],
          diet,
          message
        );
      }

      if (savedGuest) {
        setSelectedGuest(savedGuest);
        setStatus(targetStatus);
        setIsCompleted(true);

        if (targetStatus === 'confirmed' || targetStatus === 'reconfirmed') {
          confetti({
            particleCount: 140,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#1e40af', '#c2847a', '#c5a059', '#fdfbf7', '#2e4057'],
          });
        }
      } else {
        setErrorMessage('Ocorreu um erro ao salvar sua confirmação. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao salvar RSVP:', err);
      setErrorMessage('Erro de conexão ao salvar sua confirmação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="py-10 sm:py-24 bg-[#F7F2EE] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-3 mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#C2847A] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <UserCheck className="w-3.5 h-3.5" />
            Confirmação de Presença
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2D2422]">
            Confirme sua Presença
          </h2>
          <p className="text-sm sm:text-base text-[#8D7B75] max-w-xl mx-auto font-light">
            Sua presença é fundamental para nós! Confirme sua presença para organizarmos todos os detalhes com muito carinho.
          </p>
          <div className="w-24 h-0.5 bg-[#C2847A]/40 mx-auto mt-4 rounded-full" />
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-10 shadow-sm border border-[#EADBCE]">
          {/* STEP 1: Search or Switch to Direct Form */}
          {!selectedGuest && !isDirectForm ? (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h3 className="font-serif text-2xl font-medium text-[#2D2422]">
                  Encontre o seu Convite
                </h3>
                <p className="text-xs sm:text-sm text-[#8D7B75]">
                  Digite seu nome ou sobrenome para localizar seu convite e confirmar sua presença:
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D7B75]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ex: Carlos Eduardo, Mariana..."
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
                                ? '✨ Presença Confirmada'
                                : guest.status === 'confirmed'
                                ? '✅ Presença Confirmada'
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
                    <div className="text-center p-6 bg-[#FAF3EE] rounded-2xl space-y-3">
                      <p className="text-xs sm:text-sm text-[#8D7B75]">
                        Nenhum convite encontrado com o nome <strong>&ldquo;{searchTerm}&rdquo;</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleStartDirectForm(searchTerm)}
                        className="px-5 py-2.5 rounded-xl bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] shadow-xs transition-all"
                      >
                        ✨ Confirmar presença como &ldquo;{searchTerm}&rdquo; agora
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Form Alternative */}
              <div className="pt-4 border-t border-[#F0E6DF] text-center space-y-3">
                <p className="text-xs text-[#8D7B75]">
                  Prefere confirmar sem buscar na lista?
                </p>
                <button
                  type="button"
                  onClick={() => handleStartDirectForm()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#C2847A] text-[#C2847A] text-xs sm:text-sm font-semibold hover:bg-[#FAF3EE] transition-colors"
                >
                  Preencher Formulário de Confirmação Diretamente
                </button>
              </div>
            </div>
          ) : isCompleted && selectedGuest ? (
            /* STEP 3: Completed Banner */
            <div className="max-w-md mx-auto text-center space-y-6 py-4">
              <div className="inline-flex p-4 rounded-full bg-[#FAF3EE] text-[#C2847A]">
                {status === 'declined' ? (
                  <Heart className="w-10 h-10 text-[#C2847A]" />
                ) : (
                  <PartyPopper className="w-10 h-10 animate-bounce" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2D2422]">
                  {status === 'declined' ? 'Resposta Registrada!' : 'Presença Confirmada com Sucesso! 🎉'}
                </h3>
                <p className="text-sm text-[#6B5A55]">
                  {status === 'declined'
                    ? `Sentiremos sua falta, ${selectedGuest.name}. Agradecemos por nos avisar com antecedência!`
                    : `Obrigado, ${selectedGuest.name}! Estamos muito felizes e ansiosos para celebrar esse momento inesquecível com você!`}
                </p>
              </div>

              {status !== 'declined' && companions.length > 0 && (
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
                    setIsDirectForm(false);
                    setIsCompleted(false);
                    setSearchTerm('');
                  }}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Confirmar presença de outra pessoa
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Confirmation Form (Selected Guest or Direct Form) */
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              {isDirectForm ? (
                <div className="p-5 rounded-2xl bg-[#FAF3EE] border border-[#EADBCE] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#C2847A] font-bold">
                      Nova Confirmação de Presença
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDirectForm(false);
                        setSelectedGuest(null);
                        setSearchTerm('');
                      }}
                      className="text-xs text-[#C2847A] hover:underline font-medium"
                    >
                      Voltar para busca
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] uppercase font-bold text-[#8D7B75] mb-1">
                        Seu Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={directName}
                        onChange={(e) => setDirectName(e.target.value)}
                        placeholder="Ex: Carlos Eduardo Silva"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-bold text-[#8D7B75] mb-1">
                        WhatsApp / Celular (Opcional)
                      </label>
                      <input
                        type="tel"
                        value={directPhone}
                        onChange={(e) => setDirectPhone(e.target.value)}
                        placeholder="Ex: (11) 98765-4321"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                      />
                    </div>
                  </div>
                </div>
              ) : selectedGuest && (
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
                      setIsDirectForm(false);
                      setSearchTerm('');
                    }}
                    className="text-xs text-[#C2847A] hover:underline font-medium"
                  >
                    Trocar
                  </button>
                </div>
              )}

              {/* Status Decision */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  Você comparecerá ao casamento?
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setStatus('confirmed')}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                      status === 'confirmed' || status === 'reconfirmed'
                        ? 'border-[#C2847A] bg-[#FAF3EE] text-[#C2847A] font-semibold shadow-xs'
                        : 'border-[#E8DCD5] bg-white text-[#6B5A55] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Sim, com certeza! 🎉</span>
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
                    <span className="text-sm">Não poderei comparecer</span>
                  </button>
                </div>
              </div>

              {/* If Confirmed, Companions and Diet */}
              {(status === 'confirmed' || status === 'reconfirmed') && (
                <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                  <div className="space-y-3 p-5 rounded-2xl bg-[#FDFBF7] border border-[#E8DCD5]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#2D2422]">
                        <Users className="w-4 h-4 text-[#C2847A]" />
                        <span>
                          Acompanhantes ({companions.length}
                          {selectedGuest && selectedGuest.maxCompanions > 0 ? `/${selectedGuest.maxCompanions}` : ''})
                        </span>
                      </div>

                      {(!selectedGuest || companions.length < (selectedGuest.maxCompanions || 99)) && (
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
                        Nenhum acompanhante adicionado. Clique acima se for acompanhado(a) de familiares.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {companions.map((comp, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <input
                              type="text"
                              value={comp.name}
                              onChange={(e) => handleUpdateCompanion(idx, 'name', e.target.value)}
                              placeholder={`Nome completo do acompanhante ${idx + 1}`}
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
                      placeholder="Ex: Vegetariano, intolerância a lactose, celíaco..."
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                    />
                  </div>
                </div>
              )}

              {/* Message to Couple */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-[#C2847A]" />
                  <span>Mensagem para os Noivos (Opcional):</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva uma mensagem ou votos de felicidades para os noivos..."
                  className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A] resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#C2847A] text-white font-medium text-sm sm:text-base hover:bg-[#B07065] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Salvando confirmação...</span>
                ) : status === 'declined' ? (
                  <span>Informar que Não Poderei Comparecer</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmar Minha Presença</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
