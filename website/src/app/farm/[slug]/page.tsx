'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase'

interface Farm {
  id: string
  name: string
  slug: string
  description: string | null
  city: string
  logo_url: string | null
  rating_avg: number | null
  rating_count: number | null
  is_active: boolean
}

interface Printer {
  id: string
  name: string
  model: string
  materials: string[]
  status: string
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#facc15' : 'none'} stroke="#facc15" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

export default function FarmProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [farm, setFarm] = useState<Farm | null>(null)
  const [printers, setPrinters] = useState<Printer[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: farmData, error } = await supabase
        .from('farms')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !farmData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setFarm(farmData)

      const { data: printerData } = await supabase
        .from('printers')
        .select('id, name, model, materials, status')
        .eq('farm_id', farmData.id)

      if (printerData) setPrinters(printerData)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <p className="text-slate-400">Ładowanie...</p>
      </div>
    )
  }

  if (notFound || !farm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0f172a' }}>
        <p className="text-white text-xl font-bold">Farma nie znaleziona</p>
        <p className="text-slate-400">Sprawdź link i spróbuj ponownie.</p>
        <a href="/" className="text-sm px-4 py-2 rounded-lg no-underline" style={{ background: '#22C55E', color: 'white' }}>
          Strona główna
        </a>
      </div>
    )
  }

  const allMaterials = [...new Set(printers.flatMap(p => p.materials))]

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 no-underline">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            </div>
            <span className="text-lg font-bold text-white">Print<span style={{ color: '#22C55E' }}>Flow</span></span>
          </a>
          <a
            href="/marketplace"
            className="text-sm text-slate-400 hover:text-white transition-colors no-underline"
          >
            ← Marketplace
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Farm header */}
        <div className="rounded-2xl p-8 mb-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0" style={{ background: 'rgba(34,197,94,0.15)' }}>
              {farm.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{farm.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {farm.city}
                </span>
                {farm.rating_avg && (
                  <div className="flex items-center gap-2">
                    <Stars rating={farm.rating_avg} />
                    <span className="text-sm font-medium text-white">{farm.rating_avg.toFixed(1)}</span>
                    {farm.rating_count && (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>({farm.rating_count} opinii)</span>
                    )}
                  </div>
                )}
              </div>
              {farm.description && (
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{farm.description}</p>
              )}
            </div>
          </div>

          {/* Materials */}
          {allMaterials.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Materiały</p>
              <div className="flex flex-wrap gap-1.5">
                {allMaterials.map(m => (
                  <span key={m} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          <a
            href="/upload"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm no-underline transition-all hover:opacity-90"
            style={{ background: '#22C55E' }}
          >
            Zamów wydruk z tej farmy
          </a>
        </div>

        {/* Printers */}
        <h2 className="text-lg font-bold text-white mb-4">
          Drukarki ({printers.length})
        </h2>

        {printers.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-slate-500 text-sm">Ta farma nie ma jeszcze drukarek.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {printers.map(printer => (
              <div key={printer.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-sm">{printer.name}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-lg font-medium" style={{
                    background: printer.status === 'idle' ? 'rgba(34,197,94,0.1)' : printer.status === 'printing' ? 'rgba(139,92,246,0.1)' : 'rgba(239,68,68,0.1)',
                    color: printer.status === 'idle' ? '#4ade80' : printer.status === 'printing' ? '#a78bfa' : '#f87171',
                  }}>
                    {printer.status === 'idle' ? 'Idle' : printer.status === 'printing' ? 'Printing' : 'Error'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mb-2">{printer.model}</p>
                <div className="flex flex-wrap gap-1">
                  {printer.materials.map(m => (
                    <span key={m} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
