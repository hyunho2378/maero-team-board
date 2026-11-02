// 저장 한 곳. VITE_ENDPOINT 가 있으면 Apps Script 웹앱, 없으면 이 브라우저 localStorage.
const ENDPOINT = import.meta.env.VITE_ENDPOINT || '';
const TEAM_KEY = import.meta.env.VITE_TEAM_KEY || '';
const PREFIX = 'maero-team-board:';

export const SHEETS = ['일정', '할일', '지출', '미팅'];
export const MODE = ENDPOINT ? 'remote' : 'local';

export function uuid() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });
}

// 시트에는 모두 글자로 저장한다. 화면에서 쓰기 좋게 되돌린다.
function normalize(sheet, row) {
  const r = { ...row };
  for (const k of Object.keys(r)) if (r[k] === null || r[k] === undefined) r[k] = '';
  if (sheet === '할일') r.done = r.done === true || r.done === 'true' || r.done === '1';
  if (sheet === '일정') r.deadline = r.deadline === true || r.deadline === 'true' || r.deadline === '1';
  if (sheet === '지출') r.amount = Number(String(r.amount).replace(/[^0-9]/g, '')) || 0;
  return r;
}

function serialize(row) {
  const o = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === 'boolean') o[k] = v ? '1' : '';
    else o[k] = v === null || v === undefined ? '' : String(v);
  }
  return o;
}

async function post(body) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...body, key: TEAM_KEY }),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('http ' + res.status);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'fail');
  return json;
}

function readLocal(sheet) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + sheet) || '[]');
  } catch {
    return [];
  }
}
function writeLocal(sheet, rows) {
  localStorage.setItem(PREFIX + sheet, JSON.stringify(rows));
}

export async function list(sheet) {
  const rows = MODE === 'remote' ? (await post({ action: 'list', sheet })).rows : readLocal(sheet);
  return rows.map((r) => normalize(sheet, r));
}

export async function upsert(sheet, row) {
  const data = serialize({ ...row, id: row.id || uuid(), updatedAt: new Date().toISOString() });
  if (MODE === 'remote') {
    const json = await post({ action: 'upsert', sheet, row: data });
    return normalize(sheet, json.row);
  }
  const rows = readLocal(sheet);
  const i = rows.findIndex((r) => r.id === data.id);
  if (i === -1) rows.push(data);
  else rows[i] = data;
  writeLocal(sheet, rows);
  return normalize(sheet, data);
}

export async function remove(sheet, id) {
  if (MODE === 'remote') {
    await post({ action: 'remove', sheet, row: { id } });
    return true;
  }
  writeLocal(sheet, readLocal(sheet).filter((r) => r.id !== id));
  return true;
}

// 처음 채우기: 시트가 비어 있으면 data/seed.json 을 넣는다. 처음 데이터 id 가 고정이라 두 번 실행돼도 겹치지 않는다.
export async function seedIfEmpty(seed) {
  const out = {};
  for (const sheet of SHEETS) {
    let rows = await list(sheet);
    const flag = PREFIX + 'seeded:' + sheet;
    const already = localStorage.getItem(flag) === '1';
    if (rows.length === 0 && !already && Array.isArray(seed[sheet])) {
      for (const r of seed[sheet]) await upsert(sheet, r);
      rows = await list(sheet);
    }
    if (rows.length > 0 || !already) localStorage.setItem(flag, '1');
    out[sheet] = rows;
  }
  return out;
}
