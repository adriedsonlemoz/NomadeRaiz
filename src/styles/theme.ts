import type { FontScale } from '../types';
export type { FontScale } from '../types';

export const T={navy:'#0f2744',navyMid:'#16395f',navyLight:'#1d4673',blue:'#2563eb',blueLight:'#eff6ff',blueSoft:'#dbeafe',blueChip:'#e8eef8',pageBg:'#f5f7fb',white:'#ffffff',border:'#dbe3ee',textMain:'#172033',textSub:'#536174',textMuted:'#8a97a8',doneBg:'#ecfdf3',doneBorder:'#86efac',doneCheck:'#15803d',urgBg:'#fff1f2',urgBorder:'#fecdd3',urgColor:'#dc2626',medBg:'#fffbeb',medBorder:'#fde68a',medColor:'#b45309',lowBg:'#f8fafc',lowBorder:'#e2e8f0',lowColor:'#64748b'};
export const darkT={...T,navy:'#07111f',navyMid:'#10243c',navyLight:'#18324f',pageBg:'#0b1220',white:'#111c2e',border:'#26364d',textMain:'#f1f5f9',textSub:'#c3cfdd',textMuted:'#8795a8',blueLight:'#132742',blueSoft:'#1b3558',blueChip:'#1b2b40',doneBg:'#0d2c1a',doneBorder:'#176b39',doneCheck:'#4ade80',urgBg:'#32151a',urgBorder:'#7f1d2d',urgColor:'#fb7185',medBg:'#302511',medBorder:'#785d1d',medColor:'#fbbf24',lowBg:'#172033',lowBorder:'#334155',lowColor:'#cbd5e1'};

export const FONT_SCALES={sm:{xs:9,sm:11,md:13,lg:16,xl:20},md:{xs:10,sm:12,md:14,lg:18,xl:22},lg:{xs:11,sm:13,md:15,lg:20,xl:24}} as const;
export const UI_SCALE:Record<FontScale,number>={sm:.94,md:1,lg:1.07};

// Tokens básicos para novos componentes. As telas antigas podem migrar aos poucos.
export const SPACE={xs:4,sm:8,md:12,lg:16,xl:20,xxl:28} as const;
export const RADIUS={sm:9,md:12,lg:14,xl:20,pill:999} as const;
export const SHADOW={soft:'0 4px 14px rgba(15,39,68,.10)',modal:'0 20px 60px rgba(0,0,0,.30)'} as const;
