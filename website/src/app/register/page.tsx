'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const [farmName, setFarmName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { farm_name: farmName, city },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Auto-sign-in after registration (skip email verification for MVP)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      <a href="/index.html" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 text-sm no-underline hover:text-white transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Powrot
      </a>

      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          </div>
          <span className="text-[22px] font-bold text-white">Print<span style={{ color: '#22C55E' }}>Flow</span></span>
        </div>

        <h1 className="text-center font-extrabold tracking-tight" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
          Zaloz <span style={{ background: 'linear-gradient(135deg, #22C55E, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>farme</span>
        </h1>
        <p className="text-center text-slate-400 mt-3 text-base">Darmowe konto. Zacznij przyjmowac zlecenia w 5 minut.</p>

        <form onSubmit={handleRegister} className="mt-10 rounded-3xl p-8" style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.15)' }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Nazwa farmy</label>
            <input
              type="text"
              required
              value={farmName}
              onChange={e => setFarmName(e.target.value)}
              placeholder="np. 3DPrint Warszawa"
              className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Haslo</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 znakow"
              className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Miasto</label>
            <input
              type="text"
              required
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="np. Warszawa"
              className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-[17px] border-none cursor-pointer transition-all hover:opacity-90"
            style={{ background: '#22C55E' }}
          >
            {loading ? 'Rejestracja...' : 'Zaloz farme za darmo'}
          </button>

          <p className="mt-5 text-center text-[13px] text-slate-500">
            Marketplace zawsze za darmo &bull; Prowizja 7% od transakcji<br />
            Masz juz konto? <a href="/login" className="underline" style={{ color: '#22C55E' }}>Zaloguj sie</a>
          </p>
        </form>

        <div className="mt-9 flex flex-col gap-3">
          {[
            ['&#x1F193;', 'Marketplace i profil farmy — za darmo, na zawsze'],
            ['&#x26A1;', 'Auto-wycena — klient wrzuca plik, cena natychmiast'],
            ['&#x1F517;', 'Wlasny link: printflow.pl/farm/twoja-nazwa'],
            ['&#x1F4F1;', 'QR kod do wydrukowania i udostepnienia'],
            ['&#x1F4B3;', 'Stripe Connect — auto-wyplaty na konto'],
          ].map(([icon, text], i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }} dangerouslySetInnerHTML={{ __html: icon }} />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
