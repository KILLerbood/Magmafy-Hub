import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { seedLeads, seedClients, seedBills, seedTasks, seedRules, seedEvents, templates, team, DAY, stageName } from './data.js'
import { uid, startOfDay, ruleMatches, actionLabels, triggerLabels } from './logic.js'

const KEY = 'magmafy-hub.v1'
const fresh = () => ({ leads: seedLeads(), clients: seedClients(), bills: seedBills(), tasks: seedTasks(), rules: seedRules(), events: seedEvents(), templates,
  done: {}, fired: {}, runLog: [], sla: 4, widgets: ['alerts', 'funnel', 'forecast', 'source', 'team', 'trend'], views: [], history: [] })
const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.leads && s.v === 1) return s } catch { /* ignore */ } return null }
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function Provider({ children }) {
  const [data, setData] = useState(() => load() || { v: 1, ...fresh() })
  const [ui, setUi] = useState(() => {
    let p = {}; try { p = JSON.parse(localStorage.getItem(KEY + '.ui')) || {} } catch { /* ignore */ }
    return { lang: p.lang || (navigator.language?.startsWith('ar') ? 'ar' : 'en'), theme: p.theme || 'light', session: p.session || null, guide: false }
  })
  const [toast, setToast] = useState(null)
  const lang = ui.lang
  useEffect(() => { try { localStorage.setItem(KEY + '.ui', JSON.stringify({ lang: ui.lang, theme: ui.theme, session: ui.session })) } catch { /* ignore */ } }, [ui.lang, ui.theme, ui.session])
  useEffect(() => { const d = document.documentElement; d.lang = lang; d.dir = lang === 'ar' ? 'rtl' : 'ltr'; d.dataset.theme = ui.theme }, [lang, ui.theme])
  const t = useCallback((a, e) => (lang === 'ar' ? a : e), [lang])
  const n = useCallback(o => (o == null ? '' : typeof o === 'string' ? o : o[lang === 'ar' ? 'a' : 'e']), [lang])
  const mut = useCallback(fn => setData(s => { const d = structuredClone(s); fn(d); try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* ignore */ } return d }), [])
  const say = useCallback((msg, undo) => { setToast({ msg, undo, id: Date.now() }) }, [])
  useEffect(() => { if (!toast) return; const h = setTimeout(() => setToast(null), toast.undo ? 7000 : 3200); return () => clearTimeout(h) }, [toast])
  const me = team.find(u => u.id === ui.session?.id) || team[0]

  const A = useMemo(() => {
    const ev = (d, ref, type, text, by) => d.events.unshift({ id: uid('e'), ref, type, text: typeof text === 'string' ? { a: text, e: text } : text, at: Date.now(), by: by || ui.session?.id || 'u1' })
    const snapshot = d => { d.history.push(JSON.stringify({ leads: d.leads, done: d.done, events: d.events, tasks: d.tasks })); if (d.history.length > 20) d.history.shift() }
    return {
      ev,
      logOutcome(id, outcome, nextDays) {
        mut(d => {
          snapshot(d); const l = d.leads.find(x => x.id === id); if (!l) return
          const O = { answered: ['call', 'تم الرد ومكالمة ناجحة', 'Answered, productive call'], noanswer: ['call', 'اتصلنا ولا رد', 'Called, no answer'], interested: ['call', 'مهتم ويريد الخطوة التالية', 'Interested, wants next step'], meeting: ['meeting', 'تم حجز اجتماع', 'Meeting booked'], notnow: ['note', 'مش دلوقتي: مؤجل', 'Not now: snoozed'], lost: ['stage', 'خسارة: غير مهتم', 'Lost: not interested'], whatsapp: ['whatsapp', 'أرسلنا رسالة واتساب', 'WhatsApp message sent'] }[outcome]
          ev(d, id, O[0], { a: O[1], e: O[2] }); l.last = Date.now(); l.attempts = (l.attempts || 0) + 1
          if (l.firstResp == null) l.firstResp = Math.max(0.3, +((Date.now() - l.created) / 3600000).toFixed(1)) > 72 ? 8 : Math.max(0.3, +((Date.now() - l.created) / 3600000).toFixed(1))
          if (outcome === 'lost') { l.stage = 'lost'; l.next = null }
          else {
            if (outcome === 'meeting' && ['new', 'contacted'].includes(l.stage)) l.stage = 'meeting'
            else if (outcome === 'interested') { l.hot = true; if (l.stage === 'new') l.stage = 'contacted' }
            else if (outcome === 'answered' && l.stage === 'new') l.stage = 'contacted'
            l.next = startOfDay() + (nextDays ?? 1) * DAY + 10 * 3600000
          }
          d.done[id] = outcome
        })
      },
      undo() { mut(d => { const h = d.history.pop(); if (!h) return; const p = JSON.parse(h); Object.assign(d, p) }) },
      setStage(id, stage) {
        mut(d => {
          const l = d.leads.find(x => x.id === id); if (!l || l.stage === stage) return
          l.stage = stage; ev(d, id, 'stage', { a: 'انتقل إلى ' + stageName[stage].a, e: 'Moved to ' + stageName[stage].e })
          if (stage === 'won') { d.rules.filter(r => r.on && r.trigger === 'won').forEach(() => A_createClient(d, l)) }
        })
      },
      updateLead(id, patch) { mut(d => { Object.assign(d.leads.find(x => x.id === id), patch) }) },
      addLead(o) { const id = uid('l'); mut(d => { d.leads.unshift({ id, co: { a: o.co, e: o.co }, contact: { a: o.contact || o.co, e: o.contact || o.co }, value: +o.value || 0, stage: 'new', owner: o.owner || ui.session?.id || 'u1', source: o.source || 'website', created: Date.now(), last: Date.now(), next: Date.now(), hot: false, close: Date.now() + 30 * DAY, phone: o.phone || '', email: o.email || '', attempts: 0, tags: [], firstResp: null }); ev(d, id, 'note', 'تمت إضافة العميل المحتمل', 'Lead added') }); return id },
      bulk(ids, patch) { mut(d => { d.leads.forEach(l => { if (ids.includes(l.id)) Object.assign(l, patch) }) }) },
      removeLeads(ids) { mut(d => { d.leads = d.leads.filter(l => !ids.includes(l.id)) }) },
      importLeads(rows) { mut(d => { rows.forEach(r => d.leads.unshift({ id: uid('l'), co: { a: r.co, e: r.co }, contact: { a: r.contact || r.co, e: r.contact || r.co }, value: +r.value || 0, stage: 'new', owner: ui.session?.id || 'u1', source: 'website', created: Date.now(), last: Date.now(), next: Date.now(), hot: false, close: Date.now() + 30 * DAY, phone: r.phone || '', email: r.email || '', attempts: 0, tags: [], firstResp: null })) }) },
      merge(keepId, dropId) { mut(d => { const k = d.leads.find(l => l.id === keepId), x = d.leads.find(l => l.id === dropId); if (!k || !x) return; k.value = Math.max(k.value, x.value); k.phone = k.phone || x.phone; k.email = k.email || x.email; d.events.forEach(e => { if (e.ref === dropId) e.ref = keepId }); d.leads = d.leads.filter(l => l.id !== dropId); ev(d, keepId, 'note', 'تم دمج سجل مكرر', 'Merged a duplicate record') }) },
      saveView(v) { mut(d => { d.views.push({ id: uid('v'), ...v }) }) },
      delView(id) { mut(d => { d.views = d.views.filter(v => v.id !== id) }) },
      log(ref, type, text) { mut(d => { ev(d, ref, type, text); const l = d.leads.find(x => x.id === ref); if (l) { l.last = Date.now() } }) },
      addTask(title, ref, dueDays = 0) { mut(d => { d.tasks.unshift({ id: uid('t'), title: { a: title, e: title }, ref: ref || null, due: startOfDay() + dueDays * DAY, owner: ui.session?.id || 'u1', done: false }) }) },
      toggleTask(id) { mut(d => { const t = d.tasks.find(x => x.id === id); t.done = !t.done }) },
      advanceBill(id) { mut(d => { const b = d.bills.find(x => x.id === id), o = ['quote', 'contract', 'invoice', 'paid']; const i = o.indexOf(b.stage); if (i < 3) { b.stage = o[i + 1]; if (b.stage === 'invoice') b.due = Date.now() + 14 * DAY; ev(d, b.client, b.stage === 'paid' ? 'payment' : 'quote', { a: { contract: 'تم توقيع العقد', invoice: 'صدرت الفاتورة', paid: 'تم استلام الدفعة' }[b.stage] + ' · ' + b.title.a, e: { contract: 'Contract signed', invoice: 'Invoice issued', paid: 'Payment received' }[b.stage] + ' · ' + b.title.e }) } }) },
      remind(id, tplId) { mut(d => { const b = d.bills.find(x => x.id === id); b.reminders++; ev(d, b.client, 'whatsapp', { a: 'أُرسل تذكير بالفاتورة (' + b.title.a + ')', e: 'Invoice reminder sent (' + b.title.e + ')' }) }) },
      addBill(o) { mut(d => { d.bills.unshift({ id: uid('b'), client: o.client, title: { a: o.title, e: o.title }, amount: +o.amount || 0, stage: 'quote', due: Date.now() + 14 * DAY, reminders: 0 }); ev(d, o.client, 'quote', 'تم إنشاء عرض سعر جديد: ' + o.title, 'New quote created: ' + o.title) }) },
      toggleOnboard(cid, i) { mut(d => { const c = d.clients.find(x => x.id === cid); c.onboarding[i] = !c.onboarding[i] }) },
      toggleRule(id) { mut(d => { const r = d.rules.find(x => x.id === id); r.on = !r.on }) },
      addRule(r) { mut(d => { d.rules.push({ id: uid('r'), on: true, ...r, text: { a: triggerLabels[r.trigger].a + ' ' + r.days + ' → ' + actionLabels[r.action].a, e: triggerLabels[r.trigger].e + ' ' + r.days + ' → ' + actionLabels[r.action].e } }) }) },
      delRule(id) { mut(d => { d.rules = d.rules.filter(r => r.id !== id) }) },
      setSla(v) { mut(d => { d.sla = v }) },
      moveWidget(from, to) { mut(d => { const [w] = d.widgets.splice(from, 1); d.widgets.splice(to, 0, w) }) },
      runRules() {
        let count = 0
        mut(d => {
          d.rules.filter(r => r.on).forEach(r => {
            ruleMatches(r, d).forEach(m => {
              const key = r.id + ':' + m.id; if (d.fired[key]) return; d.fired[key] = 1; count++
              let ent = m.t === 'lead' ? d.leads.find(l => l.id === m.id) : m.t === 'client' ? d.clients.find(c => c.id === m.id) : d.bills.find(b => b.id === m.id)
              const label = m.t === 'bill' ? d.clients.find(c => c.id === ent.client).co : ent.co
              if (r.action === 'task') d.tasks.unshift({ id: uid('t'), title: { a: (m.t === 'client' ? 'تجديد: ' : 'متابعة: ') + label.a, e: (m.t === 'client' ? 'Renewal: ' : 'Follow up: ') + label.e }, ref: m.t === 'bill' ? ent.client : m.id, due: startOfDay(), owner: ent.owner || 'u1', done: false })
              if (r.action === 'hot') ent.hot = true
              if (r.action === 'remind') { ent.reminders = (ent.reminders || 0) + 1; ev(d, ent.client, 'whatsapp', { a: 'تذكير تلقائي بالفاتورة', e: 'Automatic invoice reminder' }, 'auto') }
              if (r.action === 'onboard') A_createClient(d, ent)
              d.runLog.unshift({ id: uid('x'), at: Date.now(), rule: r.id, ruleText: r.text, target: label, action: r.action })
            })
          })
          d.runLog = d.runLog.slice(0, 40)
        })
        return count
      },
      reset() { const f = { v: 1, ...fresh() }; setData(f); try { localStorage.setItem(KEY, JSON.stringify(f)) } catch { /* ignore */ } },
    }
    function A_createClient(d, l) {
      if (d.clients.some(c => c.leadId === l.id)) return
      const s = seedClients()[0]
      d.clients.unshift({ ...s, id: uid('c'), co: l.co, owner: l.owner, mrr: Math.round(l.value / 4), plan: 'Starter', health: 70, leadId: l.id, onboarding: [false, false, false, false, false], renewal: Date.now() + 365 * DAY, since: Date.now(), contacts: [{ a: l.contact.a, e: l.contact.e, role: 'جهة الاتصال', infl: 3, ph: l.phone }], projects: s.projects.map(p => ({ ...p, pct: 0 })), upsell: false })
      ev(d, l.id, 'note', 'تم تحويل الصفقة إلى عميل', 'Deal converted to a client')
    }
  }, [mut, ui.session])

  const value = { ...data, ...ui, lang, t, n, mut, A, me, say, toast, setToast, go: p => { location.hash = p }, setUi: p => setUi(u => ({ ...u, ...p })) }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
