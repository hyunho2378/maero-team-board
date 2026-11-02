// 화면과 store.js 사이의 캐시. 마에로 HQ store.js 의 useCollection 방식을 그대로 두고,
// 읽기와 쓰기는 팀 보드 store.js (Apps Script 웹앱 또는 이 브라우저 localStorage) 로만 한다.
import { useCallback, useSyncExternalStore } from 'react';
import seed from '../../data/seed.json';
import { seedIfEmpty, list, upsert, remove, uuid, SHEETS, MODE } from './store.js';

export { MODE };
const state = { ready: false, error: null };
const rows = Object.fromEntries(SHEETS.map((s) => [s, { items: [], loaded: false }]));
const subs = new Set();
function emit() { subs.forEach((fn) => fn()); }
function setRows(sheet, items) { rows[sheet] = { items, loaded: true }; emit(); }

let booted = false;
export function boot() {
  if (booted) return;
  booted = true;
  seedIfEmpty(seed)
    .then((d) => { SHEETS.forEach((s) => { rows[s] = { items: d[s] || [], loaded: true }; }); state.ready = true; emit(); })
    .catch(() => { SHEETS.forEach((s) => { rows[s] = { items: [], loaded: true }; }); state.ready = true; state.error = '불러오지 못했어요. 잠시 뒤 다시 열어 주세요'; emit(); });
  if (MODE === 'remote') {
    const again = async () => {
      try { const all = await Promise.all(SHEETS.map(async (s) => [s, await list(s)])); all.forEach(([s, items]) => { rows[s] = { items, loaded: true }; }); emit(); } catch { /* 다음 차례에 다시 시도 */ }
    };
    setInterval(() => { if (document.visibilityState === 'visible') again(); }, 60000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') again(); });
  }
}

const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
export function useSheet(sheet) {
  const get = useCallback(() => rows[sheet], [sheet]);
  return useSyncExternalStore(subscribe, get);
}
let readySnap = { ready: false, error: null };
export function useBoot() {
  return useSyncExternalStore(subscribe, () => {
    if (readySnap.ready !== state.ready || readySnap.error !== state.error) readySnap = { ready: state.ready, error: state.error };
    return readySnap;
  });
}

// 화면을 먼저 바꾸고 저장한다. 저장이 안 되면 되돌리고 오류를 던진다.
export async function saveRow(sheet, input) {
  const row = { ...input, id: input.id || uuid() };
  const before = rows[sheet].items;
  setRows(sheet, [...before.filter((r) => r.id !== row.id), row]);
  try {
    const saved = await upsert(sheet, row);
    setRows(sheet, rows[sheet].items.map((r) => (r.id === saved.id ? saved : r)));
    return saved;
  } catch (e) {
    setRows(sheet, before);
    throw new Error('저장하지 못했어요. 다시 눌러 주세요');
  }
}

export async function removeRow(sheet, id) {
  const before = rows[sheet].items;
  setRows(sheet, before.filter((r) => r.id !== id));
  try { await remove(sheet, id); } catch (e) { setRows(sheet, before); throw new Error('지우지 못했어요. 다시 눌러 주세요'); }
}
