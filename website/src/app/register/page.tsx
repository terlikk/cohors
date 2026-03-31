'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const FILAMENT_TYPES = ['PLA', 'PETG', 'ABS', 'TPU'] as const
const FILAMENT_COLORS: Record<string, { name: string; hex: string }[]> = {
  PLA: [
    { name: 'Biały', hex: '#ffffff' },
    { name: 'Czarny', hex: '#1a1a1a' },
    { name: 'Szary', hex: '#9ca3af' },
    { name: 'Czerwony', hex: '#ef4444' },
    { name: 'Niebieski', hex: '#3b82f6' },
    { name: 'Zielony', hex: '#22c55e' },
  ],
  PETG: [
    { name: 'Biały', hex: '#ffffff' },
    { name: 'Czarny', hex: '#1a1a1a' },
    { name: 'Naturalny', hex: '#d4c5a9' },
    { name: 'Niebieski', hex: '#3b82f6' },
  ],
  ABS: [
    { name: 'Biały', hex: '#ffffff' },
    { name: 'Czarny', hex: '#1a1a1a' },
    { name: 'Czerwony', hex: '#ef4444' },
  ],
  TPU: [
    { name: 'Czarny', hex: '#1a1a1a' },
    { name: 'Biały', hex: '#ffffff' },
    { name: 'Czerwony', hex: '#ef4444' },
  ],
}

interface SelectedFilament {
  type: string
  colors: string[]
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [farmName, setFarmName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFilaments, setSelectedFilaments] = useState<SelectedFilament[]>([])
  const router = useRouter()

  function toggleFilamentType(type: string) {
    setSelectedFilaments(prev => {
      const existing = prev.find(f => f.type === type)
      if (existing) return prev.filter(f => f.type !== type)
      return [...prev, { type, colors: [] }]
    })
  }

  function toggleFilamentColor(type: string, color: string) {
    setSelectedFilaments(prev =>
      prev.map(f => {
        if (f.type !== type) return f
        const has = f.colors.includes(color)
        return { ...f, colors: has ? f.colors.filter(c => c !== color) : [...f.colors, color] }
      })
    )
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setStep(2)
  }

  async function handleRegister() {
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

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const slug = farmName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data: farmData, error: farmError } = await supabase.from('farms').insert({
      user_id: signInData.user.id,
      name: farmName,
      slug,
      city,
      is_active: true,
    }).select().single()

    if (farmError) {
      setError('Konto utworzone, ale nie udało się utworzyć farmy: ' + farmError.message)
      setLoading(false)
      return
    }

    // Insert filaments
    if (farmData && selectedFilaments.length > 0) {
      const filamentRows = selectedFilaments.flatMap(f =>
        (f.colors.length > 0 ? f.colors : ['Czarny']).map(color => ({
          farm_id: farmData.id,
          type: f.type,
          color,
          brand: '',
          price_per_kg: 0,
          stock_grams: 1000,
          low_stock_alert: 500,
        }))
      )
      await supabase.from('filaments').insert(filamentRows)
    }

    router.push('/dashboard')
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

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: step >= 1 ? '#22C55E' : 'rgba(255,255,255,0.1)', color: step >= 1 ? '#fff' : '#94a3b8' }}>1</div>
            <span className="text-sm" style={{ color: step === 1 ? '#22C55E' : '#94a3b8' }}>Dane farmy</span>
          </div>
          <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: step >= 2 ? '#22C55E' : 'rgba(255,255,255,0.1)', color: step >= 2 ? '#fff' : '#94a3b8' }}>2</div>
            <span className="text-sm" style={{ color: step === 2 ? '#22C55E' : '#94a3b8' }}>Filamenty</span>
          </div>
        </div>

        {step === 1 && (
          <>
            <h1 className="text-center font-extrabold tracking-tight" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              Zaloz <span style={{ background: 'linear-gradient(135deg, #22C55E, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>farme</span>
            </h1>
            <p className="text-center text-slate-400 mt-3 text-base">Darmowe konto. Zacznij przyjmowac zlecenia w 5 minut.</p>

            <form onSubmit={handleStep1} className="mt-10 rounded-3xl p-8" style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.15)' }}>
              {error && (
                <div className="mb-4 p-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Nazwa farmy</label>
                <input type="text" required value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="np. 3DPrint Warszawa"
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} />
              </div>

              <div className="mb-4">
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl"
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} />
              </div>

              <div className="mb-4">
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Haslo</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 znakow"
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} />
              </div>

              <div className="mb-6">
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Miasto</label>
                <input type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="np. Warszawa"
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none transition-colors" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} />
              </div>

              <button type="submit" className="w-full py-4 rounded-xl text-white font-semibold text-[17px] border-none cursor-pointer transition-all hover:opacity-90"
                style={{ background: '#22C55E' }}>
                Dalej — wybierz filamenty
              </button>

              <p className="mt-5 text-center text-[13px] text-slate-500">
                Masz juz konto? <a href="/login" className="underline" style={{ color: '#22C55E' }}>Zaloguj sie</a>
              </p>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-center font-extrabold tracking-tight" style={{ fontSize: 'clamp(24px, 3.5vw, 36px)' }}>
              Jakie <span style={{ background: 'linear-gradient(135deg, #22C55E, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>filamenty</span> masz?
            </h1>
            <p className="text-center text-slate-400 mt-3 text-base">Zaznacz typy i kolory, które posiadasz. Możesz to zmienić później.</p>

            <div className="mt-8 rounded-3xl p-8" style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.15)' }}>
              {error && (
                <div className="mb-4 p-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-5">
                {FILAMENT_TYPES.map(type => {
                  const isSelected = selectedFilaments.some(f => f.type === type)
                  const selectedColors = selectedFilaments.find(f => f.type === type)?.colors || []
                  return (
                    <div key={type}>
                      <button
                        type="button"
                        onClick={() => toggleFilamentType(type)}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl cursor-pointer transition-all border-none"
                        style={{
                          background: isSelected ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
                          outline: isSelected ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{
                          background: isSelected ? '#22C55E' : 'rgba(255,255,255,0.06)',
                          border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        }}>
                          {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <span className="font-semibold text-[15px]" style={{ color: isSelected ? '#22C55E' : '#94a3b8' }}>{type}</span>
                      </button>

                      {isSelected && (
                        <div className="flex flex-wrap gap-2 mt-3 ml-8">
                          {FILAMENT_COLORS[type].map(c => {
                            const colorSelected = selectedColors.includes(c.name)
                            return (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => toggleFilamentColor(type, c.name)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] cursor-pointer transition-all border-none"
                                style={{
                                  background: colorSelected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                                  color: colorSelected ? '#a78bfa' : '#64748b',
                                  outline: colorSelected ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                }}
                              >
                                <span className="w-3.5 h-3.5 rounded-full" style={{ background: c.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                                {c.name}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl text-slate-400 font-semibold text-[15px] border-none cursor-pointer transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  Wstecz
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl text-white font-semibold text-[17px] border-none cursor-pointer transition-all hover:opacity-90"
                  style={{ background: '#22C55E' }}
                >
                  {loading ? 'Rejestracja...' : 'Zaloz farme za darmo'}
                </button>
              </div>

              <p className="mt-5 text-center text-[13px] text-slate-500">
                {selectedFilaments.length === 0 ? 'Możesz pominąć — dodasz filamenty później w panelu.' : `Wybrano ${selectedFilaments.length} ${selectedFilaments.length === 1 ? 'typ' : 'typy'} filamentu`}
              </p>
            </div>
          </>
        )}

        {step === 1 && (
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
        )}
      </div>
    </div>
  )
}
