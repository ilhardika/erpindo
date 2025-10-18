'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTableLayout } from '@/components/layouts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, X, Check, Star } from 'lucide-react'
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '@/lib/inventory/api'
import type { Warehouse } from '@/types/inventory'

export default function WarehousesPage() {
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    is_active: true,
    is_default: false,
  })

  useEffect(() => {
    loadWarehouses()
  }, [])

  async function loadWarehouses() {
    try {
      setLoading(true)
      const data = await getWarehouses()
      setWarehouses(data)
    } catch (error) {
      console.error('Error loading warehouses:', error)
      alert('Failed to load warehouses')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(warehouse: Warehouse) {
    setEditingId(warehouse.id)
    setFormData({
      name: warehouse.name,
      code: warehouse.code || '',
      address: warehouse.address || '',
      is_active: warehouse.is_active ?? true,
      is_default: warehouse.is_default ?? false,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setAddingNew(false)
    setFormData({
      name: '',
      code: '',
      address: '',
      is_active: true,
      is_default: false,
    })
  }

  async function handleSave(id?: string) {
    if (!formData.name.trim()) {
      alert('Warehouse name is required')
      return
    }

    try {
      if (id) {
        await updateWarehouse(id, formData)
        alert('Warehouse updated successfully')
      } else {
        await createWarehouse(formData)
        alert('Warehouse created successfully')
      }
      await loadWarehouses()
      cancelEdit()
    } catch (error) {
      console.error('Error saving warehouse:', error)
      alert('Failed to save warehouse')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this warehouse?')) return

    try {
      await deleteWarehouse(id)
      alert('Warehouse deleted successfully')
      await loadWarehouses()
    } catch (error) {
      console.error('Error deleting warehouse:', error)
      alert('Failed to delete warehouse')
    }
  }

  async function handleSetDefault(id: string) {
    try {
      // First, unset all warehouses as default
      await Promise.all(
        warehouses.map(w =>
          w.is_default
            ? updateWarehouse(w.id, { is_default: false })
            : Promise.resolve()
        )
      )
      // Then set the selected warehouse as default
      await updateWarehouse(id, { is_default: true })
      alert('Default warehouse updated successfully')
      await loadWarehouses()
    } catch (error) {
      console.error('Error setting default warehouse:', error)
      alert('Failed to set default warehouse')
    }
  }

  return (
    <DataTableLayout
      title="Warehouses"
      description="Manage warehouse locations and inventory storage"
      actions={
        <div className="flex gap-2">
          <Button onClick={() => router.push('/erp/inventory')}>
            Back to Inventory
          </Button>
          <Button onClick={() => setAddingNew(true)} disabled={addingNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>
      }
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addingNew && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Warehouse name *"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Code (e.g., WH01)"
                    value={formData.code}
                    onChange={e =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="Address"
                    value={formData.address}
                    onChange={e =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={1}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_active}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, is_active: !!checked })
                      }
                    />
                    <label className="text-sm">Active</label>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_default}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, is_default: !!checked })
                      }
                    />
                    <label className="text-sm">Default</label>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => handleSave()}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {warehouses.map(warehouse => (
              <TableRow key={warehouse.id}>
                <TableCell>
                  {editingId === warehouse.id ? (
                    <Input
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {warehouse.name}
                      {warehouse.is_default && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === warehouse.id ? (
                    <Input
                      value={formData.code}
                      onChange={e =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  ) : (
                    warehouse.code || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === warehouse.id ? (
                    <Textarea
                      value={formData.address}
                      onChange={e =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows={1}
                    />
                  ) : (
                    warehouse.address || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === warehouse.id ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.is_active}
                        onCheckedChange={checked =>
                          setFormData({ ...formData, is_active: !!checked })
                        }
                      />
                      <label className="text-sm">Active</label>
                    </div>
                  ) : (
                    <Badge
                      variant={warehouse.is_active ? 'default' : 'secondary'}
                    >
                      {warehouse.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === warehouse.id ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.is_default}
                        onCheckedChange={checked =>
                          setFormData({ ...formData, is_default: !!checked })
                        }
                      />
                      <label className="text-sm">Default</label>
                    </div>
                  ) : warehouse.is_default ? (
                    <Badge
                      variant="default"
                      className="bg-yellow-400 text-black"
                    >
                      Default
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetDefault(warehouse.id)}
                      disabled={addingNew || editingId !== null}
                    >
                      Set Default
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === warehouse.id ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(warehouse.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(warehouse)}
                        disabled={addingNew || editingId !== null}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(warehouse.id)}
                        disabled={
                          addingNew ||
                          editingId !== null ||
                          !!warehouse.is_default
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!loading && warehouses.length === 0 && !addingNew && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No warehouses found. Click &quot;Add Warehouse&quot; to create
                  one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DataTableLayout>
  )
}
