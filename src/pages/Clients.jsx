import { useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon, Avatar, Badge, Card, PageHead, Ring, healthColor, HBar, Empty, Seg } from '../ui.jsx'
import { onboardingSteps, DAY } from '../data.js'
import { money, short, fmtDate, clientStats, relationship, billState, days } from '../logic.js'
import { Timeline, WaComposer, ownerOf, AddBillModal } from '../shared.jsx'

export function BillStepper({ stage }) {
  const { t } = useApp(); const S = [['quote', t('عرض', 'Quote')], ['contract', t('عقد', 'Contract')], ['invoice', t('فاتورة', 'Invoice')], ['paid', t('مدفوعة', 'Paid')]]
  const ci = S.findIndex(s => s[0] === stage)
  return <div className="stepper">{S.map(([k, l], i) => <div key={k} className={'stp' + (i < ci || stage === 'paid' ? ' done' : i === ci ? ' cur' : '')}><i>{i < ci || stage === 'paid' ? <Icon n="check" s={12} /> : i + 1}</i>{l}</div>)}</div>
}

export function ClientsList() {
  const s = useApp(); const { clients, t, n, lang, go, events } = s
  const [filter, setFilter] = useState('all'); const st = clientStats(s)
  const rows = clients.filter(c => filter === 'all' || (filter === 'risk' && c.health < 55) || (filter === 'renew' && c.renewal - Date.now() < 60 * DAY) || (filter === 'upsell' && c.upsell))
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() + i, 1); return { y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { month: 'short' }), items: [] } })
  clients.forEach(c => { const d = new Date(c.renewal), b = months.find(x => x.y === d.getFullYear() && x.m === d.getMonth()); if (b) b.items.push(c) })
  return <div>
    <PageHead title={t('العملاء', 'Clients')} sub={t('محفظة العملاء: الإيراد المتكرر، الصحة والتجديدات', 'Client portfolio: recurring revenue, health and renewals')}>
      <Seg value={filter} onChange={setFilter} options={[{ v: 'all', l: t('الكل', 'All') }, { v: 'risk', l: t('معرّض للانسحاب', 'At risk') }, { v: 'renew', l: t('تجديد قريب', 'Renewing') }, { v: 'upsell', l: t('فرص بيع إضافي', 'Upsell') }]} />
    </PageHead>
    <div className="grid g4" style={{ marginBottom: 16 }}>
      <Card cls="kpi"><small>MRR</small><b>{money(st.mrr, lang)}</b><span className="sub">{t(`${clients.length} عميل نشط`, `${clients.length} active clients`)}</span></Card>
      <Card cls="kpi"><small>{t('إيراد معرّض للانسحاب', 'MRR at risk')}</small><b className="down">{money(st.riskMrr, lang)}</b><span className="sub">{t(`${st.risk.length} عملاء بصحة منخفضة`, `${st.risk.length} low-health clients`)}</span></Card>
      <Card cls="kpi"><small>{t('تجديدات خلال 60 يوم', 'Renewals in 60 days')}</small><b>{st.renew.length}</b><span className="sub">{money(st.renew.reduce((a, c) => a + c.mrr * 12, 0), lang)} {t('سنويًا', 'ARR')}</span></Card>
      <Card cls="kpi"><small>{t('فرص بيع إضافي', 'Upsell opportunities')}</small><b className="up">{st.upsell.length}</b><span className="sub">{t('عملاء بصحة عالية واستخدام مرتفع', 'High health, high usage')}</span></Card>
    </div>
    <Card title={t('المحفظة', 'Portfolio')}>
      <div className="scroll-x"><table className="tbl"><thead><tr><th>{t('العميل', 'Client')}</th><th>{t('الباقة', 'Plan')}</th><th>MRR</th><th>{t('الصحة', 'Health')}</th><th className="hide-m">{t('العلاقة', 'Relationship')}</th><th>{t('التجديد', 'Renewal')}</th><th className="hide-m">{t('المسؤول', 'Owner')}</th></tr></thead>
        <tbody>{rows.map(c => { const r = relationship(c, events), o = ownerOf(c.owner); return <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => go('client/' + c.id)}>
          <td><button className="link">{n(c.co)}</button> {c.upsell && <Badge tone="ok">{t('بيع إضافي', 'Upsell')}</Badge>}</td><td>{c.plan}</td><td className="num">{money(c.mrr, lang)}</td>
          <td><span className="row" style={{ gap: 8 }}><span style={{ width: 70 }}><HBar pct={c.health} color={healthColor(c.health)} /></span><b>{c.health}</b></span></td>
          <td className="hide-m"><Badge tone={r.score > 70 ? 'ok' : r.score > 45 ? 'warn' : 'bad'}>{r.score}</Badge></td>
          <td>{fmtDate(c.renewal, lang, { day: 'numeric', month: 'short', year: '2-digit' })}</td><td className="hide-m"><Avatar name={n(o)} color={o.color} size={24} /></td></tr> })}</tbody></table></div>
      {!rows.length && <Empty title={t('لا عملاء', 'No clients')} />}
    </Card>
    <Card title={t('تقويم التجديدات', 'Renewal calendar')} cls="" style={{ marginTop: 16 }}>
      <div className="cal">{months.map(m => <div key={m.label + m.m}><b>{m.label}</b>{m.items.map(c => <div key={c.id} className="it">{n(c.co)}</div>)}{!m.items.length && <span className="dim">—</span>}</div>)}</div>
    </Card>
  </div>
}

function QuickLog({ client }) {
  const { t, A, say } = useApp(); const [type, setType] = useState(null), [txt, setTxt] = useState('')
  const T = [['call', 'phone', t('مكالمة', 'Call')], ['whatsapp', 'wa', t('واتساب', 'WhatsApp')], ['meeting', 'cal', t('اجتماع', 'Meeting')], ['note', 'note', t('ملاحظة', 'Note')]]
  return <div>
    <div className="row wrap">{T.map(([k, ic, l]) => <button key={k} className={'btn sm' + (type === k ? ' pri' : '')} onClick={() => setType(type === k ? null : k)}><Icon n={ic} s={14} />{l}</button>)}</div>
    {type && <form className="row" style={{ marginTop: 10 }} onSubmit={e => { e.preventDefault(); A.log(client.id, type, txt.trim() || { call: t('تم تسجيل مكالمة', 'Call logged'), whatsapp: t('تم تسجيل رسالة واتساب', 'WhatsApp logged'), meeting: t('تم تسجيل اجتماع', 'Meeting logged'), note: '' }[type] || '.'); setTxt(''); setType(null); say(t('تم التسجيل', 'Logged')) }}>
      <input className="inp" autoFocus value={txt} onChange={e => setTxt(e.target.value)} placeholder={type === 'note' ? t('اكتب ملاحظة… @ للإشارة لزميل', 'Write a note… @ to mention a teammate') : t('تفاصيل اختيارية', 'Optional details')} /><button className="btn pri">{t('حفظ', 'Save')}</button></form>}
  </div>
}

export function Client360({ id }) {
  const s = useApp(); const { clients, bills, events, t, n, lang, A, go, say } = s
  const c = clients.find(x => x.id === id); const [wa, setWa] = useState(false), [newBill, setNewBill] = useState(false)
  if (!c) return <Empty title={t('العميل غير موجود', 'Client not found')} />
  const r = relationship(c, events), o = ownerOf(c.owner), my = bills.filter(b => b.client === c.id)
  const obDone = c.onboarding.filter(Boolean).length, renewIn = Math.round((c.renewal - Date.now()) / DAY)
  const ltv = my.filter(b => b.stage === 'paid').reduce((a, b) => a + b.amount, 0)
  return <div>
    <button className="link" style={{ marginBottom: 10 }} onClick={() => go('clients')}><Icon n="chev" s={14} cls="flip" style={{ transform: 'rotate(180deg)' }} /> {t('العملاء', 'Clients')}</button>
    <PageHead title={n(c.co)} sub={<span className="row wrap"><Badge tone="acc">{c.plan}</Badge><span>{t('عميل منذ', 'Client since')} {fmtDate(c.since, lang, { month: 'short', year: 'numeric' })}</span><span>·</span><span className="row" style={{ gap: 6 }}><Avatar name={n(o)} color={o.color} size={22} />{n(o)}</span></span>}>
      <button className="btn" onClick={() => setWa(v => !v)}><Icon n="wa" s={15} />{t('واتساب', 'WhatsApp')}</button>
      <button className="btn pri" onClick={() => setNewBill(true)}><Icon n="plus" s={15} />{t('عرض سعر', 'New quote')}</button>
    </PageHead>
    <div className="grid g4" style={{ marginBottom: 16 }}>
      <Card cls="kpi"><div className="row between"><div><small>{t('صحة العميل', 'Health')}</small><b style={{ color: healthColor(c.health) }}>{c.health}</b><span className="sub">NPS {c.nps}</span></div><Ring pct={c.health} size={54} color={healthColor(c.health)} /></div></Card>
      <Card cls="kpi"><small>MRR</small><b>{money(c.mrr, lang)}</b><span className="sub">{t('قيمة العمر', 'Lifetime')}: {money(ltv + c.mrr, lang)}</span></Card>
      <Card cls="kpi"><small>{t('قوة العلاقة', 'Relationship strength')}</small><b>{r.score}<small style={{ display: 'inline', fontSize: 14 }}>/100</small></b><span className="sub">{t(`${r.recent} تفاعل آخر 30 يوم`, `${r.recent} touches in 30 days`)}</span></Card>
      <Card cls="kpi"><small>{t('التجديد', 'Renewal')}</small><b className={renewIn < 45 ? 'down' : ''}>{renewIn} {t('يوم', 'd')}</b><span className="sub">{fmtDate(c.renewal, lang, { day: 'numeric', month: 'long', year: 'numeric' })}</span></Card>
    </div>
    {wa && <Card style={{ marginBottom: 16 }}><WaComposer client={c} kind="followup" /></Card>}
    <div className="grid g-main">
      <div className="col" style={{ gap: 16 }}>
        <Card title={t('السجل الموحد', 'Unified timeline')} action={<span className="dim">{events.filter(e => e.ref === c.id).length} {t('نشاط', 'events')}</span>}><QuickLog client={c} /><div style={{ marginTop: 10 }}><Timeline refId={c.id} /></div></Card>
        <Card title={t('خريطة جهات الاتصال', 'Contact map')}><div className="contact-map">{c.contacts.map((p, i) => <div className="cm" key={i}><Avatar name={n(p)} size={34} color={['#4F46E5', '#0E9F6E', '#D97706'][i % 3]} /><b>{n(p)}</b><span className="dim" style={{ fontSize: 12 }}>{p.role}</span><div className="infl" title={t('مستوى التأثير', 'Influence')}>{[1, 2, 3].map(k => <i key={k} className={k <= p.infl ? 'on' : ''} />)}</div><span dir="ltr" className="dim" style={{ fontSize: 12 }}>{p.ph}</span></div>)}</div>
          {c.contacts.length < 3 && <p className="muted" style={{ marginTop: 10 }}><Icon n="warn" s={14} /> {t('علاقتك بجهة اتصال واحدة أو اثنتين فقط. أضف صانع قرار آخر لتقليل المخاطرة.', 'Few contacts mapped. Add another decision-maker to reduce risk.')}</p>}</Card>
        <Card title={t('الفوترة: عرض ← عقد ← فاتورة ← دفع', 'Billing: quote → contract → invoice → paid')}>
          {my.map(b => { const bs = billState(b); return <div key={b.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div className="row between wrap"><b>{n(b.title)}</b><span className="row"><span className="num">{money(b.amount, lang)}</span>{bs === 'overdue' && <Badge tone="bad">{t(`متأخرة ${days(b.due)} يوم`, `${days(b.due)}d overdue`)}</Badge>}{bs === 'paid' && <Badge tone="ok">{t('مدفوعة', 'Paid')}</Badge>}</span></div>
            <BillStepper stage={b.stage} />
            <div className="row wrap">{b.stage !== 'paid' && <button className="btn sm pri" onClick={() => { A.advanceBill(b.id); say(t('تم تحديث الحالة', 'Status updated')) }}>{{ quote: t('تم توقيع العقد', 'Mark contract signed'), contract: t('إصدار الفاتورة', 'Issue invoice'), invoice: t('تسجيل الدفع', 'Record payment') }[b.stage]}</button>}
              {b.stage === 'invoice' && <button className="btn sm" onClick={() => { A.remind(b.id); say(t('أُرسل التذكير', 'Reminder sent')) }}><Icon n="wa" s={14} />{t('تذكير', 'Remind')} {b.reminders > 0 && `(${b.reminders})`}</button>}</div></div> })}
          {!my.length && <p className="dim">{t('لا عروض أو فواتير بعد', 'No quotes or invoices yet')}</p>}</Card>
      </div>
      <div className="col" style={{ gap: 16 }}>
        {c.upsell && <Card><div className="row"><span className="tl-dot payment"><Icon n="sparkle" s={16} /></span><div className="grow"><b>{t('فرصة بيع إضافي', 'Upsell opportunity')}</b><p className="muted">{t('صحة عالية واستخدام مرتفع: اعرض باقة أعلى أو خدمة إضافية.', 'High health and usage: offer a higher plan or add-on.')}</p></div></div><button className="btn sm" style={{ marginTop: 10 }} onClick={() => setNewBill(true)}>{t('أنشئ عرضًا', 'Create offer')}</button></Card>}
        {c.health < 55 && <Card><div className="row"><span className="tl-dot note"><Icon n="warn" s={16} /></span><div className="grow"><b>{t('خطر انسحاب', 'Churn risk')}</b><p className="muted">{t('صحة منخفضة: رتّب مكالمة مراجعة مع العميل هذا الأسبوع.', 'Low health: schedule a review call this week.')}</p></div></div><button className="btn sm" style={{ marginTop: 10 }} onClick={() => { A.addTask(t('مكالمة إنقاذ: ', 'Rescue call: ') + n(c.co), c.id, 1); say(t('أُنشئت مهمة', 'Task created')) }}>{t('أنشئ مهمة', 'Create task')}</button></Card>}
        <Card title={t('قائمة الانطلاق', 'Onboarding')} action={<Badge tone={obDone === 5 ? 'ok' : 'acc'}>{obDone}/5</Badge>}>
          <HBar pct={obDone * 20} color="var(--ok)" />
          <div style={{ marginTop: 8 }}>{onboardingSteps.map((st, i) => <button key={i} className={'check' + (c.onboarding[i] ? ' on' : '')} onClick={() => A.toggleOnboard(c.id, i)}><span className="bx">{c.onboarding[i] && <Icon n="check" s={12} />}</span><span className="t">{n(st)}</span></button>)}</div></Card>
        <Card title={t('المشاريع والتسليمات', 'Projects & deliverables')}>{c.projects.map((p, i) => <div key={i} style={{ marginBottom: 12 }}><div className="row between"><b>{n(p)}</b><span className="dim">{p.pct}% · {fmtDate(p.due, lang)}</span></div><HBar pct={p.pct} color={p.pct === 100 ? 'var(--ok)' : 'var(--accent)'} /></div>)}</Card>
      </div>
    </div>
    {newBill && <AddBillModal clientId={c.id} onClose={() => setNewBill(false)} />}
  </div>
}
