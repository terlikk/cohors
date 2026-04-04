'use server'

import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifyAndGetFarmId(userId: string) {
  if (!userId) return null
  const supabase = getServiceClient()
  
  // Verify user actually exists in auth
  const { data: { user } } = await supabase.auth.admin.getUserById(userId)
  if (!user) return null
  
  const { data: farm } = await supabase
    .from('farms')
    .select('id')
    .eq('user_id', userId)
    .single()

  return farm?.id || null
}

// ============ PRINTERS ============

export async function addPrinter(userId: string, data: {
  name: string
  model: string
  build_x: number
  build_y: number
  build_z: number
  nozzle: string
  materials: string[]
}) {
  const farmId = await verifyAndGetFarmId(userId)
  if (!farmId) return { error: 'Nie zalogowany lub brak farmy' }

  const supabase = getServiceClient()
  const { data: printer, error } = await supabase
    .from('printers')
    .insert({
      farm_id: farmId,
      name: data.name,
      model: data.model,
      build_x: data.build_x,
      build_y: data.build_y,
      build_z: data.build_z,
      nozzle: data.nozzle,
      materials: data.materials,
      status: 'idle',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: printer }
}

export async function deletePrinter(userId: string, id: string) {
  const farmId = await verifyAndGetFarmId(userId)
  if (!farmId) return { error: 'Nie zalogowany lub brak farmy' }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('printers')
    .delete()
    .eq('id', id)
    .eq('farm_id', farmId)

  if (error) return { error: error.message }
  return { success: true }
}

// ============ FILAMENTS ============

export async function addFilament(userId: string, data: {
  type: string
  color: string
  brand: string
  price_per_kg: number
  stock_grams: number
  low_stock_alert: number
}) {
  const farmId = await verifyAndGetFarmId(userId)
  if (!farmId) return { error: 'Nie zalogowany lub brak farmy' }

  const supabase = getServiceClient()
  const { data: filament, error } = await supabase
    .from('filaments')
    .insert({
      farm_id: farmId,
      ...data,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: filament }
}

export async function updateFilament(userId: string, id: string, data: {
  type: string
  color: string
  brand: string
  price_per_kg: number
  stock_grams: number
  low_stock_alert: number
}) {
  const farmId = await verifyAndGetFarmId(userId)
  if (!farmId) return { error: 'Nie zalogowany lub brak farmy' }

  const supabase = getServiceClient()
  const { data: filament, error } = await supabase
    .from('filaments')
    .update(data)
    .eq('id', id)
    .eq('farm_id', farmId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: filament }
}

export async function deleteFilament(userId: string, id: string) {
  const farmId = await verifyAndGetFarmId(userId)
  if (!farmId) return { error: 'Nie zalogowany lub brak farmy' }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('filaments')
    .delete()
    .eq('id', id)
    .eq('farm_id', farmId)

  if (error) return { error: error.message }
  return { success: true }
}
