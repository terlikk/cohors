import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getUser() {
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
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function getUserFarmId() {
  const user = await getUser()
  if (!user) return { user: null, farmId: null }

  const supabase = createServiceClient()
  const { data: farm } = await supabase
    .from('farms')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return { user, farmId: farm?.id || null }
}

export async function POST(req: NextRequest) {
  const { user, farmId } = await getUserFarmId()
  if (!user) return NextResponse.json({ error: 'Nie zalogowany. Zaloguj się ponownie.' }, { status: 401 })
  if (!farmId) return NextResponse.json({ error: 'Nie znaleziono farmy.' }, { status: 404 })

  const supabase = createServiceClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('printers')
    .insert({
      farm_id: farmId,
      name: body.name,
      model: body.model,
      build_x: body.build_x || 0,
      build_y: body.build_y || 0,
      build_z: body.build_z || 0,
      nozzle: body.nozzle || '0.4',
      materials: body.materials || [],
      status: 'idle',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { user, farmId } = await getUserFarmId()
  if (!user) return NextResponse.json({ error: 'Nie zalogowany.' }, { status: 401 })
  if (!farmId) return NextResponse.json({ error: 'Nie znaleziono farmy.' }, { status: 404 })

  const supabase = createServiceClient()
  const printerId = req.nextUrl.searchParams.get('id')
  if (!printerId) return NextResponse.json({ error: 'Brak id drukarki.' }, { status: 400 })

  const { error } = await supabase
    .from('printers')
    .delete()
    .eq('id', printerId)
    .eq('farm_id', farmId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
