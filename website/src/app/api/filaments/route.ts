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
  if (!user) return NextResponse.json({ error: 'Nie zalogowany.' }, { status: 401 })
  if (!farmId) return NextResponse.json({ error: 'Nie znaleziono farmy.' }, { status: 404 })

  const supabase = createServiceClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('filaments')
    .insert({
      farm_id: farmId,
      type: body.type,
      color: body.color,
      brand: body.brand || '',
      price_per_kg: body.price_per_kg || 0,
      stock_grams: body.stock_grams || 0,
      low_stock_alert: body.low_stock_alert || 500,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const { user, farmId } = await getUserFarmId()
  if (!user) return NextResponse.json({ error: 'Nie zalogowany.' }, { status: 401 })
  if (!farmId) return NextResponse.json({ error: 'Nie znaleziono farmy.' }, { status: 404 })

  const supabase = createServiceClient()
  const body = await req.json()
  const filamentId = req.nextUrl.searchParams.get('id')
  if (!filamentId) return NextResponse.json({ error: 'Brak id.' }, { status: 400 })

  const { data, error } = await supabase
    .from('filaments')
    .update({
      type: body.type,
      color: body.color,
      brand: body.brand || '',
      price_per_kg: body.price_per_kg || 0,
      stock_grams: body.stock_grams || 0,
      low_stock_alert: body.low_stock_alert || 500,
    })
    .eq('id', filamentId)
    .eq('farm_id', farmId)
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
  const filamentId = req.nextUrl.searchParams.get('id')
  if (!filamentId) return NextResponse.json({ error: 'Brak id.' }, { status: 400 })

  const { error } = await supabase
    .from('filaments')
    .delete()
    .eq('id', filamentId)
    .eq('farm_id', farmId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
