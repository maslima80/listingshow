// Theme System - Premium Color Science

export type ThemeMode = 'dark' | 'light';

export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

// Premium theme presets
export const themePresets = {
  darkLuxe: {
    mode: 'dark' as ThemeMode,
    name: 'Dark Luxe',
    description: 'Sophisticated dark elegance',
    tokens: {
      background: '240 10% 3.9%',
      foreground: '0 0% 98%',
      card: '240 10% 7%',
      cardForeground: '0 0% 98%',
      popover: '240 10% 7%',
      popoverForeground: '0 0% 98%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 98%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '240 5% 64.9%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '240 4.9% 83.9%',
    },
  },
  lightLuxe: {
    mode: 'light' as ThemeMode,
    name: 'Light Luxe',
    description: 'Clean, premium sophistication',
    tokens: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '240 5.9% 10%',
    },
  },
};

// Color conversion utilities
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Calculate contrast ratio (WCAG)
export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Ensure WCAG AAA contrast (7:1)
export function ensureContrast(
  color: { h: number; s: number; l: number },
  background: { h: number; s: number; l: number },
  targetRatio: number = 7
): { h: number; s: number; l: number } {
  let adjustedL = color.l;
  const bgL = background.l / 100;
  
  // Try adjusting lightness
  for (let i = 0; i < 100; i++) {
    const testL = adjustedL / 100;
    const ratio = getContrastRatio(testL, bgL);
    
    if (ratio >= targetRatio) {
      return { ...color, l: adjustedL };
    }
    
    // Adjust towards better contrast
    if (bgL > 0.5) {
      adjustedL = Math.max(0, adjustedL - 1);
    } else {
      adjustedL = Math.min(100, adjustedL + 1);
    }
  }
  
  return { ...color, l: adjustedL };
}

// Process accent color for theme
export function processAccentColor(
  hex: string,
  mode: ThemeMode
): {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
} {
  const hsl = hexToHSL(hex);
  
  // Adjust saturation and lightness for mode
  let adjustedL = hsl.l;
  let adjustedS = Math.min(hsl.s, 85); // Cap saturation for elegance
  
  if (mode === 'dark') {
    // In dark mode, make accent brighter and more vibrant
    adjustedL = Math.max(adjustedL, 55);
    adjustedL = Math.min(adjustedL, 75);
  } else {
    // In light mode, make accent darker for contrast
    adjustedL = Math.max(adjustedL, 35);
    adjustedL = Math.min(adjustedL, 55);
  }
  
  const primary = `${hsl.h} ${adjustedS}% ${adjustedL}%`;
  
  // Calculate foreground color with proper contrast
  const fgL = mode === 'dark' ? 10 : 98;
  const primaryForeground = `0 0% ${fgL}%`;
  
  // Accent (slightly different shade)
  const accentL = mode === 'dark' ? adjustedL - 5 : adjustedL + 5;
  const accent = `${hsl.h} ${adjustedS}% ${accentL}%`;
  const accentForeground = primaryForeground;
  
  // Ring (for focus states)
  const ring = primary;
  
  return {
    primary,
    primaryForeground,
    accent,
    accentForeground,
    ring,
  };
}

// Generate CSS variables for theme
export function generateThemeCSS(
  preset: typeof themePresets.darkLuxe,
  accentColor?: string
): string {
  const tokens: Record<string, string> = { ...preset.tokens };
  
  // If accent color provided, process it
  if (accentColor) {
    const processed = processAccentColor(accentColor, preset.mode);
    tokens.primary = processed.primary;
    tokens.primaryForeground = processed.primaryForeground;
    tokens.accent = processed.accent;
    tokens.accentForeground = processed.accentForeground;
    tokens.ring = processed.ring;
  } else {
    // Use default accent based on mode
    const defaultAccent = preset.mode === 'dark' ? '#C9A66B' : '#8B7355';
    const processed = processAccentColor(defaultAccent, preset.mode);
    tokens.primary = processed.primary;
    tokens.primaryForeground = processed.primaryForeground;
    tokens.accent = processed.accent;
    tokens.accentForeground = processed.accentForeground;
    tokens.ring = processed.ring;
  }
  
  // Add destructive color
  tokens.destructive = preset.mode === 'dark' ? '0 62.8% 60.6%' : '0 84.2% 60.2%';
  tokens.destructiveForeground = preset.mode === 'dark' ? '0 0% 98%' : '0 0% 98%';
  
  return Object.entries(tokens)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n    ');
}

// Apply theme to document
export function applyTheme(
  mode: ThemeMode,
  accentColor?: string
): void {
  const preset = mode === 'dark' ? themePresets.darkLuxe : themePresets.lightLuxe;
  const css = generateThemeCSS(preset, accentColor);
  
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  
  // Apply CSS variables
  const style = document.getElementById('theme-variables') || document.createElement('style');
  style.id = 'theme-variables';
  style.textContent = `:root { ${css} }`;
  
  if (!document.getElementById('theme-variables')) {
    document.head.appendChild(style);
  }
}

// Get current theme from team_themes table
export async function getCurrentTheme(teamId: string): Promise<{
  mode: ThemeMode;
  accentColor: string;
}> {
  // This will be called from the client
  const response = await fetch(`/api/theme/${teamId}`);
  const data = await response.json();
  return data;
}

// Save theme to database
export async function saveTheme(
  teamId: string,
  mode: ThemeMode,
  accentColor: string
): Promise<void> {
  await fetch('/api/theme/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, mode, accentColor }),
  });
}
