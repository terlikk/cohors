'use client'

import { useState, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Tab = 'drukarki' | 'zamowienia' | 'automatyzacja' | 'profil'
type OrderStatus = 'nowe' | 'drukuje' | 'gotowe' | 'wysłane'
type OrderFilter = 'all' | OrderStatus

interface Printer {
  id: string
  farm_id: string
  name: string
  model: string
  build_x: number
  build_y: number
  build_z: number
  nozzle: string
  materials: string[]
  status: string
  created_at: string
}

interface Order {
  id: string
  order_number: string
  client_email: string
  farm_id: string
  status: OrderStatus
  file_names: string[]
  material: string
  color: string
  quality: string
  quantity: number
  price_total: number
  estimated_hours: number
  notes: string | null
  created_at: string
  updated_at: string
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

const ORDER_STATUS_STYLES: Record<OrderStatus, { bg: string; border: string; color: string; label: string }> = {
  nowe: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', color: '#eab308', label: 'NOWE' },
  drukuje: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#3b82f6', label: 'DRUKUJE' },
  gotowe: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#22c55e', label: 'GOTOWE' },
  wysłane: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', color: '#a855f7', label: 'WYSŁANE' },
}

interface DemoOrder {
  id: string
  orderNumber: string
  client: string
  files: string[]
  quantity: number
  material: string
  color: string
  quality: string
  price: string
  status: OrderStatus
  progress?: number
  printer?: string
  eta?: string
  tracking?: string
  timestamp: string
  actions: string[]
}

const DEMO_ORDERS: DemoOrder[] = [
  {
    id: '1',
    orderNumber: 'PF-2026-00045',
    client: 'Anna Kowalska',
    files: ['bracket.stl'],
    quantity: 10,
    material: 'PLA',
    color: 'Czarny',
    quality: 'Standard',
    price: '764,75 zł',
    status: 'nowe',
    timestamp: '2 min temu',
    actions: ['Akceptuj', 'Odrzuć', 'Chat'],
  },
  {
    id: '2',
    orderNumber: 'PF-2026-00044',
    client: 'Jan Nowak',
    files: ['obudowa.stl'],
    quantity: 3,
    material: 'PETG',
    color: 'Biały',
    quality: 'High',
    price: '342,00 zł',
    status: 'drukuje',
    progress: 62,
    printer: 'Bambu X1C #1',
    eta: '2h 15min',
    timestamp: '1h temu',
    actions: [],
  },
  {
    id: '3',
    orderNumber: 'PF-2026-00043',
    client: 'TechParts Sp. z o.o.',
    files: ['gear_v2.stl', 'mount.stl'],
    quantity: 50,
    material: 'ABS',
    color: 'Czerwony',
    quality: 'Standard',
    price: '3 200,00 zł',
    status: 'drukuje',
    progress: 34,
    printer: '3 drukarki',
    eta: '8h',
    timestamp: '3h temu',
    actions: [],
  },
  {
    id: '4',
    orderNumber: 'PF-2026-00042',
    client: 'Marek Wiśniewski',
    files: ['lampshade.stl'],
    quantity: 1,
    material: 'PLA',
    color: 'Biały',
    quality: 'High',
    price: '89,50 zł',
    status: 'gotowe',
    timestamp: '5h temu',
    actions: ['Wyślij'],
  },
  {
    id: '5',
    orderNumber: 'PF-2026-00041',
    client: 'Kasia Pawlak',
    files: ['phone_case.stl'],
    quantity: 2,
    material: 'TPU',
    color: 'Czarny',
    quality: 'Standard',
    price: '156,00 zł',
    status: 'wysłane',
    tracking: 'InPost: PF123456789',
    timestamp: '1d temu',
    actions: [],
  },
]

const FREE_FEATURES = [
  { name: 'Auto-wycena', desc: 'Ustaw swoją marżę (%), system obliczy cenę za klienta automatycznie: koszt materiału + czas druku + amortyzacja drukarki + Twoja marża' },
  { name: 'Panel zamówień', desc: 'Accept/reject, status tracking' },
  { name: 'Profil farmy + link + QR kod', desc: 'Twoja strona farmy widoczna dla klientów' },
  { name: 'Marketplace', desc: 'Widoczność dla klientów' },
]

const PRO_FEATURES = [
  { name: 'Fleet Control', desc: 'Zaznacz drukarki → wyślij plik do wszystkich naraz. Jedno kliknięcie = 10 drukarek drukuje ten sam model równolegle.' },
  { name: 'Integracja API', desc: 'Połącz Klipper, OctoPrint, Bambu Lab, Prusa Connect. Auto-status, remote start/stop/pause.' },
  { name: 'Live monitoring', desc: 'Kamery, progress %, temperatury, ETA w real-time. Podgląd każdej drukarki z jednego panelu.' },
  { name: 'AI Quality Guard', desc: 'Model YOLO wykrywa spaghetti i warping. Auto-pause + alert. 97% accuracy.' },
  { name: 'Smart scheduling', desc: 'Algorytm przypisuje zlecenia do optymalnej drukarki. Matching po materiale, nozzle, blacie.' },
  { name: 'Stock management', desc: 'Zarządzanie filamentami. Auto-alert przy niskim stanie.' },
  { name: 'Analytics', desc: 'Zarobki, success rate, popularne materiały, raporty.' },
  { name: 'Do 20 drukarek', desc: 'Zarządzaj flotą do 20 drukarek z jednego panelu.' },
]

const ENTERPRISE_FEATURES = [
  { name: 'Continuous Queue', desc: 'Drukarki pracują non-stop. Zero przestojów.' },
  { name: 'Safety Rules', desc: 'Max wartość auto-accept, nowy klient = ręcznie, ABS = ręcznie, tryb nocny = tylko PLA' },
  { name: 'Maintenance Tracker', desc: 'Godziny pracy, alerty serwisowe, auto-blokada' },
  { name: '∞ drukarek', desc: 'Bez limitu drukarek w Twojej flocie.' },
  { name: 'API publiczne', desc: 'Pełne API do integracji z dowolnym systemem.' },
  { name: 'Dedykowany support', desc: 'Priorytetowa pomoc techniczna + SLA.' },
]

const FLOWPILOT_STEPS = [
  { step: 1, title: 'Klient zamawia online' },
  { step: 2, title: 'Auto-weryfikacja & akceptacja', desc: 'Safety rules konfigurowalne' },
  { step: 3, title: 'Smart assign do drukarki' },
  { step: 4, title: 'Auto-start + AI monitoring' },
  { step: 5, title: 'Auto-eject + kolejny druk' },
  { step: 6, title: 'Alert: \'Spakuj 5 wydruków\'' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [farmId, setFarmId] = useState<string | null>(null)
  const [farmSlug, setFarmSlug] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('drukarki')
  const router = useRouter()
  const supabase = createClient()

  // Printer state
  const [printers, setPrinters] = useState<Printer[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all')
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    model: PRINTER_MODELS[0],
    buildX: '256',
    buildY: '256',
    buildZ: '256',
    nozzle: '0.4',
    materials: [] as string[],
  })

  // Order state
  const [orders, setOrders] = useState<Order[]>([])
  const [showDemo, setShowDemo] = useState(false)

  // QR code state
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch user's farm
      const { data: farm } = await supabase
        .from('farms')
        .select('id, slug')
        .eq('user_id', user.id)
        .single()

      if (farm) {
        setFarmId(farm.id)
        setFarmSlug(farm.slug)

        // Fetch printers
        const { data: printerData } = await supabase
          .from('printers')
          .select('*')
          .eq('farm_id', farm.id)
          .order('created_at', { ascending: true })

        if (printerData) setPrinters(printerData)

        // Fetch orders
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('farm_id', farm.id)
          .order('created_at', { ascending: false })

        if (orderData) setOrders(orderData)
      }

      setLoading(false)
    }
    init()
  }, [router, supabase])

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

  async function handleAddPrinter(e: React.FormEvent) {
    e.preventDefault()
    if (!farmId) return

    const { data, error } = await supabase
      .from('printers')
      .insert({
        farm_id: farmId,
        name: newPrinter.name,
        model: newPrinter.model,
        build_x: parseInt(newPrinter.buildX) || 0,
        build_y: parseInt(newPrinter.buildY) || 0,
        build_z: parseInt(newPrinter.buildZ) || 0,
        nozzle: newPrinter.nozzle,
        materials: newPrinter.materials,
        status: 'idle',
      })
      .select()
      .single()

    if (error) {
      alert('Błąd dodawania drukarki: ' + error.message)
      return
    }

    setPrinters(prev => [...prev, data])
    setShowAddModal(false)
    setNewPrinter({ name: '', model: PRINTER_MODELS[0], buildX: '256', buildY: '256', buildZ: '256', nozzle: '0.4', materials: [] })
  }

  async function removePrinter(id: string) {
    const { error } = await supabase.from('printers').delete().eq('id', id)
    if (error) {
      alert('Błąd usuwania drukarki: ' + error.message)
      return
    }
    setPrinters(prev => prev.filter(p => p.id !== id))
  }

  // Generate QR code when farmSlug is available
  useEffect(() => {
    if (!farmSlug) return
    const farmUrl = `https://printflow-seven.vercel.app/farm/${farmSlug}`
    QRCode.toDataURL(farmUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#ffffffee', light: '#00000000' },
    }).then((url: string) => setQrDataUrl(url)).catch(() => {})
  }, [farmSlug])

  const handleDownloadQr = useCallback(() => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = `printflow-${farmSlug}-qr.png`
    link.href = qrDataUrl
    link.click()
  }, [qrDataUrl, farmSlug])

  const handleCopyLink = useCallback(() => {
    const farmUrl = `https://printflow-seven.vercel.app/farm/${farmSlug}`
    navigator.clipboard.writeText(farmUrl).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }, [farmSlug])

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

  // Orders: show real or demo
  const hasRealOrders = orders.length > 0
  const displayOrders = hasRealOrders && !showDemo

  // Order counts for filters
  const orderCounts: Record<OrderStatus, number> = { nowe: 0, drukuje: 0, gotowe: 0, wysłane: 0 }
  if (displayOrders) {
    orders.forEach(o => {
      if (orderCounts[o.status] !== undefined) orderCounts[o.status]++
    })
  } else if (showDemo || !hasRealOrders) {
    DEMO_ORDERS.forEach(o => orderCounts[o.status]++)
  }

  function formatOrderDate(dateStr: string) {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'teraz'
    if (diffMin < 60) return `${diffMin} min temu`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h temu`
    const diffD = Math.floor(diffH / 24)
    return `${diffD}d temu`
  }

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
                    const st = STATUS_STYLES[printer.status] || STATUS_STYLES.idle
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
                          <span>Volume: {printer.build_x}×{printer.build_y}×{printer.build_z} mm</span>
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
          {activeTab === 'zamowienia' && (() => {
            const filters: { id: OrderFilter; label: string; count?: number }[] = [
              { id: 'all', label: 'Wszystkie' },
              { id: 'nowe', label: 'Nowe', count: orderCounts.nowe },
              { id: 'drukuje', label: 'Drukuje', count: orderCounts.drukuje },
              { id: 'gotowe', label: 'Gotowe', count: orderCounts.gotowe },
              { id: 'wysłane', label: 'Wysłane', count: orderCounts.wysłane },
            ]

            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white">Zamówienia</h2>
                  {!hasRealOrders && (
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)' }}>
                      Dane demo
                    </span>
                  )}
                  {hasRealOrders && (
                    <button
                      onClick={() => setShowDemo(!showDemo)}
                      className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all border-none"
                      style={{
                        background: showDemo ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)',
                        color: showDemo ? '#eab308' : '#94a3b8',
                      }}
                    >
                      {showDemo ? 'Pokaż prawdziwe zamówienia' : 'Pokaż demo zamówienia'}
                    </button>
                  )}
                </div>
                <p className="text-slate-500 text-sm mb-6">
                  {displayOrders
                    ? 'Wszystkie przychodzące zlecenia od klientów.'
                    : hasRealOrders
                      ? 'Przykładowe zamówienia demo.'
                      : 'Brak zamówień. Poniżej dane demo — zamówienia pojawią się, gdy klienci złożą zlecenia.'}
                </p>

                {/* Filter bar */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {filters.map(f => {
                    const active = orderFilter === f.id
                    const statusColor = f.id !== 'all' ? ORDER_STATUS_STYLES[f.id as OrderStatus].color : undefined
                    return (
                      <button
                        key={f.id}
                        onClick={() => setOrderFilter(f.id)}
                        className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all border-none"
                        style={{
                          background: active
                            ? (statusColor ? ORDER_STATUS_STYLES[f.id as OrderStatus].bg : 'rgba(139,92,246,0.15)')
                            : 'rgba(255,255,255,0.03)',
                          color: active ? (statusColor || '#a78bfa') : '#94a3b8',
                          outline: active
                            ? `1px solid ${statusColor ? ORDER_STATUS_STYLES[f.id as OrderStatus].border : 'rgba(139,92,246,0.3)'}`
                            : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
                      </button>
                    )
                  })}
                </div>

                {/* Real orders */}
                {displayOrders && (
                  <div className="flex flex-col gap-4">
                    {orders
                      .filter(o => orderFilter === 'all' || o.status === orderFilter)
                      .map(order => {
                        const st = ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.nowe
                        return (
                          <div key={order.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-white font-semibold text-[15px]">{order.order_number}</span>
                                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider" style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                                    {st.label}
                                  </span>
                                </div>
                                <p className="text-slate-400 text-[13px]">{order.client_email}</p>
                              </div>
                              <span className="text-slate-600 text-[12px] whitespace-nowrap">{formatOrderDate(order.created_at)}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-slate-400 mb-3">
                              <span className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>
                                {order.file_names.join(' + ')}
                              </span>
                              <span>{order.quantity} szt × {order.material} {order.color} {order.quality}</span>
                              <span className="text-white font-semibold">{order.price_total.toFixed(2)} zł</span>
                            </div>
                            {order.notes && (
                              <p className="text-slate-500 text-[12px] mb-2">Notatki: {order.notes}</p>
                            )}
                          </div>
                        )
                      })}
                    {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-slate-500 text-sm">Brak zamówień z tym statusem.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Demo orders fallback */}
                {!displayOrders && (
                  <div className="flex flex-col gap-4">
                    {DEMO_ORDERS
                      .filter(o => orderFilter === 'all' || o.status === orderFilter)
                      .map(order => {
                        const st = ORDER_STATUS_STYLES[order.status]
                        return (
                          <div key={order.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-white font-semibold text-[15px]">{order.orderNumber}</span>
                                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider" style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                                    {st.label}{order.progress !== undefined ? ` ${order.progress}%` : ''}
                                  </span>
                                </div>
                                <p className="text-slate-400 text-[13px]">{order.client}</p>
                              </div>
                              <span className="text-slate-600 text-[12px] whitespace-nowrap">{order.timestamp}</span>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-slate-400 mb-3">
                              <span className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>
                                {order.files.join(' + ')}
                              </span>
                              <span>{order.quantity} szt × {order.material} {order.color} {order.quality}</span>
                              <span className="text-white font-semibold">{order.price}</span>
                            </div>

                            {(order.printer || order.eta || order.tracking) && (
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500 mb-3">
                                {order.printer && (
                                  <span className="flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                                    {order.printer}
                                  </span>
                                )}
                                {order.eta && <span>ETA: {order.eta}</span>}
                                {order.tracking && (
                                  <span className="flex items-center gap-1.5" style={{ color: '#a855f7' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="13" x="4" y="8" rx="2"/><path d="m22 8-10 7L2 8"/></svg>
                                    {order.tracking}
                                  </span>
                                )}
                              </div>
                            )}

                            {order.status === 'drukuje' && order.progress !== undefined && (
                              <div className="mb-3">
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(59,130,246,0.1)' }}>
                                  <div className="h-full rounded-full transition-all" style={{ width: `${order.progress}%`, background: '#3b82f6' }} />
                                </div>
                              </div>
                            )}

                            {order.actions.length > 0 && (
                              <div className="flex gap-2 mt-1">
                                {order.actions.map(action => {
                                  const isAccept = action === 'Akceptuj'
                                  const isReject = action === 'Odrzuć'
                                  const isSend = action === 'Wyślij'
                                  return (
                                    <button
                                      key={action}
                                      className="px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-all border-none"
                                      style={{
                                        background: isAccept || isSend ? '#22C55E' : isReject ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)',
                                        color: isAccept || isSend ? 'white' : isReject ? '#f87171' : '#a78bfa',
                                        border: isReject ? '1px solid rgba(239,68,68,0.2)' : (!isAccept && !isSend) ? '1px solid rgba(139,92,246,0.2)' : 'none',
                                      }}
                                    >
                                      {action}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            )
          })()}

          {/* AUTOMATYZACJA TAB */}
          {activeTab === 'automatyzacja' && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Automatyzacja</h2>
                <p className="text-slate-500 text-sm">Funkcje dostępne w Twoim planie i opcje rozbudowy.</p>
              </div>

              {/* FREE TIER */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                    Free
                  </span>
                  <span className="text-slate-400 text-sm">W zestawie</span>
                </div>
                <div className="flex flex-col gap-3">
                  {FREE_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-lg mt-0.5" style={{ color: '#22C55E' }}>✓</span>
                      <div>
                        <span className="text-white font-semibold text-[14px]">{f.name}</span>
                        <p className="text-slate-500 text-[13px] mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRO TIER */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                      Pro
                    </span>
                    <span className="text-slate-400 text-sm">149 zł/msc — Zarządzanie flotą</span>
                  </div>
                  <button
                    onClick={() => alert('Plan Pro będzie dostępny wkrótce!')}
                    className="px-5 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all border-none"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    Upgrade to Pro
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRO_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.04)' }}>
                      <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <div>
                        <span className="text-white font-semibold text-[14px]">{f.name}</span>
                        <p className="text-slate-500 text-[13px] mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ENTERPRISE TIER */}
              <div className="rounded-2xl p-6 relative" style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 0 30px rgba(34,197,94,0.08), 0 0 60px rgba(34,197,94,0.04)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                      Enterprise
                    </span>
                    <span className="text-slate-400 text-sm">499 zł/msc — FlowPilot™ Full Autonomy</span>
                  </div>
                  <button
                    onClick={() => alert('Plan Enterprise będzie dostępny wkrótce!')}
                    className="px-5 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all border-none"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}
                  >
                    Upgrade to Enterprise
                  </button>
                </div>

                {/* FlowPilot main description */}
                <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <div>
                      <span className="text-white font-bold text-[15px]">FlowPilot™</span>
                      <p className="text-slate-400 text-[13px] mt-1 leading-relaxed">
                        Twoja farma pracuje 24/7 bez Twojej interwencji. Klient zamawia → system weryfikuje plik → auto-akceptuje zlecenie → slicuje → przypisuje do optymalnej drukarki → startuje druk → AI pilnuje jakości → auto-eject po zakończeniu → startuje kolejny druk z kolejki. Jedyne co robisz = pakowanie i wysyłka.
                      </p>
                    </div>
                  </div>

                  {/* 6-step flow */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FLOWPILOT_STEPS.map(s => (
                      <div key={s.step} className="flex items-start gap-2.5 rounded-lg p-3" style={{ background: 'rgba(34,197,94,0.06)' }}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold" style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                          {s.step}
                        </span>
                        <div>
                          <p className="text-white text-[13px] font-medium leading-tight">{s.title}</p>
                          {s.desc && <p className="text-slate-500 text-[11px] mt-0.5">{s.desc}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other enterprise features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ENTERPRISE_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.04)' }}>
                      <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <div>
                        <span className="text-white font-semibold text-[14px]">{f.name}</span>
                        <p className="text-slate-500 text-[13px] mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                    {farmSlug ? (
                      <a href={`/farm/${farmSlug}`} className="text-[15px] no-underline hover:underline" style={{ color: '#22C55E' }}>
                        /farm/{farmSlug}
                      </a>
                    ) : (
                      <p className="text-slate-400 text-[15px]">—</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[12px] font-medium mb-1 uppercase tracking-wider">Drukarki</label>
                    <p className="text-white text-[15px]">{printers.length} zarejestrowanych</p>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              {farmSlug && qrDataUrl && (
                <div className="rounded-2xl p-6 mt-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-bold text-base mb-4">QR kod Twojej farmy</h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <img src={qrDataUrl} alt="QR kod farmy" width={200} height={200} style={{ display: 'block' }} />
                    </div>
                    <p className="text-slate-400 text-[13px] font-mono">
                      printflow-seven.vercel.app/farm/{farmSlug}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDownloadQr}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border-none"
                        style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA', outline: '1px solid rgba(139,92,246,0.3)' }}
                      >
                        Pobierz PNG
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border-none"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', outline: '1px solid rgba(34,197,94,0.3)' }}
                      >
                        {linkCopied ? 'Skopiowano!' : 'Kopiuj link'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
