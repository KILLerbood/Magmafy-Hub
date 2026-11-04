import { useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon, Badge, Card, PageHead, Modal, HBar, Empty } from '../ui.jsx'
import { money, fmtDate, billState, days, fillTpl } from '../logic.js'
import { AddBillModal } from '../shared.jsx'

export default function Billing() {
  const { bills, clients, t, n, lang, A, go, say, templates, me } = useApp()
  const [add, setAdd] = useState(false), [rem, setRem] = useState(null)
  const cl = id => clients.find(c => c.id === id)
  const by = s => bills.filter(b => b.stage === s)
  const inv = bills.filter(b => b.stage === 'invoice'), over = inv.filter(b => billState(b) === 'overdue')
  const sum = a => a.reduce((x, b) => x + b.amount, 0)
  const aging = [[t('غير مستحقة', 'Current'), inv.filter(b => billState(b) !== 'overdue'), 'var(--ok)'], [t('1-30 يوم', '1-30 days'), over.filter(b => days(b.due) <= 30), 'var(--warn)'], [t('+30 يوم', '30+ days'), over.filter(b => days(b.due) > 30), 'var(--bad)']]
  const cols = [['quote', t('عروض الأسعار', 'Quotes')], ['contract', t('عقود', 'Contracts')], ['invoice', t('فواتير', 'Invoices')], ['paid', t('مدفوعة', 'Paid')]]
  const next = { quote: t('عقد موقّع', 'Contract signed'), contract: t('إصدار فاتورة', 'Issue invoice'), invoice: t('تسجيل دفع', 'Record payment') }
  const bulk = () => { over.forEach(b => A.remind(b.id)); say(t(`أُرسل ${over.length} تذكير`, `${over.length} reminders sent`)) }
  return <div>
    <PageHead title={t('الفواتير', 'Billing')} sub={t('من عرض السعر إلى الدفع، في مكان واحد', 'From quote to payment, in one place')}>
      <button className="btn" disabled={!over.length} onClick={bulk}><Icon n="wa" s={15} />{t('ذكّر كل المتأخرين', 'Remind all overdue')}</button>
      <button className="btn pri" onClick={() => setAdd(true)}><Icon n="plus" s={15} />{t('عرض سعر جديد', 'New quote')}</button></PageHead>
    <div className="grid g4" style={{ marginBottom: 16 }}>
      <Card cls="kpi"><small>{t('مستحق التحصيل', 'Outstanding')}</small><b>{money(sum(inv), lang)}</b><span className="sub">{inv.length} {t('فاتورة', 'invoices')}</span></Card>
      <Card cls="kpi"><small>{t('متأخر', 'Overdue')}</small><b className="down">{money(sum(over), lang)}</b><span className="sub">{over.length} {t('فاتورة', 'invoices')}</span></Card>
      <Card cls="kpi"><small>{t('محصّل', 'Collected')}</small><b className="up">{money(sum(by('paid')), lang)}</b><span className="sub">{by('paid').length} {t('فاتورة', 'invoices')}</span></Card>
      <Card cls="kpi"><small>{t('في الخط (عروض + عقود)', 'In pipeline (quotes + contracts)')}</small><b>{money(sum(by('quote')) + sum(by('contract')), lang)}</b><span className="sub">{by('quote').length + by('contract').length} {t('مستند', 'documents')}</span></Card>
    </div>
    <Card title={t('أعمار الديون', 'Receivables ageing')} style={{ marginBottom: 16 }}><div className="grid g3">{aging.map(([l, a, c]) => <div key={l}><div className="row between"><b>{l}</b><span className="num">{money(sum(a), lang)}</span></div><HBar pct={sum(inv) ? 100 * sum(a) / sum(inv) : 0} color={c} h={10} /></div>)}</div></Card>
    <div className="kanban" style={{ gridAutoColumns: 'minmax(260px,1fr)' }}>{cols.map(([s, label]) => <div className="kcol" key={s}><h4>{label}<small>{by(s).length} · {money(sum(by(s)), lang)}</small></h4>
      {by(s).map(b => { const c = cl(b.client), bs = billState(b); return <div key={b.id} className="kcard" style={{ cursor: 'default' }}>
        <button className="link" onClick={() => go('client/' + c.id)}>{n(c.co)}</button><span className="muted">{n(b.title)}</span>
        <div className="row"><b className="num">{money(b.amount, lang)}</b>{bs === 'overdue' ? <Badge tone="bad">{t(`متأخرة ${days(b.due)} يوم`, `${days(b.due)}d late`)}</Badge> : b.stage === 'invoice' ? <Badge>{t('تستحق', 'Due')} {fmtDate(b.due, lang)}</Badge> : null}</div>
        {b.stage !== 'paid' && <div className="row" style={{ marginTop: 10, gap: 6 }}><button className="btn sm pri" onClick={() => { A.advanceBill(b.id); say(t('تم التحديث', 'Updated')) }}>{next[b.stage]}</button>{b.stage === 'invoice' && <button className="btn sm" onClick={() => setRem(b)} aria-label="remind"><Icon n="wa" s={14} />{b.reminders || ''}</button>}</div>}
      </div> })}{!by(s).length && <p className="dim" style={{ textAlign: 'center', padding: 16 }}>{t('لا شيء هنا', 'Nothing here')}</p>}</div>)}</div>
    {add && <AddBillModal onClose={() => setAdd(false)} />}
    {rem && (() => { const c = cl(rem.client), tpl = templates.find(x => x.k === 'invoice'); const text = fillTpl(tpl, lang, { name: n(c.contacts[0]).split(' ')[0], co: n(c.co), me: n(me) }); return <Modal title={t('تذكير بالفاتورة', 'Invoice reminder')} onClose={() => setRem(null)}>
      <p className="muted" style={{ marginBottom: 10 }}>{n(c.co)} · {money(rem.amount, lang)}</p><textarea className="inp" rows={4} defaultValue={text} />
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}><button className="btn ok" onClick={() => { A.remind(rem.id); window.open(`https://wa.me/${c.contacts[0].ph.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank'); setRem(null); say(t('أُرسل التذكير', 'Reminder sent')) }}><Icon n="wa" s={15} />{t('إرسال', 'Send')}</button></div></Modal> })()}
  </div>
}
