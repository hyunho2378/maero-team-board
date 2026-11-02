// 날짜와 금액 표기. 기준 시간대는 Asia/Seoul.
export const FUND_END = '2026-11-30';
export const CAPS = { 활동자금: 2000000, AI솔루션: 1000000 };
export const OWNERS = ['주현호', '허주은', '함께'];
export const COLUMNS = [
  { id: 'backlog', label: '아이디어와 백로그' },
  { id: 'week', label: '이번 주 할 일' },
  { id: 'doing', label: '진행 중' },
  { id: 'waiting', label: '답변 대기' },
  { id: 'done', label: '완료' },
  { id: 'proof', label: '실증 결과와 자료' },
];
export const BUDGET_STATUS = ['계획', '신청완료', '집행', '증빙완료', '제출'];

export function todayStr() { return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }); }
export function parseDate(s) { if (!s) return null; const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); }
export function daysBetween(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000); }
export function dday(target) {
  const n = daysBetween(todayStr(), target);
  if (n === 0) return 'D-day';
  return n > 0 ? `D-${n}` : `D+${-n}`;
}
const WD = ['일', '월', '화', '수', '목', '금', '토'];
export function fmtDate(s, { weekday = true, year = false } = {}) {
  const d = parseDate(s); if (!d) return '';
  const base = `${year ? `${d.getFullYear()}. ` : ''}${d.getMonth() + 1}. ${d.getDate()}.`;
  return weekday ? `${base}(${WD[d.getDay()]})` : base;
}
export function fmtRange(a, b) { return b && b !== a ? `${fmtDate(a)}~${fmtDate(b)}` : fmtDate(a); }
export function won(n) { return `${Math.round(Number(n) || 0).toLocaleString('ko-KR')}원`; }
export function manwon(n) {
  const v = (Number(n) || 0) / 10000;
  return `${Number.isInteger(v) ? v : v.toFixed(1)}만`;
}
export function weekStart(s) { const d = parseDate(s); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.toLocaleDateString('sv-SE'); }
export function addDays(s, n) { const d = parseDate(s); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); }
export function weekLabel(start) {
  const d = parseDate(start);
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const nth = Math.floor((d.getDate() + ((firstOfMonth.getDay() + 6) % 7) - 1) / 7) + 1;
  return `${d.getMonth() + 1}월 ${nth}주`;
}
export function relTime(iso) {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return '방금';
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  return `${Math.floor(s / 86400)}일 전`;
}
