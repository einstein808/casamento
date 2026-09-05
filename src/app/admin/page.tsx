'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Gift, 
  DollarSign, 
  Camera, 
  Send, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Settings, 
  ExternalLink, 
  Smartphone, 
  QrCode, 
  Eye,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  UploadCloud,
  Layers,
  Image as ImageIcon,
  Palette,
  Heart,
  HardDrive,
  MessageSquare,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Guest, GuestMetrics, WeddingSettings, Gift as GiftType, PixContribution, GuestPhoto, StoryMilestone, ThemeColors, SectionId, GuestChecklistItem } from '@/lib/types';
import { WeddingService } from '@/lib/wedding-service';
import { EvolutionApiClient, interpolateWeddingMessage } from '@/lib/evolution-api';
import { THEME_PRESETS } from '@/lib/themes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { compressImage } from '@/lib/image-cache';
import { ThemeInjector } from '@/components/layout/ThemeInjector';
import { CHECKLIST_ICONS, DEFAULT_CHECKLIST_ITEMS, getChecklistIconComponent } from '@/lib/checklist-icons';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<'metrics' | 'site_editor' | 'guests' | 'messages' | 'gifts' | 'photos' | 'settings'>('metrics');
  const [settings, setSettings] = useState<WeddingSettings>(WeddingService.getSettings());
  const [metrics, setMetrics] = useState<GuestMetrics>(WeddingService.getMetrics());
  const [guests, setGuests] = useState<Guest[]>(WeddingService.getGuests());
  const [gifts, setGifts] = useState<GiftType[]>(WeddingService.getGifts());
  const [pixLogs, setPixLogs] = useState<PixContribution[]>(WeddingService.getPixContributions());
  const [photos, setPhotos] = useState<GuestPhoto[]>(WeddingService.getPhotos());

  // Filter & Search
  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilter, setGuestFilter] = useState<'all' | 'confirmed' | 'reconfirmed' | 'pending' | 'declined' | 'attended'>('all');
  
  // Modals
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestCompanions, setNewGuestCompanions] = useState(0);

  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [newGiftTitle, setNewGiftTitle] = useState('');
  const [newGiftCategory, setNewGiftCategory] = useState<any>('casa');
  const [newGiftPrice, setNewGiftPrice] = useState('');
  const [newGiftDesc, setNewGiftDesc] = useState('');
  const [newGiftImage, setNewGiftImage] = useState('');

  // MinIO File upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const heroFileRef = useRef<HTMLInputElement>(null);
  const heroMobileFileRef = useRef<HTMLInputElement>(null);

  // WhatsApp Evolution Dispatch Status
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Custom WhatsApp Dispatch Modal
  const [activeDispatchGuest, setActiveDispatchGuest] = useState<Guest | null>(null);
  const [dispatchMessageType, setDispatchMessageType] = useState<'invite' | 'reminder' | 'reconfirmation'>('invite');
  const [customMessageDraft, setCustomMessageDraft] = useState<string>('');

  const handleOpenDispatchModal = (guest: Guest, type: 'invite' | 'reminder' | 'reconfirmation' = 'invite') => {
    setActiveDispatchGuest(guest);
    setDispatchMessageType(type);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    let template = '';
    if (type === 'invite') {
      template = settings.customInviteMessageTemplate || 
        `💍 *CONVITE DE CASAMENTO* 💍\n\nOlá *{{nome}}*!\n\nCom imensa alegria, nós, *{{noivos}}*, convidamos você para celebrar o nosso amor e o início do nosso para sempre!\n\n🗓 *Data:* {{data}}\n⏰ *Horário:* {{horario}}\n📍 *Local:* {{local}}\n✨ {{acompanhantes}}\n\nPara nos organizarmos da melhor forma com o buffet e cerimonial, pedimos com carinho que *confirme sua presença* através do seu link exclusivo:\n👉 {{link}}\n\nEsperamos você para viver esse dia inesquecível conosco! ❤️`;
    } else if (type === 'reminder') {
      template = settings.customReminderMessageTemplate || 
        `⏰ *LEMBRETE DE CONFIRMAÇÃO - CASAMENTO* ⏰\n\nOlá *{{nome}}*!\n\nFaltam apenas *{{dias}} dias* para o nosso grande dia! 👰🤵\n\nEstamos finalizando a lista de convidados junto ao buffet e cerimonial. Você ainda não confirmou sua presença no nosso site.\n\nPor favor, acesse o link abaixo em 1 minuto para nos avisar se poderá comparecer:\n👉 {{link}}\n\nCom amor,\n*{{noivos}}* ❤️`;
    } else {
      template = settings.customReconfirmationMessageTemplate || 
        `📋 *RECONFIRMAÇÃO FINAL DE PRESENÇA* 📋\n\nOlá *{{nome}}*!\n\nFaltam apenas *{{dias}} dias* para o casamento de *{{noivos}}*! 👰🤵✨\n\nEstamos enviando esta mensagem para fazer a *Reconfirmação Final* dos convidados confirmados, para passarmos a lista definitiva ao Buffet e organização dos lugares.\n\nPor favor, dê um clique rápido no link abaixo para fazer a *Reconfirmação Definitiva* ou nos avisar caso tenha ocorrido algum imprevisto:\n👉 {{link}}#rsvp\n\nMuito obrigado pelo carinho de sempre! ❤️`;
    }

    setCustomMessageDraft(interpolateWeddingMessage(template, guest, settings, origin));
  };

  const reloadAll = () => {
    setSettings(WeddingService.getSettings());
    setMetrics(WeddingService.getMetrics());
    setGuests(WeddingService.getGuests());
    setGifts(WeddingService.getGifts());
    setPixLogs(WeddingService.getPixContributions());
    setPhotos(WeddingService.getPhotos());
  };

  useEffect(() => {
    const unlocked = sessionStorage.getItem('casamento_admin_unlocked');
    if (unlocked === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('casamento_admin_unlocked', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Upload Photo to MinIO for Hero, Hero Mobile, or Milestone
  const handleUploadPhoto = async (file: File, target: 'hero' | 'hero_mobile' | { milestoneIndex: number }) => {
    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('settings', JSON.stringify(settings));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        if (target === 'hero') {
          const updated = { ...settings, heroBackgroundImageUrl: data.url };
          setSettings(updated);
          WeddingService.saveSettings(updated);
        } else if (target === 'hero_mobile') {
          const updated = { ...settings, heroBackgroundMobileImageUrl: data.url };
          setSettings(updated);
          WeddingService.saveSettings(updated);
        } else {
          const updatedMilestones = [...settings.loveStory];
          updatedMilestones[target.milestoneIndex].imageUrl = data.url;
          const updated = { ...settings, loveStory: updatedMilestones };
          setSettings(updated);
          WeddingService.saveSettings(updated);
        }
        setUploadSuccessMessage('Foto enviada e salva com sucesso!');
        setTimeout(() => setUploadSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Erro ao enviar foto.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    WeddingService.saveGuest({
      name: newGuestName.trim(),
      phone: newGuestPhone.trim(),
      maxCompanions: Number(newGuestCompanions) || 0,
      status: 'pending',
    });

    setNewGuestName('');
    setNewGuestPhone('');
    setNewGuestCompanions(0);
    setShowAddGuestModal(false);
    reloadAll();
  };

  const handleToggleCheckIn = (guestId: string) => {
    WeddingService.toggleGuestCheckIn(guestId);
    reloadAll();
  };

  const handleDeleteGuest = (guestId: string) => {
    if (confirm('Tem certeza que deseja remover este convidado da lista?')) {
      WeddingService.deleteGuest(guestId);
      reloadAll();
    }
  };

  const handleSendWhatsAppReconfirmation = async (guest: Guest) => {
    if (!guest.phone) {
      alert('Este convidado não possui telefone cadastrado.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const evolution = new EvolutionApiClient(settings);

    if (!evolution.isConfigured()) {
      const text = `📋 Olá ${guest.name}! Faltam poucas semanas para o nosso casamento! Por favor, faça sua Reconfirmação Final de Presença pelo link: ${origin}/convite/${guest.slug}#rsvp`;
      window.open(EvolutionApiClient.getWhatsAppDirectUrl(guest.phone, text), '_blank');
      WeddingService.recordReminderSent(guest.id);
      reloadAll();
      return;
    }

    setDispatchStatus(`Enviando reconfirmação para ${guest.name}...`);
    const res = await evolution.sendReconfirmationMessage(guest, settings, origin);
    if (res.success) {
      WeddingService.recordReminderSent(guest.id);
      reloadAll();
      setDispatchStatus(`✅ Reconfirmação enviada para ${guest.name}!`);
    } else {
      setDispatchStatus(`❌ Erro no envio: ${res.error}`);
    }
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  const handleCopyInviteLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/convite/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Evolution API Single Dispatch
  const handleSendWhatsAppInvite = async (guest: Guest) => {
    if (!guest.phone) {
      alert('Este convidado não possui telefone cadastrado.');
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const evolution = new EvolutionApiClient(settings);

    if (!evolution.isConfigured()) {
      const text = `💍 Olá ${guest.name}! Convidamos você para o nosso casamento! Confirme sua presença pelo link: ${origin}/convite/${guest.slug}`;
      window.open(EvolutionApiClient.getWhatsAppDirectUrl(guest.phone, text), '_blank');
      WeddingService.recordReminderSent(guest.id);
      reloadAll();
      return;
    }

    setDispatchStatus(`Enviando convite para ${guest.name}...`);
    const res = await evolution.sendInvitation(guest, settings, origin);
    if (res.success) {
      WeddingService.recordReminderSent(guest.id);
      reloadAll();
      setDispatchStatus(`✅ Convite enviado com sucesso para ${guest.name}!`);
    } else {
      setDispatchStatus(`❌ Erro no envio: ${res.error}`);
    }
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  // Evolution API Batch Reminder
  const handleSendBatchReminder = async () => {
    const pendingWithPhone = guests.filter(g => g.status === 'pending' && g.phone);
    if (pendingWithPhone.length === 0) {
      alert('Não há convidados pendentes com telefone cadastrado para receber lembrete.');
      return;
    }

    if (!confirm(`Deseja disparar lembrete de confirmação para ${pendingWithPhone.length} convidados pendentes?`)) {
      return;
    }

    setIsSendingBatch(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const evolution = new EvolutionApiClient(settings);

    let sentCount = 0;
    for (const guest of pendingWithPhone) {
      setDispatchStatus(`Enviando lembrete para ${guest.name} (${sentCount + 1}/${pendingWithPhone.length})...`);
      
      if (evolution.isConfigured()) {
        await evolution.sendRsvpReminder(guest, settings, origin);
      }
      WeddingService.recordReminderSent(guest.id);
      sentCount++;
      await new Promise(r => setTimeout(r, 1500));
    }

    setIsSendingBatch(false);
    reloadAll();
    setDispatchStatus(`🎉 Lembretes enviados com sucesso para ${sentCount} convidados!`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  const handleAddGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftTitle.trim() || !newGiftPrice) return;

    WeddingService.saveGift({
      title: newGiftTitle.trim(),
      category: newGiftCategory,
      price: parseFloat(newGiftPrice) || 50,
      description: newGiftDesc.trim(),
      imageUrl: newGiftImage.trim() || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    });

    setNewGiftTitle('');
    setNewGiftPrice('');
    setNewGiftDesc('');
    setNewGiftImage('');
    setShowAddGiftModal(false);
    reloadAll();
  };

  const handleAddMilestone = () => {
    const newM: StoryMilestone = {
      year: `${new Date().getFullYear()}`,
      title: 'Novo Momento Especial',
      description: 'Descreva aqui como foi esse capítulo da história de vocês...',
      imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    };
    const updated = { ...settings, loveStory: [...settings.loveStory, newM] };
    setSettings(updated);
    WeddingService.saveSettings(updated);
  };

  const handleRemoveMilestone = (index: number) => {
    const updated = {
      ...settings,
      loveStory: settings.loveStory.filter((_, i) => i !== index),
    };
    setSettings(updated);
    WeddingService.saveSettings(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    WeddingService.saveSettings(settings);
    reloadAll();
    alert('✨ Todas as alterações do site foram salvas e já estão no ar!');
  };

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
                          (g.phone && g.phone.includes(guestSearch));
    
    if (guestFilter === 'confirmed') return matchesSearch && (g.status === 'confirmed' || g.status === 'reconfirmed');
    if (guestFilter === 'reconfirmed') return matchesSearch && g.status === 'reconfirmed';
    if (guestFilter === 'pending') return matchesSearch && g.status === 'pending';
    if (guestFilter === 'declined') return matchesSearch && g.status === 'declined';
    if (guestFilter === 'attended') return matchesSearch && g.attendedOnDay;
    return matchesSearch;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#2D2422] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF3EE] text-[#C2847A] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#2D2422]">
              Painel dos Noivos
            </h2>
            <p className="text-xs text-[#8D7B75]">
              Digite o PIN de 4 dígitos para gerenciar e personalizar o site:
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN (Padrão: 1234)"
              className="w-full text-center tracking-widest text-xl py-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] focus:outline-none focus:border-[#C2847A]"
              autoFocus
            />

            {pinError && (
              <p className="text-xs text-red-600 font-medium">
                PIN incorreto. O PIN padrão é 1234.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#C2847A] text-white font-semibold text-sm hover:bg-[#B07065] transition-all shadow-sm"
            >
              Acessar Painel
            </button>
          </form>

          <Link href="/" className="inline-block text-xs text-[#8D7B75] hover:text-[#2D2422] underline">
            Voltar para o site dos noivos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2422] pb-24">
      <ThemeInjector colors={settings.themeColors} />
      {/* Header */}
      <header className="bg-white border-b border-[#F0E6DF] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3EE] text-[#C2847A] flex items-center justify-center font-bold">
              {settings.coupleInitials || '💍'}
            </div>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#2D2422]">
                Painel dos Noivos • {settings.brideName} & {settings.groomName}
              </h1>
              <p className="text-xs text-[#8D7B75]">
                {formatDate(settings.weddingDate)} • {settings.ceremonyVenueName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={reloadAll}
              title="Atualizar dados"
              className="p-2 rounded-lg text-[#8D7B75] hover:bg-[#FAF3EE] hover:text-[#C2847A] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-full bg-[#FAF3EE] text-[#C2847A] hover:bg-[#C2847A] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Site no Ar</span>
            </Link>

            <button
              onClick={() => {
                sessionStorage.removeItem('casamento_admin_unlocked');
                setIsAuthenticated(false);
              }}
              className="px-3 py-1.5 rounded-full text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'metrics'
                ? 'bg-[#C2847A] text-white shadow-xs'
                : 'text-[#6B5A55] hover:bg-[#FAF3EE]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Métricas & Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('site_editor')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'site_editor'
                ? 'bg-[#C2847A] text-white shadow-xs'
                : 'text-[#6B5A55] hover:bg-[#FAF3EE]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>🎨 Personalizar Site & Fotos</span>
          </button>

          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'guests'
                ? 'bg-[#C2847A] text-white shadow-xs'
                : 'text-[#6B5A55] hover:bg-[#FAF3EE]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Convidados & WhatsApp ({guests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gifts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'gifts'
                ? 'bg-[#C2847A] text-white shadow-xs'
                : 'text-[#6B5A55] hover:bg-[#FAF3EE]'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Presentes & PIX ({pixLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'bg-[#C2847A] text-white shadow-xs'
                : 'text-[#6B5A55] hover:bg-[#FAF3EE]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Mural dos Convidados ({photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-[#C2847A] text-white shadow-xs'
                : 'text-[#6B5A55] hover:bg-[#FAF3EE]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Modelos WhatsApp (Tenant)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#C2847A] text-white shadow-xs'
                : 'text-[#6B5A55] hover:bg-[#FAF3EE]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>APIs & Armazenamento MinIO</span>
          </button>
        </div>
      </header>

      {/* Global Notification Banner */}
      {(dispatchStatus || uploadSuccessMessage) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3.5 rounded-2xl bg-[#2D2422] text-white text-xs sm:text-sm flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C2847A]" />
              <span>{dispatchStatus || uploadSuccessMessage}</span>
            </div>
            <button onClick={() => { setDispatchStatus(null); setUploadSuccessMessage(''); }} className="text-white/60 hover:text-white text-xs">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ================= METRICS TAB ================= */}
        {activeTab === 'metrics' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-[#2D2422]">
                    Métricas de Convidados
                  </h2>
                  <p className="text-xs text-[#8D7B75]">
                    Acompanhamento em tempo real de confirmações, pendências e presença no dia
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('guests')}
                  className="px-4 py-2 rounded-xl bg-[#FAF3EE] text-[#C2847A] text-xs font-semibold hover:bg-[#C2847A] hover:text-white transition-colors"
                >
                  Gerenciar Convidados →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0E6DF] shadow-xs">
                  <div className="flex items-center justify-between text-[#8D7B75] mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Total Previsto</span>
                    <Users className="w-4 h-4 text-[#8D7B75]" />
                  </div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2422]">{metrics.totalInvited}</p>
                  <p className="text-[10px] text-[#8D7B75] mt-1">
                    {metrics.totalGuests} titulares + acomps
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-xs bg-emerald-50/30">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Confirmados</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800">{metrics.confirmedTotal}</p>
                  <p className="text-[10px] text-emerald-700 mt-1">
                    {metrics.confirmedAdults} adultos, {metrics.confirmedChildren} crianças
                  </p>
                </div>

                {/* Reconfirmados Definitivos */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-teal-200 shadow-xs bg-teal-50/40">
                  <div className="flex items-center justify-between text-teal-700 mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Reconfirmados</span>
                    <Sparkles className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-teal-800">{metrics.reconfirmedTotal}</p>
                  <p className="text-[10px] text-teal-700 mt-1">
                    Reconfirmação pré-evento
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200 shadow-xs bg-amber-50/30">
                  <div className="flex items-center justify-between text-amber-700 mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Pendentes</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-800">{metrics.pendingTotal}</p>
                  <p className="text-[10px] text-amber-700 mt-1">
                    Aguardando resposta
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-red-200 shadow-xs bg-red-50/30">
                  <div className="flex items-center justify-between text-red-700 mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Recusados</span>
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-red-800">{metrics.declinedTotal}</p>
                  <p className="text-[10px] text-red-600 mt-1">
                    Não poderão ir
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-blue-200 shadow-xs bg-blue-50/30">
                  <div className="flex items-center justify-between text-blue-700 mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider">No Casamento</span>
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-blue-800">{metrics.attendedTotal}</p>
                  <p className="text-[10px] text-blue-700 mt-1">
                    Presenças no evento
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#C2847A]/30 shadow-xs bg-[#FAF3EE]/40">
                  <div className="flex items-center justify-between text-[#C2847A] mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Total em PIX</span>
                    <DollarSign className="w-4 h-4 text-[#C2847A]" />
                  </div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#C2847A]">
                    {formatCurrency(metrics.totalRaisedPix)}
                  </p>
                  <p className="text-[10px] text-[#8D7B75] mt-1">
                    {pixLogs.length} presentes
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* WhatsApp Evolution Center */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DF] shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#2D2422]">
                        Central WhatsApp (Evolution API)
                      </h3>
                      <p className="text-xs text-[#8D7B75]">
                        Instância: <strong>{settings.evolutionInstanceName || 'BarmanJF'}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF3EE] border border-[#EADBCE] text-xs text-[#6B5A55] space-y-2">
                  <p className="font-semibold text-[#2D2422]">Disparos automáticos disponíveis:</p>
                  <p>• <strong>1. Convite Individual:</strong> Envia o link exclusivo do convidado com mensagem carinhosa.</p>
                  <p>• <strong>2. Lembrete de RSVP:</strong> Avisa os pendentes que o casamento está chegando.</p>
                  <p>• <strong>3. Reconfirmação Final (Pré-Evento):</strong> Dispara mensagem especial semanas antes para quem confirmou anteriormente, fechando o número final com o Buffet.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleSendBatchReminder}
                    disabled={isSendingBatch || metrics.pendingTotal === 0}
                    className="py-3 px-4 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Lembrar Pendentes ({metrics.pendingTotal})</span>
                  </button>

                  <button
                    onClick={async () => {
                      const confirmedWithPhone = guests.filter(g => (g.status === 'confirmed' || g.status === 'reconfirmed') && g.phone);
                      if (confirmedWithPhone.length === 0) {
                        alert('Nenhum convidado confirmado possui telefone cadastrado.');
                        return;
                      }
                      if (!confirm(`Deseja disparar mensagem de RECONFIRMAÇÃO FINAL para os ${confirmedWithPhone.length} convidados confirmados?`)) {
                        return;
                      }
                      setIsSendingBatch(true);
                      const origin = typeof window !== 'undefined' ? window.location.origin : '';
                      const evolution = new EvolutionApiClient(settings);
                      let count = 0;
                      for (const guest of confirmedWithPhone) {
                        setDispatchStatus(`Enviando reconfirmação para ${guest.name} (${count + 1}/${confirmedWithPhone.length})...`);
                        if (evolution.isConfigured()) {
                          await evolution.sendReconfirmationMessage(guest, settings, origin);
                        }
                        WeddingService.recordReminderSent(guest.id);
                        count++;
                        await new Promise(r => setTimeout(r, 1500));
                      }
                      setIsSendingBatch(false);
                      reloadAll();
                      setDispatchStatus(`🎉 Mensagens de reconfirmação enviadas com sucesso para ${count} convidados!`);
                      setTimeout(() => setDispatchStatus(null), 5000);
                    }}
                    disabled={isSendingBatch || metrics.confirmedTotal === 0}
                    className="py-3 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Disparar Reconfirmação Final</span>
                  </button>
                </div>
              </div>

              {/* Recent PIX Contributions */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DF] shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF3EE] text-[#C2847A] flex items-center justify-center">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#2D2422]">
                        Últimos Presentes PIX
                      </h3>
                      <p className="text-xs text-[#8D7B75]">
                        Presentes e mensagens dos convidados
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-[#C2847A]">
                    {formatCurrency(metrics.totalRaisedPix)}
                  </span>
                </div>

                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                  {pixLogs.length === 0 ? (
                    <p className="text-xs text-[#8D7B75] py-4 text-center italic">
                      Nenhum presente recebido ainda.
                    </p>
                  ) : (
                    pixLogs.slice().reverse().map((log) => (
                      <div key={log.id} className="py-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2D2422]">{log.guestName}</span>
                          <span className="font-semibold text-emerald-700">{formatCurrency(log.amount)}</span>
                        </div>
                        <p className="text-xs text-[#C2847A] font-medium">{log.giftTitle}</p>
                        {log.message && (
                          <p className="text-[11px] text-[#6B5A55] italic">&ldquo;{log.message}&rdquo;</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SITE EDITOR TAB (Full Noivos Customizer) ================= */}
        {activeTab === 'site_editor' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-medium text-[#2D2422]">
                  Personalização Completa do Site
                </h2>
                <p className="text-xs text-[#8D7B75]">
                  Altere fotos, textos, datas, locais e história de amor com salvamento instantâneo
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-[#C2847A] text-white text-xs sm:text-sm font-semibold hover:bg-[#B07065] shadow-md transition-all"
              >
                Salvar Todas as Alterações
              </button>
            </div>

            {/* Hero & Background Image */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DF] shadow-xs space-y-6">
              <h3 className="font-serif text-lg font-semibold text-[#2D2422] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#C2847A]" />
                <span>1. Foto Principal (Hero) & Nomes dos Noivos</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 space-y-4">
                  {/* Foto Desktop */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75]">
                      1. Foto Desktop (Principal / Computador):
                    </label>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8DCD5] bg-gray-100 shadow-inner">
                      <img
                        src={settings.heroBackgroundImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85'}
                        alt="Foto dos Noivos Desktop"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: settings.heroImagePositionDesktop || 'center 15%' }}
                      />
                    </div>

                    <input
                      ref={heroFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadPhoto(file, 'hero');
                      }}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => heroFileRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-[#FAF3EE] text-[#C2847A] font-semibold text-xs hover:bg-[#C2847A] hover:text-white transition-all flex items-center justify-center gap-2 border border-[#E8DCD5]"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{isUploadingImage ? 'Enviando foto...' : 'Trocar Foto Desktop'}</span>
                    </button>

                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">
                        Enquadramento Desktop (Foco Vertical):
                      </label>
                      <select
                        value={settings.heroImagePositionDesktop || 'center 15%'}
                        onChange={(e) => {
                          const updated = { ...settings, heroImagePositionDesktop: e.target.value };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                      >
                        <option value="center 0%">Topo Absoluto (0% - Foco bem alto)</option>
                        <option value="center 15%">✨ Foco nos Rostos (15% - Recomendado para PC)</option>
                        <option value="center 30%">Superior Médio (30%)</option>
                        <option value="center center">Centro (50%)</option>
                        <option value="center bottom">Inferior (100%)</option>
                      </select>
                    </div>
                  </div>

                  {/* Foto Mobile (Opcional) */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF3EE]/60 border border-[#EADBCE] space-y-2">
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75]">
                      2. Foto para Celular (Opcional - Vertical):
                    </label>
                    <div className="relative aspect-[3/4] max-h-36 rounded-xl overflow-hidden border border-[#E8DCD5] bg-gray-100 mx-auto">
                      <img
                        src={settings.heroBackgroundMobileImageUrl || settings.heroBackgroundImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85'}
                        alt="Foto dos Noivos Mobile"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: settings.heroImagePositionMobile || 'center center' }}
                      />
                    </div>

                    <input
                      ref={heroMobileFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadPhoto(file, 'hero_mobile');
                      }}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => heroMobileFileRef.current?.click()}
                      className="w-full py-2 rounded-xl bg-white text-[#C2847A] font-semibold text-xs hover:bg-[#C2847A] hover:text-white transition-all flex items-center justify-center gap-1.5 border border-[#E8DCD5]"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{settings.heroBackgroundMobileImageUrl ? 'Trocar Foto Celular' : 'Enviar Foto Exclusiva Celular'}</span>
                    </button>

                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">
                        Enquadramento Celular:
                      </label>
                      <select
                        value={settings.heroImagePositionMobile || 'center center'}
                        onChange={(e) => {
                          const updated = { ...settings, heroImagePositionMobile: e.target.value };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                      >
                        <option value="center top">Topo (Foco no alto)</option>
                        <option value="center 15%">Foco nos Rostos (15%)</option>
                        <option value="center center">Centro (Padrão)</option>
                        <option value="center bottom">Inferior</option>
                      </select>
                    </div>
                  </div>

                  {/* Sliders de Opacidade & Escurecimento */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF3EE]/60 border border-[#EADBCE] space-y-3 pt-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#2D2422]">
                        <span>Opacidade da Foto:</span>
                        <span className="font-mono text-[#C2847A]">{settings.heroImageOpacity ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={settings.heroImageOpacity ?? 100}
                        onChange={(e) => {
                          const updated = { ...settings, heroImageOpacity: Number(e.target.value) };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-full accent-[#C2847A] cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#2D2422]">
                        <span>Escurecimento (Contraste):</span>
                        <span className="font-mono text-[#C2847A]">{settings.heroOverlayDarkness ?? 60}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="95"
                        step="5"
                        value={settings.heroOverlayDarkness ?? 60}
                        onChange={(e) => {
                          const updated = { ...settings, heroOverlayDarkness: Number(e.target.value) };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-full accent-[#C2847A] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Nome da Noiva</label>
                    <input
                      type="text"
                      value={settings.brideName}
                      onChange={(e) => setSettings({ ...settings, brideName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Nome do Noivo</label>
                    <input
                      type="text"
                      value={settings.groomName}
                      onChange={(e) => setSettings({ ...settings, groomName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Iniciais (ex: F & G)</label>
                    <input
                      type="text"
                      value={settings.coupleInitials}
                      onChange={(e) => setSettings({ ...settings, coupleInitials: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Data & Hora do Casamento</label>
                    <input
                      type="datetime-local"
                      value={settings.weddingDate.slice(0, 16)}
                      onChange={(e) => setSettings({ ...settings, weddingDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Frase de Amor / Subtítulo do Topo</label>
                    <input
                      type="text"
                      value={settings.heroSubtitle}
                      onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Organizar Ordem das Seções da Página */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DF] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#2D2422] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#C2847A]" />
                    <span>📌 Ordem de Exibição das Seções no Site</span>
                  </h3>
                  <p className="text-xs text-[#8D7B75]">
                    Suba ou desça as seções para mudar a ordem em que elas aparecem na página e no menu para os convidados
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const defaultOrder: SectionId[] = ['historia', 'local', 'orientacoes', 'rsvp', 'presentes', 'fotos', 'duvidas'];
                    const updated = { ...settings, sectionOrder: defaultOrder };
                    setSettings(updated);
                    WeddingService.saveSettings(updated);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF3EE] text-[#C2847A] text-xs font-semibold hover:bg-[#C2847A] hover:text-white transition-colors self-start sm:self-auto"
                >
                  Restaurar Ordem Padrão
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                {(() => {
                  const defaultOrder: SectionId[] = ['historia', 'local', 'orientacoes', 'rsvp', 'presentes', 'fotos', 'duvidas'];
                  const order = settings.sectionOrder && settings.sectionOrder.length > 0 ? settings.sectionOrder : defaultOrder;

                  const sectionMeta: Record<SectionId, { title: string; desc: string; tag: string }> = {
                    historia: {
                      title: 'Nossa História de Amor',
                      desc: 'Linha do tempo com fotos e momentos marcantes do casal',
                      tag: '#historia',
                    },
                    local: {
                      title: 'O Casamento (Cerimônia & Recepção)',
                      desc: 'Endereço, horários, rota e mapa para os convidados',
                      tag: '#local',
                    },
                    orientacoes: {
                      title: 'Orientações aos Convidados & Checklist',
                      desc: 'Trajes sugeridos, open cooler, calçados e dicas úteis',
                      tag: '#orientacoes',
                    },
                    rsvp: {
                      title: 'Confirmação de Presença (RSVP)',
                      desc: 'Formulário de confirmação de presença e acompanhantes',
                      tag: '#rsvp',
                    },
                    presentes: {
                      title: 'Lista de Presentes & PIX',
                      desc: 'Vitrine de cotas, brincadeiras e PIX Copia e Cola',
                      tag: '#presentes',
                    },
                    fotos: {
                      title: 'Mural de Fotos dos Convidados',
                      desc: 'Galeria colaborativa com upload de fotos ao vivo',
                      tag: '#fotos',
                    },
                    duvidas: {
                      title: 'Perguntas Frequentes & Dúvidas (FAQ)',
                      desc: 'Tire dúvidas sobre estacionamento, trajes e cardápio',
                      tag: '#duvidas',
                    },
                  };

                  return order.map((sectionId, idx) => {
                    const meta = sectionMeta[sectionId];
                    if (!meta) return null;

                    return (
                      <div
                        key={sectionId}
                        className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DCD5] hover:border-[#C2847A]/50 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-[#FAF3EE] text-[#C2847A] font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-[#EADBCE]">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-xs sm:text-sm text-[#2D2422]">
                                {meta.title}
                              </h4>
                              <span className="text-[10px] font-mono text-[#8D7B75] bg-white px-1.5 py-0.5 rounded border border-[#E8DCD5]">
                                {meta.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8D7B75] hidden sm:block">
                              {meta.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const newOrder = [...order];
                              const temp = newOrder[idx];
                              newOrder[idx] = newOrder[idx - 1];
                              newOrder[idx - 1] = temp;
                              const updated = { ...settings, sectionOrder: newOrder };
                              setSettings(updated);
                              WeddingService.saveSettings(updated);
                            }}
                            className="p-2 rounded-xl bg-white border border-[#E8DCD5] text-[#2D2422] hover:bg-[#FAF3EE] hover:text-[#C2847A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === order.length - 1}
                            onClick={() => {
                              const newOrder = [...order];
                              const temp = newOrder[idx];
                              newOrder[idx] = newOrder[idx + 1];
                              newOrder[idx + 1] = temp;
                              const updated = { ...settings, sectionOrder: newOrder };
                              setSettings(updated);
                              WeddingService.saveSettings(updated);
                            }}
                            className="p-2 rounded-xl bg-white border border-[#E8DCD5] text-[#2D2422] hover:bg-[#FAF3EE] hover:text-[#C2847A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Cerimônia & Recepção */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DF] shadow-xs space-y-6">
              <h3 className="font-serif text-lg font-semibold text-[#2D2422] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C2847A]" />
                <span>2. Locais, Horários e Mapas</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cerimônia */}
                <div className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  settings.hasCeremony !== false ? 'bg-[#FAF3EE]/50 border-[#EADBCE]' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}>
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-semibold text-sm text-[#2D2422]">Cerimônia (Igreja / Altar)</h4>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hasCeremony !== false}
                        onChange={(e) => {
                          const updated = { ...settings, hasCeremony: e.target.checked };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="rounded accent-[#C2847A]"
                      />
                      <span>Ativar</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">Nome do Local</label>
                    <input
                      type="text"
                      value={settings.ceremonyVenueName}
                      onChange={(e) => setSettings({ ...settings, ceremonyVenueName: e.target.value })}
                      placeholder="Ex: Capela dos Sonhos & Jardins"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={settings.ceremonyAddress}
                      onChange={(e) => setSettings({ ...settings, ceremonyAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">Horário</label>
                      <input
                        type="text"
                        value={settings.ceremonyTime}
                        onChange={(e) => setSettings({ ...settings, ceremonyTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">Link Google Maps</label>
                      <input
                        type="text"
                        value={settings.ceremonyMapsUrl}
                        onChange={(e) => setSettings({ ...settings, ceremonyMapsUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Recepção */}
                <div className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  settings.hasReception !== false ? 'bg-[#FAF3EE]/50 border-[#EADBCE]' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}>
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-semibold text-sm text-[#2D2422]">Recepção & Festa</h4>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hasReception !== false}
                        onChange={(e) => {
                          const updated = { ...settings, hasReception: e.target.checked };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="rounded accent-[#C2847A]"
                      />
                      <span>Ativar</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">Nome do Espaço</label>
                    <input
                      type="text"
                      value={settings.receptionVenueName}
                      onChange={(e) => setSettings({ ...settings, receptionVenueName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={settings.receptionAddress}
                      onChange={(e) => setSettings({ ...settings, receptionAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">Horário de Início</label>
                      <input
                        type="text"
                        value={settings.receptionTime}
                        onChange={(e) => setSettings({ ...settings, receptionTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#8D7B75] mb-1">Link Google Maps</label>
                      <input
                        type="text"
                        value={settings.receptionMapsUrl}
                        onChange={(e) => setSettings({ ...settings, receptionMapsUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DCD5] text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linha do Tempo / Nossa História */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DF] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#2D2422] flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#C2847A]" />
                    <span>3. Linha do Tempo (Nossa História)</span>
                  </h3>
                  <p className="text-xs text-[#8D7B75]">
                    Caso não queira colocar nenhum marco, a seção é ocultada automaticamente do site.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2D2422] bg-[#FAF3EE] px-3 py-1.5 rounded-xl border border-[#EADBCE]">
                    <input
                      type="checkbox"
                      checked={settings.showLoveStorySection !== false && settings.loveStory.length > 0}
                      onChange={(e) => {
                        const updated = { ...settings, showLoveStorySection: e.target.checked };
                        setSettings(updated);
                        WeddingService.saveSettings(updated);
                      }}
                      className="rounded accent-[#C2847A]"
                    />
                    <span>Ativar seção no site</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3.5 py-1.5 rounded-xl bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Marco</span>
                  </button>
                </div>
              </div>

              {settings.loveStory.length === 0 ? (
                <div className="text-center py-8 bg-[#FAF3EE]/50 rounded-2xl border border-dashed border-[#EADBCE] space-y-2">
                  <Heart className="w-6 h-6 text-[#C2847A] mx-auto opacity-50" />
                  <p className="text-xs font-medium text-[#2D2422]">Nenhum marco cadastrado no momento.</p>
                  <p className="text-[11px] text-[#8D7B75]">
                    A seção &ldquo;Nossa História&rdquo; está <strong>100% oculta do site</strong> para os convidados.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                {settings.loveStory.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E8DCD5] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="space-y-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <input
                        type="file"
                        id={`milestone-file-${idx}`}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadPhoto(file, { milestoneIndex: idx });
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById(`milestone-file-${idx}`)?.click()}
                        className="w-full py-1.5 rounded-lg bg-white border border-gray-300 text-[11px] font-semibold text-[#6B5A55] hover:bg-gray-50 flex items-center justify-center gap-1"
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>Trocar Foto</span>
                      </button>
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8D7B75]">Ano</label>
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) => {
                              const updated = [...settings.loveStory];
                              updated[idx].year = e.target.value;
                              setSettings({ ...settings, loveStory: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-[#8D7B75]">Título do Marco</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...settings.loveStory];
                              updated[idx].title = e.target.value;
                              setSettings({ ...settings, loveStory: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8D7B75]">Descrição do Momento</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...settings.loveStory];
                            updated[idx].description = e.target.value;
                            setSettings({ ...settings, loveStory: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs resize-none"
                        />
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Excluir este marco
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

            {/* Orientações aos Convidados */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DF] shadow-xs space-y-6">
              <h3 className="font-serif text-lg font-semibold text-[#2D2422] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#C2847A]" />
                <span>4. Orientações aos Convidados (Trajes & Dicas)</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Título do Bloco de Orientações</label>
                  <input
                    type="text"
                    value={settings.dressCodeTitle}
                    onChange={(e) => setSettings({ ...settings, dressCodeTitle: e.target.value })}
                    placeholder="Ex: Orientações aos Convidados / Traje Sugerido"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Texto de Orientações e Dicas para os Convidados</label>
                  <textarea
                    rows={3}
                    value={settings.dressCodeDescription}
                    onChange={(e) => setSettings({ ...settings, dressCodeDescription: e.target.value })}
                    placeholder="Ex: Fiquem à vontade para vir de traje esporte fino ou passeio completo..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                  />
                </div>

                {/* Checklist dos Convidados Customizável */}
                <div className="pt-6 border-t border-[#F0E6DF] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-[#2D2422] flex items-center gap-1.5">
                        <span>✅ Checklist do Convidado (Dicas, Open Cooler, etc.)</span>
                      </h4>
                      <p className="text-xs text-[#8D7B75]">
                        Personalize os itens, títulos, descrições, selos de destaque e ícones temáticos
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...settings, checklistItems: DEFAULT_CHECKLIST_ITEMS };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF3EE] text-[#C2847A] text-xs font-medium hover:bg-[#C2847A] hover:text-white transition-colors"
                      >
                        Restaurar Padrão
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const current = settings.checklistItems && settings.checklistItems.length > 0 ? settings.checklistItems : DEFAULT_CHECKLIST_ITEMS;
                          const newItem: GuestChecklistItem = {
                            id: `chk-${Date.now()}`,
                            iconName: 'sparkles',
                            title: 'Nova Dica / Orientação',
                            desc: 'Descreva a orientação aqui para os seus convidados...',
                            highlight: 'Dica importante',
                          };
                          const updated = { ...settings, checklistItems: [...current, newItem] };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Item</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const list = settings.checklistItems && settings.checklistItems.length > 0 
                        ? settings.checklistItems 
                        : DEFAULT_CHECKLIST_ITEMS;

                      return list.map((item, idx) => {
                        const IconComp = getChecklistIconComponent(item.iconName);

                        return (
                          <div key={item.id || idx} className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DCD5] space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              {/* Ícone Seletor */}
                              <div className="sm:col-span-3">
                                <label className="block text-[10px] uppercase font-bold text-[#8D7B75] mb-1">Ícone</label>
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-xl bg-[#FAF3EE] text-[#C2847A] shrink-0">
                                    <IconComp className="w-4 h-4" />
                                  </div>
                                  <select
                                    value={item.iconName || 'sparkles'}
                                    onChange={(e) => {
                                      const updatedList = [...list];
                                      updatedList[idx] = { ...updatedList[idx], iconName: e.target.value };
                                      const updated = { ...settings, checklistItems: updatedList };
                                      setSettings(updated);
                                      WeddingService.saveSettings(updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs"
                                  >
                                    {CHECKLIST_ICONS.map((iconOpt) => (
                                      <option key={iconOpt.id} value={iconOpt.id}>
                                        {iconOpt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Título */}
                              <div className="sm:col-span-5">
                                <label className="block text-[10px] uppercase font-bold text-[#8D7B75] mb-1">Título do Item</label>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => {
                                    const updatedList = [...list];
                                    updatedList[idx] = { ...updatedList[idx], title: e.target.value };
                                    const updated = { ...settings, checklistItems: updatedList };
                                    setSettings(updated);
                                    WeddingService.saveSettings(updated);
                                  }}
                                  placeholder="Ex: 🧊 Open Cooler Liberado!"
                                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs"
                                />
                              </div>

                              {/* Selo / Destaque */}
                              <div className="sm:col-span-4">
                                <label className="block text-[10px] uppercase font-bold text-[#8D7B75] mb-1">Selo de Destaque</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={item.highlight || ''}
                                    onChange={(e) => {
                                      const updatedList = [...list];
                                      updatedList[idx] = { ...updatedList[idx], highlight: e.target.value };
                                      const updated = { ...settings, checklistItems: updatedList };
                                      setSettings(updated);
                                      WeddingService.saveSettings(updated);
                                    }}
                                    placeholder="Ex: Traga seu cooler!"
                                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedList = list.filter((_, i) => i !== idx);
                                      const updated = { ...settings, checklistItems: updatedList };
                                      setSettings(updated);
                                      WeddingService.saveSettings(updated);
                                    }}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    title="Excluir item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Descrição */}
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-[#8D7B75] mb-1">Descrição / Instrução</label>
                              <textarea
                                rows={2}
                                value={item.desc}
                                onChange={(e) => {
                                  const updatedList = [...list];
                                  updatedList[idx] = { ...updatedList[idx], desc: e.target.value };
                                  const updated = { ...settings, checklistItems: updatedList };
                                  setSettings(updated);
                                  WeddingService.saveSettings(updated);
                                }}
                                placeholder="Explique os detalhes do item..."
                                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs resize-none"
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Perguntas Frequentes (FAQs) Customizáveis */}
                <div className="pt-6 border-t border-[#F0E6DF] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-[#2D2422] flex items-center gap-1.5">
                        <span>❓ Perguntas Frequentes & Dúvidas (Estacionamento, Cardápio, etc.)</span>
                      </h4>
                      <p className="text-xs text-[#8D7B75]">
                        Adicione, edite ou remova perguntas com respostas claras para orientar os convidados
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
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
                          const updated = { ...settings, faqs: defaultFaqs };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF3EE] text-[#C2847A] text-xs font-medium hover:bg-[#C2847A] hover:text-white transition-colors"
                      >
                        Restaurar Padrão
                      </button>

                      <button
                        type="button"
                        onClick={() => {
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
                          const current = settings.faqs !== undefined ? settings.faqs : defaultFaqs;
                          const newFaq = {
                            q: 'Nova pergunta ou dúvida frequente?',
                            a: 'Resposta ou orientação detalhada para o convidado...',
                          };
                          const updated = { ...settings, faqs: [...current, newFaq] };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Dúvida</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(() => {
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
                      const list = settings.faqs !== undefined ? settings.faqs : defaultFaqs;

                      if (list.length === 0) {
                        return (
                          <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                            Nenhuma pergunta frequente cadastrada no momento (seção oculta do site).
                          </p>
                        );
                      }

                      return list.map((faq, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DCD5] space-y-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <label className="block text-[10px] uppercase font-bold text-[#8D7B75]">
                              Pergunta #{idx + 1}
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedList = list.filter((_, i) => i !== idx);
                                const updated = { ...settings, faqs: updatedList };
                                setSettings(updated);
                                WeddingService.saveSettings(updated);
                              }}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                              title="Excluir pergunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => {
                              const updatedList = [...list];
                              updatedList[idx] = { ...updatedList[idx], q: e.target.value };
                              const updated = { ...settings, faqs: updatedList };
                              setSettings(updated);
                              WeddingService.saveSettings(updated);
                            }}
                            placeholder="Ex: Tem estacionamento no local?"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs font-medium text-[#2D2422]"
                          />

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-[#8D7B75] mb-1">
                              Resposta aos Convidados
                            </label>
                            <textarea
                              rows={2}
                              value={faq.a}
                              onChange={(e) => {
                                const updatedList = [...list];
                                updatedList[idx] = { ...updatedList[idx], a: e.target.value };
                                const updated = { ...settings, faqs: updatedList };
                                setSettings(updated);
                                WeddingService.saveSettings(updated);
                              }}
                              placeholder="Ex: Sim, o local conta com valet e estacionamento gratuito..."
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E8DCD5] text-xs resize-none"
                            />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Paleta de Cores e Temas do Site */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DF] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#2D2422] flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#C2847A]" />
                    <span>5. Paleta de Cores & Identidade Visual do Site</span>
                  </h3>
                  <p className="text-xs text-[#8D7B75]">
                    Escolha um tema pronto de casamento ou personalize cada cor como desejar
                  </p>
                </div>
              </div>

              {/* Theme Preset Cards */}
              <div className="space-y-3">
                <label className="block text-xs uppercase font-semibold text-[#8D7B75]">
                  Temas Prontos Inspiradores (Clique para aplicar):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = settings.themePresetName === preset.id || 
                      (!settings.themePresetName && preset.id === 'rose-gold');

                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          const updated = {
                            ...settings,
                            themePresetName: preset.id,
                            themeColors: preset.colors,
                          };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-102 flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'border-[#C2847A] bg-[#FAF3EE] shadow-md'
                            : 'border-[#E8DCD5] bg-[#FDFBF7] hover:border-[#C2847A]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-serif text-sm font-semibold text-[#2D2422]">{preset.name}</h4>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-[#C2847A] text-white text-[10px] font-bold">
                                Ativo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8D7B75] mt-1 line-clamp-2">{preset.description}</p>
                        </div>

                        {/* Color swatches */}
                        <div className="flex items-center gap-2 pt-1 border-t border-black/5">
                          <div className="w-6 h-6 rounded-full shadow-xs border border-white" style={{ backgroundColor: preset.colors.primary }} title="Cor Primária" />
                          <div className="w-6 h-6 rounded-full shadow-xs border border-white" style={{ backgroundColor: preset.colors.accent }} title="Cor de Apoio" />
                          <div className="w-6 h-6 rounded-full shadow-xs border border-white" style={{ backgroundColor: preset.colors.cardBackground }} title="Cards" />
                          <div className="w-6 h-6 rounded-full shadow-xs border border-white" style={{ backgroundColor: preset.colors.background }} title="Fundo" />
                          <div className="w-6 h-6 rounded-full shadow-xs border border-white" style={{ backgroundColor: preset.colors.textPrimary }} title="Texto" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="pt-4 border-t border-[#F0E6DF] space-y-4">
                <label className="block text-xs uppercase font-semibold text-[#8D7B75]">
                  Ou Ajuste Fino das Cores Individuais:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Primary Color */}
                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] space-y-2">
                    <label className="block text-[11px] font-bold text-[#2D2422]">Cor Primária (Destaques)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.themeColors?.primary || '#C2847A'}
                        onChange={(e) => {
                          const updatedColors: ThemeColors = {
                            ...(settings.themeColors || THEME_PRESETS[0].colors),
                            primary: e.target.value,
                            primaryHover: e.target.value,
                          };
                          const updated = { ...settings, themeColors: updatedColors, themePresetName: 'custom' };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono">{settings.themeColors?.primary || '#C2847A'}</span>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] space-y-2">
                    <label className="block text-[11px] font-bold text-[#2D2422]">Cor de Apoio (Acentos)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.themeColors?.accent || '#D9C5B2'}
                        onChange={(e) => {
                          const updatedColors: ThemeColors = {
                            ...(settings.themeColors || THEME_PRESETS[0].colors),
                            accent: e.target.value,
                          };
                          const updated = { ...settings, themeColors: updatedColors, themePresetName: 'custom' };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono">{settings.themeColors?.accent || '#D9C5B2'}</span>
                    </div>
                  </div>

                  {/* Page Background Color */}
                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] space-y-2">
                    <label className="block text-[11px] font-bold text-[#2D2422]">Fundo da Página</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.themeColors?.background || '#FDFBF7'}
                        onChange={(e) => {
                          const updatedColors: ThemeColors = {
                            ...(settings.themeColors || THEME_PRESETS[0].colors),
                            background: e.target.value,
                          };
                          const updated = { ...settings, themeColors: updatedColors, themePresetName: 'custom' };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono">{settings.themeColors?.background || '#FDFBF7'}</span>
                    </div>
                  </div>

                  {/* Card Background Color */}
                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] space-y-2">
                    <label className="block text-[11px] font-bold text-[#2D2422]">Fundo dos Cards</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.themeColors?.cardBackground || '#FAF3EE'}
                        onChange={(e) => {
                          const updatedColors: ThemeColors = {
                            ...(settings.themeColors || THEME_PRESETS[0].colors),
                            cardBackground: e.target.value,
                          };
                          const updated = { ...settings, themeColors: updatedColors, themePresetName: 'custom' };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono">{settings.themeColors?.cardBackground || '#FAF3EE'}</span>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] space-y-2">
                    <label className="block text-[11px] font-bold text-[#2D2422]">Cor do Texto</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.themeColors?.textPrimary || '#2D2422'}
                        onChange={(e) => {
                          const updatedColors: ThemeColors = {
                            ...(settings.themeColors || THEME_PRESETS[0].colors),
                            textPrimary: e.target.value,
                          };
                          const updated = { ...settings, themeColors: updatedColors, themePresetName: 'custom' };
                          setSettings(updated);
                          WeddingService.saveSettings(updated);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono">{settings.themeColors?.textPrimary || '#2D2422'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full py-4 rounded-2xl bg-[#C2847A] text-white font-semibold text-base hover:bg-[#B07065] shadow-lg transition-all"
              >
                Salvar Todas as Alterações e Publicar no Site
              </button>
            </div>
          </div>
        )}

        {/* ================= GUESTS TAB ================= */}
        {activeTab === 'guests' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-medium text-[#2D2422]">
                  Gestão de Convidados ({guests.length})
                </h2>
                <p className="text-xs text-[#8D7B75]">
                  Envie links exclusivos por WhatsApp, confirme acompanhantes e faça check-in no dia
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleSendBatchReminder}
                  disabled={isSendingBatch || metrics.pendingTotal === 0}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Enviar lembrete para todos que ainda não responderam"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Lembrar Pendentes ({metrics.pendingTotal})</span>
                </button>

                <button
                  onClick={async () => {
                    const confirmedWithPhone = guests.filter(g => (g.status === 'confirmed' || g.status === 'reconfirmed') && g.phone);
                    if (confirmedWithPhone.length === 0) {
                      alert('Nenhum convidado confirmado possui telefone cadastrado.');
                      return;
                    }
                    if (!confirm(`Deseja disparar mensagem de RECONFIRMAÇÃO FINAL para os ${confirmedWithPhone.length} convidados confirmados?`)) {
                      return;
                    }
                    setIsSendingBatch(true);
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const evolution = new EvolutionApiClient(settings);
                    let count = 0;
                    for (const guest of confirmedWithPhone) {
                      setDispatchStatus(`Enviando reconfirmação para ${guest.name} (${count + 1}/${confirmedWithPhone.length})...`);
                      if (evolution.isConfigured()) {
                        await evolution.sendReconfirmationMessage(guest, settings, origin);
                      }
                      WeddingService.recordReminderSent(guest.id);
                      count++;
                      await new Promise(r => setTimeout(r, 1500));
                    }
                    setIsSendingBatch(false);
                    reloadAll();
                    setDispatchStatus(`🎉 Mensagens de reconfirmação enviadas com sucesso para ${count} convidados!`);
                    setTimeout(() => setDispatchStatus(null), 5000);
                  }}
                  disabled={isSendingBatch || metrics.confirmedTotal === 0}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Enviar mensagem de reconfirmação final para todos os confirmados"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Disparar Reconfirmação ({metrics.confirmedTotal})</span>
                </button>

                <button
                  onClick={() => setShowAddGuestModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Convidado</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F0E6DF]">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D7B75]" />
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Buscar por nome ou telefone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs focus:outline-none focus:border-[#C2847A]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setGuestFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    guestFilter === 'all' ? 'bg-[#2D2422] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Todos ({guests.length})
                </button>
                <button
                  onClick={() => setGuestFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    guestFilter === 'confirmed' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  Confirmados ({metrics.confirmedTotal})
                </button>
                <button
                  onClick={() => setGuestFilter('reconfirmed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    guestFilter === 'reconfirmed' ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-800'
                  }`}
                >
                  Reconfirmados ({metrics.reconfirmedTotal})
                </button>
                <button
                  onClick={() => setGuestFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    guestFilter === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  Pendentes ({metrics.pendingTotal})
                </button>
                <button
                  onClick={() => setGuestFilter('declined')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    guestFilter === 'declined' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-800'
                  }`}
                >
                  Recusados ({metrics.declinedTotal})
                </button>
                <button
                  onClick={() => setGuestFilter('attended')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    guestFilter === 'attended' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  No Casamento ({metrics.attendedTotal})
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#F0E6DF] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF3EE] border-b border-[#EADBCE] text-[#6B5A55] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Convidado</th>
                      <th className="py-3.5 px-4">Status RSVP</th>
                      <th className="py-3.5 px-4">Acompanhantes</th>
                      <th className="py-3.5 px-4">Restrições / Mensagem</th>
                      <th className="py-3.5 px-4 text-center">Presença no Dia</th>
                      <th className="py-3.5 px-4 text-center">WhatsApp / Convite</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[#2D2422]">
                    {filteredGuests.map((guest) => {
                      return (
                        <tr key={guest.id} className="hover:bg-[#FAF3EE]/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-sm">{guest.name}</p>
                            <p className="text-[11px] text-[#8D7B75]">{guest.phone || 'Sem telefone'}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            {guest.status === 'reconfirmed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-semibold text-[11px]">
                                <Sparkles className="w-3 h-3" /> Reconfirmado
                              </span>
                            )}
                            {guest.status === 'confirmed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3 h-3" /> Confirmado
                              </span>
                            )}
                            {guest.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                                <Clock className="w-3 h-3" /> Pendente
                              </span>
                            )}
                            {guest.status === 'declined' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-[11px]">
                                <XCircle className="w-3 h-3" /> Recusou
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {guest.confirmedCompanions && guest.confirmedCompanions.length > 0 ? (
                              <div className="space-y-0.5">
                                <span className="font-medium text-emerald-800">
                                  +{guest.confirmedCompanions.length} confirmados:
                                </span>
                                {guest.confirmedCompanions.map((c, i) => (
                                  <p key={i} className="text-[11px] text-[#6B5A55]">
                                    • {c.name} {c.isChild ? '(Criança)' : ''}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[#8D7B75]">
                                {guest.maxCompanions > 0 
                                  ? `Permite até ${guest.maxCompanions}`
                                  : 'Individual'}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            {guest.dietRestrictions && (
                              <p className="text-[11px] text-amber-900 font-medium">
                                🥗 {guest.dietRestrictions}
                              </p>
                            )}
                            {guest.message && (
                              <p className="text-[11px] text-[#8D7B75] italic line-clamp-2">
                                &ldquo;{guest.message}&rdquo;
                              </p>
                            )}
                            {!guest.dietRestrictions && !guest.message && (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Check-in Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleCheckIn(guest.id)}
                              className={`p-2 rounded-xl border transition-all ${
                                guest.attendedOnDay
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                  : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400'
                              }`}
                              title={guest.attendedOnDay ? 'Presente no casamento!' : 'Marcar presença'}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          </td>

                          {/* WhatsApp / Invite Link */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Botão Convite / Lembrete */}
                              <button
                                onClick={() => handleOpenDispatchModal(guest, guest.status === 'pending' ? 'reminder' : 'invite')}
                                title="Enviar Convite / Lembrete por WhatsApp"
                                className="p-2 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors flex items-center gap-1"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">
                                  {guest.status === 'pending' ? 'Lembrete' : 'Convite'}
                                </span>
                              </button>

                              {/* Botão Reconfirmação Pré-Evento */}
                              <button
                                onClick={() => handleOpenDispatchModal(guest, 'reconfirmation')}
                                title="Disparar Reconfirmação Final de Presença (Pré-Evento)"
                                className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
                                  guest.status === 'reconfirmed'
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                                }`}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">
                                  {guest.status === 'reconfirmed' ? 'Reconfirmado' : 'Reconfirmar'}
                                </span>
                              </button>

                              <button
                                onClick={() => handleCopyInviteLink(guest.slug)}
                                title="Copiar link exclusivo do convidado"
                                className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                {copiedSlug === guest.slug ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <Link
                                href={`/convite/${guest.slug}`}
                                target="_blank"
                                title="Abrir página do convidado"
                                className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Excluir Convidado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= GIFTS TAB ================= */}
        {activeTab === 'gifts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-medium text-[#2D2422]">
                  Presentes & PIX Arrecadados
                </h2>
                <p className="text-xs text-[#8D7B75]">
                  Gerencie os produtos virtuais da lista e confira as contribuições recebidas
                </p>
              </div>

              <button
                onClick={() => setShowAddGiftModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Novo Presente</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gifts.map((gift) => (
                <div key={gift.id} className="bg-white rounded-2xl p-4 border border-[#F0E6DF] shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <img
                      src={gift.imageUrl}
                      alt={gift.title}
                      className="w-full h-32 rounded-xl object-cover"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#C2847A] tracking-wider">
                        {gift.category}
                      </span>
                      <h4 className="font-serif text-sm font-semibold text-[#2D2422]">{gift.title}</h4>
                      <p className="text-xs text-[#8D7B75] line-clamp-1">{gift.description}</p>
                    </div>
                  </div>

                  {gift.reservedInPerson && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1 text-amber-800">
                          🎁 Entrega Presencial
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            WeddingService.clearGiftReservation(gift.id);
                            reloadAll();
                          }}
                          className="text-[10px] text-red-600 hover:underline font-semibold"
                        >
                          Liberar
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-800">
                        Por: <strong>{gift.reservedByGuestName || 'Convidado'}</strong>
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2D2422]">
                      {formatCurrency(gift.price)}
                    </span>
                    <span className="text-xs text-[#8D7B75]">
                      {gift.quotaPurchased || 0} presenteado(s)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* PIX Log Table */}
            <div className="mt-8 bg-white rounded-3xl border border-[#F0E6DF] p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-medium text-[#2D2422]">
                Histórico de Presentes e PIX Recebidos ({pixLogs.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF3EE] border-b border-[#EADBCE] text-[#6B5A55] uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Convidado</th>
                      <th className="py-3 px-4">Modalidade</th>
                      <th className="py-3 px-4">Presente Escolhido</th>
                      <th className="py-3 px-4">Valor Estimado</th>
                      <th className="py-3 px-4">Mensagem de Carinho</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pixLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF3EE]/30">
                        <td className="py-3 px-4 text-[#8D7B75]">{new Date(log.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 px-4 font-bold">
                          {log.guestName}
                          {log.guestPhone && <span className="block text-[10px] text-gray-500 font-normal">{log.guestPhone}</span>}
                        </td>
                        <td className="py-3 px-4">
                          {log.paymentMethod === 'in_person' ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                              🎁 Entrega no Dia
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ⚡ PIX
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#C2847A] font-medium">{log.giftTitle}</td>
                        <td className="py-3 px-4 font-bold text-[#2D2422]">{formatCurrency(log.amount)}</td>
                        <td className="py-3 px-4 max-w-xs italic text-[#6B5A55]">{log.message || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Confirmado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= PHOTOS TAB ================= */}
        {activeTab === 'photos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-2xl font-medium text-[#2D2422]">
                Mural de Fotos dos Convidados ({photos.length})
              </h2>
              <p className="text-xs text-[#8D7B75]">
                Fotos armazenadas com compressão inteligente no MinIO S3
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-2xl overflow-hidden border border-[#F0E6DF] shadow-xs flex flex-col justify-between">
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || 'Foto de convidado'}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between border-t border-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D2422] truncate">{photo.uploaderName}</span>
                      <span className="text-xs text-[#C2847A] font-semibold shrink-0">{photo.likes} curtidas</span>
                    </div>
                    <p className="text-xs text-[#6B5A55] italic line-clamp-2 min-h-[1.25rem]">
                      {photo.caption ? `“${photo.caption}”` : ''}
                    </p>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <a
                        href={photo.photoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#C2847A] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Ver Original
                      </a>

                      <button
                        onClick={() => {
                          WeddingService.deletePhoto(photo.id);
                          reloadAll();
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= GLOBAL TENANT MESSAGES TAB ================= */}
        {activeTab === 'messages' && (
          <div className="max-w-5xl space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-medium text-[#2D2422] flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-emerald-600" />
                  <span>Modelos Globais de Mensagens WhatsApp (Tenant)</span>
                </h2>
                <p className="text-xs text-[#8D7B75]">
                  Configure os modelos padrão deste casamento. Todas as mensagens disparadas (individuais ou em lote) usarão estas regras globais com interpolação dinâmica.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Modelos Globais</span>
              </button>
            </div>

            {/* Helper Tags Chips */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8DCD5] shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D2422]">
                <Sparkles className="w-4 h-4 text-[#C2847A]" />
                <span>Tags Dinâmicas Disponíveis para Interpolação no Tenant:</span>
              </div>
              <p className="text-[11px] text-[#8D7B75]">
                Ao disparar a mensagem, o sistema substitui estas tags automaticamente pelos dados reais de cada convidado:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { tag: '{{nome}}', desc: 'Nome Completo' },
                  { tag: '{{primeiroNome}}', desc: 'Primeiro Nome' },
                  { tag: '{{link}}', desc: 'Link Exclusivo do Convite/RSVP' },
                  { tag: '{{noivos}}', desc: 'Nomes dos Noivos (Ex: Fernanda & Gabryel)' },
                  { tag: '{{data}}', desc: 'Data Formatada do Casamento' },
                  { tag: '{{horario}}', desc: 'Horário da Cerimônia' },
                  { tag: '{{local}}', desc: 'Nome do Local' },
                  { tag: '{{endereco}}', desc: 'Endereço Completo' },
                  { tag: '{{acompanhantes}}', desc: 'Texto de Acompanhantes' },
                  { tag: '{{dias}}', desc: 'Dias Restantes' },
                  { tag: '{{semanas}}', desc: 'Semanas Restantes' },
                ].map((item) => (
                  <div key={item.tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF3EE] border border-[#EADBCE]">
                    <span className="font-mono text-xs font-bold text-[#C2847A]">{item.tag}</span>
                    <span className="text-[10px] text-gray-500">({item.desc})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Editors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template 1: Convite Inicial */}
              <div className="bg-white p-5 rounded-3xl border border-[#F0E6DF] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#2D2422]">
                        Convite Inicial
                      </h4>
                      <p className="text-[10px] text-[#8D7B75]">Enviado no primeiro disparo</p>
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    value={settings.customInviteMessageTemplate || ''}
                    onChange={(e) => setSettings({ ...settings, customInviteMessageTemplate: e.target.value })}
                    placeholder={`💍 *CONVITE DE CASAMENTO* 💍\n\nOlá *{{nome}}*!\n\nCom imensa alegria, nós, *{{noivos}}*, convidamos você para celebrar o nosso amor e o início do nosso para sempre!\n\n🗓 *Data:* {{data}}\n⏰ *Horário:* {{horario}}\n📍 *Local:* {{local}}\n✨ {{acompanhantes}}\n\nPara nos organizarmos da melhor forma com o buffet e cerimonial, pedimos com carinho que *confirme sua presença* através do seu link exclusivo:\n👉 {{link}}\n\nEsperamos você para viver esse dia inesquecível conosco! ❤️`}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#C2847A]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                  <span className="font-bold text-[10px] uppercase">Simulação:</span>
                  <p className="line-clamp-3 italic text-[11px]">
                    {interpolateWeddingMessage(
                      settings.customInviteMessageTemplate || `💍 *CONVITE DE CASAMENTO* 💍\n\nOlá *{{nome}}*!\n\nCom imensa alegria, nós, *{{noivos}}*, convidamos você para celebrar o nosso amor!\n\n👉 {{link}}`,
                      guests[0] || { name: 'Mariana Oliveira', slug: 'mariana-oliveira', maxCompanions: 2, status: 'pending', confirmedCompanions: [], reminderCount: 0, createdAt: '' } as any,
                      settings,
                      typeof window !== 'undefined' ? window.location.origin : ''
                    )}
                  </p>
                </div>
              </div>

              {/* Template 2: Lembrete de RSVP */}
              <div className="bg-white p-5 rounded-3xl border border-[#F0E6DF] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#2D2422]">
                        Lembrete de RSVP
                      </h4>
                      <p className="text-[10px] text-[#8D7B75]">Para convidados pendentes</p>
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    value={settings.customReminderMessageTemplate || ''}
                    onChange={(e) => setSettings({ ...settings, customReminderMessageTemplate: e.target.value })}
                    placeholder={`⏰ *LEMBRETE DE CONFIRMAÇÃO - CASAMENTO* ⏰\n\nOlá *{{nome}}*!\n\nFaltam apenas *{{dias}} dias* para o nosso grande dia! 👰🤵\n\nEstamos finalizando a lista de convidados junto ao buffet e cerimonial. Você ainda não confirmou sua presença no nosso site.\n\nPor favor, acesse o link abaixo em 1 minuto para nos avisar se poderá comparecer:\n👉 {{link}}\n\nCom amor,\n*{{noivos}}* ❤️`}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#C2847A]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <span className="font-bold text-[10px] uppercase">Simulação:</span>
                  <p className="line-clamp-3 italic text-[11px]">
                    {interpolateWeddingMessage(
                      settings.customReminderMessageTemplate || `⏰ *LEMBRETE DE CONFIRMAÇÃO* ⏰\n\nOlá *{{nome}}*! Faltam apenas {{dias}} dias! Por favor confirme no link: 👉 {{link}}`,
                      guests[0] || { name: 'Mariana Oliveira', slug: 'mariana-oliveira', maxCompanions: 2, status: 'pending', confirmedCompanions: [], reminderCount: 0, createdAt: '' } as any,
                      settings,
                      typeof window !== 'undefined' ? window.location.origin : ''
                    )}
                  </p>
                </div>
              </div>

              {/* Template 3: Reconfirmação Final */}
              <div className="bg-white p-5 rounded-3xl border border-[#F0E6DF] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#2D2422]">
                        Reconfirmação Final
                      </h4>
                      <p className="text-[10px] text-[#8D7B75]">Disparada semanas antes do evento</p>
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    value={settings.customReconfirmationMessageTemplate || ''}
                    onChange={(e) => setSettings({ ...settings, customReconfirmationMessageTemplate: e.target.value })}
                    placeholder={`📋 *RECONFIRMAÇÃO FINAL DE PRESENÇA* 📋\n\nOlá *{{nome}}*!\n\nFaltam apenas *{{dias}} dias* para o casamento de *{{noivos}}*! 👰🤵✨\n\nEstamos enviando esta mensagem para fazer a *Reconfirmação Final* dos convidados confirmados, para passarmos a lista definitiva ao Buffet e organização dos lugares.\n\nPor favor, dê um clique rápido no link abaixo para fazer a *Reconfirmação Definitiva* ou nos avisar caso tenha ocorrido algum imprevisto:\n👉 {{link}}#rsvp\n\nMuito obrigado pelo carinho de sempre! ❤️`}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#C2847A]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 space-y-1">
                  <span className="font-bold text-[10px] uppercase">Simulação:</span>
                  <p className="line-clamp-3 italic text-[11px]">
                    {interpolateWeddingMessage(
                      settings.customReconfirmationMessageTemplate || `📋 *RECONFIRMAÇÃO FINAL* 📋\n\nOlá *{{nome}}*! Faltam {{dias}} dias para o casamento de {{noivos}}! 👉 {{link}}#rsvp`,
                      guests[0] || { name: 'Mariana Oliveira', slug: 'mariana-oliveira', maxCompanions: 2, status: 'confirmed', confirmedCompanions: [], reminderCount: 0, createdAt: '' } as any,
                      settings,
                      typeof window !== 'undefined' ? window.location.origin : ''
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="w-full py-4 rounded-2xl bg-[#C2847A] text-white font-semibold text-sm hover:bg-[#B07065] transition-all shadow-md"
            >
              Salvar Modelos Globais de Mensagens do Tenant
            </button>
          </div>
        )}

        {/* ================= SETTINGS & MINIO TAB ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-2xl font-medium text-[#2D2422]">
                Configurações de APIs & Armazenamento MinIO S3
              </h2>
              <p className="text-xs text-[#8D7B75]">
                Configure MinIO para fotos, chaves PIX e Evolution API
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6DF] shadow-xs">
              {/* MinIO S3 Object Storage */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-[#2D2422] border-b pb-2 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span>1. Configuração do MinIO / S3 Storage (Para Fotos dos Noivos e Convidados)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">MinIO Endpoint / Host</label>
                    <input
                      type="text"
                      value={settings.minioEndpoint || 'localhost'}
                      onChange={(e) => setSettings({ ...settings, minioEndpoint: e.target.value })}
                      placeholder="localhost ou minio.seudominio.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Porta (Padrão: 9000)</label>
                    <input
                      type="number"
                      value={settings.minioPort || 9000}
                      onChange={(e) => setSettings({ ...settings, minioPort: parseInt(e.target.value, 10) || 9000 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Nome do Bucket</label>
                    <input
                      type="text"
                      value={settings.minioBucketName || 'casamento'}
                      onChange={(e) => setSettings({ ...settings, minioBucketName: e.target.value })}
                      placeholder="casamento"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Access Key</label>
                    <input
                      type="text"
                      value={settings.minioAccessKey || 'minioadmin'}
                      onChange={(e) => setSettings({ ...settings, minioAccessKey: e.target.value })}
                      placeholder="minioadmin"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Secret Key</label>
                    <input
                      type="password"
                      value={settings.minioSecretKey || 'minioadmin'}
                      onChange={(e) => setSettings({ ...settings, minioSecretKey: e.target.value })}
                      placeholder="minioadmin"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">URL Pública / CDN (Opcional)</label>
                    <input
                      type="text"
                      value={settings.minioPublicUrl || ''}
                      onChange={(e) => setSettings({ ...settings, minioPublicUrl: e.target.value })}
                      placeholder="http://localhost:9000/casamento"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* PIX Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-serif text-lg font-medium text-[#2D2422] border-b pb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#C2847A]" />
                  <span>2. Chave PIX dos Noivos (Para receber os presentes)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Chave PIX</label>
                    <input
                      type="text"
                      value={settings.pixKey}
                      onChange={(e) => setSettings({ ...settings, pixKey: e.target.value })}
                      placeholder="CPF, E-mail ou Telefone"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Nome do Titular</label>
                    <input
                      type="text"
                      value={settings.pixMerchantName}
                      onChange={(e) => setSettings({ ...settings, pixMerchantName: e.target.value })}
                      placeholder="FERNANDA E GABRYEL"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Cidade</label>
                    <input
                      type="text"
                      value={settings.pixMerchantCity}
                      onChange={(e) => setSettings({ ...settings, pixMerchantCity: e.target.value })}
                      placeholder="SAO PAULO"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Evolution API Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-serif text-lg font-medium text-[#2D2422] border-b pb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span>3. Evolution API (WhatsApp)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">URL da Evolution API</label>
                    <input
                      type="text"
                      value={settings.evolutionApiUrl}
                      onChange={(e) => setSettings({ ...settings, evolutionApiUrl: e.target.value })}
                      placeholder="https://api.gabryelamaro.com/message/sendText/BarmanJF"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">API Key / Token</label>
                    <input
                      type="password"
                      value={settings.evolutionApiKey}
                      onChange={(e) => setSettings({ ...settings, evolutionApiKey: e.target.value })}
                      placeholder="Sua API Key"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Instância WhatsApp</label>
                    <input
                      type="text"
                      value={settings.evolutionInstanceName}
                      onChange={(e) => setSettings({ ...settings, evolutionInstanceName: e.target.value })}
                      placeholder="BarmanJF"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Modelos de Mensagens Personalizadas de WhatsApp */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-serif text-lg font-medium text-[#2D2422] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>4. Modelos de Mensagens de WhatsApp (100% Editáveis)</span>
                  </h3>
                </div>

                <p className="text-xs text-[#8D7B75]">
                  Personalize os textos dos disparos automáticos. Você pode usar as tags dinâmicas que serão substituídas automaticamente para cada convidado:
                </p>

                {/* Helper Tags Chips */}
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#FAF3EE] border border-[#EADBCE]">
                  <span className="text-[11px] font-bold text-[#2D2422] mr-1">Tags disponíveis:</span>
                  {['{{nome}}', '{{link}}', '{{noivos}}', '{{data}}', '{{horario}}', '{{local}}', '{{acompanhantes}}', '{{dias}}', '{{semanas}}'].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-white border border-[#E8DCD5] text-[10px] font-mono text-[#C2847A] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  {/* Template 1: Convite Inicial */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-bold text-[#2D2422]">
                      1. Modelo de Convite Inicial:
                    </label>
                    <textarea
                      rows={5}
                      value={settings.customInviteMessageTemplate || ''}
                      onChange={(e) => setSettings({ ...settings, customInviteMessageTemplate: e.target.value })}
                      placeholder={`💍 *CONVITE DE CASAMENTO* 💍\n\nOlá *{{nome}}*!\n\nCom imensa alegria, nós, *{{noivos}}*, convidamos você para celebrar o nosso amor e o início do nosso para sempre!\n\n🗓 *Data:* {{data}}\n⏰ *Horário:* {{horario}}\n📍 *Local:* {{local}}\n✨ {{acompanhantes}}\n\nPara nos organizarmos da melhor forma com o buffet e cerimonial, pedimos com carinho que *confirme sua presença* através do seu link exclusivo:\n👉 {{link}}\n\nEsperamos você para viver esse dia inesquecível conosco! ❤️`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs font-mono leading-relaxed"
                    />
                  </div>

                  {/* Template 2: Lembrete de RSVP */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-bold text-[#2D2422]">
                      2. Modelo de Lembrete de Confirmação (Pendentes):
                    </label>
                    <textarea
                      rows={4}
                      value={settings.customReminderMessageTemplate || ''}
                      onChange={(e) => setSettings({ ...settings, customReminderMessageTemplate: e.target.value })}
                      placeholder={`⏰ *LEMBRETE DE CONFIRMAÇÃO - CASAMENTO* ⏰\n\nOlá *{{nome}}*!\n\nFaltam apenas *{{dias}} dias* para o nosso grande dia! 👰🤵\n\nEstamos finalizando a lista de convidados junto ao buffet e cerimonial. Você ainda não confirmou sua presença no nosso site.\n\nPor favor, acesse o link abaixo em 1 minuto para nos avisar se poderá comparecer:\n👉 {{link}}\n\nCom amor,\n*{{noivos}}* ❤️`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs font-mono leading-relaxed"
                    />
                  </div>

                  {/* Template 3: Reconfirmação Final */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-bold text-[#2D2422]">
                      3. Modelo de Reconfirmação Final Pré-Evento (Semanas Antes):
                    </label>
                    <textarea
                      rows={5}
                      value={settings.customReconfirmationMessageTemplate || ''}
                      onChange={(e) => setSettings({ ...settings, customReconfirmationMessageTemplate: e.target.value })}
                      placeholder={`📋 *RECONFIRMAÇÃO FINAL DE PRESENÇA* 📋\n\nOlá *{{nome}}*!\n\nFaltam apenas *{{dias}} dias* para o casamento de *{{noivos}}*! 👰🤵✨\n\nEstamos enviando esta mensagem para fazer a *Reconfirmação Final* dos convidados confirmados, para passarmos a lista definitiva ao Buffet e organização dos lugares.\n\nPor favor, dê um clique rápido no link abaixo para fazer a *Reconfirmação Definitiva* ou nos avisar caso tenha ocorrido algum imprevisto:\n👉 {{link}}#rsvp\n\nMuito obrigado pelo carinho de sempre! ❤️`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs font-mono leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* PIN Admin */}
              <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">PIN de Acesso dos Noivos (Admin)</label>
                  <input
                    type="text"
                    value={settings.adminPin}
                    onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#C2847A] text-white font-semibold text-sm hover:bg-[#B07065] transition-all shadow-md"
              >
                Salvar Configurações
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: Adicionar Convidado */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#F0E6DF]">
            <h3 className="font-serif text-xl font-medium text-[#2D2422]">
              Adicionar Novo Convidado
            </h3>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Nome Completo do Titular *</label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="Ex: Mariana Castro Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">WhatsApp / Telefone (com DDD)</label>
                <input
                  type="text"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  placeholder="Ex: 11987654321"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Acompanhantes Permitidos</label>
                <select
                  value={newGuestCompanions}
                  onChange={(e) => setNewGuestCompanions(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                >
                  <option value={0}>0 (Apenas o titular)</option>
                  <option value={1}>+1 acompanhante (Casal / Dupla)</option>
                  <option value={2}>+2 acompanhantes</option>
                  <option value={3}>+3 acompanhantes (Família)</option>
                  <option value={4}>+4 acompanhantes (Família grande)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] shadow-xs"
                >
                  Salvar Convidado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar Presente */}
      {showAddGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#F0E6DF]">
            <h3 className="font-serif text-xl font-medium text-[#2D2422]">
              Cadastrar Novo Presente
            </h3>

            <form onSubmit={handleAddGift} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Título do Presente *</label>
                <input
                  type="text"
                  required
                  value={newGiftTitle}
                  onChange={(e) => setNewGiftTitle(e.target.value)}
                  placeholder="Ex: Jogo de Taças de Cristal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newGiftPrice}
                    onChange={(e) => setNewGiftPrice(e.target.value)}
                    placeholder="Ex: 180.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Categoria</label>
                  <select
                    value={newGiftCategory}
                    onChange={(e) => setNewGiftCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                  >
                    <option value="casa">Cama, Mesa & Banho</option>
                    <option value="brincadeiras">🎉 Brincadeiras & Cotas Divertidas</option>
                    <option value="cozinha">Cozinha & Eletros</option>
                    <option value="lua-de-mel">Lua de Mel</option>
                    <option value="experiencias">Experiências</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">Descrição</label>
                <input
                  type="text"
                  value={newGiftDesc}
                  onChange={(e) => setNewGiftDesc(e.target.value)}
                  placeholder="Ex: Para brindar as conquistas da vida a dois"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#8D7B75] mb-1">URL da Imagem</label>
                <input
                  type="url"
                  value={newGiftImage}
                  onChange={(e) => setNewGiftImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGiftModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C2847A] text-white text-xs font-semibold hover:bg-[#B07065] shadow-xs"
                >
                  Salvar Presente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: Personalizar & Disparar Mensagem de WhatsApp */}
      {activeDispatchGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#F0E6DF] max-h-[92vh] flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#2D2422] flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span>Enviar WhatsApp para Convidado</span>
                  </h3>
                  <p className="text-xs text-[#8D7B75]">
                    Destinatário: <strong>{activeDispatchGuest.name}</strong> ({activeDispatchGuest.phone || 'Sem telefone'})
                  </p>
                </div>

                <button
                  onClick={() => setActiveDispatchGuest(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Tipo de Mensagem */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-bold text-[#8D7B75]">
                  Tipo de Mensagem:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDispatchModal(activeDispatchGuest, 'invite')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                      dispatchMessageType === 'invite'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    💌 Convite
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDispatchModal(activeDispatchGuest, 'reminder')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                      dispatchMessageType === 'reminder'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ⏰ Lembrete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDispatchModal(activeDispatchGuest, 'reconfirmation')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                      dispatchMessageType === 'reconfirmation'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📋 Reconfirmação
                  </button>
                </div>
              </div>

              {/* Textarea de Edição da Mensagem */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase font-bold text-[#8D7B75]">
                    Mensagem que será enviada (Você pode editar livremente):
                  </label>
                </div>
                <textarea
                  rows={8}
                  value={customMessageDraft}
                  onChange={(e) => setCustomMessageDraft(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#C2847A]"
                />
              </div>

              {/* Preview Bubble */}
              <div className="p-3.5 rounded-2xl bg-[#E7F8E8] border border-[#C5E8C7] text-xs text-[#1E3A20] space-y-1">
                <p className="text-[10px] uppercase font-bold text-emerald-800">Prévia no WhatsApp:</p>
                <p className="whitespace-pre-wrap font-sans text-xs line-clamp-4 italic text-[#2D4A2F]">
                  {customMessageDraft}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setActiveDispatchGuest(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!activeDispatchGuest.phone) {
                    alert('Este convidado não possui telefone cadastrado.');
                    return;
                  }
                  const evolution = new EvolutionApiClient(settings);
                  if (!evolution.isConfigured()) {
                    window.open(EvolutionApiClient.getWhatsAppDirectUrl(activeDispatchGuest.phone, customMessageDraft), '_blank');
                    WeddingService.recordReminderSent(activeDispatchGuest.id);
                    reloadAll();
                    setActiveDispatchGuest(null);
                    return;
                  }

                  setDispatchStatus(`Enviando WhatsApp para ${activeDispatchGuest.name}...`);
                  const res = await evolution.sendTextMessage(activeDispatchGuest.phone, customMessageDraft);
                  if (res.success) {
                    WeddingService.recordReminderSent(activeDispatchGuest.id);
                    reloadAll();
                    setDispatchStatus(`✅ Mensagem enviada com sucesso para ${activeDispatchGuest.name}!`);
                  } else {
                    setDispatchStatus(`❌ Erro no envio: ${res.error}`);
                  }
                  setActiveDispatchGuest(null);
                  setTimeout(() => setDispatchStatus(null), 4000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Disparar WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
