import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.user_id || !body.name || !body.slug) {
      return NextResponse.json({ error: 'Missing user_id, name, or slug' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify user exists
    const { data: { user } } = await supabase.auth.admin.getUserById(body.user_id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if farm already exists for this user
    const { data: existing } = await supabase
      .from('farms')
      .select('id')
      .eq('user_id', body.user_id)
      .single()

    if (existing) return NextResponse.json({ error: 'Farm already exists', farm: existing }, { status: 409 })

    const { data, error } = await supabase
      .from('farms')
      .insert({
        user_id: body.user_id,
        name: body.name,
        slug: body.slug,
        city: body.city || '',
        is_active: true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Insert filaments if provided
    if (body.filaments && body.filaments.length > 0 && data) {
      const rows = body.filaments.map((f: { type: string; color: string }) => ({
        farm_id: data.id,
        type: f.type,
        color: f.color,
        brand: '',
        price_per_kg: 0,
        stock_grams: 1000,
        low_stock_alert: 500,
      }))
      await supabase.from('filaments').insert(rows)
    }

    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
