import { ThemeColors } from './types';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rose-gold',
    name: 'Rose Gold & Champagne (Clássico)',
    description: 'Tons românticos e quentes de rosé com marfim e champanhe.',
    colors: {
      primary: '#C2847A',
      primaryHover: '#B07065',
      accent: '#D9C5B2',
      background: '#FDFBF7',
      cardBackground: '#FAF3EE',
      textPrimary: '#2D2422',
      textMuted: '#8D7B75',
    },
  },
  {
    id: 'royal-blue',
    name: 'Azul Royal & Dourado (Elegância Noturna)',
    description: 'Azul royal nobre e sofisticado com toques de dourado e marfim para casamentos clássicos.',
    colors: {
      primary: '#1E40AF',
      primaryHover: '#1E3A8A',
      accent: '#C5A059',
      background: '#F8FAFC',
      cardBackground: '#F1F5F9',
      textPrimary: '#0F172A',
      textMuted: '#64748B',
    },
  },
  {
    id: 'sage-green',
    name: 'Verde Eucalipto & Sage (Botânico & Rústico)',
    description: 'Tons orgânicos de verde oliva e eucalipto, ideal para casamentos no campo ou ao ar livre.',
    colors: {
      primary: '#5B7065',
      primaryHover: '#4A5C53',
      accent: '#8EA89D',
      background: '#F7FAF8',
      cardBackground: '#EEF3F0',
      textPrimary: '#24332C',
      textMuted: '#6B7E74',
    },
  },
  {
    id: 'royal-gold',
    name: 'Dourado Real & Marfim (Luxo Clássico)',
    description: 'Dourado nobre com tons de areia e off-white para casamentos clássicos.',
    colors: {
      primary: '#C5A059',
      primaryHover: '#B38D45',
      accent: '#E5C98E',
      background: '#FAF8F5',
      cardBackground: '#F3EFEA',
      textPrimary: '#2B251F',
      textMuted: '#7E756C',
    },
  },
  {
    id: 'marsala',
    name: 'Marsala & Vinho (Romance Sofisticado)',
    description: 'Paleta marcante e apaixonante em tons de vinho, marsala e rosewood.',
    colors: {
      primary: '#873D48',
      primaryHover: '#74323D',
      accent: '#C2847A',
      background: '#FDF8F8',
      cardBackground: '#F7ECEE',
      textPrimary: '#2E1C1E',
      textMuted: '#7A5C60',
    },
  },
  {
    id: 'terracotta',
    name: 'Terracota & Areia (Boho Chic & Praia)',
    description: 'Tons terrosos calorosos e modernos de terracota, damasco e linho.',
    colors: {
      primary: '#C86D51',
      primaryHover: '#B55B3F',
      accent: '#E2A384',
      background: '#FCF8F5',
      cardBackground: '#F7ECE6',
      textPrimary: '#352520',
      textMuted: '#826B64',
    },
  },
  {
    id: 'lavender',
    name: 'Lavanda & Pêssego (Delicado & Suave)',
    description: 'Tons pastéis suaves de lavanda e lilás para uma atmosfera leve e etérea.',
    colors: {
      primary: '#7E6B9E',
      primaryHover: '#6C588C',
      accent: '#B8A9D6',
      background: '#FAF8FD',
      cardBackground: '#F3EEF9',
      textPrimary: '#29233B',
      textMuted: '#736B85',
    },
  },
];

export function getThemeStyles(colors?: ThemeColors): string {
  const c = colors || THEME_PRESETS[0].colors;

  return `
    :root {
      --primary: ${c.primary};
      --primary-hover: ${c.primaryHover};
      --accent: ${c.accent};
      --background: ${c.background};
      --card-bg: ${c.cardBackground};
      --foreground: ${c.textPrimary};
      --muted: ${c.textMuted};
    }
    body {
      background-color: ${c.background} !important;
      color: ${c.textPrimary} !important;
    }
  `;
}
