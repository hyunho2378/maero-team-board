// 캘린더: 마에로 HQ 일정 화면(PageHead, 표와 목록 셀, 일정 시트)에 HQ 달력 부품(cal-grid)을 붙인 화면.
import { useEffect, useMemo, useState } from 'react';
import { Plus, Flag, CalendarDays, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHead from '../components/PageHead.jsx';
import { Button, DataTable, Sheet, Field, TextInput, TextArea, DatePicker, Segmented, useToast } from '../components/ui.jsx';
import { useSheet, saveRow, removeRow } from '../lib/collection.js';
import { fmtDate, fmtRange, dday, todayStr, parseDate } from '../lib/format.js';

export const PEOPLE4 = ['주현호', '허주은', '윤현아', '함께'];
const covers = (day, r) => (r.endDate && r.endDate > r.date ? day >= r.date && day <= r.endDate : day === r.date);

function EventSheet({ open, onClose, ev, date }) {
  const [d, setD] = useState({});
  const toast = useToast();
  useEffect(() => { if (open) setD(ev || { title: '', date: date || todayStr(), endDate: '', time: '', memo: '', owner: '함께', deadline: false }); }, [open, ev, date]);
  const set = (k) => (v) => setD((x) => ({ ...x, [k]: v }));
  const isNew = !ev?.id;
  const save = async () => {
    if (!d.title?.trim() || !d.date) { toast('제목과 날짜를 넣어 주세요'); return; }
    const row = { ...d, title: d.title.trim() };
    if (row.endDate && row.endDate <= row.date) row.endDate = '';
    try { await saveRow('일정', row); onClose(row.date); } catch (e) { toast(e.message); }
  };
  const del = async () => { try { await removeRow('일정', ev.id); onClose(); } catch (e) { toast(e.message); } };
  return (
    <Sheet open={open} onClose={() => onClose()} title={isNew ? '새 일정' : '일정 고치기'} actions={<Button variant="filled" size="sm" onClick={save}>저장</Button>}>
      <Field label="제목"><TextInput value={d.title} onChange={set('title')} placeholder="예: 증빙 제출" autoFocus={isNew} /></Field>
      <Field label="구분"><Segmented block options={[{ value: false, label: '일정' }, { value: true, label: '마감일' }]} value={!!d.deadline} onChange={set('deadline')} label="구분" /></Field>
      <div className="form-grid two">
        <Field label="날짜"><DatePicker value={d.date} onChange={set('date')} label="날짜 선택" /></Field>
        <Field label="끝나는 날"><DatePicker value={d.endDate} onChange={set('endDate')} placeholder="하루 일정" label="끝나는 날 선택" /></Field>
        <Field label="시간" className="full"><TextInput value={d.time} onChange={set('time')} placeholder="예: 17:00 (비우면 하루 종일)" inputMode="numeric" /></Field>
        <Field label="담당" className="full"><Segmented block options={PEOPLE4} value={d.owner} onChange={set('owner')} label="담당" /></Field>
      </div>
      <Field label="메모"><TextArea value={d.memo} onChange={set('memo')} placeholder="장소, 준비물" /></Field>
      {!isNew && <div><Button variant="danger" icon={Trash2} onClick={del}>일정 삭제</Button></div>}
    </Sheet>
  );
}

export default function Schedule() {
  const { items } = useSheet('일정');
  const t = todayStr();
  const [sel, setSel] = useState(t);
  const [view, setView] = useState(() => { const b = parseDate(t); return { y: b.getFullYear(), m: b.getMonth() }; });
  const [sheet, setSheet] = useState({ open: false, ev: null });

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    const out = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
    while (out.length > 35 && out.slice(-7).every((d) => d.getMonth() !== view.m)) out.splice(-7);
    return out;
  }, [view]);
  const mark = (s) => { const list = items.filter((r) => covers(s, r)); return { has: list.length > 0, dl: list.some((r) => r.deadline) }; };
  const dayRows = items.filter((r) => covers(sel, r)).sort((a, b) => Number(b.deadline) - Number(a.deadline) || (a.time || '99').localeCompare(b.time || '99'));
  const next = items.filter((r) => r.deadline && r.date >= t).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))[0];
  const pick = (s) => { setSel(s); const d = parseDate(s); if (d.getMonth() !== view.m || d.getFullYear() !== view.y) setView({ y: d.getFullYear(), m: d.getMonth() }); };
  const typeCell = (r) => (r.deadline
    ? <span className="badge lv2 danger"><Flag size={14} aria-hidden="true" />마감</span>
    : <span className="badge lv1"><CalendarDays size={14} aria-hidden="true" />일정</span>);

  return (
    <div className="page">
      <PageHead title="캘린더" sub="11월 19일~11월 25일 주현호 부재">
        <Button variant="filled" size="sm" icon={Plus} onClick={() => setSheet({ open: true, ev: null })}>일정</Button>
      </PageHead>

      {next && (
        <section className="section" aria-label="가장 가까운 마감">
          <div className="surface">
            <div className="list">
              <button type="button" className="list-row" onClick={() => pick(next.date)}>
                <Flag size={18} className="danger" aria-hidden="true" style={{ marginTop: 2, flex: 'none' }} />
                <div className="main-col">
                  <span className="t-footnote secondary w-semibold">가장 가까운 마감</span>
                  <span className="t-subhead w-semibold">{next.title}</span>
                  <div className="meta"><span>{fmtDate(next.date)}{next.time ? ` ${next.time}` : ''}</span></div>
                </div>
                <div className="end"><span className="t-subhead w-semibold danger num">{dday(next.date)}</span></div>
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="grid-2">
        <section className="section">
          <div className="surface pad">
            <div className="cal-head">
              <Button variant="plain" icon={ChevronLeft} aria-label="이전 달" onClick={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { ...v, m: v.m - 1 }))} />
              <h2 className="t-headline">{view.y}년 {view.m + 1}월</h2>
              <Button variant="plain" icon={ChevronRight} aria-label="다음 달" onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { ...v, m: v.m + 1 }))} />
            </div>
            <div className="cal-grid month">
              {['일', '월', '화', '수', '목', '금', '토'].map((w) => <span key={w} className="wd">{w}</span>)}
              {cells.map((d) => {
                const s = d.toLocaleDateString('sv-SE');
                const m = mark(s);
                return (
                  <button key={s} type="button" aria-pressed={s === sel} aria-label={`${fmtDate(s, { year: true })}${m.dl ? ' 마감 있음' : m.has ? ' 일정 있음' : ''}`}
                    className={`${s === sel ? 'on' : ''} ${s === t ? 'today' : ''} ${d.getMonth() !== view.m ? 'out' : ''} ${m.has ? 'has' : ''} ${m.dl ? 'dl' : ''}`}
                    onClick={() => pick(s)}>{d.getDate()}</button>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <Button variant="plain" size="sm" onClick={() => pick(t)}>오늘</Button>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="t-title3">{fmtDate(sel, { year: true })}</h2>
            <Button size="sm" icon={Plus} onClick={() => setSheet({ open: true, ev: null })}>이날 일정</Button>
          </div>
          <div className="surface">
            <DataTable rows={dayRows} onRowClick={(r) => setSheet({ open: true, ev: r })} empty="이날은 일정이 없어요"
              columns={[
                { key: 'time', label: '시간', render: (r) => <span className="nowrap num">{r.time || '하루'}</span>, width: 72 },
                { key: 'title', label: '일정', render: (r) => <><span className="w-semibold">{r.title}</span><div className="t-footnote secondary">{[r.owner, r.endDate ? fmtRange(r.date, r.endDate) : '', r.memo].filter(Boolean).join('  ')}</div></> },
                { key: 'type', label: '구분', render: typeCell, width: 88 },
              ]}
              mobile={(r) => ({ title: r.title, meta: <><span className="num">{r.time || '하루'}</span><span>{r.owner}</span>{r.endDate ? <span>{fmtRange(r.date, r.endDate)}</span> : null}{r.memo ? <span>{r.memo}</span> : null}</>, end: r.deadline ? typeCell(r) : null })} />
          </div>
        </section>
      </div>

      <EventSheet open={sheet.open} ev={sheet.ev} date={sel} onClose={(d) => { setSheet({ open: false, ev: null }); if (d) pick(d); }} />
    </div>
  );
}
