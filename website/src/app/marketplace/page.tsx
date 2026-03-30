'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

const MATERIALS_LIST = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon'] as const

interface Farm {
  name: string
  city: string
  rating: number
  reviews: number
  materials: string[]
  printers: number
  priceRange: string
}

const DEMO_FARMS: Farm[] = [
  { name: '3DPrint Warszawa', city: 'Warszawa', rating: 4.9, reviews: 234, materials: ['PLA', 'PETG', 'ABS', 'TPU'], printers: 8, priceRange: '19-45 zł' },
  { name: 'MakerHive', city: 'Kraków', rating: 4.7, reviews: 189, materials: ['PLA', 'PETG', 'ASA', 'Nylon'], printers: 12, priceRange: '22-55 zł' },
  { name: 'PrintLab Pro', city: 'Wrocław', rating: 4.8, reviews: 156, materials: ['PLA', 'PETG', 'ABS'], printers: 5, priceRange: '15-38 zł' },
  { name: 'NanoForge', city: 'Gdańsk', rating: 4.6, reviews: 98, materials: ['PLA', 'PETG', 'TPU', 'Nylon', 'PC'], printers: 15, priceRange: '25-65 zł' },
  { name: 'Drukuj.pl', city: 'Poznań', rating: 4.5, reviews: 312, materials: ['PLA', 'PETG'], printers: 3, priceRange: '12-30 zł' },
  { name: '3D Masters', city: 'Łódź', rating: 4.4, reviews: 87, materials: ['PLA', 'ABS', 'ASA'], printers: 6, priceRange: '18-42 zł' },
  { name: 'PrintPoint', city: 'Katowice', rating: 4.8, reviews: 201, materials: ['PLA', 'PETG', 'TPU', 'ABS'], printers: 10, priceRange: '20-50 zł' },
  { name: 'FabLab Szczecin', city: 'Szczecin', rating: 4.3, reviews: 65, materials: ['PLA', 'PETG', 'Nylon'], printers: 4, priceRange: '16-35 zł' },
  { name: 'MegaPrint', city: 'Lublin', rating: 4.6, reviews: 143, materials: ['PLA', 'PETG', 'ABS', 'TPU', 'ASA'], printers: 9, priceRange: '17-48 zł' },
  { name: 'QuickPrint24', city: 'Bydgoszcz', rating: 4.2, reviews: 52, materials: ['PLA', 'PETG'], printers: 2, priceRange: '14-28 zł' },
]

function parseMinPrice(range: string): number {
  const match = range.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

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
  const urlQuantity = searchParams.get('quantity')

  const [materialFilter, setMaterialFilter] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [minRating, setMinRating] = useState('0')
  const [sortBy, setSortBy] = useState('rating')

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }

  const filtered = DEMO_FARMS
    .filter(f => {
      if (materialFilter && !f.materials.includes(materialFilter)) return false
      if (citySearch && !f.city.toLowerCase().includes(citySearch.toLowerCase())) return false
      if (parseFloat(minRating) > 0 && f.rating < parseFloat(minRating)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'price') return parseMinPrice(a.priceRange) - parseMinPrice(b.priceRange)
      if (sortBy === 'printers') return b.printers - a.printers
      return 0
    })

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm flex items-center gap-1 transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#8B5CF6')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Powrót
            </a>
            <span
              className="text-xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
            >
              PrintFlow
            </span>
          </div>
          {urlMaterial && urlQuantity && (
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Szukasz: <span className="font-medium" style={{ color: '#8B5CF6' }}>{urlMaterial}</span> &times; {urlQuantity} szt.
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#fff' }}>
          Marketplace farm druku 3D
        </h1>
        <p className="mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Znajdź idealną farmę drukarek 3D dla swojego projektu
        </p>

        {/* Filter bar */}
        <div
          className="rounded-xl p-4 mb-8 grid gap-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          {/* Material dropdown */}
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Materiał
            </label>
            <select
              value={materialFilter}
              onChange={e => setMaterialFilter(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={inputStyle}
            >
              <option value="">Wszystkie</option>
              {MATERIALS_LIST.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* City search */}
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Miasto
            </label>
            <input
              type="text"
              placeholder="Szukaj miasta..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-white/20"
              style={inputStyle}
            />
          </div>

          {/* Min rating */}
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Min. ocena
            </label>
            <select
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={inputStyle}
            >
              <option value="0">Dowolna</option>
              <option value="4">4.0+</option>
              <option value="4.3">4.3+</option>
              <option value="4.5">4.5+</option>
              <option value="4.7">4.7+</option>
            </select>
          </div>

          {/* Sort by */}
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Sortuj wg
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={inputStyle}
            >
              <option value="rating">Ocena</option>
              <option value="price">Cena (rosnąco)</option>
              <option value="printers">Liczba drukarek</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {filtered.length} {filtered.length === 1 ? 'farma' : filtered.length < 5 ? 'farmy' : 'farm'}
        </p>

        {/* Farm cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(farm => {
            const matchesMaterial = urlMaterial ? farm.materials.includes(urlMaterial) : false

            return (
              <div
                key={farm.name}
                className="rounded-xl p-5 transition-all duration-200 relative"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = '1px solid rgba(139,92,246,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Match badge */}
                {matchesMaterial && (
                  <div
                    className="absolute -top-3 left-4 text-xs font-medium px-3 py-1 rounded-full"
                    style={{ background: '#7C3AED', color: '#fff' }}
                  >
                    Pasuje do Twojego wydruku
                  </div>
                )}

                {/* Farm name and city */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{farm.name}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <svg className="inline-block mr-1 -mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {farm.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg" style={{ color: '#22C55E' }}>{farm.priceRange}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>za wydruk</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <Stars rating={farm.rating} />
                  <span className="text-sm font-medium text-white">{farm.rating}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>({farm.reviews} opinii)</span>
                </div>

                {/* Materials */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {farm.materials.map(m => (
                    <span
                      key={m}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        color: 'rgba(139,92,246,1)',
                        border: '1px solid rgba(139,92,246,0.2)',
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Printers count */}
                <div className="flex items-center gap-1.5 mb-4 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  {farm.printers} {farm.printers === 1 ? 'drukarka' : farm.printers < 5 ? 'drukarki' : 'drukarek'}
                </div>

                {/* CTA button */}
                <button
                  className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                  style={{ background: '#22C55E', color: '#fff' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#16A34A')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#22C55E')}
                >
                  Zamów
                </button>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Brak farm spełniających kryteria
            </p>
            <button
              className="mt-4 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}
              onClick={() => {
                setMaterialFilter('')
                setCitySearch('')
                setMinRating('0')
              }}
            >
              Wyczyść filtry
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
