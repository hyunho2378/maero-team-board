// 공통 부품: 버튼, 입력, 세그먼트, 메뉴, 달력, 시트, 표, 상태. (마에로 HQ ui.jsx 에서 사진과 마크다운만 뺌)
import { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronLeft, ChevronRight, X, Circle, CircleDot, CircleCheck, Calendar } from 'lucide-react';
import { fmtDate, todayStr, parseDate } from '../lib/format.js';

export function Button({ variant = 'gray', size, icon: Icon, children, className = '', ...rest }) {
  return (
    <button type="button" className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${!children ? 'icon-btn' : ''} ${className}`} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 16 : 20} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Field({ label, children, className = '' }) {
  return <div className={`field ${className}`}><span className="label">{label}</span>{children}</div>;
}

export function TextInput({ value, onChange, ...rest }) {
  return <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />;
}
export function TextArea({ value, onChange, className = '', ...rest }) {
  return <textarea className={`textarea ${className}`} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />;
}
export function MoneyInput({ value, onChange, ...rest }) {
  return (
    <input className="input num" inputMode="numeric" value={value ? Number(value).toLocaleString('ko-KR') : ''}
      onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, '')) || 0)} placeholder="0" {...rest} />
  );
}

export function Segmented({ options, value, onChange, block, label, multi }) {
  if (multi) {
    const cur = Array.isArray(value) ? value : [];
    return (
      <div className={`segmented seg-multi ${block ? 'block' : ''}`} role="group" aria-label={label}>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value; const l = typeof o === 'string' ? o : o.label;
          const on = cur.includes(v);
          return <button key={v} type="button" aria-pressed={on} onClick={() => onChange(on ? cur.filter((x) => x !== v) : [...cur, v])}>{l}</button>;
        })}
      </div>
    );
  }
  return (
    <div className={`segmented ${block ? 'block' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value; const l = typeof o === 'string' ? o : o.label;
        return <button key={String(v)} type="button" role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>;
      })}
    </div>
  );
}

function useOutside(ref, onClose, open) {
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('pointerdown', h); document.removeEventListener('keydown', k); };
  }, [open, onClose, ref]);
}

// 네이티브 select 대신 쓰는 메뉴
export function Picker({ value, options, onChange, placeholder = '선택', label, align, render }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false), open);
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const cur = norm.find((o) => o.value === value);
  return (
    <div className="pop-anchor" ref={ref}>
      {render ? render({ open, setOpen, cur }) : (
        <button type="button" className="picker-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}>
          <span className={cur ? '' : 'tertiary'}>{cur?.label ?? placeholder}</span><ChevronDown size={16} aria-hidden="true" />
        </button>
      )}
      {open && (
        <div className={`popover ${align === 'right' ? 'right' : ''}`} role="listbox">
          {norm.map((o) => (
            <button key={String(o.value)} type="button" role="option" aria-selected={o.value === value} className={`menu-item ${o.value === value ? 'on' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}>
              <span>{o.label}</span>{o.value === value && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 네이티브 date 대신 쓰는 달력
export function DatePicker({ value, onChange, placeholder = '날짜 선택', label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false), open);
  const base = parseDate(value) || parseDate(todayStr());
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
  useEffect(() => { if (open) { const b = parseDate(value) || parseDate(todayStr()); setView({ y: b.getFullYear(), m: b.getMonth() }); } }, [open, value]);
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [view]);
  const t = todayStr();
  return (
    <div className="pop-anchor" ref={ref}>
      <button type="button" className="picker-btn" aria-label={label} aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={value ? '' : 'tertiary'}>{value ? fmtDate(value, { year: true }) : placeholder}</span><Calendar size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="popover cal" role="dialog" aria-label="날짜 선택">
          <div className="cal-head">
            <Button variant="plain" icon={ChevronLeft} aria-label="이전 달" onClick={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { ...v, m: v.m - 1 }))} />
            <span className="t-subhead w-semibold">{view.y}년 {view.m + 1}월</span>
            <Button variant="plain" icon={ChevronRight} aria-label="다음 달" onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { ...v, m: v.m + 1 }))} />
          </div>
          <div className="cal-grid">
            {['일', '월', '화', '수', '목', '금', '토'].map((w) => <span key={w} className="wd">{w}</span>)}
            {cells.map((d) => {
              const s = d.toLocaleDateString('sv-SE');
              return (
                <button key={s} type="button" className={`${s === value ? 'on' : ''} ${s === t ? 'today' : ''} ${d.getMonth() !== view.m ? 'out' : ''}`}
                  aria-label={fmtDate(s, { year: true })} onClick={() => { onChange(s); setOpen(false); }}>{d.getDate()}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
            <Button variant="plain" size="sm" onClick={() => { onChange(t); setOpen(false); }}>오늘</Button>
            <Button variant="plain" size="sm" onClick={() => { onChange(''); setOpen(false); }}>지우기</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Sheet({ open, onClose, title, children, actions, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div className={`sheet ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grabber" aria-hidden="true" />
        <div className="sheet-head">
          <Button variant="plain" onClick={onClose}>닫기</Button>
          <span className="t-headline" style={{ textAlign: 'center', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          <div style={{ display: 'flex', gap: 4 }}>{actions}</div>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>,
    document.body,
  );
}

// 표: 넓은 화면은 표, 좁은 화면은 목록 셀
export function DataTable({ columns, rows, onRowClick, mobile, empty = '항목 0건', footer, rowKey = (r) => r.id }) {
  if (!rows.length) return <div className="empty t-subhead">{empty}</div>;
  return (
    <div className="table-wrap">
      <div className={mobile ? 'desktop-only' : ''}>
        <table className="tbl">
          <thead><tr>{columns.map((c) => <th key={c.key} className={c.align === 'right' ? 'r' : ''} style={c.width ? { width: c.width } : undefined}>{c.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={rowKey(r)} className={onRowClick ? 'clickable' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined}
                tabIndex={onRowClick ? 0 : undefined} onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(r); } : undefined}>
                {columns.map((c) => <td key={c.key} className={c.align === 'right' ? 'r' : ''}>{c.render ? c.render(r) : r[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
          {footer && <tfoot><tr>{footer.map((f, i) => <td key={i} className={columns[i]?.align === 'right' ? 'r' : ''}>{f}</td>)}</tr></tfoot>}
        </table>
      </div>
      {mobile && (
        <div className="mobile-only list">
          {rows.map((r) => {
            const m = mobile(r);
            return (
              <button type="button" key={rowKey(r)} className="list-row" onClick={onRowClick ? () => onRowClick(r) : undefined}>
                <div className="main-col"><span className="t-subhead w-semibold">{m.title}</span>{m.meta && <div className="meta">{m.meta}</div>}</div>
                {m.end && <div className="end">{m.end}</div>}
              </button>
            );
          })}
          {footer && mobile.footer && <div className="list-row" style={{ cursor: 'default' }}>{mobile.footer}</div>}
        </div>
      )}
    </div>
  );
}

// 지출 상태: HQ 예산 상태 표시(빈 원, 점 원, 체크 원과 굵기)를 지출 3단계에 맞춤
const STATUS_ICON = { '승인 전': Circle, 승인: CircleDot, '결제 완료': CircleCheck };
export function BudgetStatus({ status }) {
  const lv = { '승인 전': 0, 승인: 1, '결제 완료': 2 }[status] ?? 0;
  const Icon = STATUS_ICON[status] || Circle;
  return <span className={`badge lv${lv}`}><Icon size={14} aria-hidden="true" />{status || '승인 전'}</span>;
}

export function Progress({ value }) {
  const v = Math.max(0, Math.min(1, value || 0));
  return <div className="progress" role="progressbar" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100}><i style={{ transform: `scaleX(${v})` }} /></div>;
}

const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  useEffect(() => { if (!msg) return undefined; const t = setTimeout(() => setMsg(''), 2600); return () => clearTimeout(t); }, [msg]);
  return <ToastCtx.Provider value={setMsg}>{children}{msg && <div className="toast" role="status">{msg}</div>}</ToastCtx.Provider>;
}
export const useToast = () => useContext(ToastCtx);

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className="empty">
      {Icon && <Icon size={32} aria-hidden="true" />}
      <span className="t-headline" style={{ color: 'var(--c-label)' }}>{title}</span>
      {children && <span className="t-subhead">{children}</span>}
    </div>
  );
}
