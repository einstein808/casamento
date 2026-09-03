'use client';

import React, { useEffect } from 'react';
import { ThemeColors } from '@/lib/types';
import { THEME_PRESETS } from '@/lib/themes';

interface ThemeInjectorProps {
  colors?: ThemeColors;
}

export function ThemeInjector({ colors }: ThemeInjectorProps) {
  useEffect(() => {
    const c = colors || THEME_PRESETS[0].colors;
    const root = document.documentElement;

    // Set standard CSS variables
    root.style.setProperty('--primary', c.primary);
    root.style.setProperty('--primary-hover', c.primaryHover);
    root.style.setProperty('--accent', c.accent);
    root.style.setProperty('--background', c.background);
    root.style.setProperty('--card-bg', c.cardBackground);
    root.style.setProperty('--foreground', c.textPrimary);
    root.style.setProperty('--muted', c.textMuted);

    document.body.style.backgroundColor = c.background;
    document.body.style.color = c.textPrimary;

    // Inject dynamic stylesheet override
    let styleEl = document.getElementById('wedding-theme-dynamic-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'wedding-theme-dynamic-css';
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
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
      /* Direct class overrides for full dynamic theme matching */
      [class*="bg-[#C2847A]"], .bg-theme-primary {
        background-color: ${c.primary} !important;
      }
      [class*="hover:bg-[#B07065]"]:hover, .hover\\:bg-theme-primary-hover:hover {
        background-color: ${c.primaryHover} !important;
      }
      [class*="text-[#C2847A]"], [class*="text-[#E0A899]"], .text-theme-primary {
        color: ${c.primary} !important;
      }
      [class*="border-[#C2847A]"], .border-theme-primary {
        border-color: ${c.primary} !important;
      }
      [class*="fill-[#C2847A]"], [class*="fill-[#E0A899]"] {
        fill: ${c.primary} !important;
      }
      [class*="bg-[#FAF3EE]"], [class*="bg-[#F8EFEA]"], [class*="bg-[#F5ECE5]"], .bg-theme-card {
        background-color: ${c.cardBackground} !important;
      }
      [class*="bg-[#FDFBF7]"], [class*="bg-[#F7F2EE]"], .bg-theme-page {
        background-color: ${c.background} !important;
      }
      [class*="text-[#2D2422]"], .text-theme-main {
        color: ${c.textPrimary} !important;
      }
      [class*="text-[#8D7B75]"], [class*="text-[#6B5A55]"], .text-theme-muted {
        color: ${c.textMuted} !important;
      }
    `;
  }, [colors]);

  return null;
}
