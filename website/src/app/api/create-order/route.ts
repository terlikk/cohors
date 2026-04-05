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

    const orderNumber = `PF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        client_email: body.client_email || 'anonim@printflow.pl',
        farm_id: body.farm_id,
        status: 'nowe',
        file_names: body.file_names || [],
        material: body.material || 'PLA',
        color: body.color || 'Czarny',
        quality: body.quality || 'Standard (0.2mm)',
        quantity: body.quantity || 1,
        price_total: body.price_total || 0,
        estimated_hours: body.estimated_hours || 0,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
