'use client'

import { useState, useRef } from 'react'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon']
const COLORS = ['Biały', 'Czarny', 'Szary', 'Czerwony', 'Niebieski', 'Zielony', 'Żółty', 'Pomarańczowy']
const QUALITIES = ['Draft (0.3mm)', 'Standard (0.2mm)', 'High (0.12mm)']
const INFILLS = ['15%', '30%', '50%', '100%']

interface FarmResult {
  name: string
  city: string
  rating: number
  reviews: number
  price: string
  eta: string
  materials: string[]
  distance: string
}

const DEMO_FARMS: FarmResult[] = [
  { name: '3DPrint Warszawa', city: 'Warszawa', rating: 4.9, reviews: 234, price: '24.50 zł', eta: '2 dni', materials: ['PLA', 'PETG', 'ABS', 'TPU'], distance: '12 km' },
  { name: 'MakerHive', city: 'Kraków', rating: 4.7, reviews: 189, price: '28.00 zł', eta: '1 dzień', materials: ['PLA', 'PETG', 'ASA', 'Nylon'], distance: '45 km' },
  { name: 'PrintLab Pro', city: 'Wrocław', rating: 4.8, reviews: 156, price: '22.90 zł', eta: '3 dni', materials: ['PLA', 'PETG', 'ABS'], distance: '78 km' },
  { name: 'NanoForge', city: 'Gdańsk', rating: 4.6, reviews: 98, price: '31.00 zł', eta: '1 dzień', materials: ['PLA', 'PETG', 'TPU', 'Nylon', 'PC'], distance: '120 km' },
  { name: 'Drukuj.pl', city: 'Poznań', rating: 4.5, reviews: 312, price: '19.90 zł', eta: '4 dni', materials: ['PLA', 'PETG'], distance: '95 km' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#facc15' : 'none'} stroke="#facc15" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragover, setDragover] = useState(false)
  const [material, setMaterial] = useState(MATERIALS[0])
  const [color, setColor] = useState(COLORS[0])
  const [quality, setQuality] = useState(QUALITIES[1])
  const [infill, setInfill] = useState(INFILLS[1])
  const [quantity, setQuantity] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!ext || !['stl', '3mf', 'obj'].includes(ext)) {
      alert('Nieobsługiwany format. Użyj .STL, .3MF lub .OBJ')
      return
    }
    if (f.size > 100 * 1024 * 1024) {
      alert('Plik za duży. Max 100 MB.')
      return
    }
    setFile(f)
    setShowResults(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragover(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? (bytes / 1024).toFixed(1) + ' KB'
      : (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/index.html" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <span className="text-lg font-bold text-white">Print<span style={{ color: '#3b82f6' }}>Flow</span></span>
        </a>
        <a href="/index.html" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">
          ← Strona główna
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Zamów wydruk 3D</h1>
        <p className="text-slate-400 mb-8">Wrzuć plik, skonfiguruj wydruk i porównaj oferty z farm drukarek.</p>

        {/* Drop zone */}
        {!file ? (
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
            <p className="text-xl font-semibold text-white">Przeciągnij plik tutaj</p>
            <p className="text-slate-500 text-sm mt-2">lub kliknij żeby wybrać z dysku &bull; max 100 MB</p>
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
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
          </div>
        ) : (
          <>
            {/* File info + config */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-[15px]">{file.name}</p>
                    <p className="text-slate-500 text-[13px]">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setShowResults(false) }}
                  className="text-sm text-slate-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
                >
                  Zmień plik
                </button>
              </div>
            </div>

            {/* Configuration */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-lg font-semibold text-white mb-5">Konfiguracja wydruku</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Material */}
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Materiał</label>
                  <select
                    value={material}
                    onChange={e => setMaterial(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none appearance-none cursor-pointer"
                    style={inputStyle}
                  >
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Kolor</label>
                  <select
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none appearance-none cursor-pointer"
                    style={inputStyle}
                  >
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Jakość</label>
                  <div className="flex gap-2">
                    {QUALITIES.map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        className="flex-1 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-all border-none"
                        style={{
                          background: quality === q ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                          color: quality === q ? '#3b82f6' : '#94a3b8',
                          outline: quality === q ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {q.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Infill */}
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Wypełnienie</label>
                  <div className="flex gap-2">
                    {INFILLS.map(inf => (
                      <button
                        key={inf}
                        type="button"
                        onClick={() => setInfill(inf)}
                        className="flex-1 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-all border-none"
                        style={{
                          background: infill === inf ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                          color: infill === inf ? '#3b82f6' : '#94a3b8',
                          outline: infill === inf ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {inf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Ilość sztuk</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg cursor-pointer border-none"
                      style={inputStyle}
                    >−</button>
                    <span className="text-white text-lg font-semibold w-8 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg cursor-pointer border-none"
                      style={inputStyle}
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={() => setShowResults(true)}
                className="w-full mt-6 py-4 rounded-xl text-white font-semibold text-[16px] border-none cursor-pointer transition-all hover:opacity-90"
                style={{ background: '#3b82f6' }}
              >
                Pokaż polecane farmy
              </button>
            </div>

            {/* Results */}
            {showResults && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Polecane farmy</h2>
                <p className="text-slate-500 text-sm mb-5">
                  {DEMO_FARMS.length} farm pasuje do Twojego wydruku &bull; {material} &bull; {quality.split(' ')[0]} &bull; {infill} infill &bull; {quantity} szt.
                </p>

                <div className="flex flex-col gap-4">
                  {DEMO_FARMS.map((farm, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-5 transition-all hover:translate-y-[-2px]"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ background: 'rgba(59,130,246,0.15)' }}>
                              {farm.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-[15px]">{farm.name}</h3>
                              <p className="text-slate-500 text-[13px]">{farm.city} &bull; {farm.distance}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Stars rating={farm.rating} />
                            <span className="text-slate-400 text-[13px]">{farm.rating} ({farm.reviews} opinii)</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {farm.materials.map(mat => (
                              <span key={mat} className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                                {mat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 min-w-[140px]">
                          <span className="text-2xl font-bold text-white">{farm.price}</span>
                          <span className="text-slate-400 text-[13px]">ETA: {farm.eta}</span>
                          <button
                            onClick={() => alert('Coming soon! Zamówienia będą dostępne wkrótce.')}
                            className="mt-1 px-6 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none transition-all hover:opacity-90"
                            style={{ background: '#3b82f6' }}
                          >
                            Zamów
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
