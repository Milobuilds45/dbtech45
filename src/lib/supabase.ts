import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
