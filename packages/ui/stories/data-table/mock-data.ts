import type { DataTableFilterOption } from '../../src/components'
import type { Task, Project } from './types'

export const statusOptions: DataTableFilterOption[] = [
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Done', value: 'done' },
]

export const priorityOptions: DataTableFilterOption[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

export const projectStatusOptions: DataTableFilterOption[] = [
  { label: 'Planned', value: 'planned' },
  { label: 'Active', value: 'active' },
  { label: 'On hold', value: 'on-hold' },
]

export const projectOwnerOptions: DataTableFilterOption[] = [
  { label: 'Anita', value: 'Anita' },
  { label: 'Brian', value: 'Brian' },
  { label: 'Chloe', value: 'Chloe' },
  { label: 'Diego', value: 'Diego' },
]

export const tasks: Task[] = [
  {
    id: 'TASK-001',
    title: 'Wireframe marketing page',
    status: 'todo',
    priority: 'high',
  },
  {
    id: 'TASK-002',
    title: 'Sync with design team',
    status: 'in-progress',
    priority: 'medium',
  },
  {
    id: 'TASK-003',
    title: 'Publish release notes',
    status: 'done',
    priority: 'low',
  },
  {
    id: 'TASK-004',
    title: 'Update onboarding checklist',
    status: 'todo',
    priority: 'medium',
  },
  {
    id: 'TASK-005',
    title: 'Refine pricing comparison',
    status: 'in-progress',
    priority: 'high',
  },
  {
    id: 'TASK-006',
    title: 'Plan Q2 roadmap',
    status: 'todo',
    priority: 'high',
  },
  {
    id: 'TASK-007',
    title: 'Conduct user interviews',
    status: 'done',
    priority: 'medium',
  },
  {
    id: 'TASK-008',
    title: 'Optimize landing page SEO',
    status: 'in-progress',
    priority: 'low',
  },
  {
    id: 'TASK-009',
    title: 'Set up A/B tests',
    status: 'todo',
    priority: 'medium',
  },
  {
    id: 'TASK-010',
    title: 'Analyze user feedback',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'TASK-011',
    title: 'Draft blog post',
    status: 'in-progress',
    priority: 'low',
  }
]

export const projects: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Realtime inbox',
    status: 'active',
    owner: 'Anita',
    budget: 120000,
    startDate: new Date('2024-01-08').getTime(),
  },
  {
    id: 'PRJ-002',
    name: 'AI summarizer',
    status: 'planned',
    owner: 'Brian',
    budget: 95000,
    startDate: new Date('2024-02-15').getTime(),
  },
  {
    id: 'PRJ-003',
    name: 'Payments revamp',
    status: 'on-hold',
    owner: 'Chloe',
    budget: 78000,
    startDate: new Date('2023-11-27').getTime(),
  },
  {
    id: 'PRJ-004',
    name: 'Usage analytics',
    status: 'active',
    owner: 'Diego',
    budget: 68000,
    startDate: new Date('2023-12-11').getTime(),
  },
  {
    id: 'PRJ-005',
    name: 'Billing pipeline',
    status: 'planned',
    owner: 'Anita',
    budget: 142000,
    startDate: new Date('2024-03-01').getTime(),
  },
  {
    id: 'PRJ-006',
    name: 'Team spaces',
    status: 'active',
    owner: 'Brian',
    budget: 58000,
    startDate: new Date('2023-10-02').getTime(),
  },
]
