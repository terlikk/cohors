'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon']
const COLORS = ['Biały', 'Czarny', 'Szary', 'Czerwony', 'Niebieski', 'Zielony', 'Żółty', 'Pomarańczowy']
const QUALITIES = ['Draft (0.3mm)', 'Standard (0.2mm)', 'High (0.12mm)']
const INFILLS = ['15%', '30%', '50%', '100%']

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [dragover, setDragover] = useState(false)
  const [material, setMaterial] = useState(MATERIALS[0])
  const [color, setColor] = useState(COLORS[0])
  const [quality, setQuality] = useState(QUALITIES[1])
  const [infill, setInfill] = useState(INFILLS[1])
  const [quantity, setQuantity] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFiles(newFiles: FileList | File[]) {
    const valid: File[] = []
    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i]
      const ext = f.name.split('.').pop()?.toLowerCase()
      if (!ext || !['stl', '3mf', 'obj'].includes(ext)) {
        alert(`Nieobsługiwany format: ${f.name}. Użyj .STL, .3MF lub .OBJ`)
        continue
      }
      if (f.size > 100 * 1024 * 1024) {
        alert(`Plik za duży: ${f.name}. Max 100 MB.`)
        continue
      }
      valid.push(f)
    }
    if (valid.length > 0) {
      setFiles(prev => [...prev, ...valid])
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragover(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
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
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <span className="text-lg font-bold text-white">Print<span style={{ color: '#8B5CF6' }}>Flow</span></span>
        </a>
        <a href="/index.html" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">
          ← Strona główna
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Zamów wydruk 3D</h1>
        <p className="text-slate-400 mb-8">Wrzuć pliki, skonfiguruj wydruk i znajdź farmę w marketplace.</p>

        {/* Drop zone */}
        {files.length === 0 ? (
          <div
            className="rounded-3xl p-16 text-center cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragover ? '#8B5CF6' : 'rgba(139,92,246,0.3)'}`,
              background: dragover ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.03)',
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragover(true) }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(139,92,246,0.1)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <p className="text-xl font-semibold text-white">Przeciągnij pliki tutaj</p>
            <p className="text-slate-500 text-sm mt-2">lub kliknij żeby wybrać z dysku &bull; max 100 MB na plik</p>
            <div className="flex gap-2.5 justify-center mt-5">
              {['.STL', '.3MF', '.OBJ'].map(f => (
                <span key={f} className="px-3.5 py-1 rounded-lg text-[13px] font-medium" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>{f}</span>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.3mf,.obj"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>
        ) : (
          <>
            {/* File list */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Pliki ({files.length})</h2>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-slate-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
                >
                  Wyczyść wszystko
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-[15px]">{file.name}</p>
                        <p className="text-slate-500 text-[13px]">{formatSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer bg-transparent border-none"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add more files button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-4 py-3 rounded-xl text-[14px] font-medium cursor-pointer transition-all border-none"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}
              >
                + Dodaj więcej plików
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".stl,.3mf,.obj"
                multiple
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
                  e.target.value = ''
                }}
              />
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
                          background: quality === q ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                          color: quality === q ? '#8B5CF6' : '#94a3b8',
                          outline: quality === q ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
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
                          background: infill === inf ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                          color: infill === inf ? '#8B5CF6' : '#94a3b8',
                          outline: infill === inf ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
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
                onClick={() => {
                  const params = new URLSearchParams({ material, quantity: String(quantity) })
                  router.push(`/marketplace?${params.toString()}`)
                }}
                className="w-full mt-6 py-4 rounded-xl text-white font-semibold text-[16px] border-none cursor-pointer transition-all hover:opacity-90"
                style={{ background: '#22C55E' }}
              >
                Szukaj farm w marketplace →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
