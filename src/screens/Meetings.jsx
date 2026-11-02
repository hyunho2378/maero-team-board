// 미팅 기록: 마에로 HQ 회의록 목록과 상세 화면을 날짜, 누구와, 정한 것, 다음 할 일 입력 칸으로 줄인 화면.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import PageHead from '../components/PageHead.jsx';
import { Button, DataTable, Sheet, Field, TextInput, TextArea, DatePicker, useToast } from '../components/ui.jsx';
import { useSheet, saveRow, removeRow } from '../lib/collection.js';
import { fmtDate, todayStr } from '../lib/format.js';

function MeetingEditor({ open, onClose, meeting }) {
  const [d, setD] = useState({});
  const toast = useToast();
  useEffect(() => { if (open) setD(meeting || { date: todayStr(), time: '', who: '', decided: '', next: '', memo: '' }); }, [open, meeting]);
  const set = (k) => (v) => setD((x) => ({ ...x, [k]: v }));
  const save = async () => {
    if (!String(d.who || '').trim()) { toast('누구와 만났는지 적어 주세요'); return; }
    try { const saved = await saveRow('미팅', { ...d, who: d.who.trim() }); onClose(saved); } catch (e) { toast(e.message); }
  };
  return (
    <Sheet open={open} onClose={() => onClose()} title={meeting?.id ? '기록 고치기' : '새 미팅'} wide actions={<Button variant="filled" size="sm" onClick={save}>저장</Button>}>
      <div className="form-grid two">
        <Field label="누구와" className="full"><TextInput value={d.who} onChange={set('who')} placeholder="예: 유연성 파트너" autoFocus={!meeting?.id} /></Field>
        <Field label="날짜"><DatePicker value={d.date} onChange={set('date')} label="날짜 선택" /></Field>
        <Field label="시간"><TextInput value={d.time} onChange={set('time')} placeholder="예: 15:30~16:35" /></Field>
      </div>
      <Field label="정한 것"><TextArea value={d.decided} onChange={set('decided')} placeholder="무엇을 정했나" /></Field>
      <Field label="다음 할 일"><TextArea value={d.next} onChange={set('next')} placeholder="누가 언제까지 무엇을" /></Field>
      <Field label="메모"><TextArea value={d.memo} onChange={set('memo')} placeholder="그 밖의 내용" /></Field>
    </Sheet>
  );
}

export function Meetings() {
  const { items } = useSheet('미팅');
  const nav = useNavigate();
  const [adding, setAdding] = useState(false);
  const list = [...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return (
    <div className="page">
      <PageHead title="미팅 기록" sub={`기록 ${items.length}개`}><Button variant="filled" size="sm" icon={Plus} onClick={() => setAdding(true)}>새 미팅</Button></PageHead>
      <div className="surface">
        <DataTable rows={list} onRowClick={(m) => nav(`/meetings/${m.id}`)} empty="아직 기록이 없어요"
          columns={[
            { key: 'date', label: '날짜', render: (m) => <span className="nowrap">{fmtDate(m.date)}</span>, width: 120 },
            { key: 'who', label: '누구와', render: (m) => <span className="w-semibold">{m.who}</span> },
            { key: 'decided', label: '정한 것', render: (m) => <span className="secondary">{m.decided}</span> },
          ]}
          mobile={(m) => ({ title: m.who, meta: <><span>{fmtDate(m.date)}</span>{m.time ? <span>{m.time}</span> : null}{m.decided ? <span>{m.decided}</span> : null}</> })} />
      </div>
      <MeetingEditor open={adding} meeting={null} onClose={(saved) => { setAdding(false); if (saved) nav(`/meetings/${saved.id}`); }} />
    </div>
  );
}

export function MeetingDetail() {
  const { id } = useParams();
  const { items, loaded } = useSheet('미팅');
  const m = items.find((x) => x.id === id);
  const [edit, setEdit] = useState(false);
  const nav = useNavigate();
  const toast = useToast();
  if (!m) return <div className="page">{loaded ? <p>기록을 찾지 못했어요 <Link to="/meetings">목록</Link></p> : <span className="spin" />}</div>;
  const del = async () => { try { await removeRow('미팅', m.id); nav('/meetings'); } catch (e) { toast(e.message); } };
  const block = (title, text) => (
    <section className="section">
      <h2 className="t-title3">{title}</h2>
      <div className="surface pad">{text ? <p className="pre t-callout">{text}</p> : <p className="note">비어 있어요</p>}</div>
    </section>
  );
  return (
    <div className="page">
      <div><Link to="/meetings" className="btn btn-plain btn-sm" style={{ textDecoration: 'none' }}><ChevronLeft size={16} aria-hidden="true" />미팅 기록</Link></div>
      <PageHead title={m.who} sub={`${fmtDate(m.date, { year: true })}${m.time ? `  ${m.time}` : ''}`}>
        <Button size="sm" icon={Pencil} onClick={() => setEdit(true)}>고치기</Button>
        <Button size="sm" variant="danger" icon={Trash2} onClick={del}>지우기</Button>
      </PageHead>
      <div className="split">
        {block('정한 것', m.decided)}
        {block('다음 할 일', m.next)}
      </div>
      {m.memo ? block('메모', m.memo) : null}
      <MeetingEditor open={edit} meeting={m} onClose={() => setEdit(false)} />
    </div>
  );
}
