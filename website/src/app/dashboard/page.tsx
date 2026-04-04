'use client'

import { useState, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Tab = 'drukarki' | 'zamowienia' | 'filamenty' | 'automatyzacja' | 'profil'
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

interface Filament {
  id: string
  farm_id: string
  type: string
  color: string
  brand: string
  price_per_kg: number
  stock_grams: number
  low_stock_alert: number
  created_at: string
}

const FILAMENT_TYPES = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'PC']
const FILAMENT_COLORS = [
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
  { name: 'Brązowy', hex: '#92400e' },
  { name: 'Naturalny', hex: '#d4c5a9' },
]

interface PrinterSpec {
  name: string
  brand: string
  buildX: number
  buildY: number
  buildZ: number
  defaultNozzle: string
  defaultMaterials: string[]
}

const PRINTER_DATABASE: PrinterSpec[] = [
  // Bambu Lab
  { name: 'Bambu Lab X1 Carbon', brand: 'Bambu Lab', buildX: 256, buildY: 256, buildZ: 256, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'Bambu Lab X1E', brand: 'Bambu Lab', buildX: 256, buildY: 256, buildZ: 256, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'Bambu Lab P1S', brand: 'Bambu Lab', buildX: 256, buildY: 256, buildZ: 256, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon'] },
  { name: 'Bambu Lab P1P', brand: 'Bambu Lab', buildX: 256, buildY: 256, buildZ: 256, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  { name: 'Bambu Lab A1', brand: 'Bambu Lab', buildX: 256, buildY: 256, buildZ: 256, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  { name: 'Bambu Lab A1 mini', brand: 'Bambu Lab', buildX: 180, buildY: 180, buildZ: 180, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  { name: 'Bambu Lab P2S', brand: 'Bambu Lab', buildX: 256, buildY: 256, buildZ: 256, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon'] },
  { name: 'Bambu Lab H2D', brand: 'Bambu Lab', buildX: 256, buildY: 256, buildZ: 256, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'Bambu Lab H2S', brand: 'Bambu Lab', buildX: 350, buildY: 350, buildZ: 340, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'Bambu Lab H2C', brand: 'Bambu Lab', buildX: 500, buildY: 500, buildZ: 500, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  // Prusa
  { name: 'Prusa MK4S', brand: 'Prusa', buildX: 250, buildY: 210, buildZ: 220, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'Prusa MK4', brand: 'Prusa', buildX: 250, buildY: 210, buildZ: 220, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'Prusa MK3S+', brand: 'Prusa', buildX: 250, buildY: 210, buildZ: 210, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon'] },
  { name: 'Prusa MINI+', brand: 'Prusa', buildX: 180, buildY: 180, buildZ: 180, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ASA', 'TPU'] },
  { name: 'Prusa XL (1 głowica)', brand: 'Prusa', buildX: 360, buildY: 360, buildZ: 360, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'Prusa XL (5 głowic)', brand: 'Prusa', buildX: 360, buildY: 360, buildZ: 360, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'Prusa CORE One', brand: 'Prusa', buildX: 250, buildY: 220, buildZ: 270, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  // Creality
  { name: 'Creality Ender 3 V3', brand: 'Creality', buildX: 220, buildY: 220, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  { name: 'Creality Ender 3 V3 SE', brand: 'Creality', buildX: 220, buildY: 220, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  { name: 'Creality Ender 3 V3 KE', brand: 'Creality', buildX: 220, buildY: 220, buildZ: 240, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  { name: 'Creality Ender 3 S1 Pro', brand: 'Creality', buildX: 220, buildY: 220, buildZ: 270, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
  { name: 'Creality Ender 5 S1', brand: 'Creality', buildX: 220, buildY: 220, buildZ: 280, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
  { name: 'Creality CR-10 SE', brand: 'Creality', buildX: 300, buildY: 300, buildZ: 400, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
  { name: 'Creality K1', brand: 'Creality', buildX: 220, buildY: 220, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU'] },
  { name: 'Creality K1 Max', brand: 'Creality', buildX: 300, buildY: 300, buildZ: 300, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon'] },
  { name: 'Creality K1C', brand: 'Creality', buildX: 220, buildY: 220, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU'] },
  { name: 'Creality K2 Plus', brand: 'Creality', buildX: 350, buildY: 350, buildZ: 350, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  // Anycubic
  { name: 'Anycubic Kobra 3', brand: 'Anycubic', buildX: 250, buildY: 250, buildZ: 260, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  { name: 'Anycubic Kobra 2 Pro', brand: 'Anycubic', buildX: 220, buildY: 220, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  { name: 'Anycubic Kobra 2 Max', brand: 'Anycubic', buildX: 420, buildY: 420, buildZ: 500, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'TPU'] },
  // Elegoo
  { name: 'Elegoo Neptune 4 Pro', brand: 'Elegoo', buildX: 225, buildY: 225, buildZ: 265, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
  { name: 'Elegoo Neptune 4 Plus', brand: 'Elegoo', buildX: 320, buildY: 320, buildZ: 385, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
  { name: 'Elegoo Neptune 4 Max', brand: 'Elegoo', buildX: 420, buildY: 420, buildZ: 480, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
  // Voron (popular configs)
  { name: 'Voron 0.2', brand: 'Voron', buildX: 120, buildY: 120, buildZ: 120, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon'] },
  { name: 'Voron Trident 250', brand: 'Voron', buildX: 250, buildY: 250, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'PC'] },
  { name: 'Voron Trident 300', brand: 'Voron', buildX: 300, buildY: 300, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'PC'] },
  { name: 'Voron Trident 350', brand: 'Voron', buildX: 350, buildY: 350, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'PC'] },
  { name: 'Voron 2.4 250', brand: 'Voron', buildX: 250, buildY: 250, buildZ: 230, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'PC'] },
  { name: 'Voron 2.4 300', brand: 'Voron', buildX: 300, buildY: 300, buildZ: 280, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'PC'] },
  { name: 'Voron 2.4 350', brand: 'Voron', buildX: 350, buildY: 350, buildZ: 330, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon', 'PC'] },
  // Flashforge
  { name: 'Flashforge Adventurer 5M', brand: 'Flashforge', buildX: 220, buildY: 220, buildZ: 220, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
  { name: 'Flashforge Adventurer 5M Pro', brand: 'Flashforge', buildX: 220, buildY: 220, buildZ: 220, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon'] },
  // QIDI
  { name: 'QIDI X-Plus 3', brand: 'QIDI', buildX: 280, buildY: 280, buildZ: 270, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon'] },
  { name: 'QIDI X-Max 3', brand: 'QIDI', buildX: 325, buildY: 325, buildZ: 315, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC'] },
  { name: 'QIDI Q1 Pro', brand: 'QIDI', buildX: 245, buildY: 245, buildZ: 245, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon'] },
  // RatRig
  { name: 'RatRig V-Core 3 300', brand: 'RatRig', buildX: 300, buildY: 300, buildZ: 300, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon'] },
  { name: 'RatRig V-Core 3 400', brand: 'RatRig', buildX: 400, buildY: 400, buildZ: 400, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon'] },
  { name: 'RatRig V-Core 3 500', brand: 'RatRig', buildX: 500, buildY: 500, buildZ: 500, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'ASA', 'Nylon'] },
  // Artillery
  { name: 'Artillery Sidewinder X4 Plus', brand: 'Artillery', buildX: 300, buildY: 300, buildZ: 400, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
  { name: 'Artillery Genius Pro', brand: 'Artillery', buildX: 220, buildY: 220, buildZ: 250, defaultNozzle: '0.4', defaultMaterials: ['PLA', 'PETG', 'ABS', 'TPU'] },
]

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
    id: 'filamenty' as Tab,
    label: 'Filamenty',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v7"/><path d="M12 15v7"/></svg>,
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
  const [printerSearch, setPrinterSearch] = useState('')
  const [showPrinterDropdown, setShowPrinterDropdown] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<PrinterSpec | null>(null)
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    model: '',
    buildX: '256',
    buildY: '256',
    buildZ: '256',
    nozzle: '0.4',
    materials: [] as string[],
  })

  const filteredPrinterSpecs = printerSearch.length > 0
    ? PRINTER_DATABASE.filter(p =>
        p.name.toLowerCase().includes(printerSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(printerSearch.toLowerCase())
      ).slice(0, 8)
    : PRINTER_DATABASE.slice(0, 8)

  function selectPrinterSpec(spec: PrinterSpec) {
    setSelectedSpec(spec)
    setPrinterSearch(spec.name)
    setShowPrinterDropdown(false)
    setNewPrinter(prev => ({
      ...prev,
      name: prev.name || spec.name,
      model: spec.name,
      buildX: String(spec.buildX),
      buildY: String(spec.buildY),
      buildZ: String(spec.buildZ),
      nozzle: spec.defaultNozzle,
      materials: spec.defaultMaterials,
    }))
  }

  // Order state
  const [orders, setOrders] = useState<Order[]>([])

  // Filament state
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [showFilamentModal, setShowFilamentModal] = useState(false)
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null)
  const [newFilament, setNewFilament] = useState({
    type: FILAMENT_TYPES[0],
    color: FILAMENT_COLORS[0].name,
    brand: '',
    pricePerKg: '',
    stockGrams: '',
    lowStockAlert: '500',
  })

  // Pricing state
  const [marginPercent, setMarginPercent] = useState('20')
  const [marginBulk10, setMarginBulk10] = useState('5')
  const [marginBulk50, setMarginBulk50] = useState('10')
  const [marginBulk100, setMarginBulk100] = useState('15')
  const [savingPricing, setSavingPricing] = useState(false)
  const [pricingSaved, setPricingSaved] = useState(false)

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

        // Fetch filaments
        const { data: filamentData } = await supabase
          .from('filaments')
          .select('*')
          .eq('farm_id', farm.id)
          .order('created_at', { ascending: true })

        if (filamentData) setFilaments(filamentData)

        // Fetch pricing settings
        const { data: farmFull } = await supabase
          .from('farms')
          .select('margin_percent, margin_percent_bulk_10, margin_percent_bulk_50, margin_percent_bulk_100')
          .eq('id', farm.id)
          .single()

        if (farmFull) {
          if (farmFull.margin_percent != null) setMarginPercent(String(farmFull.margin_percent))
          if (farmFull.margin_percent_bulk_10 != null) setMarginBulk10(String(farmFull.margin_percent_bulk_10))
          if (farmFull.margin_percent_bulk_50 != null) setMarginBulk50(String(farmFull.margin_percent_bulk_50))
          if (farmFull.margin_percent_bulk_100 != null) setMarginBulk100(String(farmFull.margin_percent_bulk_100))
        }
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

    const model = newPrinter.model || printerSearch
    if (!model.trim()) {
      alert('Wybierz lub wpisz model drukarki')
      return
    }

    const res = await fetch('/api/printers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newPrinter.name || model,
        model: model,
        build_x: parseInt(newPrinter.buildX) || 0,
        build_y: parseInt(newPrinter.buildY) || 0,
        build_z: parseInt(newPrinter.buildZ) || 0,
        nozzle: newPrinter.nozzle,
        materials: newPrinter.materials,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      alert('Błąd dodawania drukarki: ' + (err.error || 'Unknown error'))
      return
    }

    const data = await res.json()
    setPrinters(prev => [...prev, data])
    setShowAddModal(false)
    setNewPrinter({ name: '', model: '', buildX: '256', buildY: '256', buildZ: '256', nozzle: '0.4', materials: [] })
    setPrinterSearch('')
    setSelectedSpec(null)
  }

  async function removePrinter(id: string) {
    const res = await fetch(`/api/printers?id=${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const err = await res.json()
      alert('Błąd usuwania drukarki: ' + (err.error || 'Unknown error'))
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

  async function handleAddFilament(e: React.FormEvent) {
    e.preventDefault()
    if (!farmId) return

    const payload = {
      type: newFilament.type,
      color: newFilament.color,
      brand: newFilament.brand,
      price_per_kg: parseFloat(newFilament.pricePerKg) || 0,
      stock_grams: parseInt(newFilament.stockGrams) || 0,
      low_stock_alert: parseInt(newFilament.lowStockAlert) || 500,
    }

    if (editingFilament) {
      const res = await fetch(`/api/filaments?id=${editingFilament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const err = await res.json(); alert('Błąd edycji filamentu: ' + (err.error || 'Unknown')); return }
      const data = await res.json()
      setFilaments(prev => prev.map(f => f.id === editingFilament.id ? data : f))
    } else {
      const res = await fetch('/api/filaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const err = await res.json(); alert('Błąd dodawania filamentu: ' + (err.error || 'Unknown')); return }
      const data = await res.json()
      setFilaments(prev => [...prev, data])
    }

    setShowFilamentModal(false)
    setEditingFilament(null)
    setNewFilament({ type: FILAMENT_TYPES[0], color: FILAMENT_COLORS[0].name, brand: '', pricePerKg: '', stockGrams: '', lowStockAlert: '500' })
  }

  async function removeFilament(id: string) {
    const res = await fetch(`/api/filaments?id=${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) { const err = await res.json(); alert('Błąd usuwania filamentu: ' + (err.error || 'Unknown')); return }
    setFilaments(prev => prev.filter(f => f.id !== id))
  }

  function startEditFilament(f: Filament) {
    setEditingFilament(f)
    setNewFilament({
      type: f.type,
      color: f.color,
      brand: f.brand,
      pricePerKg: String(f.price_per_kg),
      stockGrams: String(f.stock_grams),
      lowStockAlert: String(f.low_stock_alert),
    })
    setShowFilamentModal(true)
  }

  async function handleSavePricing() {
    if (!farmId) return
    setSavingPricing(true)
    const { error } = await supabase
      .from('farms')
      .update({
        margin_percent: parseFloat(marginPercent) || 0,
        margin_percent_bulk_10: parseFloat(marginBulk10) || 0,
        margin_percent_bulk_50: parseFloat(marginBulk50) || 0,
        margin_percent_bulk_100: parseFloat(marginBulk100) || 0,
      })
      .eq('id', farmId)

    setSavingPricing(false)
    if (error) { alert('Błąd zapisu: ' + error.message); return }
    setPricingSaved(true)
    setTimeout(() => setPricingSaved(false), 2000)
  }

  function getColorHex(colorName: string): string {
    return FILAMENT_COLORS.find(c => c.name === colorName)?.hex || '#94a3b8'
  }

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

  // Order counts for filters
  const orderCounts: Record<OrderStatus, number> = { nowe: 0, drukuje: 0, gotowe: 0, wysłane: 0 }
  orders.forEach(o => {
    if (orderCounts[o.status] !== undefined) orderCounts[o.status]++
  })

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
                </div>
                <p className="text-slate-500 text-sm mb-6">
                  {orders.length > 0
                    ? 'Wszystkie przychodzące zlecenia od klientów.'
                    : 'Brak zamówień. Udostępnij swój profil klientom!'}
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

                {/* Orders */}
                {orders.length > 0 ? (
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
                ) : (
                  <div className="rounded-2xl p-10 text-center" style={{ border: '2px dashed rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.02)' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
                    </div>
                    <p className="text-slate-400 text-sm">Brak zamówień. Udostępnij swój profil klientom!</p>
                  </div>
                )}
              </div>
            )
          })()}

          {/* FILAMENTY TAB */}
          {activeTab === 'filamenty' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Filamenty</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Łącznie: {filaments.length} filamentów, {(filaments.reduce((s, f) => s + f.stock_grams, 0) / 1000).toFixed(1)} kg na stanie
                  </p>
                </div>
                <button
                  onClick={() => { setEditingFilament(null); setNewFilament({ type: FILAMENT_TYPES[0], color: FILAMENT_COLORS[0].name, brand: '', pricePerKg: '', stockGrams: '', lowStockAlert: '500' }); setShowFilamentModal(true) }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:opacity-90 border-none"
                  style={{ background: '#22C55E' }}
                >
                  + Dodaj filament
                </button>
              </div>

              {filaments.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={{ border: '2px dashed rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.02)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <p className="text-slate-400 text-sm">Nie masz jeszcze filamentów. Dodaj pierwszy filament!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filaments.map(fil => {
                    const isLowStock = fil.stock_grams < fil.low_stock_alert
                    return (
                      <div key={fil.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isLowStock ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2" style={{ background: getColorHex(fil.color), borderColor: 'rgba(255,255,255,0.15)' }} />
                            <div>
                              <h3 className="text-white font-semibold text-[15px]">{fil.type} — {fil.color}</h3>
                              <p className="text-slate-500 text-[13px]">{fil.brand}</p>
                            </div>
                          </div>
                          {isLowStock && (
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
                              Niski stan!
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-400 mb-3">
                          <span>Cena: <span className="text-white font-medium">{fil.price_per_kg.toFixed(2)} zł/kg</span></span>
                          <span>Stan: <span className={`font-medium ${isLowStock ? '' : 'text-white'}`} style={isLowStock ? { color: '#f97316' } : undefined}>{fil.stock_grams}g ({(fil.stock_grams / 1000).toFixed(1)} kg)</span></span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditFilament(fil)}
                            className="text-[12px] text-slate-500 cursor-pointer hover:text-violet-400 transition-colors bg-transparent border-none p-0"
                          >
                            Edytuj
                          </button>
                          <span className="text-slate-700 text-[12px]">•</span>
                          <button
                            onClick={() => removeFilament(fil.id)}
                            className="text-[12px] text-slate-600 cursor-pointer hover:text-red-400 transition-colors bg-transparent border-none p-0"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

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

              {/* Pricing Settings */}
              <div className="rounded-2xl p-6 mt-6" style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <h3 className="text-white font-bold text-base mb-5">Ustawienia cenowe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Marża bazowa (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={marginPercent}
                      onChange={e => setMarginPercent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Rabat hurtowy 10+ szt (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={marginBulk10}
                      onChange={e => setMarginBulk10(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Rabat hurtowy 50+ szt (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={marginBulk50}
                      onChange={e => setMarginBulk50(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Rabat hurtowy 100+ szt (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={marginBulk100}
                      onChange={e => setMarginBulk100(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSavePricing}
                  disabled={savingPricing}
                  className="mt-5 px-6 py-3 rounded-xl text-white font-semibold text-sm border-none cursor-pointer transition-all hover:opacity-90"
                  style={{ background: pricingSaved ? '#16A34A' : '#8B5CF6' }}
                >
                  {savingPricing ? 'Zapisywanie...' : pricingSaved ? 'Zapisano!' : 'Zapisz ustawienia'}
                </button>
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

      {/* Add/Edit Filament Modal */}
      {showFilamentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editingFilament ? 'Edytuj filament' : 'Dodaj filament'}</h2>
              <button onClick={() => { setShowFilamentModal(false); setEditingFilament(null) }} className="text-slate-500 hover:text-white cursor-pointer bg-transparent border-none text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleAddFilament} className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Typ filamentu</label>
                <select
                  value={newFilament.type}
                  onChange={e => setNewFilament(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none appearance-none cursor-pointer"
                  style={inputStyle}
                >
                  {FILAMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Kolor</label>
                <div className="flex flex-wrap gap-2">
                  {FILAMENT_COLORS.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setNewFilament(p => ({ ...p, color: c.name }))}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all border-none"
                      style={{
                        background: newFilament.color === c.name ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        color: newFilament.color === c.name ? '#a78bfa' : '#94a3b8',
                        outline: newFilament.color === c.name ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="w-4 h-4 rounded-full border" style={{ background: c.hex, borderColor: 'rgba(255,255,255,0.2)' }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Marka</label>
                <input
                  required
                  value={newFilament.brand}
                  onChange={e => setNewFilament(p => ({ ...p, brand: e.target.value }))}
                  placeholder="np. Prusament, Devil Design"
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Cena za kg (zł)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={newFilament.pricePerKg}
                    onChange={e => setNewFilament(p => ({ ...p, pricePerKg: e.target.value }))}
                    placeholder="89.00"
                    className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Stan (gramy)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={newFilament.stockGrams}
                    onChange={e => setNewFilament(p => ({ ...p, stockGrams: e.target.value }))}
                    placeholder="1000"
                    className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Alert niskiego stanu (gramy)</label>
                <input
                  type="number"
                  min="0"
                  value={newFilament.lowStockAlert}
                  onChange={e => setNewFilament(p => ({ ...p, lowStockAlert: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:opacity-90 mt-2"
                style={{ background: '#22C55E' }}
              >
                {editingFilament ? 'Zapisz zmiany' : 'Dodaj filament'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Printer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Dodaj drukarkę</h2>
              <button onClick={() => { setShowAddModal(false); setPrinterSearch(''); setSelectedSpec(null); setShowPrinterDropdown(false) }} className="text-slate-500 hover:text-white cursor-pointer bg-transparent border-none text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleAddPrinter} className="flex flex-col gap-4">
              <div className="relative">
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Model drukarki</label>
                <input
                  value={printerSearch}
                  onChange={e => { setPrinterSearch(e.target.value); setShowPrinterDropdown(true); setSelectedSpec(null); setNewPrinter(p => ({ ...p, model: e.target.value })) }}
                  onFocus={() => setShowPrinterDropdown(true)}
                  onBlur={() => setTimeout(() => setShowPrinterDropdown(false), 200)}
                  placeholder="Zacznij pisać np. Bambu, Prusa, Ender..."
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                  style={inputStyle}
                />
                {showPrinterDropdown && filteredPrinterSpecs.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden max-h-64 overflow-y-auto" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                    {filteredPrinterSpecs.map(spec => (
                      <button
                        key={spec.name}
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => selectPrinterSpec(spec)}
                        className="w-full px-4 py-3 text-left cursor-pointer transition-colors border-none flex items-center justify-between"
                        style={{ background: 'transparent', color: '#fff' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <span className="font-medium text-[14px]">{spec.name}</span>
                          <span className="text-slate-500 text-[12px] ml-2">{spec.brand}</span>
                        </div>
                        <span className="text-slate-500 text-[12px]">{spec.buildX}×{spec.buildY}×{spec.buildZ}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedSpec && (
                  <div className="mt-2 rounded-lg px-3 py-2 flex items-center gap-2 text-[13px]" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ color: '#22C55E' }}>Auto-uzupełniono: {selectedSpec.buildX}×{selectedSpec.buildY}×{selectedSpec.buildZ} mm, dysza {selectedSpec.defaultNozzle}, {selectedSpec.defaultMaterials.length} materiałów</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 text-[13px] font-medium mb-1.5">Nazwa własna (opcjonalna)</label>
                <input
                  value={newPrinter.name}
                  onChange={e => setNewPrinter(p => ({ ...p, name: e.target.value }))}
                  placeholder={selectedSpec ? `np. ${selectedSpec.name} #1` : 'np. Moja drukarka #1'}
                  className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                  style={inputStyle}
                />
                <p className="text-slate-600 text-[11px] mt-1">Pomaga rozróżnić drukarki tego samego modelu</p>
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
                        onChange={e => { if (!selectedSpec) setNewPrinter(p => ({ ...p, [dim]: e.target.value })) }}
                        readOnly={!!selectedSpec}
                        className="w-full px-4 py-3 rounded-xl text-white text-[15px] outline-none"
                        style={{ ...inputStyle, opacity: selectedSpec ? 0.6 : 1, cursor: selectedSpec ? 'not-allowed' : 'text' }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-[12px]">{['X', 'Y', 'Z'][i]}</span>
                    </div>
                  ))}
                </div>
                {selectedSpec && <p className="text-slate-600 text-[11px] mt-1">Dane z bazy drukarek — jeśli chcesz zmienić, wyczyść model</p>}
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
