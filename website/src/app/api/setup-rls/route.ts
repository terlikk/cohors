import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time setup endpoint to add RLS policies
// Run once then delete this file
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'public' } }
  )

  const results: string[] = []

  // Execute SQL via the Supabase client's rpc or raw query
  // We'll use a workaround: create a temporary function that sets up policies
  const setupSQL = `
    -- PRINTERS: Allow authenticated users to insert into printers if they own the farm
    DO $$
    BEGIN
      -- Drop existing policies to avoid conflicts
      DROP POLICY IF EXISTS "Users can insert printers for own farm" ON printers;
      DROP POLICY IF EXISTS "Users can delete printers for own farm" ON printers;
      DROP POLICY IF EXISTS "Users can update printers for own farm" ON printers;
      DROP POLICY IF EXISTS "Users can select printers for own farm" ON printers;
      DROP POLICY IF EXISTS "Anyone can read printers" ON printers;
      
      -- Enable RLS if not already
      ALTER TABLE printers ENABLE ROW LEVEL SECURITY;
      
      -- SELECT: anyone can read (for marketplace)
      CREATE POLICY "Anyone can read printers" ON printers
        FOR SELECT USING (true);
      
      -- INSERT: authenticated users can insert if farm_id belongs to them
      CREATE POLICY "Users can insert printers for own farm" ON printers
        FOR INSERT WITH CHECK (
          farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
        );
      
      -- UPDATE: authenticated users can update their own farm's printers
      CREATE POLICY "Users can update printers for own farm" ON printers
        FOR UPDATE USING (
          farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
        );
      
      -- DELETE: authenticated users can delete their own farm's printers
      CREATE POLICY "Users can delete printers for own farm" ON printers
        FOR DELETE USING (
          farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
        );

      -- FILAMENTS: same pattern
      DROP POLICY IF EXISTS "Users can insert filaments for own farm" ON filaments;
      DROP POLICY IF EXISTS "Users can delete filaments for own farm" ON filaments;
      DROP POLICY IF EXISTS "Users can update filaments for own farm" ON filaments;
      DROP POLICY IF EXISTS "Users can select filaments" ON filaments;
      DROP POLICY IF EXISTS "Anyone can read filaments" ON filaments;
      
      ALTER TABLE filaments ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Anyone can read filaments" ON filaments
        FOR SELECT USING (true);
      
      CREATE POLICY "Users can insert filaments for own farm" ON filaments
        FOR INSERT WITH CHECK (
          farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
        );
      
      CREATE POLICY "Users can update filaments for own farm" ON filaments
        FOR UPDATE USING (
          farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
        );
      
      CREATE POLICY "Users can delete filaments for own farm" ON filaments
        FOR DELETE USING (
          farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
        );

      -- ORDERS: allow inserts from anyone (marketplace orders) and farm owners can read
      DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
      DROP POLICY IF EXISTS "Farm owners can read orders" ON orders;
      DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
      
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Anyone can insert orders" ON orders
        FOR INSERT WITH CHECK (true);
      
      CREATE POLICY "Anyone can read orders" ON orders
        FOR SELECT USING (true);

      -- FARMS: anyone can read, authenticated can insert/update own
      DROP POLICY IF EXISTS "Anyone can read farms" ON farms;
      DROP POLICY IF EXISTS "Users can insert own farm" ON farms;
      DROP POLICY IF EXISTS "Users can update own farm" ON farms;
      
      ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Anyone can read farms" ON farms
        FOR SELECT USING (true);
      
      CREATE POLICY "Users can insert own farm" ON farms
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own farm" ON farms
        FOR UPDATE USING (auth.uid() = user_id);
        
    END $$;
  `

  try {
    const { error } = await supabase.rpc('exec_raw_sql', { sql: setupSQL })
    if (error) {
      // If rpc doesn't exist, we'll try a different approach
      results.push('RPC not available: ' + error.message)
    } else {
      results.push('RLS policies created successfully!')
    }
  } catch (e) {
    results.push('Error: ' + String(e))
  }

  return NextResponse.json({ results, note: 'If this failed, run the SQL manually in Supabase Dashboard > SQL Editor' })
}
