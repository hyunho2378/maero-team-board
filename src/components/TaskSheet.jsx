// 할 일 편집 시트. 마에로 HQ TaskSheet 구조에서 입력 칸을 제목, 담당, 기한, 끝남, 메모로 줄임.
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet, Field, TextInput, TextArea, Segmented, DatePicker, Button, useToast } from './ui.jsx';
import { saveRow, removeRow } from '../lib/collection.js';

export const PEOPLE = ['주현호', '허주은', '윤현아'];
export const ownersOf = (r) => (r?.owners ? String(r.owners).split(',').map((x) => x.trim()).filter(Boolean) : []);
const BLANK = { title: '', ownerList: [], due: '', done: false, memo: '' };

export default function TaskSheet({ task, open, onClose, defaults }) {
  const [d, setD] = useState(BLANK);
  const toast = useToast();
  useEffect(() => { if (open) setD({ ...BLANK, ...defaults, ...(task || {}), ownerList: task ? ownersOf(task) : (defaults?.ownerList || []) }); }, [open, task, defaults]);
  const isNew = !task?.id;
  const set = (k) => (v) => setD((x) => ({ ...x, [k]: v }));
  const save = async () => {
    if (!d.title.trim()) { toast('할 일을 적어 주세요'); return; }
    const { ownerList, ...rest } = d;
    try { await saveRow('할일', { ...rest, title: d.title.trim(), owners: ownerList.join(',') }); onClose(); } catch (e) { toast(e.message); }
  };
  const remove = async () => { try { await removeRow('할일', task.id); onClose(); } catch (e) { toast(e.message); } };
  return (
    <Sheet open={open} onClose={onClose} title={isNew ? '새 할 일' : '할 일 고치기'} actions={<Button variant="filled" size="sm" onClick={save}>저장</Button>}>
      <Field label="할 일"><TextInput value={d.title} onChange={set('title')} placeholder="예: 설문 문항 확정" autoFocus={isNew} /></Field>
      <div className="form-grid two">
        <Field label="담당 (여럿 고르기)" className="full"><Segmented multi block options={PEOPLE} value={d.ownerList} onChange={set('ownerList')} label="담당" /></Field>
        <Field label="기한"><DatePicker value={d.due} onChange={set('due')} placeholder="기한 없음" label="기한 선택" /></Field>
        <Field label="끝남"><Segmented block options={[{ value: false, label: '남은 일' }, { value: true, label: '끝남' }]} value={!!d.done} onChange={set('done')} label="끝남" /></Field>
      </div>
      <Field label="메모"><TextArea value={d.memo} onChange={set('memo')} placeholder="자세한 내용" /></Field>
      {!isNew && <div><Button variant="danger" icon={Trash2} onClick={remove}>할 일 삭제</Button></div>}
    </Sheet>
  );
}
