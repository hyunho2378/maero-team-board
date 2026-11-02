// 마에로 팀 보드 디자인 토큰. 마에로 HQ tokens.js 구조를 그대로 쓰고 강조색만 파랑으로 바꾼다.
// 모든 색, 간격, 글자, 반경, 모션은 여기서만 정하고 CSS 변수로 내보낸다.

export const color = {
  light: {
    bg: '#FFFFFF',            // Backgrounds Light Primary
    bgGrouped: '#F2F2F7',     // Grouped Backgrounds Light Primary, Gray 6
    surface: '#FFFFFF',       // Grouped Secondary
    surfaceRaised: '#FFFFFF',
    label: '#1C1C1E',         // 본문 글자색 (HQ #000000 에서 변경)
    labelSecondary: '#3A3A3C', // 본문 회색 금지 원칙에 따라 키트 60% 대신 진한 회색
    labelTertiary: '#636366',  // 캡션 전용, 흰 바탕 대비 6:1
    separator: 'rgba(0, 0, 0, 0.12)', // Separators Non-opaque
    separatorOpaque: '#C6C6C8',
    fill: '#E5E5EA',          // Gray 5
    fillStrong: '#D1D1D6',    // Gray 4
    fillPressed: '#C7C7CC',   // Gray 3
    accent: '#2B4BF2',        // 강조 파랑 (HQ #000000 에서 변경)
    accentPressed: '#1F38C0', // 눌림
    onAccent: '#FFFFFF',
    island: '#2B4BF2',        // HQ #000000 에서 변경
    onIsland: '#FFFFFF',
    onIslandSecondary: '#DCE2FF', // 파랑 위 보조 글자 (HQ #AEAEB2 에서 변경, 대비 4.5 이상)
    danger: '#D70015',        // 마감과 위험 표시 한 가지
    material: 'rgba(255, 255, 255, 0.78)',
    scrim: 'rgba(0, 0, 0, 0.32)',
    focus: '#2B4BF2',         // HQ #000000 에서 변경
  },
  dark: {
    bg: '#000000',
    bgGrouped: '#000000',
    surface: '#1C1C1E',       // Dark Elevated Primary, Gray 6
    surfaceRaised: '#2C2C2E',
    label: '#FFFFFF',
    labelSecondary: '#D1D1D6',
    labelTertiary: '#AEAEB2',
    separator: 'rgba(255, 255, 255, 0.17)',
    separatorOpaque: '#38383A',
    fill: '#2C2C2E',
    fillStrong: '#3A3A3C',
    fillPressed: '#48484A',
    accent: '#2B4BF2',        // HQ #FFFFFF 반전에서 같은 파랑으로 변경
    accentPressed: '#1F38C0',
    onAccent: '#FFFFFF',
    island: '#2B4BF2',
    onIsland: '#FFFFFF',
    onIslandSecondary: '#DCE2FF',
    danger: '#D70015',
    material: 'rgba(28, 28, 30, 0.78)',
    scrim: 'rgba(0, 0, 0, 0.56)',
    focus: '#2B4BF2',
  },
};

// 키트 Text Styles(Large). 한국어는 자간 0, 굵기는 400, 500, 600 세 가지만 쓴다 (HQ 700 은 600 으로).
export const type = {
  largeTitle: { size: 34, line: 41, weight: 600 },
  title1: { size: 28, line: 34, weight: 600 },
  title2: { size: 22, line: 28, weight: 600 },
  title3: { size: 20, line: 25, weight: 600 },
  headline: { size: 17, line: 22, weight: 600 },
  body: { size: 17, line: 24, weight: 400 },
  callout: { size: 16, line: 22, weight: 400 },
  subhead: { size: 15, line: 20, weight: 400 },
  footnote: { size: 13, line: 18, weight: 400 },
  caption1: { size: 12, line: 16, weight: 400 },
  caption2: { size: 11, line: 13, weight: 400 },
};

export const font = {
  family: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', system-ui, sans-serif",
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 600, // HQ 700 에서 변경
};

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 };
export const radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export const layout = {
  mobileMax: 430,
  sidebar: 248,
  contentMax: 1560,
  tabBar: 49,
  navBar: 44,
  islandCompact: { width: 232, height: 37 },
  touch: 44, // 데스크톱도 44 유지 (HQ 데스크톱 36 에서 변경)
  breakpointDesktop: 1024,
};

export const motion = {
  fast: '160ms',
  base: '240ms',
  slow: '360ms',
  ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  spring: 'cubic-bezier(0.32, 1.28, 0.6, 1)',
};

export const z = { base: 1, sticky: 10, tabBar: 20, island: 40, popover: 50, sheet: 60, toast: 70 };

// 토큰을 CSS 변수로 바꿔 :root 에 넣는다.
export function applyTokens(mode) {
  const root = document.documentElement;
  const c = color[mode];
  Object.entries(c).forEach(([k, v]) => root.style.setProperty(`--c-${k}`, v));
  Object.entries(type).forEach(([k, v]) => {
    root.style.setProperty(`--t-${k}-size`, `${v.size / 16}rem`);
    root.style.setProperty(`--t-${k}-line`, `${v.line / v.size}`);
    root.style.setProperty(`--t-${k}-weight`, `${v.weight}`);
  });
  root.style.setProperty('--font', font.family);
  root.style.setProperty('--w-regular', font.regular);
  root.style.setProperty('--w-medium', font.medium);
  root.style.setProperty('--w-semibold', font.semibold);
  root.style.setProperty('--w-bold', font.bold);
  Object.entries(space).forEach(([k, v]) => root.style.setProperty(`--s-${k}`, `${v}px`));
  Object.entries(radius).forEach(([k, v]) => root.style.setProperty(`--r-${k}`, `${v}px`));
  root.style.setProperty('--sidebar', `${layout.sidebar}px`);
  root.style.setProperty('--content-max', `${layout.contentMax}px`);
  root.style.setProperty('--tabbar', `${layout.tabBar}px`);
  root.style.setProperty('--touch', `${layout.touch}px`);
  root.style.setProperty('--island-w', `${layout.islandCompact.width}px`);
  root.style.setProperty('--island-h', `${layout.islandCompact.height}px`);
  Object.entries(motion).forEach(([k, v]) => root.style.setProperty(`--m-${k}`, v));
  Object.entries(z).forEach(([k, v]) => root.style.setProperty(`--z-${k}`, v));
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}
