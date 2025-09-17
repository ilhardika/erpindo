/**
 * CategoryDropdownSimple Component - Inline CRUD
 * Dropdown with inline CRUD operations for product categories
 * Only requires category name - no dialogs, colors, or descriptions
 * Date: 2025-09-17
 */

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useProductCategoryStore, useProductCategoryActions } from '../../../stores/productCategoryStore';
import type { ProductCategory } from '../../../types/database';

interface CategoryDropdownProps {
  value?: string | null;
  onValueChange: (categoryId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CategoryDropdownSimple: React.FC<CategoryDropdownProps> = ({
  value,
  onValueChange,
  placeholder = "Select category",
  disabled = false,
}) => {
  // State
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingName, setEditingName] = useState('');

  // Store
  const { categories, loading, error } = useProductCategoryStore();
  const { loadCategories, createCategory, updateCategory, deleteCategory } = useProductCategoryActions();

  const activeCategories = categories.filter(cat => cat.is_active);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handlers
  const handleCreateStart = () => {
    setIsCreating(true);
    setNewCategoryName('');
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setNewCategoryName('');
  };

  const handleCreateSubmit = async () => {
    if (!newCategoryName.trim()) return;

    const success = await createCategory({
      name: newCategoryName.trim(),
      description: null,
      color: '#3b82f6', // Default blue color
      is_active: true,
    });

    if (success) {
      setIsCreating(false);
      setNewCategoryName('');
    }
  };

  const handleEditStart = (category: ProductCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleEditSubmit = async () => {
    if (!editingId || !editingName.trim()) return;

    const success = await updateCategory(editingId, {
      name: editingName.trim(),
    });

    if (success) {
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const success = await deleteCategory(categoryId);
      if (success && value === categoryId) {
        onValueChange(null);
      }
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error loading categories: {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select 
        value={value || 'no-category'} 
        onValueChange={(val) => onValueChange(val === 'no-category' ? null : val)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* No category option */}
          <SelectItem value="no-category">
            <span className="text-gray-500">No category</span>
          </SelectItem>
          
          {/* Existing categories */}
          {activeCategories.map((category) => (
            <div key={category.id} className="flex items-center justify-between group hover:bg-gray-50 px-2 py-1 mx-1 rounded">
              {editingId === category.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSubmit();
                      if (e.key === 'Escape') handleEditCancel();
                    }}
                    className="h-7 text-sm flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditSubmit}
                    className="h-7 w-7 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditCancel}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <div 
                    className="flex-1 py-1 cursor-pointer"
                    onClick={() => onValueChange(category.id)}
                  >
                    {category.name}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(category);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(category.id);
                      }}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Create new category */}
          <div className="px-2 py-1 border-t mt-1">
            {isCreating ? (
              <div className="flex items-center gap-1">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateSubmit();
                    if (e.key === 'Escape') handleCreateCancel();
                  }}
                  placeholder="Category name"
                  className="h-7 text-sm flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCreateSubmit}
                  className="h-7 w-7 p-0"
                  disabled={!newCategoryName.trim()}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCreateCancel}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCreateStart}
                className="w-full justify-start h-7 text-sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add category
              </Button>
            )}
          </div>
        </SelectContent>
      </Select>

      {loading && (
        <div className="text-xs text-gray-500">Loading categories...</div>
      )}
    </div>
  );
};