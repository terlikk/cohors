import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (!body.farm_id || !body.name) {
      return NextResponse.json({ error: 'Missing farm_id or name' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('printers')
      .insert({
        farm_id: body.farm_id,
        name: body.name,
        model: body.model || body.name,
        build_x: body.build_x || 256,
        build_y: body.build_y || 256,
        build_z: body.build_z || 256,
        nozzle: body.nozzle || 0.4,
        materials: body.materials || ['PLA'],
        status: 'idle',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
