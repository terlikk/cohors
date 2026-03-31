'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const MATERIALS_LIST = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon'] as const

const BASE_PRICES: Record<string, number> = {
  PLA: 45,
  PETG: 55,
  ABS: 65,
  TPU: 75,
  ASA: 60,
  Nylon: 70,
}

const FILAMENT_COLOR_HEX: Record<string, string> = {
  'Biały': '#ffffff',
  'Czarny': '#1a1a1a',
  'Szary': '#9ca3af',
  'Czerwony': '#ef4444',
  'Niebieski': '#3b82f6',
  'Zielony': '#22c55e',
  'Żółty': '#eab308',
  'Pomarańczowy': '#f97316',
  'Fioletowy': '#a855f7',
  'Różowy': '#ec4899',
  'Brązowy': '#92400e',
  'Naturalny': '#d4c5a9',
}

function getDiscount(qty: number): number {
  if (qty >= 100) return 0.15
  if (qty >= 50) return 0.10
  if (qty >= 10) return 0.05
  return 0
}

function calcPrintTimeHours(quantity: number, printers: number): number {
  return Math.ceil(quantity / Math.max(printers, 1)) * 2
}

interface FarmFilament {
  type: string
  color: string
  stock_grams: number
  low_stock_alert: number
}

interface Farm {
  id: string
  name: string
  slug: string
  city: string
  rating_avg: number | null
  rating_count: number | null
  materials: string[]
  printerCount: number
  filaments: FarmFilament[]
}

const DEMO_FARMS: Farm[] = [
  { id: 'd1', name: '3DPrint Warszawa', slug: '3dprint-warszawa', city: 'Warszawa', rating_avg: 4.9, rating_count: 234, materials: ['PLA', 'PETG', 'ABS', 'TPU'], printerCount: 8, filaments: [{ type: 'PLA', color: 'Czarny', stock_grams: 3000, low_stock_alert: 500 }, { type: 'PLA', color: 'Biały', stock_grams: 2500, low_stock_alert: 500 }, { type: 'PETG', color: 'Naturalny', stock_grams: 1000, low_stock_alert: 500 }, { type: 'ABS', color: 'Czerwony', stock_grams: 800, low_stock_alert: 500 }, { type: 'TPU', color: 'Czarny', stock_grams: 400, low_stock_alert: 500 }] },
  { id: 'd2', name: 'MakerHive', slug: 'makerhive', city: 'Kraków', rating_avg: 4.7, rating_count: 189, materials: ['PLA', 'PETG', 'ASA', 'Nylon'], printerCount: 12, filaments: [{ type: 'PLA', color: 'Biały', stock_grams: 5000, low_stock_alert: 500 }, { type: 'PETG', color: 'Czarny', stock_grams: 2000, low_stock_alert: 500 }, { type: 'ASA', color: 'Szary', stock_grams: 1500, low_stock_alert: 500 }, { type: 'Nylon', color: 'Naturalny', stock_grams: 900, low_stock_alert: 500 }] },
  { id: 'd3', name: 'PrintLab Pro', slug: 'printlab-pro', city: 'Wrocław', rating_avg: 4.8, rating_count: 156, materials: ['PLA', 'PETG', 'ABS'], printerCount: 5, filaments: [{ type: 'PLA', color: 'Czarny', stock_grams: 2000, low_stock_alert: 500 }, { type: 'PETG', color: 'Biały', stock_grams: 1500, low_stock_alert: 500 }, { type: 'ABS', color: 'Czarny', stock_grams: 300, low_stock_alert: 500 }] },
  { id: 'd4', name: 'NanoForge', slug: 'nanoforge', city: 'Gdańsk', rating_avg: 4.6, rating_count: 98, materials: ['PLA', 'PETG', 'TPU', 'Nylon'], printerCount: 15, filaments: [{ type: 'PLA', color: 'Biały', stock_grams: 8000, low_stock_alert: 500 }, { type: 'PETG', color: 'Czarny', stock_grams: 3000, low_stock_alert: 500 }, { type: 'TPU', color: 'Czarny', stock_grams: 1200, low_stock_alert: 500 }, { type: 'Nylon', color: 'Naturalny', stock_grams: 600, low_stock_alert: 500 }] },
  { id: 'd5', name: 'Drukuj.pl', slug: 'drukuj-pl', city: 'Poznań', rating_avg: 4.5, rating_count: 312, materials: ['PLA', 'PETG'], printerCount: 3, filaments: [{ type: 'PLA', color: 'Biały', stock_grams: 1000, low_stock_alert: 500 }, { type: 'PETG', color: 'Czarny', stock_grams: 500, low_stock_alert: 500 }] },
  { id: 'd6', name: '3D Masters', slug: '3d-masters', city: 'Łódź', rating_avg: 4.4, rating_count: 87, materials: ['PLA', 'ABS', 'ASA'], printerCount: 6, filaments: [{ type: 'PLA', color: 'Szary', stock_grams: 2000, low_stock_alert: 500 }, { type: 'ABS', color: 'Biały', stock_grams: 1500, low_stock_alert: 500 }, { type: 'ASA', color: 'Czarny', stock_grams: 800, low_stock_alert: 500 }] },
  { id: 'd7', name: 'PrintPoint', slug: 'printpoint', city: 'Katowice', rating_avg: 4.8, rating_count: 201, materials: ['PLA', 'PETG', 'TPU', 'ABS'], printerCount: 10, filaments: [{ type: 'PLA', color: 'Czarny', stock_grams: 4000, low_stock_alert: 500 }, { type: 'PLA', color: 'Czerwony', stock_grams: 1500, low_stock_alert: 500 }, { type: 'PETG', color: 'Biały', stock_grams: 2000, low_stock_alert: 500 }, { type: 'TPU', color: 'Czarny', stock_grams: 800, low_stock_alert: 500 }, { type: 'ABS', color: 'Szary', stock_grams: 1000, low_stock_alert: 500 }] },
  { id: 'd8', name: 'FabLab Szczecin', slug: 'fablab-szczecin', city: 'Szczecin', rating_avg: 4.3, rating_count: 65, materials: ['PLA', 'PETG', 'Nylon'], printerCount: 4, filaments: [{ type: 'PLA', color: 'Biały', stock_grams: 1200, low_stock_alert: 500 }, { type: 'PETG', color: 'Naturalny', stock_grams: 700, low_stock_alert: 500 }, { type: 'Nylon', color: 'Naturalny', stock_grams: 400, low_stock_alert: 500 }] },
  { id: 'd9', name: 'MegaPrint', slug: 'megaprint', city: 'Lublin', rating_avg: 4.6, rating_count: 143, materials: ['PLA', 'PETG', 'ABS', 'TPU', 'ASA'], printerCount: 9, filaments: [{ type: 'PLA', color: 'Czarny', stock_grams: 3500, low_stock_alert: 500 }, { type: 'PETG', color: 'Biały', stock_grams: 2500, low_stock_alert: 500 }, { type: 'ABS', color: 'Czerwony', stock_grams: 1200, low_stock_alert: 500 }, { type: 'TPU', color: 'Biały', stock_grams: 600, low_stock_alert: 500 }, { type: 'ASA', color: 'Szary', stock_grams: 1000, low_stock_alert: 500 }] },
  { id: 'd10', name: 'QuickPrint24', slug: 'quickprint24', city: 'Bydgoszcz', rating_avg: 4.2, rating_count: 52, materials: ['PLA', 'PETG'], printerCount: 2, filaments: [{ type: 'PLA', color: 'Biały', stock_grams: 800, low_stock_alert: 500 }, { type: 'PETG', color: 'Czarny', stock_grams: 500, low_stock_alert: 500 }] },
]

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#facc15' : 'none'} stroke="#facc15" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const urlMaterial = searchParams.get('material')
  const urlColor = searchParams.get('color')
  const urlQuality = searchParams.get('quality')
  const urlQuantity = searchParams.get('quantity')
  const urlInfill = searchParams.get('infill')
  const urlFiles = searchParams.get('files')

  const hasOrderParams = !!(urlMaterial && urlQuantity)
  const quantity = urlQuantity ? parseInt(urlQuantity, 10) : 1

  const [citySearch, setCitySearch] = useState('')
  const [minRating, setMinRating] = useState('0')
  const [sortBy, setSortBy] = useState('rating')
  const [farms, setFarms] = useState<Farm[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loadingFarms, setLoadingFarms] = useState(true)
  const [orderingFarmId, setOrderingFarmId] = useState<string | null>(null)
  const [orderConfirmation, setOrderConfirmation] = useState<string | null>(null)

  useEffect(() => {
    async function loadFarms() {
      const supabase = createClient()

      const { data: farmsData } = await supabase
        .from('farms')
        .select('id, name, slug, city, rating_avg, rating_count')
        .eq('is_active', true)

      if (farmsData && farmsData.length > 0) {
        const farmIds = farmsData.map(f => f.id)

        // Fetch printers and filaments in parallel
        const [printersRes, filamentsRes] = await Promise.all([
          supabase.from('printers').select('farm_id, materials').in('farm_id', farmIds),
          supabase.from('filaments').select('farm_id, type, color, stock_grams, low_stock_alert').in('farm_id', farmIds),
        ])

        const printersData = printersRes.data || []
        const filamentsData = filamentsRes.data || []

        const farmsList: Farm[] = farmsData.map(f => {
          const farmPrinters = printersData.filter(p => p.farm_id === f.id)
          const farmFilaments = filamentsData.filter(fil => fil.farm_id === f.id)
          // Materials come from filaments table (strict), not printers
          const filamentMaterials = [...new Set(farmFilaments.map(fil => fil.type))]
          return {
            id: f.id,
            name: f.name,
            slug: f.slug,
            city: f.city,
            rating_avg: f.rating_avg,
            rating_count: f.rating_count,
            materials: filamentMaterials.length > 0 ? filamentMaterials : [...new Set(farmPrinters.flatMap(p => p.materials || []))],
            printerCount: farmPrinters.length,
            filaments: farmFilaments.map(fil => ({ type: fil.type, color: fil.color, stock_grams: fil.stock_grams, low_stock_alert: fil.low_stock_alert })),
          }
        })

        setFarms(farmsList)
        setIsDemo(false)
      } else {
        setFarms(DEMO_FARMS)
        setIsDemo(true)
      }
      setLoadingFarms(false)
    }
    loadFarms()
  }, [])

  async function handleOrder(farm: Farm) {
    if (farm.id.startsWith('d')) {
      alert('To jest farma demo. Zarejestruj swoją farmę, aby przyjmować zamówienia!')
      return
    }

    setOrderingFarmId(farm.id)
    const supabase = createClient()

    const orderNumber = `PF-2026-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`
    const basePrice = urlMaterial ? (BASE_PRICES[urlMaterial] ?? 45) : 45
    const discount = getDiscount(quantity)
    const totalPrice = basePrice * quantity * (1 - discount)
    const printTimeH = calcPrintTimeHours(quantity, farm.printerCount)

    const { data: userData } = await supabase.auth.getUser()
    const clientEmail = userData?.user?.email || 'anonim@printflow.pl'

    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      client_email: clientEmail,
      farm_id: farm.id,
      status: 'nowe',
      file_names: urlFiles ? urlFiles.split(',') : [],
      material: urlMaterial || 'PLA',
      color: urlColor || 'Czarny',
      quality: urlQuality || 'Standard (0.2mm)',
      quantity,
      price_total: totalPrice,
      estimated_hours: printTimeH,
      notes: urlInfill ? `Wypełnienie: ${urlInfill}` : null,
    })

    setOrderingFarmId(null)

    if (error) {
      alert('Błąd składania zamówienia: ' + error.message)
      return
    }

    setOrderConfirmation(orderNumber)
  }

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }

  // Strict filtering: when material is specified, only show farms that have that material in filaments
  const filtered = farms
    .filter(f => {
      if (hasOrderParams && urlMaterial) {
        const hasFilament = f.filaments.some(fil => fil.type === urlMaterial)
        if (!hasFilament && f.filaments.length > 0) return false
        // Fallback: if farm has no filaments data, check materials from printers
        if (f.filaments.length === 0 && f.materials.length > 0 && !f.materials.includes(urlMaterial)) return false
      }
      if (citySearch && !f.city.toLowerCase().includes(citySearch.toLowerCase())) return false
      if (parseFloat(minRating) > 0 && (f.rating_avg || 0) < parseFloat(minRating)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating_avg || 0) - (a.rating_avg || 0)
      if (sortBy === 'printers') return b.printerCount - a.printerCount
      return 0
    })

  if (orderConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(34,197,94,0.15)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Zamówienie złożone!</h1>
          <p className="text-slate-400 mb-4">Twoje zamówienie zostało przekazane do farmy.</p>
          <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Numer zamówienia</p>
            <p className="text-xl font-bold" style={{ color: '#22C55E' }}>{orderConfirmation}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <a href="/marketplace" className="px-5 py-2.5 rounded-xl text-sm font-medium no-underline transition-all" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}>
              Wróć do marketplace
            </a>
            <a href="/upload" className="px-5 py-2.5 rounded-xl text-sm font-medium text-white no-underline transition-all" style={{ background: '#22C55E' }}>
              Nowe zamówienie
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm flex items-center gap-1 transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#8B5CF6')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              Powrót
            </a>
            <span className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>PrintFlow</span>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)' }}>Dane demo</span>
            )}
            {urlFiles && <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Pliki: {urlFiles}</div>}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#fff' }}>
          {hasOrderParams ? 'Farmy pasujące do Twojego zamówienia' : 'Marketplace farm druku 3D'}
        </h1>

        {hasOrderParams ? (
          <div className="rounded-xl p-4 mb-8 flex flex-wrap items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="text-sm font-medium" style={{ color: '#22C55E' }}>Znaleziono {filtered.length} farm dla:</span>
            {[urlMaterial, urlColor, `${quantity} szt`, urlQuality, urlInfill ? `wypełnienie ${urlInfill}` : null]
              .filter(Boolean)
              .map((tag, i) => (
                <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                  {tag}
                </span>
              ))}
          </div>
        ) : (
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Znajdź idealną farmę drukarek 3D dla swojego projektu</p>
        )}

        {/* Filter bar */}
        <div className="rounded-xl p-4 mb-8 grid gap-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Miasto</label>
            <input type="text" placeholder="Szukaj miasta..." value={citySearch} onChange={e => setCitySearch(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-white/20" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Min. ocena</label>
            <select value={minRating} onChange={e => setMinRating(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}>
              <option value="0">Dowolna</option>
              <option value="4">4.0+</option>
              <option value="4.3">4.3+</option>
              <option value="4.5">4.5+</option>
              <option value="4.7">4.7+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Sortuj wg</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}>
              <option value="rating">Ocena</option>
              <option value="printers">Liczba drukarek</option>
            </select>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {loadingFarms ? 'Ładowanie...' : `${filtered.length} ${filtered.length === 1 ? 'farma' : filtered.length < 5 ? 'farmy' : 'farm'}`}
        </p>

        {/* Farm cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(farm => {
            const basePrice = urlMaterial ? (BASE_PRICES[urlMaterial] ?? 45) : 45
            const discount = getDiscount(quantity)
            const totalPrice = basePrice * quantity * (1 - discount)
            const unitPrice = totalPrice / quantity
            const printTimeH = calcPrintTimeHours(quantity, farm.printerCount)

            const expressTime = Math.ceil(printTimeH * 0.6)
            const expressPrice = totalPrice * 1.3
            const rushTime = Math.ceil(printTimeH * 0.4)
            const rushPrice = totalPrice * 1.5

            const rating = farm.rating_avg || 0
            const reviews = farm.rating_count || 0

            // Get filaments matching the requested material
            const matchingFilaments = urlMaterial ? farm.filaments.filter(f => f.type === urlMaterial) : []
            const totalStock = matchingFilaments.reduce((s, f) => s + f.stock_grams, 0)
            const hasLowStock = matchingFilaments.some(f => f.stock_grams < f.low_stock_alert)

            return (
              <div
                key={farm.id}
                className="rounded-xl p-5 transition-all duration-200 relative"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {hasOrderParams && (
                  <div className="absolute -top-3 left-4 text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#22C55E', color: '#fff' }}>
                    Pasuje do Twojego zamówienia
                  </div>
                )}

                <div className="flex items-start justify-between mb-3 mt-1">
                  <div>
                    <a href={`/farm/${farm.slug}`} className="no-underline">
                      <h3 className="font-semibold text-white text-lg hover:underline">{farm.name}</h3>
                    </a>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <svg className="inline-block mr-1 -mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {farm.city}
                    </p>
                  </div>
                </div>

                {rating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Stars rating={rating} />
                    <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>({reviews} opinii)</span>
                  </div>
                )}

                {/* Materials with color dots from filaments */}
                {farm.materials.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {farm.materials.map(m => (
                      <span key={m} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                        background: hasOrderParams && m === urlMaterial ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
                        color: hasOrderParams && m === urlMaterial ? '#22C55E' : 'rgba(139,92,246,1)',
                        border: `1px solid ${hasOrderParams && m === urlMaterial ? 'rgba(34,197,94,0.3)' : 'rgba(139,92,246,0.2)'}`,
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Filament color dots */}
                {farm.filaments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {[...new Set(farm.filaments.filter(f => !urlMaterial || f.type === urlMaterial).map(f => f.color))].map(color => (
                      <div key={color} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="w-3 h-3 rounded-full" style={{ background: FILAMENT_COLOR_HEX[color] || '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }} />
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{color}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stock status */}
                {hasOrderParams && matchingFilaments.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3 text-[13px]" style={{ color: hasLowStock ? '#f97316' : 'rgba(255,255,255,0.4)' }}>
                    {hasLowStock ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                        <span className="font-medium">Niski stan!</span>
                        <span>({(totalStock / 1000).toFixed(1)} kg)</span>
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Na stanie: <span className="text-white font-medium">{(totalStock / 1000).toFixed(1)} kg</span></span>
                      </>
                    )}
                  </div>
                )}

                {/* Printers count */}
                <div className="flex items-center gap-1.5 mb-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                  </svg>
                  {farm.printerCount} {farm.printerCount === 1 ? 'drukarka' : farm.printerCount < 5 ? 'drukarki' : 'drukarek'}
                </div>

                {/* Order-specific info */}
                {hasOrderParams && (
                  <div className="mb-4 space-y-2">
                    <div className="rounded-lg px-3 py-2 flex items-center gap-2 text-sm" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                      <span>🕐</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                        Szacowany czas: <span className="font-semibold text-white">~{printTimeH}h</span>
                        <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>({farm.printerCount} drukarek równolegle)</span>
                      </span>
                    </div>

                    <div className="rounded-lg px-3 py-2 flex items-center justify-between text-sm" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                          Wycena: <span className="font-bold" style={{ color: '#22C55E' }}>{totalPrice.toFixed(2)} zł</span>
                          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>({unitPrice.toFixed(2)} zł/szt)</span>
                        </span>
                      </div>
                      {discount > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>-{discount * 100}%</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Standard</div>
                        <div className="font-bold text-white">{totalPrice.toFixed(0)} zł</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)' }}>~{printTimeH}h</div>
                      </div>
                      <div className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        <div className="font-medium" style={{ color: '#a78bfa' }}>Express</div>
                        <div className="font-bold text-white">{expressPrice.toFixed(0)} zł</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)' }}>~{expressTime}h</div>
                      </div>
                      <div className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
                        <div className="font-medium" style={{ color: '#fb923c' }}>Rush</div>
                        <div className="font-bold text-white">{rushPrice.toFixed(0)} zł</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)' }}>~{rushTime}h</div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleOrder(farm)}
                  disabled={orderingFarmId === farm.id}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                  style={{ background: '#22C55E', color: '#fff', opacity: orderingFarmId === farm.id ? 0.6 : 1 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#16A34A')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#22C55E')}
                >
                  {orderingFarmId === farm.id ? 'Składanie zamówienia...' : 'Zamów'}
                </button>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && !loadingFarms && (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>Brak farm spełniających kryteria</p>
            <button
              className="mt-4 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}
              onClick={() => { setCitySearch(''); setMinRating('0') }}
            >
              Wyczyść filtry
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
