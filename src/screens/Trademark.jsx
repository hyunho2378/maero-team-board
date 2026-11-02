// 상표: 출원서 3장을 한 화면에 나란히 두고 상태만 바꾸는 화면. 상태는 store 의 "상표" 시트에 저장한다.
import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, FileImage } from 'lucide-react';
import PageHead from '../components/PageHead.jsx';
import { Sheet, useToast } from '../components/ui.jsx';
import { useSheet, saveRow } from '../lib/collection.js';
import { won } from '../lib/format.js';

const STATUS = ['작성 전', '작성 완료', '승인 대기', '제출', '완료'];
const KG = { cls: '제16류', goods: '스티커, 엽서', group: 'G2202 및 G520102' };
const FORMS = [
  { id: 'tm-ga', letter: '가', name: '마에로', sample: '상표견본_01_마에로', fee: 92000,
    lines: [{ cls: '제14류', goods: '열쇠고리(장신구 또는 장식용줄이 달린 분할 링)', group: 'G3002' }, KG] },
  { id: 'tm-na', letter: '나', name: '마에로와 삐삐로', sample: '상표견본_02_마에로와삐삐로', fee: 46000, lines: [KG] },
  { id: 'tm-da', letter: '다', name: '삐삐로', sample: '상표견본_03_삐삐로', fee: 92000,
    lines: [KG, { cls: '제35류', goods: '광고업', group: 'S0101' }] },
];
const SAME = [
  ['출원구분', '상표등록출원'], ['권리구분', '상표'], ['출원인', '주현호'], ['등록대상 입력방법', '고시 명칭만 입력'],
  ['상표유형', '일반상표'], ['상표의 설명', '비워 둠'], ['우선권주장', '없음'],
];
const STEPS = ['작성기에서 서면출력 PDF 만들기', '매니저 승인', '제출과 수수료 결제', '출원번호 받기'];
const TOTAL = FORMS.reduce((a, f) => a + f.fee, 0);
const CLASS_COUNT = FORMS.reduce((a, f) => a + f.lines.length, 0);
const lv = (s) => (s === '제출' || s === '완료' ? 'strong' : s === '작성 전' ? 'idle' : 'mid');

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
  const done = FORMS.filter((f) => statusOf(f.id) === '완료').length;

  return (
    <div className="page tm-page">
      <PageHead title="상표" sub="상표등록출원 준비" />

      <section className="tm-summary" aria-label="요약">
        <div><span className="t-caption secondary">출원서</span><span className="t-headline num">3장</span></div>
        <div><span className="t-caption secondary">류</span><span className="t-headline num">{CLASS_COUNT}개 류</span></div>
        <div><span className="t-caption secondary">수수료 합계</span><span className="t-headline num">{won(TOTAL)}</span></div>
        <div className="grow"><span className="t-caption secondary">현재 단계{done ? `  완료 ${done}장` : ''}</span><span className="t-subhead w-semibold">매니저 승인 전이라 서면출력 PDF까지만 준비해요</span></div>
      </section>

      <div className="tm-cards">
        {FORMS.map((f) => {
          const s = statusOf(f.id);
          return (
            <article key={f.id} className="tm-card" aria-label={`출원서 ${f.letter}`}>
              <div className="tm-card-head">
                <div style={{ minWidth: 0 }}>
                  <span className="t-footnote secondary w-semibold">출원서 {f.letter}</span>
                  <h2 className="t-title2">{f.name}</h2>
                </div>
                <button type="button" className={`tm-status ${lv(s)}`} aria-haspopup="dialog" aria-label={`출원서 ${f.letter} 상태 ${s}, 바꾸기`} onClick={() => setPick(f)}>
                  {s}<ChevronDown size={16} aria-hidden="true" />
                </button>
              </div>
              <p className="tm-file t-footnote"><FileImage size={16} aria-hidden="true" />{f.sample}</p>
              <ul className="tm-lines">
                {f.lines.map((l) => (
                  <li key={l.cls}>
                    <span className="tm-cls t-footnote w-semibold">{l.cls}</span>
                    <div style={{ minWidth: 0 }}>
                      <p className="t-subhead w-medium">{l.goods}</p>
                      <p className="t-caption secondary num">유사군 {l.group}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="tm-fee">
                <span className="t-footnote secondary">{f.lines.length}개 류 수수료</span>
                <span className="t-title3 num">{won(f.fee)}</span>
              </div>
            </article>
          );
        })}
      </div>
      <p className="note">수수료 결제는 승인 뒤에 해요</p>

      <section className="tm-block" aria-labelledby="tm-same">
        <h2 id="tm-same" className="t-headline">세 장 모두 같은 입력 칸</h2>
        <dl className="tm-same">
          {SAME.map(([k, v]) => <div key={k}><dt className="t-caption secondary">{k}</dt><dd className="t-subhead w-semibold">{v}</dd></div>)}
        </dl>
      </section>

      <section className="tm-block" aria-labelledby="tm-steps">
        <h2 id="tm-steps" className="t-headline">순서</h2>
        <ol className="tm-steps">
          {STEPS.map((t, i) => (
            <li key={t}>
              <span className="tm-no num" aria-hidden="true">{i + 1}</span>
              <span className="t-subhead w-medium">{t}</span>
              {i < STEPS.length - 1 && <ChevronRight size={16} className="tm-arrow" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </section>

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
