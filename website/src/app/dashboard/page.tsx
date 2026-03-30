'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Tab = 'drukarki' | 'zamowienia' | 'automatyzacja' | 'profil'

interface Printer {
  id: string
  name: string
  model: string
  buildVolume: { x: number; y: number; z: number }
  nozzle: string
  materials: string[]
  status: 'idle' | 'printing' | 'error'
}

const PRINTER_MODELS = ['Bambu X1C', 'Bambu P1S', 'Bambu A1', 'Prusa MK4', 'Prusa XL', 'Ender 3', 'Voron', 'Other']
const NOZZLE_SIZES = ['0.4', '0.6', '0.8']
const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'PC']

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string; label: string }> = {
  idle: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#4ade80', label: 'Idle' },
  printing: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', color: '#a78bfa', label: 'Printing' },
  error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#f87171', label: 'Error' },
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'drukarki',
    label: 'Drukarki',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>,
  },
  {
    id: 'zamowienia',
    label: 'Zamówienia',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>,
  },
  {
    id: 'automatyzacja',
    label: 'Automatyzacja',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  },
  {
    id: 'profil',
    label: 'Profil',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
]

const PRO_FEATURES = [
  { name: 'Auto-wycena AI', desc: 'Automatyczne kalkulowanie cen na podstawie modelu, materiału i czasu druku', tier: 'Pro' },
  { name: 'Quality Control AI', desc: 'Wykrywanie błędów druku w czasie rzeczywistym z kamerą', tier: 'Pro' },
  { name: 'Auto-scheduling', desc: 'Automatyczne planowanie kolejki druku na wszystkich drukarkach', tier: 'Pro' },
  { name: 'API do integracji', desc: 'REST API do połączenia z Twoim systemem ERP lub sklepem', tier: 'Enterprise' },
  { name: 'Custom branding', desc: 'Własna domena, logo i kolory na stronie farmy', tier: 'Enterprise' },
  { name: 'Multi-location', desc: 'Zarządzanie wieloma lokalizacjami z jednego panelu', tier: 'Enterprise' },
]

function loadPrinters(): Printer[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('printflow_printers') || '[]')
  } catch {
    return []
  }
}

function savePrinters(printers: Printer[]) {
  localStorage.setItem('printflow_printers', JSON.stringify(printers))
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('drukarki')
  const router = useRouter()
  const supabase = createClient()

  // Printer state
  const [printers, setPrinters] = useState<Printer[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    model: PRINTER_MODELS[0],
    buildX: '256',
    buildY: '256',
    buildZ: '256',
    nozzle: '0.4',
    materials: [] as string[],
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setPrinters(loadPrinters())
        setLoading(false)
      }
    })
  }, [router, supabase.auth])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function toggleMaterial(mat: string) {
    setNewPrinter(prev => ({
      ...prev,
      materials: prev.materials.includes(mat)
        ? prev.materials.filter(m => m !== mat)
        : [...prev.materials, mat],
    }))
  }

  function handleAddPrinter(e: React.FormEvent) {
    e.preventDefault()
    const printer: Printer = {
      id: crypto.randomUUID(),
      name: newPrinter.name,
      model: newPrinter.model,
      buildVolume: {
        x: parseInt(newPrinter.buildX) || 0,
        y: parseInt(newPrinter.buildY) || 0,
        z: parseInt(newPrinter.buildZ) || 0,
      },
      nozzle: newPrinter.nozzle,
      materials: newPrinter.materials,
      status: 'idle',
    }
    const updated = [...printers, printer]
    setPrinters(updated)
    savePrinters(updated)
    setShowAddModal(false)
    setNewPrinter({ name: '', model: PRINTER_MODELS[0], buildX: '256', buildY: '256', buildZ: '256', nozzle: '0.4', materials: [] })
  }

  function removePrinter(id: string) {
    const updated = printers.filter(p => p.id !== id)
    setPrinters(updated)
    savePrinters(updated)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <p className="text-slate-400">Ładowanie...</p>
      </div>
    )
  }

  const farmName = user?.user_metadata?.farm_name || 'Twoja farma'
  const userCity = user?.user_metadata?.city || ''
  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          </div>
          <span className="text-lg font-bold text-white">Print<span style={{ color: '#22C55E' }}>Flow</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm text-slate-300 cursor-pointer transition-colors hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            Wyloguj
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 py-6 px-3" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="rounded-xl p-3 mb-6" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <p className="text-white font-semibold text-sm truncate">{farmName}</p>
            {userCity && <p className="text-slate-500 text-[12px] mt-0.5">{userCity}</p>}
          </div>

          <nav className="flex flex-col gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border-none text-left w-full"
                style={{
                  background: activeTab === tab.id ? 'rgba(34,197,94,0.1)' : 'transparent',
                  color: activeTab === tab.id ? '#22C55E' : '#94a3b8',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 max-w-4xl">
          {/* DRUKARKI TAB */}
          {activeTab === 'drukarki' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Moje drukarki</h2>
                  <p className="text-slate-500 text-sm mt-1">{printers.length} {printers.length === 1 ? 'drukarka' : 'drukarek'} zarejestrowanych</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:opacity-90 border-none"
                  style={{ background: '#22C55E' }}
                >
                  + Dodaj drukarkę
                </button>
              </div>

              {printers.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={{ border: '2px dashed rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.02)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                  </div>
                  <p className="text-slate-400 text-sm">Nie masz jeszcze drukarek. Dodaj pierwszą drukarkę, aby rozpocząć!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {printers.map(printer => {
                    const st = STATUS_STYLES[printer.status]
                    return (
                      <div key={printer.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold text-[15px]">{printer.name}</h3>
                            <p className="text-slate-500 text-[13px]">{printer.model}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider" style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                            {st.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-400 mb-3">
                          <span>Volume: {printer.buildVolume.x}×{printer.buildVolume.y}×{printer.buildVolume.z} mm</span>
                          <span>Nozzle: {printer.nozzle} mm</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {printer.materials.map(mat => (
                            <span key={mat} className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                              {mat}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => removePrinter(printer.id)}
                          className="text-[12px] text-slate-600 cursor-pointer hover:text-red-400 transition-colors bg-transparent border-none p-0"
                        >
                          Usuń
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ZAMÓWIENIA TAB */}
          {activeTab === 'zamowienia' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Zamówienia</h2>
              <p className="text-slate-500 text-sm mb-8">Wszystkie przychodzące zlecenia od klientów.</p>

              <div className="rounded-2xl p-12 text-center" style={{ border: '2px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
                </div>
                <p className="text-white font-semibold text-lg mb-1">Brak zamówień</p>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Gdy klienci złożą zamówienia z marketplace, pojawią się tutaj. Upewnij się, że masz dodane drukarki!</p>
              </div>
            </div>
          )}

          {/* AUTOMATYZACJA TAB */}
          {activeTab === 'automatyzacja' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Automatyzacja</h2>
              <p className="text-slate-500 text-sm mb-8">Zaawansowane funkcje dostępne w planach Pro i Enterprise.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRO_FEATURES.map((feature, i) => (
                  <div key={i} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: feature.tier === 'Pro' ? 'rgba(168,85,247,0.15)' : 'rgba(234,179,8,0.15)',
                          color: feature.tier === 'Pro' ? '#a855f7' : '#eab308',
                          border: `1px solid ${feature.tier === 'Pro' ? 'rgba(168,85,247,0.3)' : 'rgba(234,179,8,0.3)'}`,
                        }}
                      >
                        {feature.tier}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h3 className="text-white font-semibold text-[15px] mb-1">{feature.name}</h3>
                    <p className="text-slate-500 text-[13px] mb-4">{feature.desc}</p>
                    <button
                      onClick={() => alert('Plany Pro i Enterprise będą dostępne wkrótce!')}
                      className="px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-all border-none"
                      style={{
                        background: feature.tier === 'Pro' ? 'rgba(168,85,247,0.1)' : 'rgba(234,179,8,0.1)',
                        color: feature.tier === 'Pro' ? '#a855f7' : '#eab308',
                        border: `1px solid ${feature.tier === 'Pro' ? 'rgba(168,85,247,0.2)' : 'rgba(234,179,8,0.2)'}`,
                      }}
                    >
                      Upgrade
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFIL TAB */}
          {activeTab === 'profil' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Profil farmy</h2>
              <p className="text-slate-500 text-sm mb-8">Informacje o Twojej farmie widoczne dla klientów.</p>

              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'rgba(34,197,94,0.15)' }}>
                    {farmName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{farmName}</h3>
                    <p className="text-slate-500 text-sm">{userCity || 'Miasto nie podane'}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-slate-500 text-[12px] font-medium mb-1 uppercase tracking-wider">Nazwa farmy</label>
                    <p className="text-white text-[15px]">{farmName}</p>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[12px] font-medium mb-1 uppercase tracking-wider">Miasto</label>
                    <p className="text-white text-[15px]">{userCity || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[12px] font-medium mb-1 uppercase tracking-wider">Email</label>
                    <p className="text-white text-[15px]">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[12px] font-medium mb-1 uppercase tracking-wider">Link do strony farmy</label>
                    <p className="text-slate-400 text-[15px]">printflow.pl/farm/{farmName.toLowerCase().replace(/\s+/g, '-')} <span className="text-[12px] text-slate-600">(wkrótce)</span></p>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[12px] font-medium mb-1 uppercase tracking-wider">Drukarki</label>
                    <p className="text-white text-[15px]">{printers.length} zarejestrowanych</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Printer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Dodaj drukarkę</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white cursor-pointer bg-transparent border-none text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleAddPrinter} className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Nazwa drukarki</label>
                <input
                  required
                  value={newPrinter.name}
                  onChange={e => setNewPrinter(p => ({ ...p, name: e.target.value }))}
                  placeholder="np. Bambu X1C #1"
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Model</label>
                <select
                  value={newPrinter.model}
                  onChange={e => setNewPrinter(p => ({ ...p, model: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none appearance-none cursor-pointer"
                  style={inputStyle}
                >
                  {PRINTER_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Pole robocze (mm)</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['buildX', 'buildY', 'buildZ'] as const).map((dim, i) => (
                    <div key={dim} className="relative">
                      <input
                        required
                        type="number"
                        min="1"
                        value={newPrinter[dim]}
                        onChange={e => setNewPrinter(p => ({ ...p, [dim]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                        style={inputStyle}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-[12px]">{['X', 'Y', 'Z'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Średnica dyszy (mm)</label>
                <div className="flex gap-2">
                  {NOZZLE_SIZES.map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNewPrinter(p => ({ ...p, nozzle: n }))}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border-none"
                      style={{
                        background: newPrinter.nozzle === n ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        color: newPrinter.nozzle === n ? '#8B5CF6' : '#94a3b8',
                        outline: newPrinter.nozzle === n ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Obsługiwane materiały</label>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map(mat => {
                    const active = newPrinter.materials.includes(mat)
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => toggleMaterial(mat)}
                        className="px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all border-none"
                        style={{
                          background: active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                          color: active ? '#22C55E' : '#94a3b8',
                          outline: active ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {mat}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:opacity-90 mt-2"
                style={{ background: '#22C55E' }}
              >
                Dodaj drukarkę
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
