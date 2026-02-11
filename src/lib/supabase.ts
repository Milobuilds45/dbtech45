import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface IdeaVaultItem {
  id: string
  title: string
  description?: string
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
  description?: string
  category: string
  target_value?: number
  current_value: number
  unit?: string
  deadline?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface Todo {
  id: string
  title: string
  description?: string
  assignee?: string
  priority: 'low' | 'medium' | 'high'
  status: 'backlog' | 'in_progress' | 'review' | 'done'
  due_date?: string
  project?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  title: string
  description?: string
  category: string
  agent?: string
  project?: string
  metadata: any
  created_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  agents: string[]
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  description?: string
  created_at: string
  updated_at: string
}

export interface MemoryEntry {
  id: string
  title: string
  content: string
  category: string
  context?: string
  tags: string[]
  importance: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
}

// API functions for Ideas Vault
export const ideasVaultAPI = {
  async getAll(): Promise<IdeaVaultItem[]> {
    const { data, error } = await supabase
      .from('ideas_vault')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(item: Omit<IdeaVaultItem, 'id' | 'created_at' | 'updated_at'>): Promise<IdeaVaultItem> {
    const { data, error } = await supabase
      .from('ideas_vault')
      .insert([item])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<IdeaVaultItem>): Promise<IdeaVaultItem> {
    const { data, error } = await supabase
      .from('ideas_vault')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ideas_vault')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// API functions for Goals
export const goalsAPI = {
  async getAll(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// API functions for Todos
export const todosAPI = {
  async getAll(): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .insert([todo])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Todo>): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// API functions for Activities
export const activitiesAPI = {
  async getRecent(limit: number = 10): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  async create(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// API functions for Skills
export const skillsAPI = {
  async getAll(): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
    
    if (error) throw error
    return data || []
  }
}