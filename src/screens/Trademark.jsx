// 상표: 출원서 5장을 표 하나로 보여 주고 상태만 바꾸는 화면. 상태는 store 의 "상표" 시트에 저장한다.
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import PageHead from '../components/PageHead.jsx';
import { Sheet, useToast } from '../components/ui.jsx';
import { useSheet, saveRow } from '../lib/collection.js';
import { won } from '../lib/format.js';

const STATUS = ['작성 전', '작성 완료', '승인 대기', '제출', '완료'];
const GOODS16 = { cls: '제16류', goods: '스티커, 엽서', group: 'G2202, G520102' };
const FORMS = [
  { id: 'tm-1', letter: '가', name: '마에로', sample: '상표견본_01_마에로', fee: 46000,
    lines: [{ cls: '제14류', goods: '열쇠고리(장신구 또는 장식용줄이 달린 분할 링)', group: 'G3002' }] },
  { id: 'tm-2', letter: '나', name: '마에로', sample: '상표견본_01_마에로', fee: 46000, lines: [GOODS16] },
  { id: 'tm-3', letter: '다', name: '마에로와 삐삐로', sample: '상표견본_02_마에로와삐삐로', fee: 46000, lines: [GOODS16] },
  { id: 'tm-4', letter: '라', name: '삐삐로', sample: '상표견본_03_삐삐로', fee: 46000, lines: [GOODS16] },
  { id: 'tm-5', letter: '마', name: '삐삐로', sample: '상표견본_03_삐삐로', fee: 46000,
    lines: [{ cls: '제35류', goods: '광고업', group: 'S0101' }] },
];
const SAME = [
  ['출원구분', '상표등록출원'], ['권리구분', '상표'], ['출원인', '주현호'], ['등록대상 입력방법', '고시 명칭만 입력'],
  ['상표유형', '일반상표'], ['상표의 설명', '비워 둠'], ['우선권주장', '없음'],
];
const STEPS = ['작성기에서 서면출력 PDF 만들기', '매니저 승인', '제출과 수수료 결제', '출원번호 받기'];
const TOTAL = FORMS.reduce((a, f) => a + f.fee, 0);
const CLASS_COUNT = FORMS.reduce((a, f) => a + f.lines.length, 0);
const lv = (s) => (s === '제출' || s === '완료' ? 'strong' : s === '작성 전' ? 'idle' : 'mid');

function FormName({ f, s, onPick }) {
  return (
    <div className="tm-name">
      <span className="t-headline">{f.letter}. {f.name}</span>
      <button type="button" className="tm-chip-btn" aria-haspopup="dialog" aria-label={`출원서 ${f.letter} 상태 ${s}, 바꾸기`} onClick={onPick}>
        <span className={`tm-chip ${lv(s)}`}>{s}<ChevronDown size={14} aria-hidden="true" /></span>
      </button>
      <span className="tm-file t-caption secondary">{f.sample}</span>
    </div>
  );
}

export default function Trademark() {
  const { items } = useSheet('상표');
  const toast = useToast();
  const [pick, setPick] = useState(null);
  const statusOf = (id) => items.find((r) => r.id === id)?.status || '작성 전';
  const change = async (s) => {
    const f = pick; setPick(null);
    const cur = items.find((r) => r.id === f.id) || { id: f.id, letter: f.letter, name: f.name };
    try { await saveRow('상표', { ...cur, status: s }); toast(`출원서 ${f.letter} 상태를 바꿨어요`); } catch (e) { toast(e.message); }
  };

  return (
    <div className="page tm-page">
      <PageHead title="상표" sub="상표등록출원 준비" />

      <p className="tm-top">
        <span className="t-headline num">출원서 {FORMS.length}장, {CLASS_COUNT}개 류, 수수료 합계 {won(TOTAL)}</span>
        <span className="t-subhead secondary">매니저 승인 전이라 서면출력 PDF까지만 준비해요</span>
      </p>

      <section className="tm-block" aria-labelledby="tm-forms">
        <h2 id="tm-forms" className="t-headline">출원서</h2>
        <div className="surface tm-wrap">
          <table className="tbl tm-tbl tm-forms tm-d">
            <colgroup>
              <col className="c-form" /><col className="c-cls" /><col /><col className="c-group" /><col className="c-fee" />
            </colgroup>
            <thead>
              <tr><th>출원서</th><th>류</th><th>지정상품</th><th>유사군</th><th className="r">수수료</th></tr>
            </thead>
            {FORMS.map((f, gi) => {
              const s = statusOf(f.id);
              return (
                <tbody key={f.id} className={gi % 2 ? 'alt' : ''}>
                  {f.lines.map((l, i) => (
                    <tr key={l.cls}>
                      {i === 0 && <td rowSpan={f.lines.length}><FormName f={f} s={s} onPick={() => setPick(f)} /></td>}
                      <td className="nw">{l.cls}</td>
                      <td>{l.goods}</td>
                      <td className="num">{l.group}</td>
                      {i === 0 && <td rowSpan={f.lines.length} className="r"><span className="t-headline num">{won(f.fee)}</span></td>}
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
          <table className="tbl tm-tbl tm-forms tm-m">
            <colgroup><col className="c-cls" /><col /><col className="c-group" /></colgroup>
            <thead><tr><th>류</th><th>지정상품</th><th>유사군</th></tr></thead>
            {FORMS.map((f, gi) => {
              const s = statusOf(f.id);
              return (
                <tbody key={f.id} className={gi % 2 ? 'alt' : ''}>
                  <tr className="tm-grp">
                    <td colSpan={3}>
                      <div className="tm-grp-in">
                        <FormName f={f} s={s} onPick={() => setPick(f)} />
                        <span className="t-headline num nw">{won(f.fee)}</span>
                      </div>
                    </td>
                  </tr>
                  {f.lines.map((l) => (
                    <tr key={l.cls}>
                      <td className="nw">{l.cls}</td>
                      <td>{l.goods}</td>
                      <td className="num">{l.group}</td>
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
        </div>
      </section>

      <section className="tm-block" aria-labelledby="tm-same">
        <h2 id="tm-same" className="t-headline">다섯 장 모두 같은 칸</h2>
        <div className="surface tm-wrap">
          <table className="tbl tm-tbl tm-same">
            <colgroup><col className="c-key" /><col /></colgroup>
            <thead><tr><th>칸</th><th>입력</th></tr></thead>
            <tbody>
              {SAME.map(([k, v]) => <tr key={k}><td className="secondary">{k}</td><td>{v}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="tm-block" aria-labelledby="tm-steps">
        <h2 id="tm-steps" className="t-headline">순서</h2>
        <ol className="surface tm-steps">
          {STEPS.map((t, i) => (
            <li key={t}>
              <span className="tm-no num" aria-hidden="true">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="note">수수료 결제는 승인 뒤에 해요</p>

      <Sheet open={!!pick} onClose={() => setPick(null)} title={pick ? `출원서 ${pick.letter} 상태` : ''}>
        <div className="tm-choices" role="radiogroup" aria-label="상태">
          {pick && STATUS.map((s) => {
            const on = statusOf(pick.id) === s;
            return (
              <button key={s} type="button" role="radio" aria-checked={on} className={`menu-item ${on ? 'on' : ''}`} onClick={() => change(s)}>
                {s}{on && <Check size={18} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}
