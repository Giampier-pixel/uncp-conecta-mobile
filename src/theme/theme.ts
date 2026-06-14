export const colors = {
  canvas: '#0B0B0F', surface: '#141419', surfaceElevated: '#1C1C24', surfaceHover: '#22222B',
  hairline: 'rgba(255,255,255,0.08)', hairlineStrong: 'rgba(255,255,255,0.14)',
  textPrimary: '#F5F5F7', textSecondary: 'rgba(255,255,255,0.72)',
  textMuted: 'rgba(255,255,255,0.50)', textDisabled: 'rgba(255,255,255,0.30)', textOnPrimary: '#FFFFFF',
  primary: '#494FDF', primaryHover: '#5B61F0', primaryPressed: '#3C42C9',
  primarySoft: 'rgba(73,79,223,0.16)', primaryRing: 'rgba(73,79,223,0.45)',
  teal: '#22D3C5', blue: '#38BDF8', pink: '#FF4D8D', green: '#4ADE80',
  orange: '#FB923C', violet: '#A04BF0', red: '#FF5A5F',
  success: '#4ADE80', warning: '#FB923C', danger: '#FF5A5F', info: '#38BDF8',
} as const;

export const gradients = {
  hero: ['#5B5BFF', '#A04BF0', '#FF5BA9'],
  primary: ['#494FDF', '#7A3FF0'],
  teal: ['#22D3C5', '#38BDF8'],
  sunset: ['#FB923C', '#FF4D8D'],
} as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64 } as const;
export const radii = { xs: 8, sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const font = {
  regular: 'Manrope_400Regular', medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold', bold: 'Manrope_700Bold', extrabold: 'Manrope_800ExtraBold',
} as const;

export const type = {
  display:  { fontFamily: font.extrabold, fontSize: 40, lineHeight: 42, letterSpacing: -1 },
  h1:       { fontFamily: font.bold, fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  h2:       { fontFamily: font.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  h3:       { fontFamily: font.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  titleLg:  { fontFamily: font.semibold, fontSize: 18, lineHeight: 24 },
  bodyLg:   { fontFamily: font.medium, fontSize: 17, lineHeight: 26 },
  body:     { fontFamily: font.regular, fontSize: 15, lineHeight: 22 },
  bodySm:   { fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  caption:  { fontFamily: font.medium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: font.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  numberLg: { fontFamily: font.extrabold, fontSize: 40, lineHeight: 44, letterSpacing: -1 },
} as const;

// RequestStatus → { color, soft, label }
export const statusStyle = {
  ENVIADA:                    { color: colors.blue,   soft: 'rgba(56,189,248,0.16)',  label: 'Enviada' },
  EN_REVISION:                { color: colors.violet, soft: 'rgba(160,75,240,0.16)',  label: 'En revisión' },
  INFORMACION_PENDIENTE:      { color: colors.orange, soft: 'rgba(251,146,60,0.16)',  label: 'Información pendiente' },
  DERIVADA_A_FACULTAD:        { color: colors.teal,   soft: 'rgba(34,211,197,0.16)',  label: 'Derivada a facultad' },
  ACEPTADA_GRUPO_ABIERTO:     { color: colors.green,  soft: 'rgba(74,222,128,0.16)',  label: 'Aceptada' },
  EN_EJECUCION:               { color: colors.primary,soft: 'rgba(73,79,223,0.16)',   label: 'En ejecución' },
  ATENDIDA_CONSTANCIA_EMITIDA:{ color: colors.green,  soft: 'rgba(74,222,128,0.16)',  label: 'Atendida' },
  CERRADA:                    { color: '#9A9AA5',     soft: 'rgba(154,154,165,0.16)', label: 'Cerrada' },
  NO_PROCEDE:                 { color: colors.red,    soft: 'rgba(255,90,95,0.16)',   label: 'No procede' },
} as const;

export const theme = { colors, gradients, space, radii, font, type, statusStyle };
export type AppTheme = typeof theme;
