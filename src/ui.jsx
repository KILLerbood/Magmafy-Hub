import { useEffect, useRef, useState } from 'react'
import { useApp } from './store.jsx'
import { initials, short } from './logic.js'

const P = {
  today: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 100 8 4 4 0 000-8z', leads: 'M3 5h18l-7 8v6l-4 2v-8L3 5z', pipeline: 'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v6h-4z',
  clients: 'M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z', billing: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6', insights: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  auto: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z', tasks: 'M9 11l3 3 8-8M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h9', settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8.500 4 8l-1 3 2 1v2l-2 1 1 3 2-.5L7.500 19l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.500-1.500 2 .5 1-3-2-1v-2z',
  phone: 'M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z', wa: 'M3 21l1.500-5A9 9 0 1112 21a9 9 0 01-4-1l-5 1zM9 9c0 3 3 6 6 6l1-2-2-1-1 .5a4 4 0 01-2-2l.5-1-1-2-1.500.5z',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5', plus: 'M12 5v14M5 12h14', check: 'M5 12l5 5 9-10', x: 'M6 6l12 12M18 6L6 18', bell: 'M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4',
  moon: 'M20 14A8 8 0 0110 4a8 8 0 1010 10z', sun: 'M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2', help: 'M9 9a3 3 0 115 2c-1 1-2 1.500-2 3M12 18h.01M12 3a9 9 0 100 18 9 9 0 000-18z',
  skip: 'M5 5l9 7-9 7V5zM18 5v14', mail: 'M3 6h18v12H3zM3 7l9 7 9-7', cal: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4', chev: 'M9 6l6 6-6 6', down: 'M6 9l6 6 6-6', up: 'M6 15l6-6 6 6', menu: 'M4 7h16M4 12h16M4 17h16',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14', upload: 'M12 16V5M7 9l5-5 5 5M5 20h14', note: 'M5 3h10l4 4v14H5zM8 12h8M8 16h5', flame: 'M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z',
  warn: 'M12 3l10 18H2L12 3zM12 10v5M12 18h.01', trend: 'M3 17l6-6 4 4 8-8M15 7h6v6', undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3', grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  merge: 'M6 4v6a4 4 0 004 4h4M18 4v6M14 10l4 4 4-4M6 20v-2', out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11', user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0', sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z', bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
}
export const Icon = ({ n, s = 18, cls = '' }) => <svg className={'ic ' + cls} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n] || P.help} /></svg>

export const Avatar = ({ name, color = '#4F46E5', size = 32 }) => <span className="avatar" style={{ width: size, height: size, background: color + '22', color, fontSize: size * .38 }}>{initials(name)}</span>
export const Badge = ({ tone = 'gray', children }) => <span className={'badge ' + tone}>{children}</span>
export const Card = ({ title, action, children, cls = '', ...r }) => <section className={'card ' + cls} {...r}>{(title || action) && <header className="card-h"><h3>{title}</h3>{action}</header>}{children}</section>
export const Empty = ({ icon = 'check', title, hint }) => <div className="empty"><Icon n={icon} s={28} /><b>{title}</b>{hint && <p>{hint}</p>}</div>
export const PageHead = ({ title, sub, children }) => <div className="page-head"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div><div className="head-actions">{children}</div></div>

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return <div className="scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon n="x" /></button></header><div className="modal-b">{children}</div></div></div>
}
export function Drawer({ title, onClose, children }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return <div className="scrim drawer-scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}><aside className="drawer" role="dialog" aria-label={title}><header><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon n="x" /></button></header><div className="drawer-b">{children}</div></aside></div>
}
export const Field = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>

export function Ring({ pct, size = 64, stroke = 7, color = 'var(--accent)', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct))
  return <div className="ring" style={{ width: size, height: size }}><svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} /><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} style={{ transition: 'stroke-dashoffset .5s' }} /></svg><span>{children}</span></div>
}
export const healthColor = h => (h >= 75 ? 'var(--ok)' : h >= 55 ? 'var(--warn)' : 'var(--bad)')
export const Spark = ({ data, w = 90, h = 28, color = 'var(--accent)' }) => {
  const mx = Math.max(...data), mn = Math.min(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - mn) / rng) * (h - 6)])
  return <svg width={w} height={h} className="spark"><polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
}
export function Bars({ data, h = 160, fmt = short, colors }) { // data [{label,v,v2}]
  const mx = Math.max(...data.map(d => Math.max(d.v, d.v2 || 0)), 1), w = 100 / data.length
  return <svg viewBox={`0 0 100 ${h / 2}`} preserveAspectRatio="none" className="bars" style={{ height: h }} role="img">
    {data.map((d, i) => { const bh = (d.v / mx) * (h / 2 - 14); const bh2 = d.v2 ? (d.v2 / mx) * (h / 2 - 14) : 0; return <g key={i}>
      {d.v2 != null && <rect x={i * w + w * .12} y={h / 2 - 8 - bh2} width={w * .76} height={bh2} rx="1.5" fill="var(--line-strong)" />}
      <rect x={i * w + w * .22} y={h / 2 - 8 - bh} width={w * .56} height={bh} rx="1.5" fill={colors?.[i] || 'var(--accent)'} /></g> })}
  </svg>
}
export function HBar({ pct, color = 'var(--accent)', h = 8 }) { return <div className="hbar" style={{ height: h }}><i style={{ width: Math.min(100, pct) + '%', background: color }} /></div> }
export function LineChart({ series, labels, h = 180, fmt = short }) { // series [{data,color,name}]
  const W = 400, H = h, pad = 22, all = series.flatMap(s => s.data), mx = Math.max(...all, 1)
  const X = i => pad + (i / (labels.length - 1)) * (W - pad * 2), Y = v => H - 22 - (v / mx) * (H - 44)
  return <svg viewBox={`0 0 ${W} ${H}`} className="line" role="img">
    {[0, .5, 1].map(g => <g key={g}><line x1={pad} x2={W - pad} y1={Y(mx * g)} y2={Y(mx * g)} stroke="var(--line)" /><text x={pad - 4} y={Y(mx * g) + 3} textAnchor="end" className="ax">{fmt(mx * g)}</text></g>)}
    {series.map((s, k) => <g key={k}><path d={`M${s.data.map((v, i) => X(i) + ',' + Y(v)).join('L')}L${X(s.data.length - 1)},${H - 22}L${X(0)},${H - 22}Z`} fill={s.color} opacity=".08" /><polyline points={s.data.map((v, i) => X(i) + ',' + Y(v)).join(' ')} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />{s.data.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r="3" fill="var(--card)" stroke={s.color} strokeWidth="2" />)}</g>)}
    {labels.map((l, i) => <text key={i} x={X(i)} y={H - 6} textAnchor="middle" className="ax">{l}</text>)}
  </svg>
}
export function Donut({ parts, size = 130, center }) {
  const tot = parts.reduce((a, p) => a + p.v, 0) || 1, r = 48, c = 2 * Math.PI * r; let off = 0
  return <div className="donut" style={{ width: size, height: size }}><svg viewBox="0 0 120 120" width={size} height={size}><g style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}>{parts.map((p, i) => { const len = (p.v / tot) * c; const el = <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={p.color} strokeWidth="14" strokeDasharray={`${Math.max(len - 2, 0)} ${c}`} strokeDashoffset={-off} />; off += len; return el })}</g></svg><span>{center}</span></div>
}
export function useKeys(map, deps = []) {
  const ref = useRef(map); ref.current = map
  useEffect(() => {
    const h = e => {
      const tag = e.target.tagName; if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable || e.ctrlKey || e.metaKey || e.altKey) return
      const f = ref.current[e.key.toLowerCase()]; if (f) { e.preventDefault(); f(e) }
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, deps) // eslint-disable-line
}
export function Select({ value, onChange, options, cls = '' }) { return <select className={'sel ' + cls} value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select> }
export function Seg({ value, onChange, options }) { return <div className="seg" role="tablist">{options.map(o => <button key={o.v} role="tab" aria-selected={value === o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.l}</button>)}</div> }
export function useToggleSet() { const [s, set] = useState(new Set()); return [s, id => set(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n }), set] }
export const Mention = ({ text }) => { const { users } = {}; return text.split(/(@[\p{L}]+)/u).map((p, i) => p.startsWith('@') ? <span key={i} className="mention">{p}</span> : p) }
