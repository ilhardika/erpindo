/**
 * CategoryDropdown Component
 * Dropdown with CRUD operations for product categories
 * Date: 2025-09-16
 */

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { useProductCategoryStore, useProductCategoryActions } from '../../../stores/productCategoryStore';
import { useAuthStore } from '../../../stores/authStore';
import type { ProductCategory } from '../../../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface CategoryDropdownProps {
  value?: string | null;
  onValueChange: (categoryId: string | null) => void;
  placeholder?: string;
  className?: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

// ============================================================================
// COLOR PALETTE
// ============================================================================

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151',
];

// ============================================================================
// COMPONENT
// ============================================================================

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onValueChange,
  placeholder = "Select category...",
  className,
}) => {
  const { categories, loading } = useProductCategoryStore();
  console.log('CategoryDropdown: categories loaded =', categories.length, 'loading =', loading);
  const {
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getActiveCategories,
  } = useProductCategoryActions();

  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: COLOR_PALETTE[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    console.log('CategoryDropdown: Component mounted');
    const { user } = useAuthStore.getState();
    console.log('CategoryDropdown: Auth user:', user);
    console.log('CategoryDropdown: Loading categories...');
    loadCategories();
  }, [loadCategories]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color,
        is_active: true,
      });

      if (success) {
        setShowCreateDialog(false);
        setFormData({ name: '', description: '', color: COLOR_PALETTE[0] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color,
      });

      if (success) {
        setShowEditDialog(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: COLOR_PALETTE[0] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: ProductCategory) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    const success = await deleteCategory(category.id);
    if (success && value === category.id) {
      onValueChange(null);
    }
  };

  const openEditDialog = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || COLOR_PALETTE[0],
    });
    setShowEditDialog(true);
  };

  const openCreateDialog = () => {
    setFormData({ name: '', description: '', color: COLOR_PALETTE[0] });
    setShowCreateDialog(true);
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const activeCategories = getActiveCategories();
  const selectedCategory = activeCategories.find(cat => cat.id === value);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        {/* Category Select */}
        <Select 
          value={value || 'no-category'} 
          onValueChange={(val) => onValueChange(val === 'no-category' ? null : val)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder}>
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedCategory.color || '#6b7280' }}
                  />
                  {selectedCategory.name}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-category">
              <span className="text-gray-500">No category</span>
            </SelectItem>
            {activeCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#6b7280' }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </DropdownMenuItem>
            
            {selectedCategory && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openEditDialog(selectedCategory)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteCategory(selectedCategory)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Category
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Category Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name..."
              />
            </div>
            
            <div>
              <Label htmlFor="create-description">Description (Optional)</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description..."
                rows={3}
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCategory} 
              disabled={!formData.name.trim() || isSubmitting}
            >
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name..."
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description..."
                rows={3}
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditCategory} 
              disabled={!formData.name.trim() || isSubmitting}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryDropdown;