'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      <a href="/index.html" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 text-sm no-underline hover:text-white transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Powrot
      </a>

      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          </div>
          <span className="text-[22px] font-bold text-white">Print<span style={{ color: '#3b82f6' }}>Flow</span></span>
        </div>

        <h1 className="text-center font-extrabold tracking-tight" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
          <span style={{ background: 'linear-gradient(135deg, #3b82f6, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zaloguj sie</span>
        </h1>
        <p className="text-center text-slate-400 mt-3 text-base">Wejdz do panelu i zarzadzaj zleceniami.</p>

        <form onSubmit={handleLogin} className="mt-10 rounded-3xl p-8" style={{ background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.15)' }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Haslo</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 znakow"
              className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-[17px] border-none cursor-pointer transition-all hover:opacity-90"
            style={{ background: '#3b82f6' }}
          >
            {loading ? 'Logowanie...' : 'Zaloguj sie'}
          </button>

          <p className="mt-5 text-center text-[13px] text-slate-500">
            Nie masz konta? <a href="/register" className="underline" style={{ color: '#3b82f6' }}>Zaloz farme</a>
          </p>
        </form>
      </div>
    </div>
  )
}
