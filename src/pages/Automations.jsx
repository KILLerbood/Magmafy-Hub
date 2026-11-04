import { useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon, Card, PageHead, Select, Field, Modal, Badge, Empty } from '../ui.jsx'
import { ruleMatches, triggerLabels, actionLabels, leadStats, ago, alerts } from '../logic.js'

export default function Automations() {
  const s = useApp(); const { rules, runLog, sla, leads, t, n, lang, A, say } = s
  const [f, setF] = useState({ trigger: 'noReply', days: 3, action: 'task' }), [open, setOpen] = useState(false)
  const breach = leads.filter(l => l.stage === 'new' && !l.attempts && (Date.now() - l.created) / 3600000 > sla)
  const run = () => { const c = A.runRules(); say(c ? t(`تم تنفيذ ${c} إجراء`, `${c} action(s) executed`) : t('لا توجد إجراءات جديدة', 'Nothing new to run')) }
  const needsDays = f.trigger !== 'won'
  return <div>
    <PageHead title={t('الأتمتة', 'Automations')} sub={t('قواعد "لو حصل X يبقى Y" تنفذ تلقائيًا على بياناتك', 'If-this-then-that rules that run on your data')}>
      <button className="btn" onClick={() => setOpen(true)}><Icon n="plus" s={15} />{t('قاعدة جديدة', 'New rule')}</button><button className="btn pri" onClick={run}><Icon n="bolt" s={15} />{t('نفّذ الآن', 'Run now')}</button></PageHead>
    <div className="grid g-main">
      <Card title={t('القواعد', 'Rules')}>
        {rules.map(r => { const m = ruleMatches(r, s).filter(x => true).length; return <div className="rule" key={r.id}>
          <button className={'switch' + (r.on ? ' on' : '')} role="switch" aria-checked={r.on} aria-label={n(r.text)} onClick={() => A.toggleRule(r.id)} />
          <div className="grow"><b>{n(r.text)}</b><div className="row wrap" style={{ marginTop: 4 }}><Badge tone="acc">{n(triggerLabels[r.trigger])} {r.trigger !== 'won' ? r.days + (r.trigger === 'renewal' || r.trigger === 'noReply' || r.trigger === 'stale' || r.trigger === 'overdue' ? t(' يوم', ' d') : '') : ''}</Badge><Icon n="chev" s={12} cls="flip" /><Badge>{n(actionLabels[r.action])}</Badge></div></div>
          <div style={{ textAlign: 'end' }}><b className={m ? 'up' : 'dim'}>{m}</b><div className="dim" style={{ fontSize: 12 }}>{t('مطابقة الآن', 'matching now')}</div></div>
          <button className="icon-btn" aria-label="delete" onClick={() => A.delRule(r.id)}><Icon n="x" s={15} /></button></div> })}
      </Card>
      <div className="col" style={{ gap: 16 }}>
        <Card title={t('اتفاقية سرعة الرد (SLA)', 'Response-time SLA')}>
          <p className="muted" style={{ marginBottom: 10 }}>{t('أقصى مدة للرد على العميل الجديد:', 'Max time to first response for a new lead:')}</p>
          <div className="chips">{[1, 2, 4, 8, 24].map(h => <button key={h} className={'chip' + (sla === h ? ' on' : '')} onClick={() => A.setSla(h)}>{h} {t('س', 'h')}</button>)}</div>
          <div style={{ marginTop: 14 }}>{breach.length ? <><b className="down">{t(`${breach.length} عملاء تخطّوا المهلة`, `${breach.length} leads breached SLA`)}</b>{breach.map(l => <button key={l.id} className="alert-i" onClick={() => s.setUi({ drawer: l.id })}><span className="sv s3"><Icon n="warn" s={15} /></span><span className="grow">{n(l.co)}</span><span className="dim">{ago(l.created, lang)}</span></button>)}</> : <b className="up">{t('لا مخالفات', 'No breaches')}</b>}</div>
        </Card>
        <Card title={t('سجل التنفيذ', 'Run log')}>{runLog.length ? runLog.slice(0, 8).map(x => <div key={x.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}><b>{n(x.target)}</b><div className="dim" style={{ fontSize: 12.5 }}>{n(actionLabels[x.action])} · {ago(x.at, lang)}</div></div>) : <Empty icon="bolt" title={t('لم تُنفّذ قواعد بعد', 'No rules run yet')} hint={t('اضغط "نفّذ الآن" لتطبيق القواعد المفعّلة.', 'Press “Run now” to apply enabled rules.')} />}</Card>
      </div>
    </div>
    {open && <Modal title={t('قاعدة جديدة', 'New rule')} onClose={() => setOpen(false)}>
      <Field label={t('لو حصل', 'When')}><Select value={f.trigger} onChange={v => setF({ ...f, trigger: v })} options={Object.entries(triggerLabels).map(([k, v]) => ({ v: k, l: n(v) }))} /></Field>
      {needsDays && <Field label={t('عدد الأيام', 'Days')}><input className="inp" type="number" min="1" value={f.days} onChange={e => setF({ ...f, days: +e.target.value || 1 })} /></Field>}
      <Field label={t('يبقى', 'Then')}><Select value={f.action} onChange={v => setF({ ...f, action: v })} options={Object.entries(actionLabels).map(([k, v]) => ({ v: k, l: n(v) }))} /></Field>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn pri" onClick={() => { A.addRule({ ...f, days: needsDays ? f.days : 0 }); setOpen(false); say(t('تمت إضافة القاعدة', 'Rule added')) }}>{t('حفظ القاعدة', 'Save rule')}</button></div></Modal>}
  </div>
}
