// Minimi Agri design tokens.
// "Night pasture" dark theme + sage-paper light theme, gold (farmer/primary)
// and teal (vet/secondary) accents. Keep these as the single source of truth —
// components should read colors from here, never hardcode hex values.

export const dark = {
  bg: '#1F1F1F', bgElevated: '#292929', surface: '#292929',
  surfaceHover: '#333333', border: '#3D3D3D', borderStrong: '#525252',
  text: '#EBEBEB', textMuted: '#8C8C8C', textFaint: '#737373',
  gold: '#C28B46', goldSoft: 'rgba(194,139,70,0.16)', goldText: '#E2B77C',
  teal: '#45A66A', tealSoft: 'rgba(69,166,106,0.16)', tealText: '#81CC9A',
  danger: '#D9705F', dangerSoft: 'rgba(217,112,95,0.14)',
};

export const light = {
  bg: '#FAFAFA', bgElevated: '#FFFFFF', surface: '#FFFFFF',
  surfaceHover: '#F5F1ED', border: '#E0E0E0', borderStrong: '#CBCBCB',
  // Keep all standard light-mode copy comfortably readable on white/ivory
  // surfaces; low-contrast gray is reserved for decorative borders only.
  text: '#171717', textMuted: '#3F3F3F', textFaint: '#5A5A5A',
  gold: '#BD7D28', goldSoft: 'rgba(189,125,40,0.10)', goldText: '#9A641F',
  teal: '#389E5D', tealSoft: 'rgba(56,158,93,0.10)', tealText: '#287A45',
  danger: '#C0503F', dangerSoft: 'rgba(192,80,63,0.10)',
};
