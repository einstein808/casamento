'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Heart, 
  PartyPopper, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  Gift as GiftIcon,
  Lock,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Gift, WeddingSettings, Guest } from '@/lib/types';
import { generatePixPayload, generatePixQrCode } from '@/lib/pix';
import { WeddingService } from '@/lib/wedding-service';
import { formatCurrency } from '@/lib/utils';
import { Search, AlertTriangle } from 'lucide-react';

interface PixModalProps {
  gift: Gift | null;
  settings: WeddingSettings;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PixModal({ gift, settings, isOpen, onClose, onSuccess }: PixModalProps) {
  const [step, setStep] = useState<'form' | 'in_person_confirm' | 'pix' | 'success'>('form');
  const [method, setMethod] = useState<'pix' | 'in_person'>('pix');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [pixPayload, setPixPayload] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setMethod('pix');
      setGuestName('');
      setGuestPhone('');
      setGuestMessage('');
      setCopied(false);
      setErrorMsg('');
      setCustomAmount(gift?.price || 100);
      setGuestList(WeddingService.getGuests());
      WeddingService.syncAllFromCloud().then(() => {
        setGuestList(WeddingService.getGuests());
      });
    }
  }, [isOpen, gift]);

  if (!isOpen || !gift) return null;

  const finalAmount = gift.price > 0 ? gift.price : (customAmount || 100);
  const isPhysicalAlreadyReserved = Boolean(gift.reservedInPerson);

  const filteredGuestSuggestions = guestName.trim().length > 1
    ? guestList.filter(g => g.name.toLowerCase().includes(guestName.toLowerCase())).slice(0, 5)
    : [];

  const handleSelectSuggestedGuest = (guest: Guest) => {
    setGuestName(guest.name);
    if (guest.phone) setGuestPhone(guest.phone);
    setShowSuggestions(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('Por favor, informe seu nome para os noivos.');
      return;
    }

    if (method === 'in_person') {
      if (isPhysicalAlreadyReserved) {
        setErrorMsg('Este presente já foi reservado para entrega física por outro convidado!');
        return;
      }

      // Step 2: Open Double Confirmation Step
      setStep('in_person_confirm');
      return;
    }

    // PIX flow
    setIsGenerating(true);
    try {
      const payload = generatePixPayload({
        pixKey: settings.pixKey,
        merchantName: settings.pixMerchantName || `${settings.brideName} e ${settings.groomName}`,
        merchantCity: settings.pixMerchantCity || 'BRASIL',
        amount: finalAmount,
        description: `Presente: ${gift.title.slice(0, 20)}`,
      });

      setPixPayload(payload);
      const qrDataUrl = await generatePixQrCode(payload);
      setQrCodeUrl(qrDataUrl);
      setStep('pix');
    } catch (err) {
      console.error('Erro ao gerar PIX:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmInPersonReservation = () => {
    const res = WeddingService.reserveGiftInPerson(
      gift.id, 
      guestName.trim(), 
      guestPhone.trim(), 
      guestMessage.trim()
    );

    if (!res.success) {
      setErrorMsg(res.error || 'Não foi possível reservar este item.');
      setStep('form');
      return;
    }

    setStep('success');
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#c2847a', '#d9c5b2', '#e0a899', '#fdfbf7', '#2e4057'],
    });
    onSuccess();
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmSent = () => {
    WeddingService.recordPixContribution({
      giftId: gift.id,
      giftTitle: gift.title,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      amount: finalAmount,
      message: guestMessage.trim(),
      pixCode: pixPayload,
      status: 'confirmed',
      paymentMethod: 'pix',
    });

    setStep('success');
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#c2847a', '#d9c5b2', '#e0a899', '#fdfbf7', '#2e4057'],
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#F0E6DF] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF3EE] to-[#FDFBF7] border-b border-[#EADBCE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C2847A]/10 text-[#C2847A] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2D2422]">
                Presentear os Noivos
              </h3>
              <p className="text-xs text-[#8D7B75] line-clamp-1">
                {gift.title} • {formatCurrency(finalAmount)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#8D7B75] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Product preview card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-[#F0E6DF]">
                <img
                  src={gift.imageUrl}
                  alt={gift.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[#2D2422]">{gift.title}</h4>
                  <p className="text-xs text-[#8D7B75] line-clamp-1">{gift.description}</p>
                  <p className="text-sm font-bold text-[#C2847A] mt-1">
                    {formatCurrency(finalAmount)}
                  </p>
                </div>
              </div>

              {/* Selector: PIX vs Entregar Pessoalmente */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  Como você deseja presentear?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setMethod('pix'); setErrorMsg(''); }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      method === 'pix'
                        ? 'border-[#C2847A] bg-[#FAF3EE] shadow-xs'
                        : 'border-[#E8DCD5] bg-white hover:border-[#C2847A]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D2422] flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-[#C2847A]" />
                        Via PIX
                      </span>
                      {method === 'pix' && <Check className="w-3.5 h-3.5 text-[#C2847A]" />}
                    </div>
                    <p className="text-[11px] text-[#8D7B75]">
                      Rápido e prático pelo QR Code / Copia e Cola
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isPhysicalAlreadyReserved}
                    onClick={() => {
                      if (!isPhysicalAlreadyReserved) {
                        setMethod('in_person');
                        setErrorMsg('');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all relative ${
                      isPhysicalAlreadyReserved
                        ? 'opacity-50 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : method === 'in_person'
                        ? 'border-[#C2847A] bg-[#FAF3EE] shadow-xs'
                        : 'border-[#E8DCD5] bg-white hover:border-[#C2847A]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D2422] flex items-center gap-1">
                        <GiftIcon className="w-3.5 h-3.5 text-[#C2847A]" />
                        Entregar no Dia
                      </span>
                      {isPhysicalAlreadyReserved ? (
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      ) : method === 'in_person' ? (
                        <Check className="w-3.5 h-3.5 text-[#C2847A]" />
                      ) : null}
                    </div>
                    <p className="text-[11px] text-[#8D7B75]">
                      {isPhysicalAlreadyReserved ? 'Já reservado por outro convidado' : 'Comprar e levar pessoalmente na festa'}
                    </p>
                  </button>
                </div>

                {isPhysicalAlreadyReserved && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>
                      A entrega física deste item já foi reservada por <strong>{gift.reservedByGuestName || 'um convidado'}</strong>. Você pode presentear via PIX!
                    </span>
                  </div>
                )}

                {errorMsg && (
                  <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
                )}
              </div>

              {/* Guest name with suggestions */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  {method === 'in_person' ? 'Busque seu nome na lista ou digite:' : 'Seu Nome ou Família:'} <span className="text-[#C2847A]">*</span>
                </label>
                <div className="relative">
                  {method === 'in_person' && (
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D7B75]" />
                  )}
                  <input
                    type="text"
                    required
                    value={guestName}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder={method === 'in_person' ? "Comece digitando seu nome..." : "Ex: Tio Paulo e Família"}
                    className={`w-full py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-sm focus:outline-none focus:border-[#C2847A] ${
                      method === 'in_person' ? 'pl-10 pr-4' : 'px-4'
                    }`}
                  />
                </div>

                {/* Suggestions dropdown */}
                {method === 'in_person' && showSuggestions && filteredGuestSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-[#EADBCE] rounded-2xl shadow-xl overflow-hidden divide-y divide-gray-100">
                    <div className="px-3 py-1.5 bg-[#FAF3EE] text-[10px] uppercase font-bold text-[#8D7B75]">
                      Convidados encontrados na lista:
                    </div>
                    {filteredGuestSuggestions.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectSuggestedGuest(g)}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#FAF3EE] flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="font-semibold text-[#2D2422]">{g.name}</span>
                        <span className="text-[11px] text-[#C2847A] font-medium">Selecionar</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone (useful for in_person delivery) */}
              {method === 'in_person' && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                    Seu Telefone / WhatsApp (para contato):
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-sm focus:outline-none focus:border-[#C2847A]"
                  />
                </div>
              )}

              {/* Message to couple */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  Mensagem de carinho para os noivos (opcional):
                </label>
                <textarea
                  rows={3}
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder="Escreva seus votos de amor e felicidades..."
                  className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-sm focus:outline-none focus:border-[#C2847A] resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isGenerating || !guestName.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#C2847A] text-white font-medium text-sm sm:text-base hover:bg-[#B07065] shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {method === 'in_person' ? (
                  <>
                    <PackageCheck className="w-5 h-5" />
                    <span>Avançar para Confirmação de Entrega</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    <span>{isGenerating ? 'Gerando PIX...' : 'Avançar para Pagamento PIX'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP: Double Confirmation for In-Person Delivery */}
          {step === 'in_person_confirm' && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Dupla Confirmação de Reserva</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">
                  Ao confirmar, este presente será <strong>imediatamente bloqueado e ocultado do site</strong> para que nenhum outro convidado escolha ou compre o mesmo item repetido.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBCE] space-y-3">
                <div className="flex items-center gap-3">
                  <img src={gift.imageUrl} alt={gift.title} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#2D2422]">{gift.title}</h4>
                    <p className="text-xs text-[#C2847A] font-bold">{formatCurrency(finalAmount)}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EADBCE] text-xs text-[#6B5A55] space-y-1">
                  <p><strong>Quem vai levar:</strong> {guestName}</p>
                  {guestPhone && <p><strong>Telefone / WhatsApp:</strong> {guestPhone}</p>}
                  <p><strong>Modalidade:</strong> Entrega física pessoalmente no dia do casamento</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmInPersonReservation}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PackageCheck className="w-5 h-5" />
                  <span>Sim, confirmo que vou comprar e levar este presente!</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full py-2.5 rounded-xl bg-white border border-[#E8DCD5] text-[#6B5A55] text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Voltar / Cancelar
                </button>
              </div>
            </div>
          )}

          {step === 'pix' && (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-[#C2847A] font-bold">
                  Quase lá! Escaneie ou Copie o PIX
                </span>
                <h4 className="font-serif text-xl font-medium text-[#2D2422]">
                  {formatCurrency(finalAmount)}
                </h4>
                <p className="text-xs text-[#8D7B75]">
                  Destinatário: <span className="font-semibold">{settings.pixMerchantName || `${settings.brideName} e ${settings.groomName}`}</span>
                </p>
              </div>

              {/* QR Code Container */}
              {qrCodeUrl && (
                <div className="inline-block p-4 rounded-3xl bg-[#FAF3EE] border border-[#EADBCE] shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="PIX QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-xl shadow-xs"
                  />
                  <p className="text-[11px] text-[#8D7B75] mt-2">
                    Abra o app do seu banco e aponte a câmera
                  </p>
                </div>
              )}

              {/* PIX Copia e Cola */}
              <div className="space-y-2 text-left">
                <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold text-center">
                  Ou use o PIX Copia e Cola:
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5]">
                  <input
                    type="text"
                    readOnly
                    value={pixPayload}
                    className="flex-1 bg-transparent text-xs text-[#6B5A55] font-mono focus:outline-none overflow-hidden text-ellipsis"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] flex items-center gap-1 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleConfirmSent}
                  className="w-full py-3.5 rounded-2xl bg-[#C2847A] text-white font-medium text-sm sm:text-base hover:bg-[#B07065] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Já fiz a transferência no banco</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-[#8D7B75] hover:text-[#2D2422] py-1"
                >
                  Voltar para alterar dados
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#FAF3EE] text-[#C2847A] flex items-center justify-center mx-auto border-2 border-[#EADBCE]">
                <PartyPopper className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2D2422]">
                  {method === 'in_person' ? 'Presente Reservado com Sucesso!' : 'Muito Obrigado pelo Carinho!'}
                </h3>
                <p className="text-sm text-[#6B5A55] max-w-sm mx-auto leading-relaxed">
                  {method === 'in_person' ? (
                    <>
                      <strong>{guestName}</strong>, sua intenção de entregar o item <strong>{gift.title}</strong> pessoalmente foi confirmada. Os noivos agradecem de coração!
                    </>
                  ) : (
                    <>
                      <strong>{guestName}</strong>, sua contribuição e seus votos foram registrados com muito amor no coração dos noivos!
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF3EE]/60 border border-[#EADBCE] text-xs text-[#8D7B75] space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-semibold text-[#2D2422]">
                  <Heart className="w-4 h-4 text-[#C2847A] fill-[#C2847A]" />
                  <span>{settings.brideName} & {settings.groomName}</span>
                </div>
                <p>Agradecem imensamente por fazer parte dessa história.</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-[#2D2422] text-white font-medium text-sm hover:bg-black transition-colors"
              >
                Concluir e Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
