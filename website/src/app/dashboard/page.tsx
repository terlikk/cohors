'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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
  printing: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#60a5fa', label: 'Printing' },
  error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#f87171', label: 'Error' },
}

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
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([])
  const [dragover, setDragover] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  async function uploadFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['stl', '3mf', 'obj'].includes(ext)) {
      setMessage('Nieobslugiwany format. Uzyj .STL, .3MF lub .OBJ')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      setMessage('Plik za duzy. Max 100 MB.')
      return
    }

    setUploading(true)
    setMessage('')

    const fileName = `${user!.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('stl-files').upload(fileName, file)

    if (error) {
      setMessage(`Blad uploadu: ${error.message}`)
    } else {
      setUploadedFiles(prev => [...prev, { name: file.name, size: file.size }])
      setMessage(`Plik ${file.name} przeslany!`)
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? (bytes / 1024).toFixed(1) + ' KB'
      : (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <p className="text-slate-400">Ladowanie...</p>
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
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b6b, #e05555)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          </div>
          <span className="text-lg font-bold text-white">Print<span style={{ color: '#ff6b6b' }}>Flow</span></span>
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

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Farm Info */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,107,107,0.03)', border: '1px solid rgba(255,107,107,0.15)' }}>
          <h1 className="text-2xl font-bold text-white mb-1">Witaj, {farmName}!</h1>
          {userCity && <p className="text-slate-400 text-sm">Miasto: {userCity}</p>}
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* My Printers Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Moje drukarki</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:opacity-90"
              style={{ background: '#ff6b6b' }}
            >
              + Dodaj drukarke
            </button>
          </div>

          {printers.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ border: '2px dashed rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.02)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,107,107,0.1)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              </div>
              <p className="text-slate-400 text-sm">Nie masz jeszcze drukarek. Dodaj pierwsza drukarke, aby rozpoczac!</p>
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
                        <span key={mat} className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                          {mat}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => removePrinter(printer.id)}
                      className="text-[12px] text-slate-600 cursor-pointer hover:text-red-400 transition-colors bg-transparent border-none p-0"
                    >
                      Usun
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Printer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Dodaj drukarke</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white cursor-pointer bg-transparent border-none text-xl leading-none">&times;</button>
              </div>

              <form onSubmit={handleAddPrinter} className="flex flex-col gap-4">
                {/* Name */}
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

                {/* Model */}
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

                {/* Build Volume */}
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

                {/* Nozzle */}
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Srednica dyszy (mm)</label>
                  <div className="flex gap-2">
                    {NOZZLE_SIZES.map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNewPrinter(p => ({ ...p, nozzle: n }))}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border-none"
                        style={{
                          background: newPrinter.nozzle === n ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                          color: newPrinter.nozzle === n ? '#3b82f6' : '#94a3b8',
                          outline: newPrinter.nozzle === n ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Obslugiwane materialy</label>
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
                            background: active ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.03)',
                            color: active ? '#ff6b6b' : '#94a3b8',
                            outline: active ? '1px solid rgba(255,107,107,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {mat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:opacity-90 mt-2"
                  style={{ background: '#ff6b6b' }}
                >
                  Dodaj drukarke
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <h2 className="text-lg font-semibold text-white mb-4">Przeslij pliki 3D</h2>

        <div
          className="rounded-3xl p-16 text-center cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragover ? '#3b82f6' : 'rgba(59,130,246,0.3)'}`,
            background: dragover ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.03)',
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragover(true) }}
          onDragLeave={() => setDragover(false)}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <p className="text-xl font-semibold text-white">
            {uploading ? 'Przesylanie...' : 'Przeciagnij plik tutaj'}
          </p>
          <p className="text-slate-500 text-sm mt-2">lub kliknij zeby wybrac z dysku &bull; max 100 MB</p>
          <div className="flex gap-2.5 justify-center mt-5">
            {['.STL', '.3MF', '.OBJ'].map(f => (
              <span key={f} className="px-3.5 py-1 rounded-lg text-[13px] font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{f}</span>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".stl,.3mf,.obj"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) uploadFile(file)
            }}
          />
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{
            background: message.includes('Blad') || message.includes('Nieobslug') || message.includes('za duzy')
              ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${message.includes('Blad') || message.includes('Nieobslug') || message.includes('za duzy')
              ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            color: message.includes('Blad') || message.includes('Nieobslug') || message.includes('za duzy')
              ? '#fca5a5' : '#86efac',
          }}>
            {message}
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Przeslane pliki ({uploadedFiles.length})</h3>
            <div className="flex flex-col gap-2">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm text-white font-medium flex-1">{f.name}</span>
                  <span className="text-[13px] text-slate-500">{formatSize(f.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
