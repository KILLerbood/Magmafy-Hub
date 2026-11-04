import { useEffect, useMemo, useState } from 'react'
import { useApp } from './store.jsx'
import { Icon, Modal, Avatar, useKeys, Badge } from './ui.jsx'
import { LeadDrawer, AddLeadModal, AddTaskModal, AddBillModal } from './shared.jsx'
import { alerts, billState, buildQueue, startOfDay } from './logic.js'
import Login from './pages/Login.jsx'
import Today from './pages/Today.jsx'
import Leads from './pages/Leads.jsx'
import Pipeline from './pages/Pipeline.jsx'
import { ClientsList, Client360 } from './pages/Clients.jsx'
import Billing from './pages/Billing.jsx'
import Insights from './pages/Insights.jsx'
import Automations from './pages/Automations.jsx'
import Tasks from './pages/Tasks.jsx'
import Settings from './pages/Settings.jsx'

const useRoute = () => { const [h, setH] = useState(location.hash.slice(1) || 'today'); useEffect(() => { const f = () => setH(location.hash.slice(1) || 'today'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, []); return h }

function Palette({ onClose }) {
  const { t, n, leads, clients, go, setUi } = useApp(); const [q, setQ] = useState(''), [i, setI] = useState(0)
  const pages = [['today', t('اليوم', 'Today')], ['leads', t('العملاء المحتملون', 'Leads')], ['pipeline', t('المسار', 'Pipeline')], ['clients', t('العملاء', 'Clients')], ['billing', t('الفواتير', 'Billing')], ['insights', t('التحليلات', 'Analytics')], ['automations', t('الأتمتة', 'Automations')], ['tasks', t('المهام', 'Tasks')], ['settings', t('الإعدادات', 'Settings')]]
  const items = useMemo(() => {
    const ql = q.toLowerCase(); const m = s => !ql || s.toLowerCase().includes(ql)
    return [...pages.filter(p => m(p[1])).map(p => ({ k: 'p' + p[0], icon: 'chev', label: p[1], tag: t('صفحة', 'Page'), run: () => go(p[0]) })),
      ...leads.filter(l => m(l.co.a + l.co.e + l.contact.a + l.contact.e + l.phone)).slice(0, 6).map(l => ({ k: l.id, icon: 'leads', label: n(l.co), tag: t('عميل محتمل', 'Lead'), run: () => setUi({ drawer: l.id }) })),
      ...clients.filter(c => m(c.co.a + c.co.e)).slice(0, 5).map(c => ({ k: c.id, icon: 'clients', label: n(c.co), tag: t('عميل', 'Client'), run: () => go('client/' + c.id) }))].slice(0, 12)
  }, [q, leads, clients]) // eslint-disable-line
  const run = it => { onClose(); it?.run() }
  return <div className="scrim" style={{ alignItems: 'start' }} onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="palette" role="dialog" aria-label="Command palette">
    <input autoFocus placeholder={t('ابحث عن عميل أو صفحة…', 'Search a lead, client or page…')} value={q} onChange={e => { setQ(e.target.value); setI(0) }} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setI(Math.min(i + 1, items.length - 1)) } else if (e.key === 'ArrowUp') { e.preventDefault(); setI(Math.max(i - 1, 0)) } else if (e.key === 'Enter') run(items[i]); else if (e.key === 'Escape') onClose() }} />
    <ul>{items.map((it, k) => <li key={it.k}><button className={k === i ? 'on' : ''} onMouseEnter={() => setI(k)} onClick={() => run(it)}><Icon n={it.icon} s={16} /><span className="grow">{it.label}</span><Badge>{it.tag}</Badge></button></li>)}{!items.length && <li className="dim" style={{ padding: 16 }}>{t('لا نتائج', 'No results')}</li>}</ul></div></div>
}

function Guide({ onClose }) {
  const { t } = useApp()
  const flow = [[t('عميل محتمل', 'Lead'), t('يدخل من الإعلانات أو الترشيحات أو الاستيراد', 'Arrives from ads, referrals or import')], [t('متابعة', 'Follow-up'), t('طابور اليوم يرتّبهم حسب الأولوية. اتصل وسجّل النتيجة بمفتاح', 'Today queue ranks them. Call and log the outcome with one key')], [t('صفقة', 'Deal'), t('تتحرك في المسار: اجتماع ← عرض ← تفاوض ← فوز', 'Moves through the pipeline: meeting → proposal → negotiation → won')], [t('عميل', 'Client'), t('عند الفوز تتحول لعميل بملف 360° وقائمة انطلاق', 'On win it becomes a client with a 360° profile and onboarding')], [t('فاتورة', 'Billing'), t('عرض ← عقد ← فاتورة ← دفع مع تذكيرات واتساب', 'Quote → contract → invoice → paid with WhatsApp reminders')]]
  const keys = [['Ctrl K', t('بحث وانتقال سريع', 'Search & jump')], ['1 – 6', t('تسجيل نتيجة المكالمة', 'Log call outcome')], ['C / W', t('اتصال / واتساب', 'Call / WhatsApp')], ['S · K', t('التالي · السابق', 'Next · Previous')], ['Z', t('تراجع', 'Undo')], ['N / T', t('عميل جديد / مهمة', 'New lead / task')]]
  return <Modal wide title={t('كيف يعمل النظام؟', 'How does it work?')} onClose={onClose}>
    <div className="guide-steps">{flow.map(([a, b], i) => <div className="gs" key={i}><i>{i + 1}</i><div><b>{a}</b><div className="muted">{b}</div></div></div>)}</div>
    <h3 style={{ margin: '16px 0 8px' }}>{t('أهم الاختصارات', 'Top shortcuts')}</h3>
    <div className="grid g3" style={{ gap: 8 }}>{keys.map(([k, l]) => <div key={k} className="row"><kbd>{k}</kbd><span className="muted">{l}</span></div>)}</div>
    <h3 style={{ margin: '16px 0 6px' }}>{t('أين البيانات؟', 'Where is my data?')}</h3>
    <p className="muted">{t('هذه نسخة تجريبية: كل البيانات وهمية وتُحفظ داخل متصفحك فقط. "الإعدادات ← إعادة ضبط" تعيدها كما كانت.', 'This is a demo: all data is fictional and stored only in your browser. Settings → Reset restores it.')}</p>
  </Modal>
}

export default function App() {
  const s = useApp(); const { session, t, n, lang, theme, setUi, me, drawer, toast, setToast, leads, clients, bills, tasks, done, sla, go } = s
  const route = useRoute(); const [modal, setModal] = useState(null), [menu, setMenu] = useState(false), [add, setAdd] = useState(false)
  useEffect(() => { setMenu(false); window.scrollTo(0, 0) }, [route])
  useKeys({ n: () => setModal('lead'), t: () => setModal('task') }, [])
  useEffect(() => { const h = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setModal('pal') } }; addEventListener('keydown', h); return () => removeEventListener('keydown', h) }, [])
  if (!session) return <Login />
  const al = alerts(s, sla), q = buildQueue(leads).filter(x => !done[x.lead.id]).length
  const overdueT = tasks.filter(x => !x.done && x.due < startOfDay()).length, overdueB = bills.filter(b => billState(b) === 'overdue').length
  const nav = [[t('يومك', 'Your day'), [['today', 'today', t('اليوم', 'Today'), q], ['tasks', 'tasks', t('المهام', 'Tasks'), overdueT]]], [t('المبيعات', 'Sales'), [['leads', 'leads', t('العملاء المحتملون', 'Leads')], ['pipeline', 'pipeline', t('المسار', 'Pipeline')]]], [t('بعد البيع', 'After-sale'), [['clients', 'clients', t('العملاء', 'Clients')], ['billing', 'billing', t('الفواتير', 'Billing'), overdueB]]], [t('الإدارة', 'Management'), [['insights', 'insights', t('التحليلات', 'Analytics')], ['automations', 'auto', t('الأتمتة', 'Automations')], ['settings', 'settings', t('الإعدادات', 'Settings')]]]]
  const [base, param] = route.split('/')
  const page = { today: <Today />, leads: <Leads />, pipeline: <Pipeline />, clients: <ClientsList />, client: <Client360 id={param} />, billing: <Billing />, insights: <Insights />, automations: <Automations />, tasks: <Tasks />, settings: <Settings /> }[base] || <Today />
  const active = base === 'client' ? 'clients' : base
  return <div className="app">
    <aside className={'side' + (menu ? ' open' : '')} aria-label="Navigation">
      <div className="brand"><span className="logo">M</span><div><b>Magmafy Hub</b><small>{t('مبيعات · عملاء · فواتير', 'Sales · Clients · Billing')}</small></div></div>
      <button className="btn pri" style={{ justifyContent: 'center', marginBottom: 6 }} onClick={() => setModal('lead')}><Icon n="plus" s={16} />{t('عميل جديد', 'New lead')} <kbd style={{ background: 'rgba(255,255,255,.18)', color: '#fff', border: 0 }}>N</kbd></button>
      {nav.map(([g, items]) => <div key={g}><div className="navgrp">{g}</div>{items.map(([r, ic, l, c]) => <a key={r} href={'#' + r} className={'nav' + (active === r ? ' on' : '')} aria-current={active === r ? 'page' : undefined}><Icon n={ic} s={18} />{l}{c > 0 && <span className={'cnt' + (r === 'today' ? ' soft' : '')}>{c}</span>}</a>)}</div>)}
      <div className="me"><Avatar name={n(me)} color={me.color} /><div className="grow"><b>{n(me)}</b><small>{me.role === 'admin' ? t('مدير', 'Admin') : t('مبيعات', 'Sales')}</small></div><button className="icon-btn" style={{ color: '#fff' }} aria-label="Sign out" onClick={() => { setUi({ session: null }); location.hash = '' }}><Icon n="out" s={17} /></button></div>
    </aside>
    {menu && <div className="scrim" style={{ zIndex: 65 }} onClick={() => setMenu(false)} />}
    <div className="main">
      <header className="top">
        <button className="icon-btn menu-btn" aria-label="Menu" onClick={() => setMenu(true)}><Icon n="menu" /></button>
        <button className="searchbox" onClick={() => setModal('pal')} aria-label="Search"><Icon n="search" s={16} /><span>{t('ابحث عن عميل أو صفحة أو أمر…', 'Search a lead, page or command…')}</span><kbd>Ctrl K</kbd></button>
        <span className="spacer" />
        <button className="icon-btn" aria-label="Notifications" onClick={() => setModal('alerts')}><Icon n="bell" /><span className="dot">{al.length}</span></button>
        <button className="icon-btn" aria-label="Toggle theme" onClick={() => setUi({ theme: theme === 'dark' ? 'light' : 'dark' })}><Icon n={theme === 'dark' ? 'sun' : 'moon'} /></button>
        <button className="btn sm" onClick={() => setUi({ lang: lang === 'ar' ? 'en' : 'ar' })}>{lang === 'ar' ? 'EN' : 'ع'}</button>
        <div style={{ position: 'relative' }}><button className="btn sm pri" onClick={() => setAdd(v => !v)} aria-label="Quick add"><Icon n="plus" s={15} /></button>
          {add && <div className="card" style={{ position: 'absolute', insetInlineEnd: 0, top: 38, width: 190, padding: 6, zIndex: 30 }} onClick={() => setAdd(false)}>{[['lead', 'leads', t('عميل محتمل', 'Lead'), 'N'], ['task', 'tasks', t('مهمة', 'Task'), 'T'], ['bill', 'billing', t('عرض سعر', 'Quote'), '']].map(([k, ic, l, kk]) => <button key={k} className="nav" style={{ color: 'var(--ink)' }} onClick={() => setModal(k)}><Icon n={ic} s={16} />{l}{kk && <kbd style={{ marginInlineStart: 'auto' }}>{kk}</kbd>}</button>)}</div>}</div>
      </header>
      <main className="page" id="main">{page}</main>
    </div>
    <button className="helpfab" onClick={() => setModal('guide')}><Icon n="help" s={17} /><span>{t('كيف يعمل؟', 'How does it work?')}</span></button>
    <nav className="bottom" aria-label="Primary">{[['today', 'today', t('اليوم', 'Today')], ['leads', 'leads', t('عملاء', 'Leads')], ['pipeline', 'pipeline', t('المسار', 'Pipeline')], ['clients', 'clients', t('العملاء', 'Clients')], ['insights', 'insights', t('تحليلات', 'Stats')]].map(([r, ic, l]) => <a key={r} href={'#' + r} className={active === r ? 'on' : ''}><Icon n={ic} s={20} />{l}</a>)}</nav>
    {drawer && <LeadDrawer id={drawer} onClose={() => setUi({ drawer: null })} />}
    {modal === 'lead' && <AddLeadModal onClose={() => setModal(null)} />}{modal === 'task' && <AddTaskModal onClose={() => setModal(null)} />}{modal === 'bill' && <AddBillModal onClose={() => setModal(null)} />}
    {modal === 'pal' && <Palette onClose={() => setModal(null)} />}{modal === 'guide' && <Guide onClose={() => setModal(null)} />}
    {modal === 'alerts' && <Modal title={t('التنبيهات', 'Alerts')} onClose={() => setModal(null)}>{al.length ? al.map((a, i) => <button key={i} className="alert-i" onClick={() => { setModal(null); a.type === 'lead' ? setUi({ drawer: a.ref }) : go('client/' + a.ref) }}><span className={'sv s' + a.sev}><Icon n="warn" s={16} /></span><span className="grow">{n(a)}</span></button>) : <p className="dim">{t('لا تنبيهات', 'No alerts')}</p>}</Modal>}
    {toast && <div className="toast" role="status"><span>{toast.msg}</span>{toast.undo && <button onClick={() => { toast.undo(); setToast(null) }}>{t('تراجع', 'Undo')}</button>}</div>}
  </div>
}
