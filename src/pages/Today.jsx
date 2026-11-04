import { useMemo, useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon, Avatar, Badge, Card, Ring, PageHead, useKeys, Empty, Seg } from '../ui.jsx'
import { buildQueue, nextAction, money, ago, fmtDate, days } from '../logic.js'
import { stageName, sources } from '../data.js'
import { WaComposer, ownerOf, Timeline } from '../shared.jsx'

const OUT = [
  { k: 'answered', key: '1', a: 'تم الرد', e: 'Answered', sa: 'مكالمة ناجحة', se: 'Good conversation', d: 3 },
  { k: 'interested', key: '2', a: 'مهتم', e: 'Interested', sa: 'علّمه ساخن', se: 'Mark as hot', d: 2 },
  { k: 'meeting', key: '3', a: 'حجز اجتماع', e: 'Meeting booked', sa: 'ينقل لمرحلة اجتماع', se: 'Moves to Meeting', d: 5 },
  { k: 'noanswer', key: '4', a: 'لا رد', e: 'No answer', sa: 'حاول غدًا', se: 'Retry tomorrow', d: 1 },
  { k: 'notnow', key: '5', a: 'مش دلوقتي', e: 'Not now', sa: 'أجّل أسبوع', se: 'Snooze a week', d: 7 },
  { k: 'lost', key: '6', a: 'غير مهتم', e: 'Not interested', sa: 'أغلق كخسارة', se: 'Close as lost', d: 0 },
]
const NEXT = [{ d: 1, a: 'غدًا', e: 'Tomorrow' }, { d: 3, a: '3 أيام', e: '3 days' }, { d: 7, a: 'أسبوع', e: '1 week' }, { d: 14, a: 'أسبوعين', e: '2 weeks' }]

export default function Today() {
  const { leads, done, t, n, lang, A, me, say, setUi, tasks, go } = useApp()
  const [mine, setMine] = useState('all'), [sel, setSel] = useState(null), [wa, setWa] = useState(false), [next, setNext] = useState(null)
  const pending = useMemo(() => buildQueue(leads).filter(q => !done[q.lead.id] && (mine === 'all' || q.lead.owner === me.id)), [leads, done, mine, me.id])
  const doneN = leads.filter(l => done[l.id] && (mine === 'all' || l.owner === me.id)).length
  const total = pending.length + doneN
  const cur = pending.find(q => q.lead.id === sel) || pending[0]
  const idx = cur ? pending.indexOf(cur) : -1
  const go1 = d => { const q = pending[(idx + d + pending.length) % pending.length]; if (q) { setSel(q.lead.id); setWa(false); setNext(null) } }
  const log = o => {
    if (!cur) return; const id = cur.lead.id
    A.logOutcome(id, o.k, next ?? o.d); setWa(false); setNext(null); setSel(null)
    say(t(`تم تسجيل «${o.a}» لـ ${n(cur.lead.co)}`, `Logged “${o.e}” for ${n(cur.lead.co)}`), () => A.undo())
  }
  useKeys({ '1': () => log(OUT[0]), '2': () => log(OUT[1]), '3': () => log(OUT[2]), '4': () => log(OUT[3]), '5': () => log(OUT[4]), '6': () => log(OUT[5]), s: () => go1(1), j: () => go1(1), k: () => go1(-1), w: () => setWa(v => !v), z: () => A.undo(), o: () => cur && setUi({ drawer: cur.lead.id }), c: () => cur && (location.href = 'tel:' + cur.lead.phone) }, [cur, next, pending.length])
  const l = cur?.lead, o = l && ownerOf(l.owner), na = l && nextAction(l)
  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const meetings = leads.filter(x => x.stage === 'meeting' && x.next && days(x.next, Date.now()) <= 0 && x.next - Date.now() < 86400000)
  const overdueTasks = tasks.filter(x => !x.done && x.due < Date.now() - 86400000).length
  const nextTpl = (<div className="chips" aria-label="next step">{NEXT.map(x => <button key={x.d} className={'chip' + (next === x.d ? ' on' : '')} onClick={() => setNext(next === x.d ? null : x.d)}>{t(x.a, x.e)}</button>)}</div>)
  return <div>
    <PageHead title={t(`صباح الخير يا ${n(me)}`, `Good morning, ${n(me)}`)} sub={`${today} · ${t(`قدامك ${pending.length} عميل محتاجين تواصل النهارده`, `${pending.length} leads need a touch today`)}`}>
      <Seg value={mine} onChange={setMine} options={[{ v: 'all', l: t('الفريق كله', 'Whole team') }, { v: 'me', l: t('عملائي', 'Mine') }]} />
      <div className="row" style={{ gap: 14 }}><Ring pct={total ? 100 * doneN / total : 0} size={58}>{doneN}/{total}</Ring></div>
    </PageHead>
    <div className="grid g4" style={{ marginBottom: 18 }}>
      {[[t('اتعمل', 'Done'), doneN, 'ok'], [t('فاضل', 'Remaining'), pending.length, ''], [t('اجتماعات اليوم', 'Meetings today'), meetings.length, ''], [t('مهام متأخرة', 'Overdue tasks'), overdueTasks, overdueTasks ? 'bad' : '']].map(([k, v, c]) => <Card key={k} cls="kpi"><small>{k}</small><b className={c === 'bad' ? 'down' : c === 'ok' ? 'up' : ''}>{v}</b></Card>)}
    </div>
    {!cur ? <Card><Empty icon="check" title={t('خلصت طابور اليوم!', 'Queue cleared!')} hint={t('كل العملاء اتواصلت معاهم. تقدر تضيف عميل جديد أو تراجع التحليلات.', 'Every lead has been contacted. Add a new lead or review analytics.')} /><div className="row" style={{ justifyContent: 'center', paddingBottom: 18 }}><button className="btn pri" onClick={() => go('insights')}>{t('افتح التحليلات', 'Open analytics')}</button></div></Card> :
      <div className="q-layout">
        <div className="col" style={{ gap: 16 }}>
          <Card cls="q-card" aria-label="current lead">
            <div className="q-top">
              <div><div className="q-num">{t(`رقم ${idx + 1} من ${pending.length}`, `${idx + 1} of ${pending.length}`)} · {t('أولوية', 'Priority')} <b>{cur.score}</b></div>
                <h2 className="q-name">{n(l.co)}</h2>
                <div className="muted">{n(l.contact)} · {n(sources[l.source])}</div>
                <div className="q-meta"><Badge tone="acc">{n(stageName[l.stage])}</Badge><Badge tone="ok">{money(l.value, lang)}</Badge>{l.hot && <Badge tone="bad"><Icon n="flame" s={12} />{t('مهتم جدًا', 'Hot')}</Badge>}<Badge>{t('آخر تواصل', 'Last touch')}: {ago(l.last, lang)}</Badge>{l.next && <Badge><Icon n="cal" s={12} />{fmtDate(l.next, lang)}</Badge>}</div></div>
              <Avatar name={n(l.co)} color={o.color} size={52} />
            </div>
            <div className="q-body">
              <div className="nba"><small>{t('الخطوة الأنسب', 'Best next step')}</small><b>{n(na)}</b></div>
              <ul className="q-why">{cur.reasons.slice(0, 4).map((r, i) => <li key={i}><span>{n(r)}</span><b className="up">+{r.pts}</b></li>)}</ul>
              <div className="call-row">
                <a className="btn pri lg" href={'tel:' + l.phone}><Icon n="phone" />{t('اتصل', 'Call')} <span dir="ltr">{l.phone}</span> <kbd>C</kbd></a>
                <button className="btn lg" onClick={() => setWa(v => !v)} aria-pressed={wa}><Icon n="wa" />{t('واتساب', 'WhatsApp')} <kbd>W</kbd></button>
                <button className="btn lg ghost" onClick={() => setUi({ drawer: l.id })}><Icon n="user" />{t('الملف', 'Profile')} <kbd>O</kbd></button>
              </div>
              {wa && <WaComposer key={l.id} lead={l} kind={l.stage === 'proposal' ? 'followup' : l.stage === 'meeting' ? 'meeting' : l.stage === 'new' ? 'intro' : 'followup'} />}
              <h3 style={{ margin: '18px 0 10px', fontSize: 14 }}>{t('سجّل النتيجة', 'Log the outcome')}</h3>
              <div className="outcomes">{OUT.map(x => <button key={x.k} className="outcome" onClick={() => log(x)}><kbd>{x.key}</kbd>{t(x.a, x.e)}<small>{t(x.sa, x.se)}</small></button>)}</div>
              <div className="row wrap" style={{ marginTop: 14 }}><span className="muted" style={{ fontWeight: 600 }}>{t('المتابعة الجاية', 'Next follow-up')}:</span>{nextTpl}<span className="dim" style={{ fontSize: 12 }}>{next ? '' : t('(تلقائي حسب النتيجة)', '(automatic by outcome)')}</span></div>
              <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}><button className="btn sm" onClick={() => go1(-1)}><Icon n="chev" s={14} cls="flip" />{t('السابق', 'Previous')} <kbd>K</kbd></button><button className="btn sm" onClick={() => A.undo()}><Icon n="undo" s={14} />{t('تراجع', 'Undo')} <kbd>Z</kbd></button><button className="btn sm" onClick={() => go1(1)}>{t('تخطّى', 'Skip')} <kbd>S</kbd><Icon n="skip" s={14} cls="flip" /></button></div>
            </div>
          </Card>
          <Card title={t('آخر الأنشطة مع هذا العميل', 'Recent activity with this lead')}><Timeline refId={l.id} limit={4} /></Card>
        </div>
        <div className="col" style={{ gap: 16 }}>
          <Card title={t('أهم الخطوات الجاية', 'Top next actions')}>
            {pending.slice(0, 4).map(q => { const a = nextAction(q.lead); return <button key={q.lead.id} className="q-item" onClick={() => { setSel(q.lead.id); setWa(false) }}><span className="tl-dot call"><Icon n={a.key === 'whatsapp' ? 'wa' : a.key === 'meeting' ? 'cal' : 'phone'} s={15} /></span><span className="grow"><b>{n(a)}</b><div className="dim" style={{ fontSize: 12.5 }}>{n(q.lead.co)} · {n(q.reasons[0] || { a: '', e: '' })}</div></span></button> })}
          </Card>
          <Card title={<>{t('باقي الطابور', 'Rest of the queue')} <span className="dim">{pending.length}</span></>}>
            <div className="q-list">{pending.map((q, i) => <button key={q.lead.id} className={'q-item' + (q.lead.id === l.id ? ' on' : '')} onClick={() => { setSel(q.lead.id); setWa(false); setNext(null) }}><span className="sc">{q.score}</span><span className="grow"><b>{n(q.lead.co)}</b><div className="dim" style={{ fontSize: 12.5 }}>{n(q.reasons[0] || { a: '', e: '' })}</div></span><Badge>{n(stageName[q.lead.stage])}</Badge></button>)}</div>
          </Card>
        </div>
      </div>}
  </div>
}
