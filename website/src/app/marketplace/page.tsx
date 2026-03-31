'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

const MATERIALS_LIST = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon'] as const

const BASE_PRICES: Record<string, number> = {
  PLA: 45,
  PETG: 55,
  ABS: 65,
  TPU: 75,
  ASA: 60,
  Nylon: 70,
}

function getDiscount(qty: number): number {
  if (qty >= 100) return 0.15
  if (qty >= 50) return 0.10
  if (qty >= 10) return 0.05
  return 0
}

function calcPrintTimeHours(quantity: number, printers: number): number {
  return Math.ceil(quantity / printers) * 2
}

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

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }

  const filtered = DEMO_FARMS
    .filter(f => {
      if (hasOrderParams && urlMaterial && !f.materials.includes(urlMaterial)) return false
      if (citySearch && !f.city.toLowerCase().includes(citySearch.toLowerCase())) return false
      if (parseFloat(minRating) > 0 && f.rating < parseFloat(minRating)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'printers') return b.printers - a.printers
      if (sortBy === 'price') {
        if (!hasOrderParams || !urlMaterial) return 0
        const basePrice = BASE_PRICES[urlMaterial] ?? 45
        const discount = getDiscount(quantity)
        const priceA = basePrice * quantity * (1 - discount)
        const priceB = basePrice * quantity * (1 - discount)
        return priceA - priceB
      }
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
          {urlFiles && (
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Pliki: {urlFiles}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#fff' }}>
          {hasOrderParams ? 'Farmy pasujące do Twojego zamówienia' : 'Marketplace farm druku 3D'}
        </h1>

        {hasOrderParams ? (
          <div
            className="rounded-xl p-4 mb-8 flex flex-wrap items-center gap-3"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <span className="text-sm font-medium" style={{ color: '#22C55E' }}>
              Znaleziono {filtered.length} farm dla:
            </span>
            {[urlMaterial, urlColor, `${quantity} szt`, urlQuality, urlInfill ? `wypełnienie ${urlInfill}` : null]
              .filter(Boolean)
              .map((tag, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
                >
                  {tag}
                </span>
              ))}
          </div>
        ) : (
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Znajdź idealną farmę drukarek 3D dla swojego projektu
          </p>
        )}

        {/* Filter bar */}
        <div
          className="rounded-xl p-4 mb-8 grid gap-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
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
            const basePrice = urlMaterial ? (BASE_PRICES[urlMaterial] ?? 45) : 45
            const discount = getDiscount(quantity)
            const totalPrice = basePrice * quantity * (1 - discount)
            const unitPrice = totalPrice / quantity
            const printTimeH = calcPrintTimeHours(quantity, farm.printers)

            const expressTime = Math.ceil(printTimeH * 0.6)
            const expressPrice = totalPrice * 1.3
            const rushTime = Math.ceil(printTimeH * 0.4)
            const rushPrice = totalPrice * 1.5

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
                {hasOrderParams && (
                  <div
                    className="absolute -top-3 left-4 text-xs font-medium px-3 py-1 rounded-full"
                    style={{ background: '#22C55E', color: '#fff' }}
                  >
                    Pasuje do Twojego zamówienia
                  </div>
                )}

                {/* Farm name and city */}
                <div className="flex items-start justify-between mb-3 mt-1">
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
                        background: hasOrderParams && m === urlMaterial ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
                        color: hasOrderParams && m === urlMaterial ? '#22C55E' : 'rgba(139,92,246,1)',
                        border: `1px solid ${hasOrderParams && m === urlMaterial ? 'rgba(34,197,94,0.3)' : 'rgba(139,92,246,0.2)'}`,
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Printers count */}
                <div className="flex items-center gap-1.5 mb-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  {farm.printers} {farm.printers === 1 ? 'drukarka' : farm.printers < 5 ? 'drukarki' : 'drukarek'}
                </div>

                {/* Order-specific info */}
                {hasOrderParams && (
                  <div className="mb-4 space-y-2">
                    {/* Estimated time */}
                    <div
                      className="rounded-lg px-3 py-2 flex items-center gap-2 text-sm"
                      style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
                    >
                      <span>🕐</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                        Szacowany czas: <span className="font-semibold text-white">~{printTimeH}h</span>
                        <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          ({farm.printers} drukarek równolegle)
                        </span>
                      </span>
                    </div>

                    {/* Price estimate */}
                    <div
                      className="rounded-lg px-3 py-2 flex items-center justify-between text-sm"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                          Wycena: <span className="font-bold" style={{ color: '#22C55E' }}>{totalPrice.toFixed(2)} zł</span>
                          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            ({unitPrice.toFixed(2)} zł/szt)
                          </span>
                        </span>
                      </div>
                      {discount > 0 && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
                        >
                          -{discount * 100}%
                        </span>
                      )}
                    </div>

                    {/* ETA options */}
                    <div className="flex gap-2">
                      <div
                        className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Standard</div>
                        <div className="font-bold text-white">{totalPrice.toFixed(0)} zł</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)' }}>~{printTimeH}h</div>
                      </div>
                      <div
                        className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs"
                        style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
                      >
                        <div className="font-medium" style={{ color: '#a78bfa' }}>Express</div>
                        <div className="font-bold text-white">{expressPrice.toFixed(0)} zł</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)' }}>~{expressTime}h</div>
                      </div>
                      <div
                        className="flex-1 rounded-lg px-2 py-1.5 text-center text-xs"
                        style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}
                      >
                        <div className="font-medium" style={{ color: '#fb923c' }}>Rush</div>
                        <div className="font-bold text-white">{rushPrice.toFixed(0)} zł</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)' }}>~{rushTime}h</div>
                      </div>
                    </div>
                  </div>
                )}

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
