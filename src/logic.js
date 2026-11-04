import { DAY, stageW, stages, sources, team } from './data.js'
export const isOpen = l => l.stage !== 'won' && l.stage !== 'lost'
export const days = (ts, now = Date.now()) => Math.floor((now - ts) / DAY)
export const startOfDay = (ts = Date.now()) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime() }
export const uid = p => p + Math.random().toString(36).slice(2, 8)

// Priority score for the daily call queue, with human readable reasons.
export function scoreLead(l, now = Date.now()) {
  const r = []
  const add = (pts, a, e) => pts && r.push({ pts, a, e })
  const today = startOfDay(now)
  if (l.next && l.next < today + DAY) {
    if (l.next >= today) add(35, 'متابعة مجدولة اليوم', 'Follow-up scheduled today')
    else add(Math.min(40, 20 + days(l.next, today) * 5), `متأخرة ${days(l.next, today)} يوم`, `${days(l.next, today)} day${days(l.next, today) > 1 ? 's' : ''} overdue`)
  }
  if (l.stage === 'new' && !l.attempts) { const d = days(l.created, now); add(18 + Math.min(d, 8), d ? `عميل جديد منتظر ${d} يوم` : 'عميل جديد وصل اليوم', d ? `New lead waiting ${d} day${d > 1 ? 's' : ''}` : 'New lead arrived today') }
  if (l.hot) add(18, 'مهتم جدًا', 'High interest')
  add(Math.round(stageW[l.stage] * 20), 'مرحلة متقدمة', 'Late stage')
  add(Math.min(15, Math.round(l.value / 10000)), 'قيمة صفقة عالية', 'High deal value')
  const quiet = days(l.last, now); if (quiet >= 5) add(Math.min(14, quiet), `ما اتواصلناش من ${quiet} يوم`, `No touch for ${quiet} days`)
  if (l.close && l.close - now < 8 * DAY) add(10, 'إغلاق قريب', 'Closing soon')
  return { score: r.reduce((s, x) => s + x.pts, 0), reasons: r.sort((a, b) => b.pts - a.pts) }
}
export function buildQueue(leads, now = Date.now()) {
  const today = startOfDay(now)
  return leads.filter(isOpen)
    .filter(l => (l.next && l.next < today + DAY) || (l.stage === 'new' && !l.attempts) || l.hot)
    .map(l => ({ lead: l, ...scoreLead(l, now) })).sort((a, b) => b.score - a.score)
}
export function nextAction(l) {
  const A = (a, e, key) => ({ a, e, key })
  if (l.stage === 'new') return A('اتصل أول مرة وسجّل احتياجه', 'Make the first call and capture needs', 'call')
  if (l.stage === 'contacted') return A('حدّد موعد اجتماع تعريفي', 'Book an intro meeting', 'meeting')
  if (l.stage === 'meeting') return A('حضّر للاجتماع وابعت تذكير على واتساب', 'Prepare for the meeting and send a WhatsApp reminder', 'whatsapp')
  if (l.stage === 'proposal') return A('تابع العرض واسأل عن القرار', 'Follow up on the proposal and ask for a decision', 'call')
  if (l.stage === 'negotiation') return A('اقفل الشروط وجهّز العقد', 'Close the terms and prepare the contract', 'call')
  return A('تابع', 'Follow up', 'call')
}
export const fillTpl = (tpl, lang, { name, co, me }) => tpl[lang === 'ar' ? 'a' : 'e'].replace('{name}', name).replace('{co}', co).replace('{me}', me)

export function leadStats(s, now = Date.now()) {
  const open = s.leads.filter(isOpen), won = s.leads.filter(l => l.stage === 'won'), lost = s.leads.filter(l => l.stage === 'lost')
  const pipeline = open.reduce((a, l) => a + l.value, 0)
  const weighted = open.reduce((a, l) => a + l.value * stageW[l.stage], 0)
  const winRate = won.length + lost.length ? Math.round(100 * won.length / (won.length + lost.length)) : 0
  const resp = s.leads.map(l => l.firstResp).filter(x => x != null)
  const avgResp = resp.length ? resp.reduce((a, b) => a + b, 0) / resp.length : 0
  const cycle = won.length ? Math.round(won.reduce((a, l) => a + (l.last - l.created) / DAY, 0) / won.length) : 0
  return { open, won, lost, pipeline, weighted, winRate, avgResp, cycle }
}
export function clientStats(s, now = Date.now()) {
  const mrr = s.clients.reduce((a, c) => a + c.mrr, 0)
  const risk = s.clients.filter(c => c.health < 55)
  const renew = s.clients.filter(c => c.renewal - now < 60 * DAY)
  const overdue = s.bills.filter(b => billState(b, now) === 'overdue')
  return { mrr, risk, riskMrr: risk.reduce((a, c) => a + c.mrr, 0), renew, upsell: s.clients.filter(c => c.upsell), overdue, overdueSum: overdue.reduce((a, b) => a + b.amount, 0) }
}
export function billState(b, now = Date.now()) { if (b.stage === 'invoice') return b.due < startOfDay(now) ? 'overdue' : 'open'; return b.stage }
export function relationship(c, events, now = Date.now()) {
  const ev = events.filter(e => e.ref === c.id)
  const recent = ev.filter(e => now - e.at < 30 * DAY).length
  const last = ev.length ? Math.min(...ev.map(e => days(e.at, now))) : 99
  const multi = Math.min(c.contacts.length, 3) * 8
  const score = Math.max(5, Math.min(100, Math.round(c.health * .5 + recent * 6 + multi - Math.min(last, 30) * .6)))
  return { score, recent, last }
}
export function funnel(leads) {
  const idx = s => stages.indexOf(s)
  const reached = st => leads.filter(l => l.stage === 'lost' ? false : idx(l.stage) >= idx(st)).length + (st === 'new' ? leads.filter(l => l.stage === 'lost').length : 0)
  return ['new', 'contacted', 'meeting', 'proposal', 'negotiation', 'won'].map(st => ({ stage: st, n: reached(st) }))
}
export function sourceRoi(leads) {
  return Object.entries(sources).map(([k, v]) => {
    const ls = leads.filter(l => l.source === k), won = ls.filter(l => l.stage === 'won'), rev = won.reduce((a, l) => a + l.value, 0)
    return { key: k, label: v, leads: ls.length, won: won.length, rev, spend: v.spend, roi: v.spend ? Math.round(100 * (rev - v.spend) / v.spend) : null, conv: ls.length ? Math.round(100 * won.length / ls.length) : 0 }
  }).sort((a, b) => b.rev - a.rev)
}
export function teamPerf(s) {
  return team.map(u => {
    const mine = s.leads.filter(l => l.owner === u.id), won = mine.filter(l => l.stage === 'won').reduce((a, l) => a + l.value, 0)
    const pipe = mine.filter(isOpen).reduce((a, l) => a + l.value * stageW[l.stage], 0)
    const calls = s.events.filter(e => e.by === u.id && (e.type === 'call' || e.type === 'whatsapp' || e.type === 'meeting')).length
    return { u, won, pipe, calls, target: u.target, pct: Math.round(100 * (won + pipe * .5) / u.target) }
  })
}
export function forecastByMonth(leads, lang, now = Date.now()) {
  const out = []
  for (let i = 0; i < 4; i++) { const d = new Date(now); d.setMonth(d.getMonth() + i, 1); out.push({ m: d.getMonth(), y: d.getFullYear(), v: 0, raw: 0, label: d.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { month: 'short' }) }) }
  leads.filter(isOpen).forEach(l => { const d = new Date(l.close); const b = out.find(o => o.m === d.getMonth() && o.y === d.getFullYear()) || (l.close < now ? out[0] : null); if (b) { b.v += l.value * stageW[l.stage]; b.raw += l.value } })
  return out
}
export function alerts(s, sla, now = Date.now()) {
  const A = []
  s.leads.filter(l => l.stage === 'new' && !l.attempts && (now - l.created) / 3600000 > sla).forEach(l => A.push({ k: 'sla', ref: l.id, type: 'lead', sev: 3, a: `${l.co.a}: تخطى مهلة أول رد (${sla} س)`, e: `${l.co.e}: breached first-response SLA (${sla}h)` }))
  s.leads.filter(l => isOpen(l) && l.stage !== 'new' && days(l.last, now) >= 7).forEach(l => A.push({ k: 'stale', ref: l.id, type: 'lead', sev: 2, a: `${l.co.a}: واقفة منذ ${days(l.last, now)} يوم`, e: `${l.co.e}: stalled for ${days(l.last, now)} days` }))
  s.bills.filter(b => billState(b, now) === 'overdue').forEach(b => { const c = s.clients.find(c => c.id === b.client); A.push({ k: 'ar', ref: b.client, type: 'client', sev: 3, a: `فاتورة ${c.co.a} متأخرة ${days(b.due, now)} يوم`, e: `${c.co.e}: invoice ${days(b.due, now)} days overdue` }) })
  s.clients.filter(c => c.health < 55).forEach(c => A.push({ k: 'risk', ref: c.id, type: 'client', sev: 2, a: `${c.co.a}: خطر انسحاب (صحة ${c.health})`, e: `${c.co.e}: churn risk (health ${c.health})` }))
  s.clients.filter(c => c.renewal - now < 45 * DAY).forEach(c => A.push({ k: 'renew', ref: c.id, type: 'client', sev: 1, a: `تجديد ${c.co.a} بعد ${Math.max(0, Math.round((c.renewal - now) / DAY))} يوم`, e: `${c.co.e} renews in ${Math.max(0, Math.round((c.renewal - now) / DAY))} days` }))
  return A.sort((a, b) => b.sev - a.sev)
}
// ---- Automation rules: pure matchers, executed on mock data -----
export function ruleMatches(rule, s, now = Date.now()) {
  switch (rule.trigger) {
    case 'noReply': return s.leads.filter(l => l.stage === 'new' && !l.attempts && days(l.created, now) >= rule.days).map(l => ({ t: 'lead', id: l.id }))
    case 'stale': return s.leads.filter(l => isOpen(l) && l.stage !== 'new' && days(l.last, now) >= rule.days).map(l => ({ t: 'lead', id: l.id }))
    case 'overdue': return s.bills.filter(b => billState(b, now) === 'overdue' && days(b.due, now) >= rule.days).map(b => ({ t: 'bill', id: b.id }))
    case 'won': return s.leads.filter(l => l.stage === 'won' && !s.clients.some(c => c.leadId === l.id)).map(l => ({ t: 'lead', id: l.id }))
    case 'renewal': return s.clients.filter(c => c.renewal - now < rule.days * DAY).map(c => ({ t: 'client', id: c.id }))
    default: return []
  }
}
export const triggerLabels = {
  noReply: { a: 'عميل جديد بدون تواصل لمدة', e: 'New lead untouched for' }, stale: { a: 'صفقة واقفة لمدة', e: 'Deal stalled for' },
  overdue: { a: 'فاتورة متأخرة لمدة', e: 'Invoice overdue by' }, won: { a: 'تم الفوز بصفقة', e: 'A deal is won' }, renewal: { a: 'تجديد خلال', e: 'Renewal within' },
}
export const actionLabels = {
  task: { a: 'أنشئ مهمة متابعة', e: 'Create a follow-up task' }, hot: { a: 'علّم "تحتاج اهتمام"', e: 'Flag as needs-attention' },
  remind: { a: 'أرسل تذكير للعميل', e: 'Send a client reminder' }, onboard: { a: 'ابدأ قائمة الانطلاق', e: 'Start onboarding checklist' },
}
export const money = (n, lang) => Math.round(n).toLocaleString('en-US') + (lang === 'ar' ? ' ر.س' : ' SAR')
export const short = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + Math.round(n)
export const fmtDate = (ts, lang, o = { day: 'numeric', month: 'short' }) => new Date(ts).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', o)
export const ago = (ts, lang, now = Date.now()) => { const d = days(ts, now); if (d <= 0) return lang === 'ar' ? 'اليوم' : 'Today'; if (d === 1) return lang === 'ar' ? 'أمس' : 'Yesterday'; return lang === 'ar' ? `منذ ${d} يوم` : `${d}d ago` }
export const initials = s => (s || '?').split(' ').map(w => w[0]).slice(0, 2).join('')
