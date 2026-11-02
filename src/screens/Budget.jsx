// 돈 쓴 것: 마에로 HQ 예산 화면(PageHead, 요약 칸, 표와 목록 셀, 예산 시트)을 지출 입력 칸만 남겨 줄인 화면.
import { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import PageHead from '../components/PageHead.jsx';
import { Button, DataTable, BudgetStatus, Progress, Segmented, Sheet, Field, TextInput, TextArea, MoneyInput, DatePicker, useToast } from '../components/ui.jsx';
import { useSheet, saveRow, removeRow } from '../lib/collection.js';
import { won, manwon, fmtDate, todayStr } from '../lib/format.js';

const LIMIT = 2000000;
const PLAN_TOTAL = 1979300;
const STATUS = ['승인 전', '승인', '결제 완료'];
const ORDER = { '결제 완료': 0, 승인: 1, '승인 전': 2 };
const isLink = (s) => /^https?:\/\//.test(String(s || '').trim());

function SpendSheet({ item, open, onClose }) {
  const [d, setD] = useState({});
  const toast = useToast();
  useEffect(() => { if (open) setD(item || { date: todayStr(), shop: '', amount: 0, item: '', status: '승인 전', receipt: '', memo: '' }); }, [open, item]);
  const set = (k) => (v) => setD((x) => ({ ...x, [k]: v }));
  const isNew = !item?.id;
  const save = async () => {
    if (!String(d.item || '').trim()) { toast('무엇을 샀는지 적어 주세요'); return; }
    try { await saveRow('지출', { ...d, item: d.item.trim(), amount: Number(d.amount) || 0 }); onClose(); } catch (e) { toast(e.message); }
  };
  const del = async () => { try { await removeRow('지출', item.id); onClose(); } catch (e) { toast(e.message); } };
  return (
    <Sheet open={open} onClose={onClose} title={isNew ? '새 지출' : '지출 고치기'} actions={<Button variant="filled" size="sm" onClick={save}>저장</Button>}>
      <Field label="무엇을"><TextInput value={d.item} onChange={set('item')} placeholder="예: 원형 키링 60개" autoFocus={isNew} /></Field>
      <div className="form-grid two">
        <Field label="가게"><TextInput value={d.shop} onChange={set('shop')} placeholder="예: 레드프린팅" /></Field>
        <Field label="금액"><MoneyInput value={d.amount} onChange={set('amount')} aria-label="금액" /></Field>
        <Field label="날짜"><DatePicker value={d.date} onChange={set('date')} placeholder="날짜 미정" label="날짜 선택" /></Field>
        <Field label="상태"><Segmented block options={STATUS} value={d.status} onChange={set('status')} label="상태" /></Field>
        <Field label="영수증 사진 링크" className="full">
          <div className="inline-add">
            <TextInput value={d.receipt} onChange={set('receipt')} placeholder="https://" inputMode="url" />
            {isLink(d.receipt) && <a className="btn btn-gray" href={String(d.receipt).trim()} target="_blank" rel="noreferrer noopener">열기</a>}
          </div>
          <span className="note">사진을 드라이브에 올리고 링크를 붙여 넣어요</span>
        </Field>
      </div>
      <Field label="메모"><TextArea value={d.memo} onChange={set('memo')} placeholder="승인 상황, 참고할 점" /></Field>
      {!isNew && <div><Button variant="danger" icon={Trash2} onClick={del}>지출 삭제</Button></div>}
    </Sheet>
  );
}

export default function Budget() {
  const { items } = useSheet('지출');
  const [sheet, setSheet] = useState({ open: false, item: null });
  const spent = items.filter((r) => r.status === '결제 완료').reduce((a, r) => a + (Number(r.amount) || 0), 0);
  const left = LIMIT - spent;
  const list = [...items].sort((a, b) => (ORDER[a.status] ?? 3) - (ORDER[b.status] ?? 3) || (b.date || '').localeCompare(a.date || ''));
  const receipt = (b) => (isLink(b.receipt)
    ? <a className="btn btn-plain btn-sm" href={b.receipt.trim()} target="_blank" rel="noreferrer noopener" onClick={(e) => e.stopPropagation()}><ExternalLink size={14} aria-hidden="true" />영수증</a>
    : <span className="tertiary">없음</span>);
  const columns = [
    { key: 'date', label: '날짜', render: (b) => <span className="nowrap">{b.date ? fmtDate(b.date) : <span className="tertiary">날짜 미정</span>}</span>, width: 112 },
    { key: 'item', label: '무엇을', render: (b) => <span className="w-semibold">{b.item}</span> },
    { key: 'shop', label: '가게', render: (b) => <span className="secondary nowrap">{b.shop}</span> },
    { key: 'amount', label: '금액', align: 'right', render: (b) => won(b.amount) },
    { key: 'status', label: '상태', render: (b) => <BudgetStatus status={b.status} /> },
    { key: 'receipt', label: '영수증', render: receipt, width: 112 },
  ];
  const mobile = (b) => ({ title: b.item, meta: <><span>{b.date ? fmtDate(b.date) : '날짜 미정'}</span>{b.shop ? <span>{b.shop}</span> : null}<BudgetStatus status={b.status} /></>, end: <div className="num" style={{ color: 'var(--c-label)' }}>{won(b.amount)}</div> });
  return (
    <div className="page">
      <PageHead title="돈 쓴 것" sub="활동자금 200만 원 기준">
        <Button variant="filled" size="sm" icon={Plus} onClick={() => setSheet({ open: true, item: null })}>지출</Button>
      </PageHead>
      <div className="stats" aria-label="쓴 돈과 남은 돈">
        <div className="stat"><span className="t-footnote secondary">쓴 돈 (결제 완료)</span><span className="v">{won(spent)}</span><Progress value={spent / LIMIT} /></div>
        <div className="stat"><span className="t-footnote secondary">남은 돈</span><span className={`v ${left < 0 ? 'danger' : ''}`}>{won(left)}</span><span className="t-caption secondary">{manwon(LIMIT)} 중</span></div>
      </div>
      <section className="section">
        <div className="surface">
          <DataTable columns={columns} rows={list} mobile={mobile} onRowClick={(b) => setSheet({ open: true, item: b })} empty="아직 없어요" />
        </div>
        <p className="note">사용계획서 합계 {won(PLAN_TOTAL)}, 총 한도 {won(LIMIT)} 기준</p>
      </section>
      <SpendSheet open={sheet.open} item={sheet.item} onClose={() => setSheet({ open: false, item: null })} />
    </div>
  );
}
