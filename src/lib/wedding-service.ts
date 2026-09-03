import { 
  DEFAULT_GIFTS, 
  DEFAULT_GUESTS, 
  DEFAULT_SETTINGS 
} from './default-data';
import { 
  Companion,
  Gift, 
  Guest, 
  GuestMetrics, 
  GuestPhoto, 
  PixContribution, 
  WeddingSettings 
} from './types';

const STORAGE_KEYS = {
  SETTINGS: 'casamento_settings_v1',
  GUESTS: 'casamento_guests_v1',
  GIFTS: 'casamento_gifts_v1',
  PIX_LOGS: 'casamento_pix_logs_v1',
  PHOTOS: 'casamento_photos_v1',
};

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export class WeddingService {
  // --- SETTINGS ---
  static getSettings(): WeddingSettings {
    const s = getLocalItem<WeddingSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

    // Auto-migrate old placeholders to provided credentials
    let changed = false;
    if (!s.minioEndpoint || s.minioEndpoint === 'localhost') {
      s.minioEndpoint = DEFAULT_SETTINGS.minioEndpoint;
      s.minioPort = DEFAULT_SETTINGS.minioPort;
      s.minioUseSSL = DEFAULT_SETTINGS.minioUseSSL;
      s.minioAccessKey = DEFAULT_SETTINGS.minioAccessKey;
      s.minioSecretKey = DEFAULT_SETTINGS.minioSecretKey;
      s.minioBucketName = DEFAULT_SETTINGS.minioBucketName;
      s.minioPublicUrl = DEFAULT_SETTINGS.minioPublicUrl;
      changed = true;
    }
    if (!s.evolutionApiUrl || s.evolutionApiUrl.includes('exemplo.com')) {
      s.evolutionApiUrl = DEFAULT_SETTINGS.evolutionApiUrl;
      s.evolutionApiKey = DEFAULT_SETTINGS.evolutionApiKey;
      s.evolutionInstanceName = DEFAULT_SETTINGS.evolutionInstanceName;
      changed = true;
    }

    if (changed) {
      setLocalItem(STORAGE_KEYS.SETTINGS, s);
    }

    return s;
  }

  static saveSettings(settings: WeddingSettings): WeddingSettings {
    setLocalItem(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  }

  // --- GUESTS ---
  static getGuests(): Guest[] {
    return getLocalItem<Guest[]>(STORAGE_KEYS.GUESTS, DEFAULT_GUESTS);
  }

  static getGuestBySlug(slug: string): Guest | undefined {
    const guests = this.getGuests();
    const cleanSlug = slug.trim().toLowerCase();
    return guests.find(g => g.slug.toLowerCase() === cleanSlug || g.id === cleanSlug);
  }

  static saveGuest(guest: Partial<Guest> & { name: string }): Guest {
    const guests = this.getGuests();
    const slug = guest.slug || guest.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingIndex = guests.findIndex(g => g.id === guest.id || (guest.id && g.id === guest.id));

    if (existingIndex >= 0) {
      const updated: Guest = {
        ...guests[existingIndex],
        ...guest,
        slug,
        updatedAt: new Date().toISOString(),
      };
      guests[existingIndex] = updated;
      setLocalItem(STORAGE_KEYS.GUESTS, guests);
      return updated;
    } else {
      const newGuest: Guest = {
        id: guest.id || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: guest.name,
        phone: guest.phone || '',
        email: guest.email || '',
        slug,
        maxCompanions: guest.maxCompanions ?? 0,
        status: guest.status || 'pending',
        confirmedCompanions: guest.confirmedCompanions || [],
        dietRestrictions: guest.dietRestrictions || '',
        message: guest.message || '',
        reminderCount: 0,
        attendedOnDay: false,
        createdAt: new Date().toISOString(),
      };
      guests.push(newGuest);
      setLocalItem(STORAGE_KEYS.GUESTS, guests);
      return newGuest;
    }
  }

  static updateGuestStatus(
    guestId: string, 
    status: 'confirmed' | 'declined' | 'reconfirmed', 
    confirmedCompanions: Companion[] = [],
    dietRestrictions: string = '',
    message: string = ''
  ): Guest | null {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === guestId);
    if (index === -1) return null;

    const isReconfirm = status === 'reconfirmed';

    guests[index] = {
      ...guests[index],
      status: isReconfirm ? 'reconfirmed' : status,
      confirmedCompanions: (status === 'confirmed' || isReconfirm) ? confirmedCompanions : [],
      dietRestrictions,
      message,
      reconfirmedAt: isReconfirm ? new Date().toISOString() : guests[index].reconfirmedAt,
      updatedAt: new Date().toISOString(),
    };

    setLocalItem(STORAGE_KEYS.GUESTS, guests);
    return guests[index];
  }

  static toggleGuestCheckIn(guestId: string): Guest | null {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === guestId);
    if (index === -1) return null;

    guests[index].attendedOnDay = !guests[index].attendedOnDay;
    guests[index].updatedAt = new Date().toISOString();

    setLocalItem(STORAGE_KEYS.GUESTS, guests);
    return guests[index];
  }

  static recordReminderSent(guestId: string): void {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === guestId);
    if (index >= 0) {
      guests[index].reminderCount = (guests[index].reminderCount || 0) + 1;
      guests[index].lastReminderSentAt = new Date().toISOString();
      setLocalItem(STORAGE_KEYS.GUESTS, guests);
    }
  }

  static deleteGuest(guestId: string): void {
    const guests = this.getGuests().filter(g => g.id !== guestId);
    setLocalItem(STORAGE_KEYS.GUESTS, guests);
  }

  // --- GIFTS ---
  static getGifts(): Gift[] {
    const saved = getLocalItem<Gift[]>(STORAGE_KEYS.GIFTS, DEFAULT_GIFTS);
    // Ensure all default gifts exist
    const missing = DEFAULT_GIFTS.filter(dg => !saved.some(sg => sg.id === dg.id));
    if (missing.length > 0) {
      const merged = [...missing, ...saved];
      setLocalItem(STORAGE_KEYS.GIFTS, merged);
      return merged;
    }
    return saved;
  }

  static saveGift(gift: Partial<Gift> & { title: string; price: number }): Gift {
    const gifts = this.getGifts();
    const existingIndex = gifts.findIndex(g => g.id === gift.id);

    if (existingIndex >= 0) {
      const updated: Gift = { ...gifts[existingIndex], ...gift } as Gift;
      gifts[existingIndex] = updated;
      setLocalItem(STORAGE_KEYS.GIFTS, gifts);
      return updated;
    } else {
      const newGift: Gift = {
        id: gift.id || `gift-${Date.now()}`,
        title: gift.title,
        description: gift.description || '',
        category: gift.category || 'casa',
        price: gift.price,
        imageUrl: gift.imageUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
        quotaTotal: gift.quotaTotal || 1,
        quotaPurchased: 0,
        active: true,
        isFeatured: gift.isFeatured || false,
      };
      gifts.push(newGift);
      setLocalItem(STORAGE_KEYS.GIFTS, gifts);
      return newGift;
    }
  }

  static recordPixContribution(contribution: Omit<PixContribution, 'id' | 'createdAt'>): PixContribution {
    const contributions = getLocalItem<PixContribution[]>(STORAGE_KEYS.PIX_LOGS, []);
    const newContrib: PixContribution = {
      ...contribution,
      id: `pix-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    contributions.push(newContrib);
    setLocalItem(STORAGE_KEYS.PIX_LOGS, contributions);

    const gifts = this.getGifts();
    const giftIndex = gifts.findIndex(g => g.id === contribution.giftId);
    if (giftIndex >= 0) {
      gifts[giftIndex].quotaPurchased = (gifts[giftIndex].quotaPurchased || 0) + 1;
      setLocalItem(STORAGE_KEYS.GIFTS, gifts);
    }

    return newContrib;
  }

  static getPixContributions(): PixContribution[] {
    return getLocalItem<PixContribution[]>(STORAGE_KEYS.PIX_LOGS, [
      {
        id: 'pix-demo-1',
        giftId: 'gift-2',
        giftTitle: 'Jantar Romântico na Lua de Mel',
        guestName: 'Carlos Eduardo Oliveira',
        amount: 250.00,
        message: 'Aproveitem muito esse jantar maravilhoso! Abraços do Carlos e Mari.',
        status: 'confirmed',
        createdAt: '2026-08-11T14:20:00Z',
      },
      {
        id: 'pix-demo-2',
        giftId: 'gift-4',
        giftTitle: 'Cota Diária de Hotel na Lua de Mel',
        guestName: 'Juliana Mendes',
        amount: 380.00,
        message: 'Para vocês curtirem muito o hotel dos sonhos!',
        status: 'confirmed',
        createdAt: '2026-08-12T19:00:00Z',
      }
    ]);
  }

  // --- PHOTOS ---
  static getPhotos(): GuestPhoto[] {
    const list = getLocalItem<GuestPhoto[]>(STORAGE_KEYS.PHOTOS, [
      {
        id: 'photo-1',
        uploaderName: 'Juliana Mendes',
        photoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        caption: 'Os noivos mais lindos do mundo! Toda a felicidade para vocês!',
        approved: true,
        likes: 14,
        createdAt: '2026-11-21T21:40:00Z',
      },
      {
        id: 'photo-2',
        uploaderName: 'Carlos Oliveira',
        photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        caption: 'Hora do brinde! Que festa maravilhosa!',
        approved: true,
        likes: 22,
        createdAt: '2026-11-21T22:15:00Z',
      }
    ]);

    // Automatically normalize direct S3 URLs to safe internal media proxy
    return list.map(photo => {
      if (photo.photoUrl.includes('s3.gabryelamaro.com/casamento/')) {
        const filename = photo.photoUrl.split('s3.gabryelamaro.com/casamento/')[1];
        return {
          ...photo,
          photoUrl: `/api/media/${filename}`
        };
      }
      return photo;
    });
  }

  static addPhoto(uploaderName: string, photoUrl: string, caption?: string): GuestPhoto {
    const photos = this.getPhotos();
    const newPhoto: GuestPhoto = {
      id: `photo-${Date.now()}`,
      uploaderName,
      photoUrl,
      caption,
      approved: true,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    photos.unshift(newPhoto);
    setLocalItem(STORAGE_KEYS.PHOTOS, photos);
    return newPhoto;
  }

  static toggleLikePhoto(photoId: string): void {
    const photos = this.getPhotos();
    const index = photos.findIndex(p => p.id === photoId);
    if (index >= 0) {
      photos[index].likes = (photos[index].likes || 0) + 1;
      setLocalItem(STORAGE_KEYS.PHOTOS, photos);
    }
  }

  static deletePhoto(photoId: string): void {
    const photos = this.getPhotos().filter(p => p.id !== photoId);
    setLocalItem(STORAGE_KEYS.PHOTOS, photos);
  }

  // --- METRICS CALCULATION (Real-time and exhaustive) ---
  static getMetrics(): GuestMetrics {
    const guests = this.getGuests();
    const contributions = this.getPixContributions();
    const photos = this.getPhotos();

    let totalInvited = 0;
    let confirmedAdults = 0;
    let confirmedChildren = 0;
    let reconfirmedTotal = 0;
    let declinedTotal = 0;
    let pendingTotal = 0;
    let attendedTotal = 0;

    guests.forEach(guest => {
      totalInvited += 1 + (guest.maxCompanions || 0);

      if (guest.status === 'confirmed' || guest.status === 'reconfirmed') {
        confirmedAdults += 1;
        guest.confirmedCompanions?.forEach(c => {
          if (c.isChild) {
            confirmedChildren += 1;
          } else {
            confirmedAdults += 1;
          }
        });

        if (guest.status === 'reconfirmed') {
          reconfirmedTotal += 1 + (guest.confirmedCompanions?.length || 0);
        }
      } else if (guest.status === 'declined') {
        declinedTotal += 1;
      } else {
        pendingTotal += 1;
      }

      if (guest.attendedOnDay) {
        attendedTotal += 1;
        if (guest.confirmedCompanions?.length) {
          attendedTotal += guest.confirmedCompanions.length;
        }
      }
    });

    const totalRaisedPix = contributions
      .filter(c => c.status === 'confirmed')
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      totalInvited,
      totalGuests: guests.length,
      confirmedTotal: confirmedAdults + confirmedChildren,
      reconfirmedTotal,
      confirmedAdults,
      confirmedChildren,
      declinedTotal,
      pendingTotal,
      attendedTotal,
      totalRaisedPix,
      totalPhotosCount: photos.length,
    };
  }
}
