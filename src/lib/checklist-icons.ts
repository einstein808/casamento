import { 
  Wine, 
  Footprints, 
  Car, 
  Smartphone, 
  Clock, 
  Heart, 
  Sparkles, 
  Music, 
  Camera, 
  Gift, 
  Coffee, 
  Sun, 
  Moon, 
  Umbrella, 
  ShieldCheck, 
  MapPin, 
  Smile, 
  AlertCircle,
  PartyPopper,
  Shirt,
  Volume2
} from 'lucide-react';
import { GuestChecklistItem } from './types';

export const CHECKLIST_ICONS = [
  { id: 'wine', label: '🧊 Cooler / Bebidas', icon: Wine },
  { id: 'footprints', label: '🩴 Chinelo / Calçado Confortável', icon: Footprints },
  { id: 'car', label: '🚗 Carona / Uber / Transporte', icon: Car },
  { id: 'smartphone', label: '📱 Celular / Bateria', icon: Smartphone },
  { id: 'clock', label: '⏰ Horário / Pontualidade', icon: Clock },
  { id: 'heart', label: '🤍 Amor / Exclusividade da Noiva', icon: Heart },
  { id: 'sparkles', label: '✨ Dica de Ouro / Brilho', icon: Sparkles },
  { id: 'music', label: '🎵 Música / Pista de Dança', icon: Music },
  { id: 'party', label: '🎉 Festa / Comemoração', icon: PartyPopper },
  { id: 'camera', label: '📸 Fotos / Mural', icon: Camera },
  { id: 'gift', label: '🎁 Presentes / PIX', icon: Gift },
  { id: 'shirt', label: '👔 Trajes / Vestuário', icon: Shirt },
  { id: 'coffee', label: '☕ Café / Madrugada', icon: Coffee },
  { id: 'sun', label: '☀️ Dia / Sol / Calor', icon: Sun },
  { id: 'moon', label: '🌙 Noite / Madrugada', icon: Moon },
  { id: 'umbrella', label: '☂️ Chuva / Cobertura', icon: Umbrella },
  { id: 'shield', label: '🛡️ Segurança / Avisos', icon: ShieldCheck },
  { id: 'map-pin', label: '📍 Localização / Estacionamento', icon: MapPin },
  { id: 'smile', label: '😊 Alegria / Diversão', icon: Smile },
  { id: 'alert', label: '⚠️ Atenção / Lembrete', icon: AlertCircle },
];

export function getChecklistIconComponent(iconName?: string) {
  const found = CHECKLIST_ICONS.find(item => item.id === iconName);
  return found ? found.icon : Sparkles;
}

export const DEFAULT_CHECKLIST_ITEMS: GuestChecklistItem[] = [
  {
    id: 'chk-1',
    iconName: 'wine',
    title: '🧊 Open Cooler Liberado!',
    desc: 'Fique à vontade para trazer o seu cooler com suas bebidas preferidas (cerveja especial, whisky, gin, energético) para curtir a festa no seu estilo até o amanhecer!',
    highlight: 'Traga seu cooler!',
  },
  {
    id: 'chk-2',
    iconName: 'footprints',
    title: '🩴 Calçado Confortável para a Pista',
    desc: 'Nossa pista de dança vai bombar! Sugerimos trazer um calçado confortável, rasteirinha ou chinelo para dançar sem hora para acabar.',
    highlight: 'Conforto garantido',
  },
  {
    id: 'chk-3',
    iconName: 'car',
    title: '🚗 Carona Amiga ou Uber / 99',
    desc: 'Se for beber e brindar com os noivos, planeje sua volta de aplicativo ou combine carona para curtir com 100% de segurança e tranquilidade.',
    highlight: 'Se beber, não dirija',
  },
  {
    id: 'chk-4',
    iconName: 'smartphone',
    title: '📱 Celular Carregado para Fotos',
    desc: 'Venha com a bateria cheia para registrar os melhores momentos! Depois você pode subir suas fotos diretamente no nosso Mural de Fotos do site.',
    highlight: 'Mural de Fotos ao Vivo',
  },
  {
    id: 'chk-5',
    iconName: 'clock',
    title: '⏰ Chegue com Antecedência',
    desc: 'Chegar de 15 a 20 minutos antes do horário marcado garante que você estacione com calma e pegue um ótimo lugar para assistir a celebração.',
    highlight: 'Pontualidade com carinho',
  },
  {
    id: 'chk-6',
    iconName: 'heart',
    title: '🤍 Exclusividade da Noiva',
    desc: 'Pedimos com carinho que os tons de branco, off-white, cru e marfim sejam reservados exclusivamente para o vestido da noiva Fernanda.',
    highlight: 'Reserva especial da noiva',
  },
];
