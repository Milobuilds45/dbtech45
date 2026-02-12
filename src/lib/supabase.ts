import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create a real client if env vars are set; otherwise return a no-op stub
function createSafeClient(): SupabaseClient {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  // Return a stub that won't throw during build/prerender
  const noop = () => ({ data: null, error: null, count: null, status: 200, statusText: 'OK' })
  const chainable: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 'is', 'in', 'order', 'limit', 'single', 'maybeSingle', 'range', 'match', 'not', 'or', 'filter', 'contains', 'containedBy', 'textSearch']
  const handler: ProxyHandler<Record<string, unknown>> = {
    get: (_target, prop) => {
      if (prop === 'then') return undefined // not a promise
      if (methods.includes(prop as string)) return () => new Proxy(chainable, handler)
      return noop
    },
  }
  const queryProxy = new Proxy(chainable, handler)
  return { from: () => queryProxy, rpc: noop, auth: { getSession: noop, getUser: noop, signInWithPassword: noop, signOut: noop, onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) } } as unknown as SupabaseClient
}

export const supabase = createSafeClient()

// Types
export interface Idea {
  id: string
  title: string
  description: string | null
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'spark' | 'shaping' | 'building' | 'shipped'
  tags: string[]
  created_at: string
  updated_at: string
  created_by: string
}

export interface Goal {
  id: string
  title: string
  description: string | null
  category: string
  target_value: number | null
  current_value: number
  unit: string | null
  deadline: string | null
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface Todo {
  id: string
  title: string
  description: string | null
  assignee: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'backlog' | 'in_progress' | 'review' | 'done'
  due_date: string | null
  project: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  title: string
  description: string | null
  category: string
  agent: string | null
  project: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface DailyNote {
  id: string
  text: string
  project: string | null
  agent: string | null
  created_at: string
}
