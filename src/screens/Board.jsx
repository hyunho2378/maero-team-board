// 해야 할 일: 마에로 HQ 보드(PageHead, 담당 메뉴, 칸과 카드, 할 일 시트)를 "할 일"과 "끝난 일" 두 칸으로 줄인 화면.
import { useState } from 'react';
import { Plus, CalendarClock, AlertCircle, Check } from 'lucide-react';
import PageHead from '../components/PageHead.jsx';
import TaskSheet, { PEOPLE, ownersOf } from '../components/TaskSheet.jsx';
import { Button, Picker, useToast } from '../components/ui.jsx';
import { useSheet, saveRow } from '../lib/collection.js';
import { fmtDate, todayStr, daysBetween } from '../lib/format.js';

function dueText(due, done) {
  if (!due) return null;
  if (done) return { text: `${fmtDate(due)}까지`, warn: false };
  const n = daysBetween(todayStr(), due);
  if (n < 0) return { text: `${fmtDate(due)} 지남`, warn: true };
  if (n === 0) return { text: '오늘까지', warn: true };
  if (n === 1) return { text: '내일까지', warn: false };
  return { text: `${fmtDate(due)}까지`, warn: false };
}

export function TaskCard({ task, onOpen, onToggle }) {
  const d = dueText(task.due, task.done);
  return (
    <div className="card task">
      <button type="button" className="hit" role="checkbox" aria-checked={!!task.done} aria-label={`${task.title} ${task.done ? '끝난 일에서 되돌리기' : '끝냄으로 표시'}`} onClick={() => onToggle(task)}>
        <span className="box">{task.done && <Check size={16} aria-hidden="true" />}</span>
      </button>
      <button type="button" className="body" onClick={() => onOpen(task)}>
        <span className={`title ${task.done ? 'secondary strike' : ''}`}>{task.title}</span>
        <span className="meta">
          <span className="w-semibold" style={{ color: 'var(--c-label)' }}>{ownersOf(task).join(', ') || '담당 없음'}</span>
          {d && <span className={d.warn ? 'w-semibold danger' : ''}>{d.warn ? <AlertCircle size={13} aria-label="기한 임박" /> : <CalendarClock size={13} aria-hidden="true" />}{d.text}</span>}
        </span>
      </button>
    </div>
  );
}

export default function Board() {
  const { items: tasks, loaded } = useSheet('할일');
  const [sheet, setSheet] = useState({ open: false, task: null, defaults: null });
  const [owner, setOwner] = useState('전체');
  const toast = useToast();
  const shown = tasks.filter((x) => owner === '전체' || ownersOf(x).includes(owner));
  const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999') || a.title.localeCompare(b.title);
  const cols = [
    { id: 'open', label: '할 일', list: shown.filter((x) => !x.done).sort(byDue), empty: '남은 일이 없어요' },
    { id: 'done', label: '끝난 일', list: shown.filter((x) => x.done).sort(byDue), empty: '아직 끝난 일이 없어요' },
  ];
  const open = (task) => setSheet({ open: true, task, defaults: null });
  const add = () => setSheet({ open: true, task: null, defaults: { ownerList: owner === '전체' ? [] : [owner] } });
  const toggle = async (task) => { try { await saveRow('할일', { ...task, done: !task.done }); } catch (e) { toast(e.message); } };

  return (
    <div className="page">
      <PageHead title="해야 할 일" sub={`남은 할 일 ${tasks.filter((x) => !x.done).length}건`}>
        <Picker value={owner} onChange={setOwner} options={['전체', ...PEOPLE]} align="right"
          render={({ open: o, setOpen, cur }) => <Button size="sm" aria-expanded={o} onClick={() => setOpen(!o)}>담당 {cur?.label}</Button>} />
        <Button variant="filled" size="sm" icon={Plus} onClick={add}>할 일</Button>
      </PageHead>

      <div className="split">
        {cols.map((c) => (
          <section key={c.id} className="col" aria-label={c.label}>
            <div className="col-head"><h2 className="t-footnote w-semibold">{c.label}</h2><span className="tertiary num">{c.list.length}</span></div>
            {c.list.map((t) => <TaskCard key={t.id} task={t} onOpen={open} onToggle={toggle} />)}
            {loaded && !c.list.length && <p className="note" style={{ padding: 8 }}>{c.empty}</p>}
            {c.id === 'open' && <button type="button" className="add-card" onClick={add}><Plus size={16} aria-hidden="true" />할 일 추가</button>}
          </section>
        ))}
      </div>

      <TaskSheet open={sheet.open} task={sheet.task} defaults={sheet.defaults} onClose={() => setSheet({ open: false, task: null, defaults: null })} />
    </div>
  );
}
