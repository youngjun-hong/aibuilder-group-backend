import { createAnonClient } from '@/lib/supabase/anon'
import type { Category, CategoryType } from '@/lib/types'

export async function listCategories(type: CategoryType): Promise<Category[]> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, type, sort')
    .eq('type', type)
    .order('sort', { ascending: true })
  if (error) throw error
  return data as Category[]
}
