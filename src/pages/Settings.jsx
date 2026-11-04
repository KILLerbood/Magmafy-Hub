import { useApp } from '../store.jsx'
import { Card, PageHead, Seg, Avatar, Badge } from '../ui.jsx'
import { team } from '../data.js'
import { money } from '../logic.js'

export default function Settings() {
  const { t, n, lang, theme, setUi, A, say, templates, me } = useApp()
  return <div><PageHead title={t('الإعدادات', 'Settings')} sub={t('التفضيلات والفريق والقوالب', 'Preferences, team and templates')} />
    <div className="grid g2">
      <Card title={t('التفضيلات', 'Preferences')}>
        <div className="row between" style={{ marginBottom: 14 }}><span>{t('اللغة', 'Language')}</span><Seg value={lang} onChange={v => setUi({ lang: v })} options={[{ v: 'ar', l: 'العربية' }, { v: 'en', l: 'English' }]} /></div>
        <div className="row between" style={{ marginBottom: 14 }}><span>{t('المظهر', 'Theme')}</span><Seg value={theme} onChange={v => setUi({ theme: v })} options={[{ v: 'light', l: t('فاتح', 'Light') }, { v: 'dark', l: t('داكن', 'Dark') }]} /></div>
        <div className="row between"><span>{t('بيانات العرض التجريبي', 'Demo data')}</span><button className="btn sm danger" onClick={() => { A.reset(); say(t('تمت إعادة البيانات', 'Demo data restored')) }}>{t('إعادة ضبط', 'Reset')}</button></div></Card>
      <Card title={t('الفريق', 'Team')}>{team.map(u => <div key={u.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}><Avatar name={n(u)} color={u.color} /><div className="grow"><b>{n(u)}</b><div className="dim" dir="ltr" style={{ textAlign: 'start', fontSize: 12.5 }}>{u.email}</div></div><Badge tone={u.role === 'admin' ? 'acc' : ''}>{u.role === 'admin' ? t('مدير', 'Admin') : t('مبيعات', 'Sales')}</Badge><span className="dim num">{money(u.target, lang)}</span></div>)}</Card>
      <Card title={t('قوالب واتساب', 'WhatsApp templates')} style={{ gridColumn: '1/-1' }}>{templates.map(x => <div key={x.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}><Badge tone="acc">{x.k}</Badge> <span className="muted">{x[lang === 'ar' ? 'a' : 'e']}</span></div>)}</Card>
    </div></div>
}
