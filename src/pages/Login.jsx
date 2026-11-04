import { useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon } from '../ui.jsx'
import { team } from '../data.js'

export default function Login() {
  const { t, lang, setUi } = useApp(); const [email, setEmail] = useState(''), [step, setStep] = useState(0), [code, setCode] = useState(['', '', '', '', '', '']), [err, setErr] = useState('')
  const refs = useRef([])
  const verify = c => { if (c === '123456') { const u = team.find(x => x.email === email.trim().toLowerCase()) || team[0]; setUi({ session: { id: u.id, email: email.trim() } }); location.hash = 'today' } else { setErr(t('الكود غير صحيح. جرّب 123456', 'Wrong code. Try 123456')); setCode(['', '', '', '', '', '']); refs.current[0]?.focus() } }
  const onCode = (i, v) => { v = v.replace(/\D/g, ''); if (v.length > 1) { const a = v.slice(0, 6).split(''); const n = [...a, ...Array(6 - a.length).fill('')]; setCode(n); if (a.length === 6) verify(a.join('')); return } const n = [...code]; n[i] = v; setCode(n); setErr(''); if (v && i < 5) refs.current[i + 1]?.focus(); if (n.every(Boolean)) verify(n.join('')) }
  return <div className="login">
    <div className="login-art"><div className="row" style={{ gap: 12 }}><span className="logo">M</span><b style={{ fontSize: 20 }}>Magmafy Hub</b></div>
      <div><h2>{t('كل ما يحتاجه فريق المبيعات والعملاء في مكان واحد', 'Everything your sales and client team needs, in one place')}</h2>
        <ul style={{ marginTop: 28 }}>{[[t('طابور مكالمات يومي بضغطة مفتاح', 'A daily call queue driven by single keys')], [t('تحليلات وأتمتة للإدارة', 'Analytics and automation for management')], [t('ملف عميل 360° وفوترة من العرض للدفع', 'Client 360° and billing from quote to cash')]].map(([x], i) => <li key={i}><Icon n="check" s={18} /><span>{x}</span></li>)}</ul></div>
      <small style={{ opacity: .7 }}>© Magmafy</small></div>
    <div className="login-form"><form onSubmit={e => { e.preventDefault(); if (step === 0 && /.+@.+/.test(email)) setStep(1); else if (step === 1) verify(code.join('')) }}>
      <div className="row between" style={{ marginBottom: 28 }}><span className="row"><span className="logo" style={{ width: 30, height: 30 }}>M</span><b>Magmafy Hub</b></span><button type="button" className="btn sm" onClick={() => setUi({ lang: lang === 'ar' ? 'en' : 'ar' })}>{lang === 'ar' ? 'English' : 'العربية'}</button></div>
      <h1>{step ? t('أدخل كود التحقق', 'Enter your code') : t('تسجيل الدخول', 'Sign in')}</h1>
      <p className="muted">{step ? t('أرسلنا كودًا من 6 أرقام إلى ', 'We sent a 6-digit code to ') + email : t('أدخل بريدك الإلكتروني للمتابعة', 'Enter your work email to continue')}</p>
      <div className="hint">{t('نسخة تجريبية: أي بريد إلكتروني يعمل، والكود هو ', 'Demo version: any email works, the code is ')}<b>123456</b></div>
      {step === 0 ? <><label className="field"><span>{t('البريد الإلكتروني', 'Email')}</span><input className="inp" type="email" autoFocus dir="ltr" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <button className="btn pri lg" style={{ width: '100%', justifyContent: 'center' }} disabled={!/.+@.+/.test(email)}>{t('أرسل الكود', 'Send code')}</button></> :
        <><div className="otp">{code.map((c, i) => <input key={i} ref={el => (refs.current[i] = el)} inputMode="numeric" aria-label={'digit ' + (i + 1)} autoFocus={i === 0} value={c} onChange={e => onCode(i, e.target.value)} onKeyDown={e => e.key === 'Backspace' && !c && i > 0 && refs.current[i - 1]?.focus()} />)}</div>
          {err && <p className="down" role="alert" style={{ textAlign: 'center' }}>{err}</p>}
          <button className="btn pri lg" style={{ width: '100%', justifyContent: 'center' }} disabled={code.some(x => !x)}>{t('دخول', 'Sign in')}</button>
          <button type="button" className="link" style={{ marginTop: 12 }} onClick={() => { setStep(0); setErr('') }}>{t('تغيير البريد', 'Change email')}</button></>}
    </form></div></div>
}
