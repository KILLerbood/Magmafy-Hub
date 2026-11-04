import { useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon, Card, PageHead, Seg, Bars, LineChart, HBar, Badge, Empty, Spark, Avatar } from '../ui.jsx'
import { stageName } from '../data.js'
import { leadStats, clientStats, funnel, sourceRoi, teamPerf, forecastByMonth, alerts, money, short, fmtDate, days } from '../logic.js'
import { DAY } from '../data.js'

export default function Insights() {
  const s = useApp(); const { t, n, lang, widgets, A, go, setUi, sla, leads, events } = s
  const [period, setPeriod] = useState('90'), [drag, setDrag] = useState(null), [over, setOver] = useState(null)
  const st = leadStats(s), cs = clientStats(s), al = alerts(s, sla)
  const inP = l => period === 'all' || Date.now() - l.created < +period * DAY
  const newLeads = leads.filter(inP).length
  const weeks = Array.from({ length: 8 }, (_, i) => { const end = Date.now() - (7 - i) * 7 * DAY; return { end, label: fmtDate(end, lang) } })
  const created = weeks.map(w => leads.filter(l => l.created <= w.end && l.created > w.end - 7 * DAY).length)
  const touches = weeks.map(w => events.filter(e => e.at <= w.end && e.at > w.end - 7 * DAY).length)
  const fn = funnel(leads.filter(inP)), mx = Math.max(...fn.map(x => x.n), 1)
  const fc = forecastByMonth(leads, lang), roi = sourceRoi(leads), tp = teamPerf(s)
  const W = {
    alerts: { title: t('تنبيهات ذكية', 'Smart alerts'), body: <div>{al.slice(0, 7).map((a, i) => <button key={i} className="alert-i" onClick={() => a.type === 'lead' ? setUi({ drawer: a.ref }) : go('client/' + a.ref)}><span className={'sv s' + a.sev}><Icon n={a.k === 'ar' ? 'billing' : a.k === 'risk' ? 'warn' : a.k === 'renew' ? 'cal' : 'flame'} s={16} /></span><span className="grow">{n(a)}</span><Icon n="chev" s={14} cls="flip" /></button>)}{!al.length && <Empty title={t('كل شيء تمام', 'All clear')} />}</div> },
    funnel: { title: t('قمع التحويل', 'Conversion funnel'), body: <div>{fn.map((x, i) => <div className="funnel-row" key={x.stage}><span>{n(stageName[x.stage])}</span><div><div className="funnel-bar" style={{ width: Math.max(8, 100 * x.n / mx) + '%', background: `color-mix(in srgb, var(--accent) ${100 - i * 11}%, var(--line-strong))` }}>{x.n}</div></div><span className="dim">{i ? Math.round(100 * x.n / fn[i - 1].n) + '%' : ''}</span></div>)}<p className="dim" style={{ marginTop: 6, fontSize: 12.5 }}>{t(`التحويل الكلي: ${fn[0].n ? Math.round(100 * fn[5].n / fn[0].n) : 0}%`, `Overall conversion: ${fn[0].n ? Math.round(100 * fn[5].n / fn[0].n) : 0}%`)}</p></div> },
    forecast: { title: t('توقع الإيراد المرجّح', 'Weighted revenue forecast'), body: <div><Bars data={fc.map(f => ({ v: f.v, v2: f.raw }))} h={170} /><div className="row" style={{ justifyContent: 'space-around' }}>{fc.map(f => <div key={f.label} style={{ textAlign: 'center' }}><b>{f.label}</b><div className="dim num" style={{ fontSize: 12 }}>{short(f.v)}</div></div>)}</div><p className="dim" style={{ marginTop: 8, fontSize: 12.5 }}><i style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent)', borderRadius: 3 }} /> {t('مرجّح', 'Weighted')} <i style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--line-strong)', borderRadius: 3, marginInlineStart: 8 }} /> {t('إجمالي', 'Total')}</p></div> },
    source: { title: t('العائد على المصدر (ROI)', 'Source ROI'), body: <div className="scroll-x"><table className="tbl"><thead><tr><th>{t('المصدر', 'Source')}</th><th>{t('عملاء', 'Leads')}</th><th>{t('تحويل', 'Conv.')}</th><th>{t('إيراد', 'Revenue')}</th><th>ROI</th></tr></thead><tbody>{roi.map(r => <tr key={r.key}><td>{n(r.label)}</td><td>{r.leads}</td><td>{r.conv}%</td><td className="num">{short(r.rev)}</td><td>{r.roi == null ? <Badge tone="ok">{t('مجاني', 'Free')}</Badge> : <Badge tone={r.roi > 0 ? 'ok' : 'bad'}>{r.roi > 0 ? '+' : ''}{r.roi}%</Badge>}</td></tr>)}</tbody></table></div> },
    team: { title: t('أداء الفريق مقابل الهدف', 'Team vs. target'), body: <div>{tp.map(x => <div key={x.u.id} style={{ marginBottom: 14 }}><div className="row between"><span className="row"><Avatar name={n(x.u)} color={x.u.color} size={26} /><b>{n(x.u)}</b></span><span className="dim">{t(`${x.calls} تواصل`, `${x.calls} touches`)} · <b style={{ color: x.pct >= 100 ? 'var(--ok)' : 'var(--ink)' }}>{x.pct}%</b></span></div><HBar pct={x.pct} color={x.u.color} h={9} /><div className="dim num" style={{ fontSize: 12, marginTop: 3 }}>{short(x.won)} {t('مغلق', 'won')} + {short(x.pipe)} {t('متوقع', 'forecast')} / {short(x.target)}</div></div>)}</div> },
    trend: { title: t('النشاط الأسبوعي', 'Weekly activity'), body: <LineChart labels={weeks.map(w => w.label)} series={[{ data: created, color: 'var(--accent)' }, { data: touches, color: 'var(--ok)' }]} fmt={v => Math.round(v)} /> },
  }
  const reorder = (from, to) => { if (from !== to && from >= 0 && to >= 0) A.moveWidget(from, to) }
  const K = [[t('قيمة المسار المفتوح', 'Open pipeline'), money(st.pipeline, lang), t(`${st.open.length} صفقة`, `${st.open.length} deals`)], [t('توقع مرجّح', 'Weighted forecast'), money(st.weighted, lang), ''], [t('نسبة الفوز', 'Win rate'), st.winRate + '%', t(`${st.won.length} فوز / ${st.lost.length} خسارة`, `${st.won.length} won / ${st.lost.length} lost`)], [t('متوسط أول رد', 'Avg first response'), st.avgResp.toFixed(1) + (lang === 'ar' ? ' س' : 'h'), t(`الهدف ${sla} س`, `SLA ${sla}h`)], [t('عملاء جدد', 'New leads'), newLeads, ''], [t('دورة البيع', 'Sales cycle'), st.cycle + (lang === 'ar' ? ' يوم' : 'd'), ''], ['MRR', money(cs.mrr, lang), t(`معرّض ${short(cs.riskMrr)}`, `${short(cs.riskMrr)} at risk`)], [t('متأخرات', 'Overdue AR'), money(cs.overdueSum, lang), t(`${cs.overdue.length} فواتير`, `${cs.overdue.length} invoices`)]]
  return <div>
    <PageHead title={t('التحليلات', 'Analytics')} sub={t('صورة الفريق كله في صفحة. رتّب الكروت بالسحب أو بالأسهم.', 'The whole team on one page. Reorder cards by dragging or with the arrows.')}>
      <Seg value={period} onChange={setPeriod} options={[{ v: '30', l: t('30 يوم', '30d') }, { v: '90', l: t('90 يوم', '90d') }, { v: 'all', l: t('الكل', 'All') }]} /></PageHead>
    <div className="grid g4" style={{ marginBottom: 16 }}>{K.map(([k, v, sub]) => <Card cls="kpi" key={k}><small>{k}</small><b>{v}</b><span className="sub">{sub || ' '}</span></Card>)}</div>
    <div className="grid g2">{widgets.map((w, i) => <div key={w} className={'widget' + (drag === i ? ' dragging' : '') + (over === i && drag !== i ? ' over' : '')} onDragOver={e => { e.preventDefault(); setOver(i) }} onDrop={() => { reorder(drag, i); setDrag(null); setOver(null) }}>
      <Card title={<span className="row"><span className="grip" draggable onDragStart={() => setDrag(i)} onDragEnd={() => { setDrag(null); setOver(null) }} title="drag"><Icon n="grip" s={16} /></span>{W[w].title}</span>} action={<span className="row" style={{ gap: 0 }}><button className="icon-btn" aria-label="move up" disabled={i === 0} onClick={() => reorder(i, i - 1)}><Icon n="up" s={15} /></button><button className="icon-btn" aria-label="move down" disabled={i === widgets.length - 1} onClick={() => reorder(i, i + 1)}><Icon n="down" s={15} /></button></span>}>{W[w].body}</Card></div>)}</div>
  </div>
}
