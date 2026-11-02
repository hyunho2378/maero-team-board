// 다이나믹 아일랜드: 접힌 상태는 가장 가까운 마감까지 남은 날과 쓴 돈, 펼치면 마감 3개와 오늘까지 할 일.
import { useEffect, useRef, useState } from 'react';
import { useSheet } from '../lib/collection.js';
import { dday, manwon, todayStr, fmtDate } from '../lib/format.js';

const LIMIT = 2000000;

export default function Island() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { items: spend } = useSheet('지출');
  const { items: tasks } = useSheet('할일');
  const { items: events } = useSheet('일정');
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('pointerdown', h); document.removeEventListener('keydown', k); };
  }, [open]);

  const t = todayStr();
  const spent = spend.filter((r) => r.status === '결제 완료').reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const next = events.filter((e) => e.deadline && e.date >= t).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')).slice(0, 3);
  const first = next[0];
  const todayCount = tasks.filter((x) => !x.done && x.due && x.due <= t).length;

  return (
    <div className="island-wrap" ref={ref}>
      <button type="button" className="island" aria-expanded={open} aria-label={`${first ? `${first.title} ${dday(first.date)}` : '남은 마감 없음'} 쓴 돈 ${manwon(spent)} 상세 보기`} onClick={() => setOpen(!open)}>
        <span className="num">{first ? `마감 ${dday(first.date)}` : '마감 없음'}</span>
        <span className="num"><span>{manwon(spent)}</span><span className="dim"> / {manwon(LIMIT)}</span></span>
      </button>
      <div className={`island-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="head">
          <span className="big num">{first ? `마감 ${dday(first.date)}` : '마감 없음'}</span>
          <span className="dim t-footnote">{first ? first.title : ''}</span>
        </div>
        <div className="row"><span className="dim">쓴 돈</span><span className="num">{manwon(spent)} / {manwon(LIMIT)}</span></div>
        <div className="island-bar"><i style={{ transform: `scaleX(${Math.min(1, spent / LIMIT)})` }} /></div>
        {next.map((n) => (
          <div className="row" key={n.id}><span>{n.title}</span><span className="dim num nowrap">{fmtDate(n.date)} {dday(n.date)}</span></div>
        ))}
        <div className="row"><span className="dim">오늘까지 할 일</span><span className="num">{todayCount}건</span></div>
      </div>
    </div>
  );
}
