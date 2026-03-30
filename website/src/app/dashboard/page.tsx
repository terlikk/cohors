'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([])
  const [dragover, setDragover] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setLoading(false)
      }
    })
  }, [router, supabase.auth])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function uploadFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['stl', '3mf', 'obj'].includes(ext)) {
      setMessage('Nieobslugiwany format. Uzyj .STL, .3MF lub .OBJ')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      setMessage('Plik za duzy. Max 100 MB.')
      return
    }

    setUploading(true)
    setMessage('')

    const fileName = `${user!.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('stl-files').upload(fileName, file)

    if (error) {
      setMessage(`Blad uploadu: ${error.message}`)
    } else {
      setUploadedFiles(prev => [...prev, { name: file.name, size: file.size }])
      setMessage(`Plik ${file.name} przeslany!`)
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? (bytes / 1024).toFixed(1) + ' KB'
      : (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <p className="text-slate-400">Ladowanie...</p>
      </div>
    )
  }

  const farmName = user?.user_metadata?.farm_name || 'Twoja farma'
  const userCity = user?.user_metadata?.city || ''

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b6b, #e05555)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          </div>
          <span className="text-lg font-bold text-white">Print<span style={{ color: '#ff6b6b' }}>Flow</span></span>
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

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* User Info */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,107,107,0.03)', border: '1px solid rgba(255,107,107,0.15)' }}>
          <h1 className="text-2xl font-bold text-white mb-1">Witaj, {farmName}!</h1>
          {userCity && <p className="text-slate-400 text-sm">Miasto: {userCity}</p>}
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Upload Area */}
        <h2 className="text-lg font-semibold text-white mb-4">Przeslij pliki 3D</h2>

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
          <p className="text-xl font-semibold text-white">
            {uploading ? 'Przesylanie...' : 'Przeciagnij plik tutaj'}
          </p>
          <p className="text-slate-500 text-sm mt-2">lub kliknij zeby wybrac z dysku &bull; max 100 MB</p>
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
              const file = e.target.files?.[0]
              if (file) uploadFile(file)
            }}
          />
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{
            background: message.includes('Blad') || message.includes('Nieobslug') || message.includes('za duzy')
              ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${message.includes('Blad') || message.includes('Nieobslug') || message.includes('za duzy')
              ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            color: message.includes('Blad') || message.includes('Nieobslug') || message.includes('za duzy')
              ? '#fca5a5' : '#86efac',
          }}>
            {message}
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Przeslane pliki ({uploadedFiles.length})</h3>
            <div className="flex flex-col gap-2">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm text-white font-medium flex-1">{f.name}</span>
                  <span className="text-[13px] text-slate-500">{formatSize(f.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
