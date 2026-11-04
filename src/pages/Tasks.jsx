import { useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon, Card, PageHead, Empty, Avatar } from '../ui.jsx'
import { startOfDay, fmtDate } from '../logic.js'
import { DAY } from '../data.js'
import { ownerOf, AddTaskModal } from '../shared.jsx'

export default function Tasks() {
  const { tasks, t, n, lang, A, leads, clients, go, setUi } = useApp(); const [add, setAdd] = useState(false), [showDone, setShowDone] = useState(false)
  const today = startOfDay(); const open = tasks.filter(x => !x.done).sort((a, b) => a.due - b.due)
  const groups = [[t('متأخرة', 'Overdue'), open.filter(x => x.due < today), 'down'], [t('اليوم', 'Today'), open.filter(x => x.due >= today && x.due < today + DAY), ''], [t('قادمة', 'Upcoming'), open.filter(x => x.due >= today + DAY), '']]
  const ref = id => leads.find(l => l.id === id) || clients.find(c => c.id === id)
  const goRef = x => { if (!x.ref) return; if (x.ref.startsWith('l')) setUi({ drawer: x.ref }); else go('client/' + x.ref) }
  const Row = x => { const r = x.ref && ref(x.ref); return <div key={x.id} className={'check' + (x.done ? ' on' : '')} style={{ cursor: 'default' }}>
    <button className="check" style={{ width: 'auto', border: 0, padding: 0 }} aria-label="toggle" onClick={() => A.toggleTask(x.id)}><span className="bx">{x.done && <Icon n="check" s={12} />}</span></button>
    <span className="grow"><span className="t">{n(x.title)}</span>{r && <button className="link" style={{ marginInlineStart: 8, fontSize: 12.5 }} onClick={() => goRef(x)}>{n(r.co)}</button>}</span>
    <span className="dim">{fmtDate(x.due, lang)}</span><Avatar name={n(ownerOf(x.owner))} color={ownerOf(x.owner).color} size={24} /></div> }
  return <div><PageHead title={t('المهام', 'Tasks')} sub={t(`${open.length} مهمة مفتوحة`, `${open.length} open tasks`)}><button className="btn pri" onClick={() => setAdd(true)}><Icon n="plus" s={15} />{t('مهمة', 'New task')}</button></PageHead>
    {groups.map(([l, a, c]) => <Card key={l} title={<span className={c}>{l} <span className="dim">{a.length}</span></span>} style={{ marginBottom: 14 }}>{a.map(Row)}{!a.length && <p className="dim">{t('لا مهام', 'Nothing here')}</p>}</Card>)}
    <button className="link" onClick={() => setShowDone(v => !v)}>{showDone ? t('إخفاء المنجزة', 'Hide completed') : t('إظهار المنجزة', 'Show completed')} ({tasks.filter(x => x.done).length})</button>
    {showDone && <Card style={{ marginTop: 10 }}>{tasks.filter(x => x.done).map(Row)}</Card>}
    {add && <AddTaskModal onClose={() => setAdd(false)} />}</div>
}
