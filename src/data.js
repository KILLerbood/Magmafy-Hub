// Seed data for the mock demo. All offsets are in days relative to "now".
export const DAY = 86400000
export const stages = ['new', 'contacted', 'meeting', 'proposal', 'negotiation', 'won', 'lost']
export const stageW = { new: .08, contacted: .2, meeting: .4, proposal: .6, negotiation: .8, won: 1, lost: 0 }
export const stageName = {
  new: { a: 'جديد', e: 'New' }, contacted: { a: 'تم التواصل', e: 'Contacted' }, meeting: { a: 'اجتماع', e: 'Meeting' },
  proposal: { a: 'عرض سعر', e: 'Proposal' }, negotiation: { a: 'تفاوض', e: 'Negotiation' }, won: { a: 'تم الفوز', e: 'Won' }, lost: { a: 'خسارة', e: 'Lost' },
}
export const sources = {
  referral: { a: 'ترشيح', e: 'Referral', spend: 0 }, instagram: { a: 'انستجرام', e: 'Instagram', spend: 14000 },
  google: { a: 'إعلانات جوجل', e: 'Google Ads', spend: 22000 }, linkedin: { a: 'لينكدإن', e: 'LinkedIn', spend: 9000 },
  event: { a: 'فعالية', e: 'Event', spend: 12000 }, website: { a: 'الموقع', e: 'Website', spend: 3000 },
}
export const team = [
  { id: 'u1', a: 'عبد الله', e: 'Abdullah', email: 'abdallah@magmafy.com', role: 'admin', target: 220000, color: '#4F46E5' },
  { id: 'u2', a: 'نور حسن', e: 'Nour Hassan', email: 'nour@magmafy.com', role: 'sales', target: 160000, color: '#0E9F6E' },
  { id: 'u3', a: 'يوسف العتيبي', e: 'Youssef Al-Otaibi', email: 'youssef@magmafy.com', role: 'sales', target: 150000, color: '#D97706' },
  { id: 'u4', a: 'نورة الشهري', e: 'Noura Al-Shehri', email: 'noura@magmafy.com', role: 'sales', target: 140000, color: '#DB2777' },
]
const P = (a, e, role, infl, ph) => ({ a, e, role, infl, ph })
// [id, company, contact, value, stage, owner, source, createdAgo, lastAgo, nextIn, hot, closeInDays, phone]
const L = [
  ['l1', ['مطابخ الأناقة', 'Elegance Kitchens'], ['سلطان الحربي', 'Sultan Al-Harbi'], 60000, 'meeting', 'u1', 'referral', 20, 3, 0, 1, 14, '+966524237717'],
  ['l2', ['معرض النخيل للأثاث', 'Nakheel Furniture'], ['ماجد الدوسري', 'Majed Al-Dosari'], 85000, 'proposal', 'u2', 'google', 31, 4, 0, 1, 10, '+966501112233'],
  ['l3', ['بيت التصميم', 'Design House'], ['ريم القحطاني', 'Reem Al-Qahtani'], 42000, 'negotiation', 'u1', 'instagram', 44, 2, 1, 0, 6, '+966555019932'],
  ['l4', ['مصنع الأمانة', 'Al-Amana Factory'], ['فهد الشمري', 'Fahad Al-Shammari'], 120000, 'contacted', 'u3', 'linkedin', 12, 8, -1, 0, 35, '+966540008821'],
  ['l5', ['معرض الياسمين للمفروشات', 'Jasmine Home'], ['هند العمري', 'Hind Al-Omari'], 38000, 'proposal', 'u4', 'instagram', 26, 7, -2, 0, 12, '+966503337744'],
  ['l6', ['مصنع النخبة للأثاث', 'Elite Furniture Co.'], ['خالد المطيري', 'Khaled Al-Mutairi'], 95000, 'new', 'u1', 'website', 8, 8, -8, 1, 40, '+966511223344'],
  ['l7', ['بيت الكنب الحديث', 'Modern Sofa House'], ['لجين الغامدي', 'Lujain Al-Ghamdi'], 27000, 'new', 'u3', 'google', 7, 7, -7, 0, 30, '+966566001122'],
  ['l8', ['أبواب ومطابخ الريادة', 'Riyada Doors & Kitchens'], ['عمر الزهراني', 'Omar Al-Zahrani'], 54000, 'new', 'u2', 'event', 4, 4, -4, 0, 28, '+966590770011'],
  ['l9', ['ستوديو مساحة', 'Masaha Studio'], ['دانة السبيعي', 'Dana Al-Subaie'], 33000, 'contacted', 'u2', 'instagram', 15, 8, -3, 1, 20, '+966544556677'],
  ['l10', ['أثاث المستقبل', 'Future Furniture'], ['بدر العنزي', 'Badr Al-Anazi'], 71000, 'contacted', 'u4', 'linkedin', 18, 9, 0, 1, 25, '+966577889900'],
  ['l11', ['ديكور الواحة', 'Oasis Decor'], ['منى الفيصل', 'Mona Al-Faisal'], 29000, 'meeting', 'u3', 'referral', 22, 1, 2, 0, 9, '+966512340099'],
  ['l12', ['مجموعة الرفاهية', 'Rafahiya Group'], ['تركي البقمي', 'Turki Al-Baqami'], 150000, 'negotiation', 'u2', 'event', 52, 1, 1, 1, 7, '+966533221100'],
  ['l13', ['نجارة الخليج', 'Gulf Carpentry'], ['سعد الراشد', 'Saad Al-Rashed'], 22000, 'new', 'u4', 'website', 2, 2, 0, 0, 33, '+966588776655'],
  ['l14', ['غرف النوم الذهبية', 'Golden Bedrooms'], ['وفاء الجهني', 'Wafa Al-Juhani'], 46000, 'contacted', 'u1', 'google', 10, 5, 1, 0, 22, '+966509090909'],
  ['l15', ['مفروشات الدار', 'Al-Dar Furnishings'], ['نايف الحازمي', 'Nayef Al-Hazmi'], 64000, 'meeting', 'u4', 'referral', 19, 2, 0, 0, 11, '+966521212121'],
  ['l16', ['ورشة الإبداع', 'Ibdaa Workshop'], ['جود الخالدي', 'Joud Al-Khalidi'], 18000, 'new', 'u3', 'instagram', 1, 1, 0, 0, 36, '+966545454545'],
  ['l17', ['ركن الضيافة', 'Hospitality Corner'], ['عبدالعزيز التميمي', 'Abdulaziz Al-Tamimi'], 36000, 'proposal', 'u3', 'linkedin', 28, 3, 0, 0, 13, '+966560606060'],
  ['l18', ['مصنع الجود', 'Al-Jood Factory'], ['حصة المالكي', 'Hessa Al-Malki'], 88000, 'new', 'u2', 'google', 3, 3, -3, 1, 30, '+966570707070'],
  ['l19', ['أثاث الرواد', 'Pioneers Furniture'], ['صالح اليامي', 'Saleh Al-Yami'], 52000, 'contacted', 'u1', 'event', 14, 6, -1, 0, 24, '+966580808080'],
  ['l20', ['مفروشات اللؤلؤة', 'Pearl Home'], ['نهى السلمي', 'Noha Al-Sulami'], 31000, 'lost', 'u3', 'google', 40, 20, 99, 0, 0, '+966590909090'],
  ['l21', ['ديار للتأثيث', 'Diyar Interiors'], ['ياسر العتيبي', 'Yasser Al-Otaibi'], 76000, 'won', 'u2', 'referral', 60, 5, 99, 0, -12, '+966500101010'],
  ['l22', ['مصنع الصفوة', 'Al-Safwa Factory'], ['إيمان الدريس', 'Eman Al-Dreis'], 99000, 'won', 'u1', 'event', 70, 9, 99, 0, -20, '+966500202020'],
]
const guessEmail = n => 'info@' + n.e.toLowerCase().replace(/[^a-z]+/g, '') + '.sa'
export const seedLeads = () => L.map(r => ({
  id: r[0], co: { a: r[1][0], e: r[1][1] }, contact: { a: r[2][0], e: r[2][1] }, value: r[3], stage: r[4], owner: r[5], source: r[6],
  created: Date.now() - r[7] * DAY, last: Date.now() - r[8] * DAY, next: r[9] === 99 ? null : Date.now() + r[9] * DAY, hot: !!r[10],
  close: Date.now() + r[11] * DAY, phone: r[12], email: guessEmail({ e: r[1][1] }), attempts: r[4] === 'new' ? 0 : 1, tags: [],
  firstResp: r[4] === 'new' ? null : [0.8, 2.4, 6.5, 1.2, 3.1][r[7] % 5],
}))
const C = [
  ['c1', ['ديار للتأثيث', 'Diyar Interiors'], 'u2', 18500, 'Growth', 82, 52, 'l21', 300, [P('ياسر العتيبي', 'Yasser Al-Otaibi', 'المدير العام', 3, '+966500101010'), P('لمى الحسن', 'Lama Al-Hassan', 'مديرة التسويق', 2, '+966500101011'), P('طلال القرني', 'Talal Al-Qarni', 'المحاسب', 1, '+966500101012')]],
  ['c2', ['مصنع الصفوة', 'Al-Safwa Factory'], 'u1', 32000, 'Scale', 91, 140, 'l22', 410, [P('إيمان الدريس', 'Eman Al-Dreis', 'الرئيسة التنفيذية', 3, '+966500202020'), P('رائد السعدون', 'Raed Al-Saadoun', 'مدير العمليات', 2, '+966500202021')]],
  ['c3', ['أثاث الفخامة', 'Fakhama Furniture'], 'u3', 12000, 'Starter', 48, 24, null, 180, [P('وليد النعيمي', 'Waleed Al-Nuaimi', 'المالك', 3, '+966500303030'), P('شهد الفهد', 'Shahd Al-Fahd', 'المبيعات', 1, '+966500303031')]],
  ['c4', ['مطبخ الشرق', 'Sharq Kitchen'], 'u2', 24000, 'Growth', 67, 70, null, 260, [P('أنس البلوي', 'Anas Al-Balawi', 'المدير', 3, '+966500404040'), P('ديمة الحربي', 'Dima Al-Harbi', 'التسويق', 2, '+966500404041'), P('عادل الشريف', 'Adel Al-Sharif', 'المالية', 2, '+966500404042')]],
  ['c5', ['بيت الألوان', 'Colors House'], 'u4', 9000, 'Starter', 36, 18, null, 95, [P('سلمى الجبر', 'Salma Al-Jabr', 'المالكة', 3, '+966500505050')]],
  ['c6', ['مجموعة الإتقان', 'Itqan Group'], 'u1', 41000, 'Scale', 88, 210, null, 520, [P('ماهر الصالح', 'Maher Al-Saleh', 'المدير التنفيذي', 3, '+966500606060'), P('غادة المنصور', 'Ghada Al-Mansour', 'مديرة المشتريات', 2, '+966500606061')]],
  ['c7', ['ديكورات النور', 'Al-Nour Decor'], 'u3', 15500, 'Growth', 59, 35, null, 210, [P('زياد الكعبي', 'Ziyad Al-Kaabi', 'المدير', 3, '+966500707070'), P('أمل الحمدان', 'Amal Al-Hamdan', 'المحاسبة', 1, '+966500707071')]],
  ['c8', ['شركة بناء المستقبل', 'Mustaqbal Build'], 'u4', 28000, 'Growth', 74, 95, null, 340, [P('هاني الشهراني', 'Hani Al-Shahrani', 'المدير', 3, '+966500808080'), P('رنا العسيري', 'Rana Al-Asiri', 'التسويق', 2, '+966500808081')]],
]
const ST = [['bf', 'تحليل المتطلبات', 'Requirements', 100, -20], ['bf', 'تصميم الهوية', 'Brand identity', 100, -8], ['bf', 'بناء الموقع', 'Website build', 65, 12], ['bf', 'حملة الإطلاق', 'Launch campaign', 20, 40]]
export const seedClients = () => C.map((r, i) => ({
  id: r[0], co: { a: r[1][0], e: r[1][1] }, owner: r[2], mrr: r[3], plan: r[4], health: r[5], renewal: Date.now() + r[6] * DAY, leadId: r[7],
  since: Date.now() - r[8] * DAY, nps: r[5] > 80 ? 9 : r[5] > 60 ? 7 : r[5] > 45 ? 6 : 4, contacts: r[9], email: guessEmail({ e: r[1][1] }),
  onboarding: [i < 5 || i % 2 === 0, i < 6, i < 3 || i === 5, i < 2 || i === 5, i === 5],
  projects: ST.map(s => ({ a: s[1], e: s[2], pct: Math.max(0, Math.min(100, s[3] - (i % 3) * 20 - (s[3] === 100 ? 0 : i * 5))), due: Date.now() + (s[4] + i * 3) * DAY })),
  tags: [], upsell: i === 1 || i === 3 || i === 5 || i === 7,
}))
export const onboardingSteps = [
  { a: 'اجتماع الانطلاق', e: 'Kickoff meeting' }, { a: 'استلام المواد والوصول', e: 'Assets & access received' }, { a: 'توقيع العقد', e: 'Contract signed' },
  { a: 'إعداد الفوترة', e: 'Billing set up' }, { a: 'تدريب فريق العميل', e: 'Client team training' },
]
// bills: stage quote -> contract -> invoice -> paid
const B = [
  ['b1', 'c1', ['باقة النمو - شهر نوفمبر', 'Growth plan - November'], 18500, 'invoice', -6, 'b-9'],
  ['b2', 'c2', ['باقة التوسع - أكتوبر', 'Scale plan - October'], 32000, 'invoice', -22, 'x'],
  ['b3', 'c3', ['تجديد الباقة', 'Plan renewal'], 12000, 'invoice', 5, 'x'],
  ['b4', 'c4', ['حملة موسم الشتاء', 'Winter campaign'], 36000, 'quote', 0, 'x'],
  ['b5', 'c6', ['توسعة الأتمتة', 'Automation expansion'], 55000, 'contract', 0, 'x'],
  ['b6', 'c7', ['باقة النمو - أكتوبر', 'Growth plan - October'], 15500, 'paid', -30, 'x'],
  ['b7', 'c8', ['باقة النمو - نوفمبر', 'Growth plan - November'], 28000, 'invoice', 12, 'x'],
  ['b8', 'c2', ['باقة التوسع - نوفمبر', 'Scale plan - November'], 32000, 'invoice', 10, 'x'],
  ['b9', 'c5', ['باقة المبتدئ', 'Starter plan'], 9000, 'invoice', -35, 'x'],
  ['b10', 'c1', ['باقة النمو - أكتوبر', 'Growth plan - October'], 18500, 'paid', -28, 'x'],
  ['b11', 'c6', ['باقة التوسع - نوفمبر', 'Scale plan - November'], 41000, 'paid', -4, 'x'],
  ['b12', 'c4', ['باقة النمو - أكتوبر', 'Growth plan - October'], 24000, 'paid', -31, 'x'],
]
export const seedBills = () => B.map(r => ({ id: r[0], client: r[1], title: { a: r[2][0], e: r[2][1] }, amount: r[3], stage: r[4], due: Date.now() + r[5] * DAY, reminders: 0 }))
export const seedTasks = () => [
  ['t1', ['حضّر عرض السعر المعدّل لمعرض النخيل', 'Prepare revised quote for Nakheel'], 'l2', 0, 'u2'],
  ['t2', ['أرسل العقد لمجموعة الرفاهية', 'Send contract to Rafahiya Group'], 'l12', -1, 'u2'],
  ['t3', ['مراجعة تقرير صحة العملاء', 'Review client health report'], null, 1, 'u1'],
  ['t4', ['اتصل بمصنع الأمانة', 'Call Al-Amana Factory'], 'l4', -2, 'u3'],
  ['t5', ['جهّز عرض تجديد ديار', 'Prepare Diyar renewal offer'], 'c1', 3, 'u1'],
  ['t6', ['تذكير فاتورة بيت الألوان', 'Invoice reminder for Colors House'], 'c5', 0, 'u4'],
].map(r => ({ id: r[0], title: { a: r[1][0], e: r[1][1] }, ref: r[2], due: Date.now() + r[3] * DAY, owner: r[4], done: false }))
export const seedRules = () => [
  { id: 'r1', on: true, trigger: 'noReply', days: 3, action: 'task', text: { a: 'مهمة متابعة لو العميل الجديد ما اتكلمش', e: 'Follow-up task when a new lead is untouched' } },
  { id: 'r2', on: true, trigger: 'stale', days: 7, action: 'hot', text: { a: 'علّم الصفقة "تحتاج اهتمام" لو واقفة', e: 'Flag stalled deals as needs-attention' } },
  { id: 'r3', on: true, trigger: 'overdue', days: 1, action: 'remind', text: { a: 'ذكّر العميل بالفاتورة المتأخرة', e: 'Remind the client about the overdue invoice' } },
  { id: 'r4', on: false, trigger: 'won', days: 0, action: 'onboard', text: { a: 'ابدأ قائمة الانطلاق عند الفوز بالصفقة', e: 'Start onboarding checklist when a deal is won' } },
  { id: 'r5', on: true, trigger: 'renewal', days: 45, action: 'task', text: { a: 'مهمة تجديد قبل انتهاء العقد بـ 45 يوم', e: 'Renewal task 45 days before the contract ends' } },
]
export const seedEvents = () => {
  const E = []; const add = (ref, type, a, e, ago, by = 'u1') => E.push({ id: 'e' + E.length, ref, type, text: { a, e }, at: Date.now() - ago * DAY - E.length * 60000, by })
  add('l1', 'call', 'مكالمة 12 دقيقة، مهتم ويريد معاينة نموذج', '12-min call, interested and wants a sample', 3)
  add('l1', 'whatsapp', 'أرسلنا الكتالوج على واتساب', 'Catalogue sent via WhatsApp', 5)
  add('l1', 'stage', 'انتقل إلى اجتماع', 'Moved to Meeting', 8)
  add('l2', 'quote', 'عرض السعر #Q-204 أُرسل', 'Quote #Q-204 sent', 4, 'u2')
  add('l2', 'email', 'رد العميل: يحتاج خصم 5%', 'Client replied: needs 5% discount', 6, 'u2')
  add('l12', 'meeting', 'اجتماع تفاوض مع الإدارة', 'Negotiation meeting with management', 1, 'u2')
  add('c1', 'payment', 'تم دفع فاتورة أكتوبر 18,500', 'October invoice paid: 18,500', 28, 'u2')
  add('c1', 'call', 'مكالمة مراجعة الأداء الشهري', 'Monthly performance review call', 9, 'u2')
  add('c1', 'whatsapp', 'العميل يسأل عن خدمة التصوير', 'Client asked about photography service', 4, 'u2')
  add('c1', 'note', 'يفضّل التواصل بعد الساعة 11 صباحًا @نور', 'Prefers contact after 11am @Nour', 12, 'u1')
  add('c1', 'stage', 'تم الفوز بالصفقة وبدأ الانطلاق', 'Deal won, onboarding started', 52, 'u2')
  add('c2', 'meeting', 'اجتماع ربع سنوي مع الإدارة', 'Quarterly business review', 15)
  add('c2', 'email', 'طلب عرض توسعة للأتمتة', 'Requested an automation expansion quote', 6)
  add('c2', 'payment', 'تم دفع فاتورة سبتمبر', 'September invoice paid', 51)
  add('c4', 'call', 'العميل غير راضٍ عن سرعة التسليم', 'Client unhappy with delivery speed', 11, 'u2')
  add('c5', 'whatsapp', 'تذكير بالفاتورة ولا رد', 'Invoice reminder, no reply', 3, 'u4')
  add('c3', 'note', 'استخدام المنصة منخفض هذا الشهر', 'Platform usage is low this month', 10, 'u3')
  return E
}
export const templates = [
  { id: 'w1', k: 'intro', a: 'مرحبًا {name}، أنا {me} من ماجمافاي. شفت إن {co} مهتمة بتطوير حضورها الرقمي وحبيت أعرض عليكم فكرة سريعة. هل يناسبكم مكالمة 10 دقائق؟', e: 'Hi {name}, this is {me} from Magmafy. I saw {co} is growing its digital presence and have a quick idea for you. Do you have 10 minutes for a call?' },
  { id: 'w2', k: 'followup', a: 'أهلًا {name}، بتابع معاك بخصوص العرض. تحب أوضح أي نقطة أو نعدّل على الباقة؟', e: 'Hi {name}, following up on the proposal. Want me to clarify anything or adjust the package?' },
  { id: 'w3', k: 'meeting', a: 'تذكير بسيط: عندنا اجتماع اليوم مع {co}. هل ما زال الموعد مناسبًا؟', e: 'Quick reminder: we have a meeting today with {co}. Is the time still good?' },
  { id: 'w4', k: 'invoice', a: 'مرحبًا {name}، تذكير ودّي بفاتورة {co} المستحقة. رابط الدفع جاهز لو احتجته.', e: 'Hi {name}, a friendly reminder about the outstanding invoice for {co}. The payment link is ready if you need it.' },
  { id: 'w5', k: 'renewal', a: 'أهلًا {name}، عقد {co} قارب على الانتهاء. حبيت أرتب معاكم مكالمة سريعة نراجع فيها النتائج ونجدّد بأفضل شروط.', e: 'Hi {name}, the contract for {co} is nearing its end. Let us schedule a quick call to review results and renew on the best terms.' },
]
