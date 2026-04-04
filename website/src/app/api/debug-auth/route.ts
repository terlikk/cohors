import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Check cookies
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    results.cookieCount = allCookies.length
    results.cookieNames = allCookies.map(c => c.name)
    results.hasSupabaseCookie = allCookies.some(c => c.name.includes('supabase') || c.name.includes('sb-'))
  } catch (e) {
    results.cookieError = String(e)
  }

  // 2. Try SSR client auth
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )
    const { data: { user }, error } = await supabase.auth.getUser()
    results.ssrUser = user ? { id: user.id, email: user.email } : null
    results.ssrError = error?.message || null
  } catch (e) {
    results.ssrException = String(e)
  }

  // 3. Try service role insert (should always work)
  try {
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await svc
      .from('printers')
      .insert({ farm_id: '217f2c07-7574-4566-88bf-3ef5086d329b', name: 'DEBUG-TEST', model: 'Debug', build_x: 1, build_y: 1, build_z: 1, nozzle: 0.4, materials: ['PLA'], status: 'idle' })
      .select()
      .single()
    
    if (data) {
      results.serviceRoleInsert = 'OK'
      await svc.from('printers').delete().eq('id', data.id)
    }
    if (error) results.serviceRoleError = error.message
  } catch (e) {
    results.serviceRoleException = String(e)
  }

  // 4. Check env vars
  results.hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  results.hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  results.hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  return NextResponse.json(results)
}
