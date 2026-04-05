import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Dead simple test: add a printer and return HTML result
export async function GET(req: NextRequest) {
  const farmId = req.nextUrl.searchParams.get('farm_id')
  
  if (!farmId) {
    // List all farms so user can pick one
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: farms } = await supabase.from('farms').select('id, name, slug')
    
    const links = (farms || []).map(f => 
      `<a href="/api/test-add?farm_id=${f.id}">${f.name} (${f.slug})</a>`
    ).join('<br>')
    
    return new NextResponse(
      `<html><body style="background:#0f172a;color:white;font-family:sans-serif;padding:40px">
        <h2>PrintFlow — Test dodawania drukarki</h2>
        <p>Kliknij swoją farmę:</p>${links}
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Add test printer
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('printers')
    .insert({
      farm_id: farmId,
      name: 'Test Drukarka ' + new Date().toLocaleTimeString(),
      model: 'Bambu Lab X1 Carbon',
      build_x: 256, build_y: 256, build_z: 256,
      nozzle: 0.4,
      materials: ['PLA', 'PETG'],
      status: 'idle',
    })
    .select()
    .single()

  if (error) {
    return new NextResponse(
      `<html><body style="background:#0f172a;color:#ef4444;font-family:sans-serif;padding:40px">
        <h2>BLAD</h2><pre>${JSON.stringify(error, null, 2)}</pre>
        <a href="/dashboard" style="color:#22c55e">← Dashboard</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  return new NextResponse(
    `<html><body style="background:#0f172a;color:#22c55e;font-family:sans-serif;padding:40px">
      <h2>DODANO DRUKARKE!</h2>
      <pre style="color:white">${JSON.stringify(data, null, 2)}</pre>
      <br><a href="/dashboard" style="color:#22c55e;font-size:20px">← Wróć do Dashboard (odśwież stronę!)</a>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
