'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon']
const MATERIAL_DENSITY: Record<string, number> = {
  PLA: 1.24, PETG: 1.27, ABS: 1.04, TPU: 1.21, ASA: 1.07, Nylon: 1.14,
}
const QUALITY_SPEED: Record<string, number> = {
  'Draft (0.3mm)': 20, 'Standard (0.2mm)': 12, 'High (0.12mm)': 8,
}
const MATERIAL_LABELS: Record<string, string> = {
  PLA: 'Uniwersalny', PETG: 'Odporny', ABS: 'Wytrzymaly', TPU: 'Elastyczny', ASA: 'UV-odporny', Nylon: 'Mechaniczny',
}
const COLOR_OPTIONS = [
  { name: 'Bialy', hex: '#ffffff' },
  { name: 'Czarny', hex: '#1a1a1a' },
  { name: 'Szary', hex: '#9ca3af' },
  { name: 'Czerwony', hex: '#ef4444' },
  { name: 'Niebieski', hex: '#3b82f6' },
  { name: 'Zielony', hex: '#22c55e' },
  { name: 'Zolty', hex: '#eab308' },
  { name: 'Pomaranczowy', hex: '#f97316' },
  { name: 'Fioletowy', hex: '#a855f7' },
  { name: 'Rozowy', hex: '#ec4899' },
]
const QUALITIES = ['Draft (0.3mm)', 'Standard (0.2mm)', 'High (0.12mm)']
const INFILLS = ['15%', '30%', '50%', '100%']

interface Dims { x: number; y: number; z: number; volumeMm3: number }

interface FileItem {
  file: File
  dims: Dims | null
  parsing: boolean
  material: string
  color: string
  quality: string
  infill: string
  quantity: number
  expanded: boolean
}

// ============ PARSERS ============

function parseStlBinary(buf: ArrayBuffer): Dims | null {
  try {
    const v = new DataView(buf)
    if (buf.byteLength < 84) return null
    const tc = v.getUint32(80, true)
    if (buf.byteLength < 84 + tc * 50) return null
    let minX=Infinity, minY=Infinity, minZ=Infinity, maxX=-Infinity, maxY=-Infinity, maxZ=-Infinity
    for (let i = 0; i < tc; i++) {
      const o = 84 + i * 50 + 12
      for (let j = 0; j < 3; j++) {
        const p = o + j * 12
        const x = v.getFloat32(p, true), y = v.getFloat32(p+4, true), z = v.getFloat32(p+8, true)
        if (x<minX) minX=x; if (x>maxX) maxX=x
        if (y<minY) minY=y; if (y>maxY) maxY=y
        if (z<minZ) minZ=z; if (z>maxZ) maxZ=z
      }
    }
    const dx=maxX-minX, dy=maxY-minY, dz=maxZ-minZ
    return { x: dx, y: dy, z: dz, volumeMm3: dx*dy*dz }
  } catch { return null }
}

function parseStlAscii(text: string): Dims | null {
  let minX=Infinity, minY=Infinity, minZ=Infinity, maxX=-Infinity, maxY=-Infinity, maxZ=-Infinity
  let found = false
  const re = /vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g
  let m
  while ((m = re.exec(text))) {
    const x=parseFloat(m[1]), y=parseFloat(m[2]), z=parseFloat(m[3])
    if (isNaN(x)||isNaN(y)||isNaN(z)) continue
    found = true
    if (x<minX) minX=x; if (x>maxX) maxX=x
    if (y<minY) minY=y; if (y>maxY) maxY=y
    if (z<minZ) minZ=z; if (z>maxZ) maxZ=z
  }
  if (!found) return null
  const dx=maxX-minX, dy=maxY-minY, dz=maxZ-minZ
  return { x: dx, y: dy, z: dz, volumeMm3: dx*dy*dz }
}

function parseObj(text: string): Dims | null {
  let minX=Infinity, minY=Infinity, minZ=Infinity, maxX=-Infinity, maxY=-Infinity, maxZ=-Infinity
  let found = false
  for (const line of text.split('\n')) {
    if (!line.startsWith('v ')) continue
    const parts = line.trim().split(/\s+/)
    if (parts.length < 4) continue
    const x=parseFloat(parts[1]), y=parseFloat(parts[2]), z=parseFloat(parts[3])
    if (isNaN(x)||isNaN(y)||isNaN(z)) continue
    found = true
    if (x<minX) minX=x; if (x>maxX) maxX=x
    if (y<minY) minY=y; if (y>maxY) maxY=y
    if (z<minZ) minZ=z; if (z>maxZ) maxZ=z
  }
  if (!found) return null
  const dx=maxX-minX, dy=maxY-minY, dz=maxZ-minZ
  return { x: dx, y: dy, z: dz, volumeMm3: dx*dy*dz }
}

function parseStep(text: string): Dims | null {
  // STEP files have CARTESIAN_POINT('',(...)) entries
  let minX=Infinity, minY=Infinity, minZ=Infinity, maxX=-Infinity, maxY=-Infinity, maxZ=-Infinity
  let found = false
  const re = /CARTESIAN_POINT\s*\(\s*'[^']*'\s*,\s*\(\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*\)/g
  let m
  while ((m = re.exec(text))) {
    const x=parseFloat(m[1]), y=parseFloat(m[2]), z=parseFloat(m[3])
    if (isNaN(x)||isNaN(y)||isNaN(z)) continue
    found = true
    if (x<minX) minX=x; if (x>maxX) maxX=x
    if (y<minY) minY=y; if (y>maxY) maxY=y
    if (z<minZ) minZ=z; if (z>maxZ) maxZ=z
  }
  if (!found) return null
  const dx=maxX-minX, dy=maxY-minY, dz=maxZ-minZ
  return { x: dx, y: dy, z: dz, volumeMm3: dx*dy*dz }
}

async function parseFile(file: File): Promise<Dims | null> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  try {
    if (ext === 'stl') {
      const buf = await file.arrayBuffer()
      // Try binary first, then ASCII
      const dims = parseStlBinary(buf)
      if (dims) return dims
      const text = new TextDecoder().decode(buf)
      return parseStlAscii(text)
    }
    if (ext === 'obj') {
      const text = await file.text()
      return parseObj(text)
    }
    if (ext === 'step' || ext === 'stp') {
      const text = await file.text()
      return parseStep(text)
    }
    if (ext === '3mf') {
      // 3MF is a ZIP — try to find vertices in model XML
      // Basic approach: read as text and find coordinates
      // Full 3MF parsing would need a ZIP library
      return null // TODO: add JSZip for full 3MF support
    }
  } catch { /* ignore */ }
  return null
}

// ============ CALC ============

function calcFileEstimation(item: FileItem) {
  if (!item.dims) return null
  const infillPct = parseInt(item.infill) / 100
  const fillFactor = infillPct * 0.3 + 0.15
  const volumeCm3 = (item.dims.volumeMm3 / 1000) * fillFactor
  const density = MATERIAL_DENSITY[item.material] || 1.24
  const grams = volumeCm3 * density
  const filArea = Math.PI * (1.75 / 2) ** 2
  const meters = grams / (filArea * density) / 100 * 1000
  const speed = QUALITY_SPEED[item.quality] || 12
  const timeH = grams / speed
  return {
    grams: grams * item.quantity,
    meters: meters * item.quantity,
    timeSingleH: timeH,
    timeTotalH: timeH * item.quantity,
  }
}

// ============ COMPONENT ============

export default function UploadPage() {
  const [items, setItems] = useState<FileItem[]>([])
  const [dragover, setDragover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFiles(newFiles: FileList | File[]) {
    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i]
      const ext = f.name.split('.').pop()?.toLowerCase()
      if (!ext || !['stl', '3mf', 'obj', 'step', 'stp'].includes(ext)) {
        alert(`Nieobslugiwany format: ${f.name}`)
        continue
      }
      if (f.size > 100 * 1024 * 1024) {
        alert(`Plik za duzy: ${f.name}. Max 100 MB.`)
        continue
      }
      const newItem: FileItem = {
        file: f, dims: null, parsing: true,
        material: 'PLA', color: 'Czarny', quality: 'Standard (0.2mm)', infill: '30%', quantity: 1,
        expanded: true,
      }
      setItems(prev => [...prev, newItem])
      const idx = items.length + i // approximate, but works for single batch
      parseFile(f).then(dims => {
        setItems(prev => prev.map((item, j) => 
          item.file === f ? { ...item, dims, parsing: false } : item
        ))
      })
    }
  }

  function updateItem(index: number, updates: Partial<FileItem>) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item))
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Totals across all files
  const totals = items.reduce((acc, item) => {
    const est = calcFileEstimation(item)
    if (est) {
      acc.grams += est.grams
      acc.meters += est.meters
      acc.timeH += est.timeTotalH
      acc.hasData = true
    }
    acc.totalQty += item.quantity
    return acc
  }, { grams: 0, meters: 0, timeH: 0, totalQty: 0, hasData: false })

  // Max dims for bed filtering
  const maxDims = items.reduce<{ x: number; y: number; z: number } | null>((acc, item) => {
    if (!item.dims) return acc
    if (!acc) return { x: item.dims.x, y: item.dims.y, z: item.dims.z }
    return { x: Math.max(acc.x, item.dims.x), y: Math.max(acc.y, item.dims.y), z: Math.max(acc.z, item.dims.z) }
  }, null)

  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/index.html" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <span className="text-lg font-bold text-white">Print<span style={{ color: '#8B5CF6' }}>Flow</span></span>
        </a>
        <a href="/index.html" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">← Strona glowna</a>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Zamow wydruk 3D</h1>
        <p className="text-slate-400 mb-8">Wrzuc pliki — kazdy z osobnymi ustawieniami.</p>

        {items.length === 0 ? (
          <div
            className="rounded-3xl p-16 text-center cursor-pointer transition-all"
            style={{ border: `2px dashed ${dragover ? '#8B5CF6' : 'rgba(139,92,246,0.3)'}`, background: dragover ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.03)' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragover(true) }}
            onDragLeave={() => setDragover(false)}
            onDrop={e => { e.preventDefault(); setDragover(false); if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files) }}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(139,92,246,0.1)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <p className="text-xl font-semibold text-white">Przeciagnij pliki tutaj</p>
            <p className="text-slate-500 text-sm mt-2">lub kliknij zeby wybrac z dysku</p>
            <div className="flex gap-2.5 justify-center mt-5">
              {['.STL', '.OBJ', '.STEP', '.STP', '.3MF'].map(f => (
                <span key={f} className="px-3.5 py-1 rounded-lg text-[13px] font-medium" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>{f}</span>
              ))}
            </div>
            <input ref={fileInputRef} type="file" accept=".stl,.3mf,.obj,.step,.stp" multiple className="hidden"
              onChange={e => { if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files); e.target.value = '' }} />
          </div>
        ) : (
          <>
            {/* Per-file cards */}
            <div className="flex flex-col gap-4 mb-6">
              {items.map((item, index) => {
                const est = calcFileEstimation(item)
                return (
                  <div key={index} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {/* File header - always visible */}
                    <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => updateItem(index, { expanded: !item.expanded })}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-[15px]">{item.file.name}</p>
                          <div className="flex items-center gap-2 text-[12px] text-slate-500">
                            <span>{formatSize(item.file.size)}</span>
                            {item.parsing && <span style={{ color: '#a78bfa' }}>Analizowanie...</span>}
                            {item.dims && <span style={{ color: '#4ade80' }}>{item.dims.x.toFixed(1)} x {item.dims.y.toFixed(1)} x {item.dims.z.toFixed(1)} mm</span>}
                            <span className="text-slate-600">|</span>
                            <span>{item.material} {item.color} {item.quantity}szt</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {est && <span className="text-[12px] font-medium" style={{ color: '#4ade80' }}>{est.grams.toFixed(0)}g / {est.timeTotalH.toFixed(1)}h</span>}
                        <button onClick={e => { e.stopPropagation(); removeItem(index) }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 cursor-pointer bg-transparent border-none">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"
                          style={{ transform: item.expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {/* Expanded settings */}
                    {item.expanded && (
                      <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Material */}
                          <div className="md:col-span-2">
                            <label className="block text-slate-500 text-[12px] font-medium mb-1.5">Material</label>
                            <div className="flex flex-wrap gap-1.5">
                              {MATERIALS.map(m => (
                                <button key={m} type="button" onClick={() => updateItem(index, { material: m })}
                                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all border-none"
                                  style={{
                                    background: item.material === m ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                                    color: item.material === m ? '#8B5CF6' : '#94a3b8',
                                    outline: item.material === m ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.06)',
                                  }}>
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Color */}
                          <div className="md:col-span-2">
                            <label className="block text-slate-500 text-[12px] font-medium mb-1.5">Kolor</label>
                            <div className="flex flex-wrap gap-2">
                              {COLOR_OPTIONS.map(c => (
                                <button key={c.name} type="button" onClick={() => updateItem(index, { color: c.name })}
                                  className="cursor-pointer border-none bg-transparent p-0" title={c.name}>
                                  <div className="w-7 h-7 rounded-full transition-all" style={{
                                    background: c.hex,
                                    outline: item.color === c.name ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                                    outlineOffset: item.color === c.name ? '2px' : '0px',
                                  }} />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quality */}
                          <div>
                            <label className="block text-slate-500 text-[12px] font-medium mb-1.5">Jakosc</label>
                            <div className="flex gap-1.5">
                              {QUALITIES.map(q => (
                                <button key={q} type="button" onClick={() => updateItem(index, { quality: q })}
                                  className="flex-1 px-2 py-2 rounded-lg text-[11px] font-medium cursor-pointer transition-all border-none"
                                  style={{
                                    background: item.quality === q ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                                    color: item.quality === q ? '#8B5CF6' : '#94a3b8',
                                    outline: item.quality === q ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                  }}>
                                  {q.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Infill */}
                          <div>
                            <label className="block text-slate-500 text-[12px] font-medium mb-1.5">Wypelnienie</label>
                            <div className="flex gap-1.5">
                              {INFILLS.map(inf => (
                                <button key={inf} type="button" onClick={() => updateItem(index, { infill: inf })}
                                  className="flex-1 px-2 py-2 rounded-lg text-[11px] font-medium cursor-pointer transition-all border-none"
                                  style={{
                                    background: item.infill === inf ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                                    color: item.infill === inf ? '#8B5CF6' : '#94a3b8',
                                    outline: item.infill === inf ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                  }}>
                                  {inf}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-slate-500 text-[12px] font-medium mb-1.5">Ilosc</label>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) })}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white cursor-pointer border-none" style={inputStyle}>-</button>
                              <span className="text-white font-semibold w-6 text-center">{item.quantity}</span>
                              <button type="button" onClick={() => updateItem(index, { quantity: item.quantity + 1 })}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white cursor-pointer border-none" style={inputStyle}>+</button>
                            </div>
                          </div>
                        </div>

                        {/* Per-file estimation */}
                        {est && (
                          <div className="mt-3 rounded-lg p-3 flex items-center gap-4 text-[12px]" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
                            <span style={{ color: '#4ade80' }}>Obliczono:</span>
                            <span className="text-white font-medium">{est.grams.toFixed(0)}g filamentu</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-white font-medium">{est.meters.toFixed(1)}m</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-white font-medium">{est.timeTotalH.toFixed(1)}h ({item.quantity}szt x {est.timeSingleH.toFixed(1)}h)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add more + totals */}
            <div className="flex gap-3 mb-4">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-xl text-[14px] font-medium cursor-pointer transition-all border-none"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                + Dodaj wiecej plikow
              </button>
              <button onClick={() => setItems([])}
                className="px-4 py-3 rounded-xl text-[14px] font-medium cursor-pointer transition-all border-none text-slate-500 hover:text-red-400"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                Wyczysc
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".stl,.3mf,.obj,.step,.stp" multiple className="hidden"
              onChange={e => { if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files); e.target.value = '' }} />

            {/* Total summary */}
            {totals.hasData && (
              <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: '#4ade80' }}>Podsumowanie ({items.length} plikow, {totals.totalQty} szt)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Filament</p>
                    <p className="text-white font-semibold text-sm">{totals.grams.toFixed(0)}g</p>
                    <p className="text-slate-500 text-[11px]">{totals.meters.toFixed(1)}m</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Czas (1 drukarka)</p>
                    <p className="text-white font-semibold text-sm">{totals.timeH.toFixed(1)}h</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Sztuk lacznie</p>
                    <p className="text-white font-semibold text-sm">{totals.totalQty}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={() => {
                // Use first file's settings as primary (or most common)
                const first = items[0]
                const params = new URLSearchParams({
                  material: first?.material || 'PLA',
                  color: first?.color || 'Czarny',
                  quality: first?.quality || 'Standard (0.2mm)',
                  quantity: String(totals.totalQty),
                  infill: first?.infill || '30%',
                  files: items.map(i => i.file.name).join(','),
                })
                if (maxDims) {
                  params.set('maxX', maxDims.x.toFixed(1))
                  params.set('maxY', maxDims.y.toFixed(1))
                  params.set('maxZ', maxDims.z.toFixed(1))
                }
                if (totals.hasData) {
                  params.set('estGrams', totals.grams.toFixed(1))
                  const avgTimeSingle = totals.timeH / totals.totalQty
                  params.set('estTimeSingle', avgTimeSingle.toFixed(2))
                }
                router.push(`/marketplace?${params.toString()}`)
              }}
              className="w-full py-4 rounded-xl text-white font-semibold text-[16px] border-none cursor-pointer transition-all hover:opacity-90"
              style={{ background: '#22C55E' }}
            >
              Pokaz polecane farmy →
            </button>
          </>
        )}
      </main>
    </div>
  )
}
