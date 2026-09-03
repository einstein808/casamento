export type GuestStatus = 'pending' | 'confirmed' | 'declined' | 'reconfirmed';

export interface Companion {
  name: string;
  isChild?: boolean;
}

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  slug: string;
  token?: string;
  maxCompanions: number;
  status: GuestStatus;
  confirmedCompanions: Companion[];
  dietRestrictions?: string;
  message?: string;
  reminderCount: number;
  lastReminderSentAt?: string;
  reconfirmedAt?: string;             // Data da reconfirmação final pré-evento
  reconfirmationMessage?: string;
  attendedOnDay?: boolean;           // Check-in no dia do evento
  createdAt: string;
  updatedAt?: string;
}

export type GiftCategory = 'casa' | 'cozinha' | 'lua-de-mel' | 'experiencias' | 'brincadeiras';
export type SectionId = 'historia' | 'local' | 'orientacoes' | 'rsvp' | 'presentes' | 'fotos';

export interface GuestChecklistItem {
  id: string;
  title: string;
  desc: string;
  highlight: string;
  iconName: string;
}

export interface Gift {
  id: string;
  title: string;
  description: string;
  category: GiftCategory;
  price: number;
  imageUrl: string;
  quotaTotal?: number;
  quotaPurchased?: number;
  isFeatured?: boolean;
  active: boolean;
}

export interface PixContribution {
  id: string;
  giftId: string;
  giftTitle: string;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  amount: number;
  message?: string;
  pixCode?: string;
  status: 'pending' | 'confirmed';
  createdAt: string;
}

export interface GuestPhoto {
  id: string;
  uploaderName: string;
  photoUrl: string;
  caption?: string;
  approved: boolean;
  likes: number;
  createdAt: string;
}

export interface StoryMilestone {
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface WeddingFAQ {
  q: string;
  a: string;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  accent: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textMuted: string;
}

export interface WeddingSettings {
  brideName: string;
  groomName: string;
  coupleInitials: string;
  heroSubtitle: string;
  heroBackgroundImageUrl?: string; // Desktop ou padrão
  heroBackgroundMobileImageUrl?: string; // Celular (opcional)
  heroImagePositionDesktop?: string; // 'top', 'center 15%', 'center', 'bottom'
  heroImagePositionMobile?: string; // 'top', 'center', 'bottom'
  heroImageOpacity?: number; // 10 a 100
  heroOverlayDarkness?: number; // 0 a 100
  weddingDate: string; // ISO string e.g. "2026-11-21T16:30:00"
  
  // Theme & Colors
  themeColors?: ThemeColors;
  themePresetName?: string;

  hasCeremony?: boolean;
  ceremonyVenueName: string;
  ceremonyAddress: string;
  ceremonyTime: string;
  ceremonyMapsUrl: string;
  
  hasReception?: boolean;
  receptionVenueName: string;
  receptionAddress: string;
  receptionTime: string;
  receptionMapsUrl: string;
  
  dressCodeTitle: string;
  dressCodeDescription: string;
  dressCodeColors: string[];
  faqs?: WeddingFAQ[];
  checklistItems?: GuestChecklistItem[];
  
  showLoveStorySection?: boolean;
  loveStory: StoryMilestone[];
  
  // Ordem das Seções
  sectionOrder?: SectionId[];
  
  // PIX Settings
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixMerchantName: string;
  pixMerchantCity: string;
  
  // Evolution API Settings
  evolutionApiUrl: string;
  evolutionApiKey: string;
  evolutionInstanceName: string;
  
  // Mensagens Personalizadas de WhatsApp
  customInviteMessageTemplate?: string;
  customReminderMessageTemplate?: string;
  customReconfirmationMessageTemplate?: string;

  // MinIO S3 Storage Settings
  minioEndpoint?: string;
  minioPort?: number;
  minioUseSSL?: boolean;
  minioAccessKey?: string;
  minioSecretKey?: string;
  minioBucketName?: string;
  minioPublicUrl?: string;

  // Admin & Features
  adminPin: string;
  postEventPhotosEnabled: boolean;
  reconfirmationActive?: boolean;
}

export interface GuestMetrics {
  totalInvited: number;
  totalGuests: number;
  confirmedTotal: number;
  reconfirmedTotal: number;
  confirmedAdults: number;
  confirmedChildren: number;
  declinedTotal: number;
  pendingTotal: number;
  attendedTotal: number;
  totalRaisedPix: number;
  totalPhotosCount: number;
}
