export interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
}

export interface Project {
  id: string
  name: string
  status: 'planned' | 'active' | 'on-hold'
  owner: 'Anita' | 'Brian' | 'Chloe' | 'Diego'
  budget: number
  startDate: number
}
