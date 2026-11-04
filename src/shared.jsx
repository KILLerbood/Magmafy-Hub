import { useState } from 'react'
import { useApp } from './store.jsx'
import { Icon, Avatar, Badge, Drawer, Modal, Field, Select, Mention } from './ui.jsx'
import { team, sources, stages, stageName } from './data.js'
import { money, ago, fillTpl, nextAction, scoreLead, fmtDate } from './logic.js'

export const evIcon = { call: 'phone', whatsapp: 'wa', email: 'mail', note: 'note', meeting: 'cal', stage: 'pipeline', quote: 'billing', payment: 'check' }
export const ownerOf = id => team.find(u => u.id === id)

export function Timeline({ refId, limit }) {
  const { events, t, n, lang } = useApp()
  const list = events.filter(e => e.ref === refId).sort((a, b) => b.at - a.at).slice(0, limit || 99)
  if (!list.length) return <p className="dim" style={{ padding: '12px 0' }}>{t('لا توجد أنشطة بعد', 'No activity yet')}</p>
  return <div className="tl">{list.map(e => <div className="tl-i" key={e.id}>
    <span className={'tl-dot ' + e.type}><Icon n={evIcon[e.type] || 'note'} s={15} /></span>
    <div className="grow"><div><Mention text={n(e.text)} /></div><small>{ago(e.at, lang)} · {e.by === 'auto' ? t('تلقائي', 'Automatic') : n(ownerOf(e.by) || { a: '', e: '' })}</small></div>
  </div>)}</div>
}

export function WaComposer({ lead, client, kind = 'followup', onSent }) {
  const { templates, t, n, lang, me, A, say } = useApp()
  const target = lead || client
  const contact = lead ? lead.contact : client.contacts[0]
  const phone = (lead ? lead.phone : client.contacts[0].ph).replace(/[^\d]/g, '')
  const [tplId, setTpl] = useState(templates.find(x => x.k === kind)?.id || templates[0].id)
  const make = id => fillTpl(templates.find(x => x.id === id), lang, { name: (n(contact) || '').split(' ')[0], co: n(target.co), me: n(me) })
  const [text, setText] = useState(() => make(tplId))
  return <div className="wa-box">
    <div className="row wrap" style={{ marginBottom: 8 }}>{templates.map(x => <button key={x.id} className={'chip' + (x.id === tplId ? ' on' : '')} onClick={() => { setTpl(x.id); setText(make(x.id)) }}>{({ intro: t('تعارف', 'Intro'), followup: t('متابعة', 'Follow-up'), meeting: t('اجتماع', 'Meeting'), invoice: t('فاتورة', 'Invoice'), renewal: t('تجديد', 'Renewal') })[x.k]}</button>)}</div>
    <textarea className="inp" value={text} onChange={e => setText(e.target.value)} rows={3} />
    <div className="row" style={{ marginTop: 8, justifyContent: 'flex-end' }}>
      <a className="btn ok" target="_blank" rel="noreferrer" href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`} onClick={() => { A.log(target.id, 'whatsapp', { a: 'رسالة واتساب: ' + text.slice(0, 60) + '…', e: 'WhatsApp message: ' + text.slice(0, 60) + '…' }); say(t('تم تسجيل الرسالة', 'Message logged')); onSent && onSent() }}><Icon n="wa" s={16} />{t('إرسال عبر واتساب', 'Send on WhatsApp')}</a>
    </div></div>
}

export function LeadDrawer({ id, onClose }) {
  const { leads, t, n, lang, A, go } = useApp()
  const l = leads.find(x => x.id === id); const [note, setNote] = useState('')
  if (!l) return null
  const o = ownerOf(l.owner), na = nextAction(l), sc = scoreLead(l)
  return <Drawer title={n(l.co)} onClose={onClose}>
    <div className="row wrap" style={{ marginBottom: 12 }}><Badge tone="acc">{n(stageName[l.stage])}</Badge>{l.hot && <Badge tone="bad"><Icon n="flame" s={12} />{t('مهتم جدًا', 'Hot')}</Badge>}<Badge>{n(sources[l.source])}</Badge><Badge tone="ok">{money(l.value, lang)}</Badge></div>
    <div className="grid g2" style={{ marginBottom: 12 }}>
      <Field label={t('المرحلة', 'Stage')}><Select value={l.stage} onChange={v => A.setStage(l.id, v)} options={stages.map(s => ({ v: s, l: n(stageName[s]) }))} /></Field>
      <Field label={t('المسؤول', 'Owner')}><Select value={l.owner} onChange={v => A.updateLead(l.id, { owner: v })} options={team.map(u => ({ v: u.id, l: n(u) }))} /></Field>
    </div>
    <div className="row" style={{ marginBottom: 12 }}><Avatar name={n(l.contact)} color={o.color} /><div className="grow"><b>{n(l.contact)}</b><div className="dim" dir="ltr" style={{ textAlign: 'start' }}>{l.phone} · {l.email}</div></div></div>
    <div className="call-row"><a className="btn pri" href={'tel:' + l.phone} onClick={() => A.log(l.id, 'call', t('اتصال من الملف', 'Call placed from profile'))}><Icon n="phone" s={16} />{t('اتصل', 'Call')}</a><button className="btn" onClick={() => go('today')}><Icon n="today" s={16} />{t('افتح طابور اليوم', 'Open today queue')}</button></div>
    <div className="nba"><small>{t('الخطوة الأنسب', 'Best next step')}</small><b>{n(na)}</b></div>
    <p className="dim" style={{ fontSize: 12.5 }}>{t('درجة الأولوية', 'Priority score')}: <b>{sc.score}</b> · {sc.reasons.slice(0, 3).map(r => n(r)).join(' · ')}</p>
    <h3 style={{ margin: '18px 0 8px' }}>{t('تسجيل ملاحظة', 'Log a note')}</h3>
    <div className="row"><input className="inp" value={note} onChange={e => setNote(e.target.value)} placeholder={t('اكتب ملاحظة… استخدم @ للإشارة', 'Write a note… use @ to mention')} onKeyDown={e => { if (e.key === 'Enter' && note.trim()) { A.log(l.id, 'note', note.trim()); setNote('') } }} /><button className="btn" disabled={!note.trim()} onClick={() => { A.log(l.id, 'note', note.trim()); setNote('') }}>{t('حفظ', 'Save')}</button></div>
    <h3 style={{ margin: '18px 0 4px' }}>{t('السجل', 'Timeline')}</h3><Timeline refId={l.id} />
  </Drawer>
}

export function AddLeadModal({ onClose }) {
  const { t, A, say, setUi } = useApp(); const [f, set] = useState({ co: '', contact: '', phone: '', value: '', source: 'website' })
  const ok = f.co.trim()
  return <Modal title={t('عميل محتمل جديد', 'New lead')} onClose={onClose}>
    <form onSubmit={e => { e.preventDefault(); if (!ok) return; const id = A.addLead(f); say(t('تمت الإضافة وأُضيف لأول طابور اليوم', 'Added and queued for today')); onClose(); setUi({ drawer: id }) }}>
      <Field label={t('اسم الشركة', 'Company')}><input className="inp" autoFocus value={f.co} onChange={e => set({ ...f, co: e.target.value })} /></Field>
      <div className="grid g2"><Field label={t('جهة الاتصال', 'Contact')}><input className="inp" value={f.contact} onChange={e => set({ ...f, contact: e.target.value })} /></Field>
        <Field label={t('الجوال', 'Phone')}><input className="inp" dir="ltr" value={f.phone} onChange={e => set({ ...f, phone: e.target.value })} /></Field>
        <Field label={t('قيمة الصفقة (ر.س)', 'Deal value (SAR)')}><input className="inp" type="number" value={f.value} onChange={e => set({ ...f, value: e.target.value })} /></Field>
        <Field label={t('المصدر', 'Source')}><Select value={f.source} onChange={v => set({ ...f, source: v })} options={Object.entries(sources).map(([k, v]) => ({ v: k, l: t(v.a, v.e) }))} /></Field></div>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn" onClick={onClose}>{t('إلغاء', 'Cancel')}</button><button className="btn pri" disabled={!ok}>{t('إضافة', 'Add lead')}</button></div>
    </form></Modal>
}
export function AddTaskModal({ onClose }) {
  const { t, A, say } = useApp(); const [title, setTitle] = useState(''), [d, setD] = useState('0')
  return <Modal title={t('مهمة جديدة', 'New task')} onClose={onClose}><form onSubmit={e => { e.preventDefault(); if (!title.trim()) return; A.addTask(title.trim(), null, +d); say(t('تمت إضافة المهمة', 'Task added')); onClose() }}>
    <Field label={t('العنوان', 'Title')}><input className="inp" autoFocus value={title} onChange={e => setTitle(e.target.value)} /></Field>
    <Field label={t('الموعد', 'Due')}><Select value={d} onChange={setD} options={[{ v: '0', l: t('اليوم', 'Today') }, { v: '1', l: t('غدًا', 'Tomorrow') }, { v: '3', l: t('بعد 3 أيام', 'In 3 days') }, { v: '7', l: t('بعد أسبوع', 'In a week') }]} /></Field>
    <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn pri" disabled={!title.trim()}>{t('إضافة', 'Add task')}</button></div></form></Modal>
}
export function AddBillModal({ onClose, clientId }) {
  const { t, n, clients, A, say } = useApp(); const [f, set] = useState({ client: clientId || clients[0].id, title: '', amount: '' })
  return <Modal title={t('عرض سعر جديد', 'New quote')} onClose={onClose}><form onSubmit={e => { e.preventDefault(); if (!f.title.trim()) return; A.addBill(f); say(t('تم إنشاء عرض السعر', 'Quote created')); onClose() }}>
    <Field label={t('العميل', 'Client')}><Select value={f.client} onChange={v => set({ ...f, client: v })} options={clients.map(c => ({ v: c.id, l: n(c.co) }))} /></Field>
    <Field label={t('الوصف', 'Description')}><input className="inp" autoFocus value={f.title} onChange={e => set({ ...f, title: e.target.value })} /></Field>
    <Field label={t('المبلغ (ر.س)', 'Amount (SAR)')}><input className="inp" type="number" value={f.amount} onChange={e => set({ ...f, amount: e.target.value })} /></Field>
    <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn pri" disabled={!f.title.trim()}>{t('إنشاء', 'Create')}</button></div></form></Modal>
}
