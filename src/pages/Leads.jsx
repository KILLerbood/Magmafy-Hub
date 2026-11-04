import { useMemo, useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon, Avatar, Badge, Card, PageHead, Select, Modal, Field, Empty, useToggleSet } from '../ui.jsx'
import { team, sources, stages, stageName } from '../data.js'
import { money, ago, scoreLead, isOpen } from '../logic.js'
import { ownerOf } from '../shared.jsx'

const COLS = ['co', 'contact', 'stage', 'value', 'owner', 'source', 'last', 'score']
const colName = { co: ['الشركة', 'Company'], contact: ['جهة الاتصال', 'Contact'], stage: ['المرحلة', 'Stage'], value: ['القيمة', 'Value'], owner: ['المسؤول', 'Owner'], source: ['المصدر', 'Source'], last: ['آخر تواصل', 'Last touch'], score: ['الأولوية', 'Priority'] }
const norm = s => (s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')

export function findDuplicates(leads) {
  const out = []
  for (let i = 0; i < leads.length; i++) for (let j = i + 1; j < leads.length; j++) {
    const a = leads[i], b = leads[j]
    if ((a.phone && a.phone === b.phone) || norm(a.co.e) === norm(b.co.e) || norm(a.co.a) === norm(b.co.a)) out.push([a, b])
  }
  return out
}
function parseCsv(txt) {
  const rows = txt.trim().split(/\r?\n/).map(r => r.split(/,|\t|;/).map(c => c.trim().replace(/^"|"$/g, '')))
  return rows
}
function ImportModal({ onClose }) {
  const { t, A, say } = useApp()
  const [txt, setTxt] = useState('company,contact,phone,value\nBrightWood Studio,Ali Karim,+966501234500,45000\nMaple Furniture,Dina Saleh,+966501234501,30000')
  const rows = parseCsv(txt), head = rows[0] || [], body = rows.slice(1).filter(r => r.some(Boolean))
  const [map, setMap] = useState({ co: 0, contact: 1, phone: 2, value: 3 })
  const opts = head.map((h, i) => ({ v: i, l: h || '#' + (i + 1) }))
  const mapped = body.map(r => ({ co: r[map.co], contact: r[map.contact], phone: r[map.phone], value: r[map.value] })).filter(r => r.co)
  return <Modal wide title={t('استيراد عملاء من CSV', 'Import leads from CSV')} onClose={onClose}>
    <Field label={t('الصق بيانات CSV (الصف الأول عناوين)', 'Paste CSV data (first row = headers)')}><textarea className="inp" rows={5} dir="ltr" value={txt} onChange={e => setTxt(e.target.value)} /></Field>
    <div className="grid g4">{[['co', t('الشركة', 'Company')], ['contact', t('الاتصال', 'Contact')], ['phone', t('الجوال', 'Phone')], ['value', t('القيمة', 'Value')]].map(([k, l]) => <Field key={k} label={l}><select className="sel" value={map[k]} onChange={e => setMap({ ...map, [k]: +e.target.value })}>{opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select></Field>)}</div>
    <p className="muted" style={{ marginBottom: 12 }}>{t(`سيتم استيراد ${mapped.length} سجل`, `${mapped.length} record(s) will be imported`)}</p>
    <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={onClose}>{t('إلغاء', 'Cancel')}</button><button className="btn pri" disabled={!mapped.length} onClick={() => { A.importLeads(mapped); say(t(`تم استيراد ${mapped.length} عميل`, `Imported ${mapped.length} leads`)); onClose() }}>{t('استيراد', 'Import')}</button></div>
  </Modal>
}
function DupModal({ onClose }) {
  const { leads, t, n, A, say } = useApp()
  const dups = findDuplicates(leads)
  return <Modal wide title={t('السجلات المكررة', 'Duplicate records')} onClose={onClose}>
    {!dups.length ? <Empty title={t('لا توجد مكررات', 'No duplicates found')} hint={t('قاعدة البيانات نظيفة.', 'Your database is clean.')} /> : dups.map(([a, b]) => <div key={a.id + b.id} className="row between" style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <div className="grow"><b>{n(a.co)}</b> ↔ <b>{n(b.co)}</b><div className="dim" dir="ltr" style={{ textAlign: 'start' }}>{a.phone} · {b.phone}</div></div>
      <button className="btn sm" onClick={() => { A.merge(a.id, b.id); say(t('تم الدمج', 'Merged')) }}><Icon n="merge" s={14} />{t('دمج', 'Merge')}</button></div>)}
    <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn" onClick={onClose}>{t('إغلاق', 'Close')}</button></div></Modal>
}

export default function Leads() {
  const { leads, views, t, n, lang, A, setUi, say, me } = useApp()
  const [q, setQ] = useState(''), [f, setF] = useState({ stage: 'all', owner: 'all', source: 'all', hot: false, open: true })
  const [sort, setSort] = useState({ k: 'score', dir: -1 }), [cols, setCols] = useState(COLS), [colsOpen, setColsOpen] = useState(false)
  const [naming, setNaming] = useState(false), [vname, setVname] = useState('')
  const [selSet, toggle, setSel] = useToggleSet(), [modal, setModal] = useState(null), [edit, setEdit] = useState(null)
  const rows = useMemo(() => {
    const ql = q.toLowerCase()
    let r = leads.map(l => ({ l, sc: scoreLead(l).score })).filter(({ l }) => (f.stage === 'all' || l.stage === f.stage) && (f.owner === 'all' || l.owner === f.owner) && (f.source === 'all' || l.source === f.source) && (!f.hot || l.hot) && (!f.open || isOpen(l) || f.stage !== 'all') &&
      (!ql || [l.co.a, l.co.e, l.contact.a, l.contact.e, l.phone, l.email].join(' ').toLowerCase().includes(ql)))
    const val = ({ l, sc }) => ({ co: n(l.co), contact: n(l.contact), stage: stages.indexOf(l.stage), value: l.value, owner: l.owner, source: l.source, last: -l.last, score: sc })[sort.k]
    r.sort((a, b) => { const x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir }); return r
  }, [leads, q, f, sort, lang])
  const sortBy = k => setSort(s => ({ k, dir: s.k === k ? -s.dir : (k === 'score' || k === 'value' ? -1 : 1) }))
  const csv = () => {
    const head = ['company', 'contact', 'phone', 'email', 'stage', 'value', 'owner', 'source']
    const body = rows.map(({ l }) => [n(l.co), n(l.contact), l.phone, l.email, l.stage, l.value, n(ownerOf(l.owner)), l.source].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    const url = URL.createObjectURL(new Blob(['﻿' + [head.join(','), ...body].join('\n')], { type: 'text/csv' })); const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click(); URL.revokeObjectURL(url); say(t('تم تنزيل الملف', 'File downloaded'))
  }
  const ids = [...selSet], allOn = rows.length && rows.every(({ l }) => selSet.has(l.id))
  const applyView = v => setF(v.f)
  return <div>
    <PageHead title={t('العملاء المحتملون', 'Leads')} sub={t(`${rows.length} من ${leads.length} سجل`, `${rows.length} of ${leads.length} records`)}>
      <button className="btn" onClick={() => setModal('dup')}><Icon n="merge" s={15} />{t('المكررات', 'Duplicates')}</button>
      <button className="btn" onClick={() => setModal('import')}><Icon n="upload" s={15} />{t('استيراد', 'Import')}</button>
      <button className="btn" onClick={csv}><Icon n="download" s={15} />{t('تصدير', 'Export')}</button>
    </PageHead>
    <Card>
      <div className="row wrap" style={{ marginBottom: 12 }}>
        <div className="searchbox" style={{ maxWidth: 280 }}><Icon n="search" s={16} /><input aria-label="search" className="inp" style={{ border: 0, padding: 0, background: 'none', outline: 0 }} placeholder={t('بحث بالاسم أو الجوال', 'Search name or phone')} value={q} onChange={e => setQ(e.target.value)} /></div>
        <Select value={f.stage} onChange={v => setF({ ...f, stage: v })} options={[{ v: 'all', l: t('كل المراحل', 'All stages') }, ...stages.map(s => ({ v: s, l: n(stageName[s]) }))]} />
        <Select value={f.owner} onChange={v => setF({ ...f, owner: v })} options={[{ v: 'all', l: t('كل المسؤولين', 'All owners') }, ...team.map(u => ({ v: u.id, l: n(u) }))]} />
        <Select value={f.source} onChange={v => setF({ ...f, source: v })} options={[{ v: 'all', l: t('كل المصادر', 'All sources') }, ...Object.entries(sources).map(([k, v]) => ({ v: k, l: n(v) }))]} />
        <button className={'chip' + (f.hot ? ' on' : '')} onClick={() => setF({ ...f, hot: !f.hot })}><Icon n="flame" s={13} /> {t('ساخن', 'Hot')}</button>
        <button className={'chip' + (f.open ? ' on' : '')} onClick={() => setF({ ...f, open: !f.open })}>{t('المفتوحة فقط', 'Open only')}</button>
        <span className="spacer" />
        <div style={{ position: 'relative' }}><button className="btn sm" onClick={() => setColsOpen(v => !v)}>{t('الأعمدة', 'Columns')}</button>
          {colsOpen && <div className="card" style={{ position: 'absolute', insetInlineEnd: 0, top: 36, zIndex: 10, width: 190, padding: 10 }}>{COLS.map(c => <label key={c} className="row" style={{ padding: '4px 2px' }}><input type="checkbox" checked={cols.includes(c)} disabled={c === 'co'} onChange={() => setCols(cols.includes(c) ? cols.filter(x => x !== c) : COLS.filter(x => cols.includes(x) || x === c))} />{t(...colName[c])}</label>)}</div>}</div>
      </div>
      <div className="row wrap" style={{ marginBottom: 12 }}><span className="dim">{t('العروض المحفوظة', 'Saved views')}:</span>
        <button className="chip" onClick={() => setF({ stage: 'all', owner: 'all', source: 'all', hot: false, open: true })}>{t('الكل', 'All open')}</button>
        <button className="chip" onClick={() => setF({ stage: 'all', owner: me.id, source: 'all', hot: false, open: true })}>{t('عملائي', 'My leads')}</button>
        <button className="chip" onClick={() => setF({ stage: 'new', owner: 'all', source: 'all', hot: false, open: true })}>{t('جدد', 'New')}</button>
        {views.map(v => <span key={v.id} className="chip" style={{ display: 'inline-flex', gap: 6 }}><button style={{ all: 'unset', cursor: 'pointer' }} onClick={() => applyView(v)}>{v.name}</button><button aria-label="delete view" style={{ all: 'unset', cursor: 'pointer', opacity: .6 }} onClick={() => A.delView(v.id)}>×</button></span>)}
        {naming ? <form className="row" onSubmit={e => { e.preventDefault(); if (vname.trim()) { A.saveView({ name: vname.trim(), f }); setVname(''); setNaming(false) } }}><input className="inp" autoFocus style={{ width: 140 }} value={vname} onChange={e => setVname(e.target.value)} placeholder={t('اسم العرض', 'View name')} /><button className="btn sm pri">{t('حفظ', 'Save')}</button></form> : <button className="link" onClick={() => setNaming(true)}>+ {t('حفظ العرض الحالي', 'Save current view')}</button>}
      </div>
      {ids.length > 0 && <div className="row wrap" style={{ background: 'var(--accent-soft)', padding: '8px 12px', borderRadius: 10, marginBottom: 10 }}>
        <b>{t(`${ids.length} محدد`, `${ids.length} selected`)}</b><span className="spacer" />
        <Select value="" onChange={v => { if (v) { A.bulk(ids, { owner: v }); say(t('تم تغيير المسؤول', 'Owner updated')) } }} options={[{ v: '', l: t('تعيين مسؤول…', 'Assign owner…') }, ...team.map(u => ({ v: u.id, l: n(u) }))]} />
        <Select value="" onChange={v => { if (v) { A.bulk(ids, { stage: v }); say(t('تم تغيير المرحلة', 'Stage updated')) } }} options={[{ v: '', l: t('نقل لمرحلة…', 'Move to stage…') }, ...stages.map(s => ({ v: s, l: n(stageName[s]) }))]} />
        <button className="btn sm" onClick={() => { A.bulk(ids, { hot: true, next: Date.now() }); say(t('أُضيفوا لطابور اليوم', 'Added to today queue')) }}>{t('أضف للطابور', 'Add to queue')}</button>
        <button className="btn sm danger" onClick={() => { A.removeLeads(ids); setSel(new Set()); say(t('تم الحذف', 'Deleted')) }}>{t('حذف', 'Delete')}</button></div>}
      <div className="scroll-x"><table className="tbl"><thead><tr>
        <th style={{ width: 34 }}><input type="checkbox" aria-label="select all" checked={!!allOn} onChange={() => setSel(allOn ? new Set() : new Set(rows.map(r => r.l.id)))} /></th>
        {cols.map(c => <th key={c} className="sortable" onClick={() => sortBy(c)} aria-sort={sort.k === c ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}>{t(...colName[c])}{sort.k === c && (sort.dir > 0 ? ' ↑' : ' ↓')}</th>)}</tr></thead>
        <tbody>{rows.map(({ l, sc }) => <tr key={l.id} className={selSet.has(l.id) ? 'sel-row' : ''}>
          <td><input type="checkbox" aria-label="select" checked={selSet.has(l.id)} onChange={() => toggle(l.id)} /></td>
          {cols.includes('co') && <td><button className="link" onClick={() => setUi({ drawer: l.id })}>{n(l.co)}</button> {l.hot && <Icon n="flame" s={13} cls="tag-hot" />}</td>}
          {cols.includes('contact') && <td>{n(l.contact)}<div className="dim" dir="ltr" style={{ textAlign: 'start', fontSize: 12 }}>{l.phone}</div></td>}
          {cols.includes('stage') && <td><select className="sel" aria-label="stage" value={l.stage} onChange={e => A.setStage(l.id, e.target.value)}>{stages.map(s => <option key={s} value={s}>{n(stageName[s])}</option>)}</select></td>}
          {cols.includes('value') && <td className="num" onDoubleClick={() => setEdit(l.id)}>{edit === l.id ? <input className="inp" autoFocus type="number" defaultValue={l.value} style={{ width: 100 }} onBlur={e => { A.updateLead(l.id, { value: +e.target.value || 0 }); setEdit(null) }} onKeyDown={e => e.key === 'Enter' && e.target.blur()} /> : money(l.value, lang)}</td>}
          {cols.includes('owner') && <td><span className="row" style={{ gap: 6 }}><Avatar name={n(ownerOf(l.owner))} color={ownerOf(l.owner).color} size={24} />{n(ownerOf(l.owner)).split(' ')[0]}</span></td>}
          {cols.includes('source') && <td className="muted">{n(sources[l.source])}</td>}
          {cols.includes('last') && <td className="muted">{ago(l.last, lang)}</td>}
          {cols.includes('score') && <td><Badge tone={sc > 70 ? 'bad' : sc > 40 ? 'warn' : ''}>{sc}</Badge></td>}
        </tr>)}</tbody></table>
        {!rows.length && <Empty icon="search" title={t('لا نتائج', 'No results')} hint={t('جرّب تغيير الفلاتر.', 'Try adjusting your filters.')} />}
      </div>
      <p className="dim" style={{ marginTop: 10, fontSize: 12 }}>{t('نصيحة: انقر مرتين على القيمة لتعديلها داخل الجدول.', 'Tip: double-click a value to edit it inline.')}</p>
    </Card>
    {modal === 'import' && <ImportModal onClose={() => setModal(null)} />}{modal === 'dup' && <DupModal onClose={() => setModal(null)} />}
  </div>
}
