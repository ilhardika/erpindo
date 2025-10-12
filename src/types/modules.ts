export type ModuleCategory = 'system' | 'company' | 'erp'

export type Module = {
  id: string
  name: string
  slug: string
  category: ModuleCategory
  description: string
  icon: string
  route_path: string
  is_active: boolean
  sort_order: number
}

export type ModulePermission = {
  id: string
  user_id: string
  module_id: string
  module?: Module
  can_read: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
  granted_at: string
  granted_by: string
}
