'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon']
const MATERIAL_DENSITY: Record<string, number> = {
  PLA: 1.24, PETG: 1.27, ABS: 1.04, TPU: 1.21, ASA: 1.07, Nylon: 1.14,
}
const QUALITY_SPEED: Record<string, number> = {
  'Draft (0.3mm)': 20, 'Standard (0.2mm)': 12, 'High (0.12mm)': 8,
}
const MATERIAL_LABELS: Record<string, string> = {
  PLA: 'Uniwersalny', PETG: 'Odporny', ABS: 'Wytrzymały', TPU: 'Elastyczny', ASA: 'UV-odporny', Nylon: 'Mechaniczny',
}

const COLOR_OPTIONS = [
  { name: 'Biały', hex: '#ffffff' },
  { name: 'Czarny', hex: '#1a1a1a' },
  { name: 'Szary', hex: '#9ca3af' },
  { name: 'Czerwony', hex: '#ef4444' },
  { name: 'Niebieski', hex: '#3b82f6' },
  { name: 'Zielony', hex: '#22c55e' },
  { name: 'Żółty', hex: '#eab308' },
  { name: 'Pomarańczowy', hex: '#f97316' },
  { name: 'Fioletowy', hex: '#a855f7' },
  { name: 'Różowy', hex: '#ec4899' },
] as const

const COLORS = COLOR_OPTIONS.map(c => c.name)
const QUALITIES = ['Draft (0.3mm)', 'Standard (0.2mm)', 'High (0.12mm)']
const INFILLS = ['15%', '30%', '50%', '100%']

interface StlDimensions {
  x: number
  y: number
  z: number
  volumeMm3: number
}

function parseStlBinary(buffer: ArrayBuffer): StlDimensions | null {
  try {
    const view = new DataView(buffer)
    if (buffer.byteLength < 84) return null
    const triangleCount = view.getUint32(80, true)
    const expectedSize = 84 + triangleCount * 50
    if (buffer.byteLength < expectedSize) return null

    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

    for (let i = 0; i < triangleCount; i++) {
      const offset = 84 + i * 50 + 12 // skip normal (3 floats = 12 bytes)
      for (let v = 0; v < 3; v++) {
        const vOffset = offset + v * 12
        const x = view.getFloat32(vOffset, true)
        const y = view.getFloat32(vOffset + 4, true)
        const z = view.getFloat32(vOffset + 8, true)
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        if (z < minZ) minZ = z
        if (z > maxZ) maxZ = z
      }
    }

    const dx = maxX - minX
    const dy = maxY - minY
    const dz = maxZ - minZ
    return { x: dx, y: dy, z: dz, volumeMm3: dx * dy * dz }
  } catch {
    return null
  }
}

interface FileDimensions {
  dims: StlDimensions | null
  isStl: boolean
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [fileDimensions, setFileDimensions] = useState<FileDimensions[]>([])
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
      if (!ext || !['stl', '3mf', 'obj', 'step', 'stp'].includes(ext)) {
        alert(`Nieobsługiwany format: ${f.name}. Użyj .STL, .3MF, .OBJ, .STEP lub .STP`)
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
      // Parse STL dimensions for each new file
      valid.forEach(f => {
        const ext = f.name.split('.').pop()?.toLowerCase()
        if (ext === 'stl') {
          f.arrayBuffer().then(buf => {
            const dims = parseStlBinary(buf)
            setFileDimensions(prev => [...prev, { dims, isStl: true }])
          }).catch(() => {
            setFileDimensions(prev => [...prev, { dims: null, isStl: true }])
          })
        } else {
          setFileDimensions(prev => [...prev, { dims: null, isStl: false }])
        }
      })
    }
  }

  // Get the max dimensions across all STL files (for bed size filtering)
  const maxDims = fileDimensions.reduce<{ x: number; y: number; z: number } | null>((acc, fd) => {
    if (!fd.dims) return acc
    if (!acc) return { x: fd.dims.x, y: fd.dims.y, z: fd.dims.z }
    return {
      x: Math.max(acc.x, fd.dims.x),
      y: Math.max(acc.y, fd.dims.y),
      z: Math.max(acc.z, fd.dims.z),
    }
  }, null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragover(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setFileDimensions(prev => prev.filter((_, i) => i !== index))
  }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? (bytes / 1024).toFixed(1) + ' KB'
      : (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Compute real estimation from STL data
  function calcEstimation() {
    const totalVolumeMm3 = fileDimensions.reduce((sum, fd) => sum + (fd.dims?.volumeMm3 || 0), 0)
    const hasStlData = fileDimensions.some(fd => fd.dims)
    if (!hasStlData || totalVolumeMm3 === 0) return null

    const infillPct = parseInt(infill) / 100
    const fillFactor = infillPct * 0.3 + 0.15
    const volumeCm3 = (totalVolumeMm3 / 1000) * fillFactor
    const density = MATERIAL_DENSITY[material] || 1.24
    const filamentGrams = volumeCm3 * density
    const filamentDiameter = 1.75
    const filamentArea = Math.PI * (filamentDiameter / 2) ** 2
    const filamentMeters = filamentGrams / (filamentArea * density) / 100 * 1000
    const speedGPerH = QUALITY_SPEED[quality] || 12
    const timeHoursSingle = filamentGrams / speedGPerH

    return {
      filamentGrams: filamentGrams * quantity,
      filamentMeters: filamentMeters * quantity,
      timeHoursSingle,
      timeHoursTotal: timeHoursSingle * quantity,
    }
  }

  const estimation = calcEstimation()

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
              {['.STL', '.3MF', '.OBJ', '.STEP', '.STP'].map(f => (
                <span key={f} className="px-3.5 py-1 rounded-lg text-[13px] font-medium" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>{f}</span>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.3mf,.obj,.step,.stp"
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
                  onClick={() => { setFiles([]); setFileDimensions([]) }}
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
                        {fileDimensions[index] && (
                          fileDimensions[index].dims ? (
                            <div className="mt-1">
                              <p className="text-[12px]" style={{ color: '#a78bfa' }}>
                                {fileDimensions[index].dims!.x.toFixed(1)} x {fileDimensions[index].dims!.y.toFixed(1)} x {fileDimensions[index].dims!.z.toFixed(1)} mm
                              </p>
                              <p className="text-[11px] text-slate-500">
                                ~{(() => {
                                  const vol = fileDimensions[index].dims!.volumeMm3
                                  const infillPct = parseInt(infill) / 100
                                  const fillFactor = infillPct * 0.3 + 0.15
                                  const density = MATERIAL_DENSITY[material] || 1.24
                                  const volumeCm3 = (vol / 1000) * fillFactor
                                  const grams = volumeCm3 * density
                                  return grams.toFixed(0)
                                })()}g filamentu ({material})
                              </p>
                            </div>
                          ) : fileDimensions[index].isStl ? (
                            <p className="text-[11px] text-slate-500 mt-1">Nie udało się odczytać wymiarów</p>
                          ) : (
                            <p className="text-[11px] text-slate-500 mt-1">Wymiary niedostępne (tylko STL)</p>
                          )
                        )}
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
                accept=".stl,.3mf,.obj,.step,.stp"
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
                {/* Material tiles */}
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-[13px] font-medium mb-2">Materiał</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {MATERIALS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMaterial(m)}
                        className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl cursor-pointer transition-all border-none"
                        style={{
                          background: material === m ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                          outline: material === m ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span className="text-[13px] font-bold" style={{ color: material === m ? '#a78bfa' : '#94a3b8' }}>{m.charAt(0)}</span>
                        <span className="text-[13px] font-semibold" style={{ color: material === m ? '#8B5CF6' : '#fff' }}>{m}</span>
                        <span className="text-[10px]" style={{ color: material === m ? '#a78bfa' : '#64748b' }}>{MATERIAL_LABELS[m]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color swatches */}
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-[13px] font-medium mb-2">Kolor</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColor(c.name)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer border-none bg-transparent p-0"
                        title={c.name}
                      >
                        <div
                          className="w-10 h-10 rounded-full transition-all"
                          style={{
                            background: c.hex,
                            outline: color === c.name ? '3px solid #8B5CF6' : '2px solid rgba(255,255,255,0.1)',
                            outlineOffset: color === c.name ? '2px' : '0px',
                            boxShadow: color === c.name ? '0 0 12px rgba(139,92,246,0.4)' : 'none',
                          }}
                        />
                        {color === c.name && (
                          <span className="text-[11px] font-medium" style={{ color: '#a78bfa' }}>{c.name}</span>
                        )}
                      </button>
                    ))}
                  </div>
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

              {/* Estimate card */}
              <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-sm font-semibold" style={{ color: '#a78bfa' }}>Szacunkowe zuzycie</span>
                </div>
                {estimation ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Filament</p>
                      <p className="text-white font-semibold text-sm">~{estimation.filamentGrams.toFixed(0)}g</p>
                      <p className="text-slate-500 text-[11px]">~{estimation.filamentMeters.toFixed(1)} m ({(estimation.filamentGrams / 1000).toFixed(2)} kg)</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Czas druku (1 drukarka)</p>
                      <p className="text-white font-semibold text-sm">~{estimation.timeHoursTotal.toFixed(1)}h</p>
                      <p className="text-slate-500 text-[11px]">{quantity} szt x ~{estimation.timeHoursSingle.toFixed(1)}h/szt</p>
                    </div>
                    <div className="rounded-lg p-3 col-span-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Parametry kalkulacji</p>
                      <p className="text-slate-500 text-[11px]">{material} ({MATERIAL_DENSITY[material]} g/cm3) | {quality} | Wypelnienie {infill}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-slate-400 text-sm">Dokladne oszacowanie po analizie pliku</p>
                    <p className="text-slate-500 text-[11px]">Wymiary i czas druku dostepne dla plikow STL</p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    material,
                    color,
                    quality,
                    quantity: String(quantity),
                    infill,
                  })
                  if (files.length > 0) {
                    params.set('files', files.map(f => f.name).join(','))
                  }
                  if (maxDims) {
                    params.set('maxX', maxDims.x.toFixed(1))
                    params.set('maxY', maxDims.y.toFixed(1))
                    params.set('maxZ', maxDims.z.toFixed(1))
                  }
                  if (estimation) {
                    params.set('estGrams', estimation.filamentGrams.toFixed(1))
                    params.set('estTimeSingle', estimation.timeHoursSingle.toFixed(2))
                  }
                  router.push(`/marketplace?${params.toString()}`)
                }}
                className="w-full mt-6 py-4 rounded-xl text-white font-semibold text-[16px] border-none cursor-pointer transition-all hover:opacity-90"
                style={{ background: '#22C55E' }}
              >
                Pokaż polecane farmy →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
