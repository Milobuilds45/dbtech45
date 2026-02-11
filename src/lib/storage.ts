// Fallback storage system when Supabase isn't configured
// Uses localStorage temporarily until real database is connected

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

// Temporary storage using localStorage
export const tempStorage = {
  ideas: {
    getAll(): IdeaVaultItem[] {
      if (typeof window === 'undefined') return []
      const stored = localStorage.getItem('db-tech-os-ideas')
      return stored ? JSON.parse(stored) : [
        {
          id: '1',
          title: 'AI Trading Assistant Enhancement',
          description: 'Improve signal detection algorithms for better market timing',
          category: 'trading',
          priority: 'high' as const,
          status: 'building' as const,
          tags: ['AI', 'trading', 'signals'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'derek'
        },
        {
          id: '2', 
          title: 'Restaurant POS Analytics Dashboard',
          description: 'Real-time sales analytics for Bobola\'s operations',
          category: 'business',
          priority: 'medium' as const,
          status: 'shaping' as const,
          tags: ['analytics', 'restaurant', 'dashboard'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'derek'
        },
        {
          id: '3',
          title: 'Agent Coordination Improvements',
          description: 'Better handoff protocols between Paula, Anders, and team',
          category: 'operations',
          priority: 'medium' as const,
          status: 'spark' as const,
          tags: ['agents', 'workflow', 'coordination'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'derek'
        }
      ]
    },

    save(ideas: IdeaVaultItem[]) {
      if (typeof window === 'undefined') return
      localStorage.setItem('db-tech-os-ideas', JSON.stringify(ideas))
    },

    add(idea: Omit<IdeaVaultItem, 'id' | 'created_at' | 'updated_at'>): IdeaVaultItem {
      const newIdea: IdeaVaultItem = {
        ...idea,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const ideas = this.getAll()
      ideas.unshift(newIdea)
      this.save(ideas)
      return newIdea
    },

    update(id: string, updates: Partial<IdeaVaultItem>): IdeaVaultItem | null {
      const ideas = this.getAll()
      const index = ideas.findIndex(idea => idea.id === id)
      if (index === -1) return null

      ideas[index] = {
        ...ideas[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      this.save(ideas)
      return ideas[index]
    },

    delete(id: string): boolean {
      const ideas = this.getAll()
      const filtered = ideas.filter(idea => idea.id !== id)
      if (filtered.length === ideas.length) return false
      
      this.save(filtered)
      return true
    }
  },

  // Real goals data
  goals: {
    getAll() {
      return [
        {
          id: '1',
          title: 'Sunday Squares Launch',
          description: 'Complete football squares app with payments',
          current_value: 95,
          target_value: 100,
          unit: 'percent',
          deadline: '2026-02-12',
          status: 'active' as const,
          priority: 'high' as const
        },
        {
          id: '2',
          title: 'Soul Solace Beta',
          description: 'AI wellness app beta testing',
          current_value: 60,
          target_value: 100,
          unit: 'percent',
          deadline: '2026-03-01',
          status: 'active' as const,
          priority: 'medium' as const
        },
        {
          id: '3',
          title: 'Boundless v2',
          description: 'Travel planning app redesign',
          current_value: 40,
          target_value: 100,
          unit: 'percent',
          deadline: '2026-02-17',
          status: 'active' as const,
          priority: 'medium' as const
        },
        {
          id: '4',
          title: 'tickR MVP',
          description: 'Trading dashboard MVP scope',
          current_value: 25,
          target_value: 100,
          unit: 'percent',
          deadline: '2026-02-24',
          status: 'active' as const,
          priority: 'medium' as const
        }
      ]
    }
  },

  // Real todo data
  todos: {
    getAll() {
      return [
        {
          id: '1',
          title: 'Model Counsel API key restoration',
          assignee: 'Anders',
          priority: 'high' as const,
          status: 'in_progress' as const,
          due_date: '2026-02-10',
          project: 'DB Tech OS'
        },
        {
          id: '2',
          title: 'Sunday Squares payment integration',
          assignee: 'Anders',
          priority: 'high' as const,
          status: 'in_progress' as const,
          due_date: '2026-02-12',
          project: 'Sunday Squares'
        },
        {
          id: '3',
          title: 'Signal & Noise draft review',
          assignee: 'Grant',
          priority: 'high' as const,
          status: 'backlog' as const,
          due_date: '2026-02-14',
          project: 'Newsletter'
        },
        {
          id: '4',
          title: 'Boundless onboarding redesign',
          assignee: 'Paula',
          priority: 'medium' as const,
          status: 'in_progress' as const,
          due_date: '2026-02-17',
          project: 'Boundless'
        },
        {
          id: '5',
          title: 'MenuSparks demo prep',
          assignee: 'Milo',
          priority: 'medium' as const,
          status: 'backlog' as const,
          due_date: '2026-02-24',
          project: 'MenuSparks'
        }
      ]
    }
  }
}