import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.farm_id) return NextResponse.json({ error: 'Missing farm_id' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('filaments')
      .insert({
        farm_id: body.farm_id,
        type: body.type || 'PLA',
        color: body.color || 'Czarny',
        brand: body.brand || '',
        price_per_kg: body.price_per_kg || 0,
        stock_grams: body.stock_grams || 0,
        low_stock_alert: body.low_stock_alert || 500,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
