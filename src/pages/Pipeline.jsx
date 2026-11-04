import { useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon, Avatar, Badge, PageHead, Card } from '../ui.jsx'
import { stages, stageName, stageW } from '../data.js'
import { money, short, ago } from '../logic.js'
import { ownerOf } from '../shared.jsx'

export default function Pipeline() {
  const { leads, t, n, lang, A, setUi, say } = useApp()
  const [over, setOver] = useState(null), [drag, setDrag] = useState(null)
  const shown = stages.filter(s => s !== 'lost')
  const open = leads.filter(l => !['won', 'lost'].includes(l.stage))
  const weighted = open.reduce((a, l) => a + l.value * stageW[l.stage], 0)
  return <div>
    <PageHead title={t('المسار', 'Pipeline')} sub={t(`قيمة مفتوحة ${money(open.reduce((a, l) => a + l.value, 0), lang)} · متوقعة مرجّحة ${money(weighted, lang)}`, `Open ${money(open.reduce((a, l) => a + l.value, 0), lang)} · weighted forecast ${money(weighted, lang)}`)}><span className="dim">{t('اسحب البطاقة لتغيير المرحلة', 'Drag a card to change stage')}</span></PageHead>
    <div className="kanban">{shown.map(s => { const col = leads.filter(l => l.stage === s); return <div key={s} className={'kcol' + (over === s ? ' over' : '')}
      onDragOver={e => { e.preventDefault(); setOver(s) }} onDragLeave={() => setOver(null)} onDrop={e => { e.preventDefault(); setOver(null); if (drag) { A.setStage(drag, s); say(t('تم نقل الصفقة إلى ', 'Deal moved to ') + n(stageName[s])); setDrag(null) } }}>
      <h4>{n(stageName[s])} <small>{col.length} · {short(col.reduce((a, l) => a + l.value, 0))}</small></h4>
      {col.map(l => <div key={l.id} draggable tabIndex={0} role="button" className="kcard" onDragStart={() => setDrag(l.id)} onClick={() => setUi({ drawer: l.id })} onKeyDown={e => { if (e.key === 'Enter') setUi({ drawer: l.id }); if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const dir = (e.key === 'ArrowRight') === (lang !== 'ar') ? 1 : -1; const i = shown.indexOf(s) + dir; if (shown[i]) A.setStage(l.id, shown[i]) } }}>
        <b>{n(l.co)}</b><span className="dim">{n(l.contact)}</span>
        <div className="row"><Badge tone="ok">{money(l.value, lang)}</Badge><span className="row" style={{ gap: 6 }}>{l.hot && <Icon n="flame" s={13} cls="tag-hot" />}<Avatar name={n(ownerOf(l.owner))} color={ownerOf(l.owner).color} size={24} /></span></div>
        <div className="dim" style={{ fontSize: 12, marginTop: 6 }}>{ago(l.last, lang)}</div></div>)}
      {!col.length && <p className="dim" style={{ textAlign: 'center', padding: 16 }}>{t('فارغ', 'Empty')}</p>}</div> })}</div>
  </div>
}
