/**
 * ProductFormSimple Component
 * Simple form for creating products with minimal validation
 * Integrates with productStore and authStore
 * Date: 2025-09-14
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { useProductActions } from '../../../stores/productStore';
import { useProductStore } from '../../../stores/productStore';
import { useAuthStore } from '../../../stores/authStore';
import type { ProductInsert } from '../../../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface ProductFormSimpleProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductFormSimple: React.FC<ProductFormSimpleProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const { user } = useAuthStore();
  const { createProduct, updateProduct } = useProductActions();
  const { selectedProduct } = useProductStore();
  
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(selectedProduct);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    cost_price: '',
    selling_price: '',
    stock_quantity: '',
    minimum_stock: '',
    maximum_stock: '',
    location: '',
  });

  // Populate form when selectedProduct changes (for editing)
  useEffect(() => {
    console.log('ProductFormSimple: selectedProduct changed:', { selectedProduct, isEditing });
    if (selectedProduct) {
      console.log('ProductFormSimple: Loading data for edit:', selectedProduct);
      setFormData({
        name: selectedProduct.name || '',
        sku: selectedProduct.sku || '',
        description: selectedProduct.description || '',
        category: selectedProduct.category || '',
        cost_price: selectedProduct.cost_price?.toString() || '',
        selling_price: selectedProduct.selling_price?.toString() || '',
        stock_quantity: selectedProduct.stock_quantity?.toString() || '',
        minimum_stock: selectedProduct.minimum_stock?.toString() || '',
        maximum_stock: selectedProduct.maximum_stock?.toString() || '',
        location: selectedProduct.location || '',
      });
    } else {
      console.log('ProductFormSimple: No selectedProduct, resetting form for create mode');
      // Reset form for create mode
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        cost_price: '',
        selling_price: '',
        stock_quantity: '',
        minimum_stock: '',
        maximum_stock: '',
        location: '',
      });
    }
  }, [selectedProduct]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.tenant_id) {
      alert('User not authenticated');
      return;
    }

    if (!formData.name || !formData.sku) {
      alert('Name and SKU are required');
      return;
    }

    setLoading(true);

    try {
      let success = false;

      if (isEditing && selectedProduct) {
        // Update existing product
        const productUpdate = {
          name: formData.name,
          sku: formData.sku,
          description: formData.description || null,
          category: formData.category || null,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
          selling_price: formData.selling_price ? parseFloat(formData.selling_price) : 0,
          stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
          minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock) : 0,
          maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock) : null,
          location: formData.location || null,
          unit_of_measure: 'pcs',
          is_active: true,
        };

        console.log('ProductFormSimple: Updating product:', selectedProduct.id, productUpdate);
        success = await updateProduct(selectedProduct.id, productUpdate);
      } else {
        // Create new product
        const productData: ProductInsert = {
          name: formData.name,
          sku: formData.sku,
          description: formData.description || null,
          category: formData.category || null,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
          selling_price: formData.selling_price ? parseFloat(formData.selling_price) : 0,
          stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
          minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock) : 0,
          maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock) : null,
          location: formData.location || null,
          company_id: user.tenant_id,
          unit_of_measure: 'pcs',
          is_active: true,
        };

        console.log('ProductFormSimple: Creating product:', productData);
        success = await createProduct(productData);
      }
      
      if (success) {
        console.log('ProductFormSimple: Product saved successfully');
        onSuccess?.();
        // Reset form only if creating (not editing)
        if (!isEditing) {
          setFormData({
            name: '',
            sku: '',
            description: '',
            category: '',
            cost_price: '',
            selling_price: '',
            stock_quantity: '',
            minimum_stock: '',
            maximum_stock: '',
            location: '',
          });
        }
      } else {
        alert(isEditing ? 'Failed to update product' : 'Failed to create product');
      }
    } catch (error) {
      console.error('ProductFormSimple: Error saving product:', error);
      alert(isEditing ? 'Error updating product' : 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Product Name *</label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="sku" className="block text-sm font-medium mb-1">SKU *</label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Enter SKU"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
            
            <div>
              <label htmlFor="cost_price" className="block text-sm font-medium mb-1">Cost Price</label>
              <Input
                id="cost_price"
                type="number"
                value={formData.cost_price}
                onChange={(e) => handleInputChange('cost_price', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label htmlFor="selling_price" className="block text-sm font-medium mb-1">Selling Price</label>
              <Input
                id="selling_price"
                type="number"
                value={formData.selling_price}
                onChange={(e) => handleInputChange('selling_price', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium mb-1">Stock Quantity</label>
            <Input
              id="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minimum_stock" className="block text-sm font-medium mb-1">Minimum Stock</label>
              <Input
                id="minimum_stock"
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => handleInputChange('minimum_stock', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="maximum_stock" className="block text-sm font-medium mb-1">Maximum Stock</label>
              <Input
                id="maximum_stock"
                type="number"
                value={formData.maximum_stock}
                onChange={(e) => handleInputChange('maximum_stock', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">Location/Zone</label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. Warehouse A, Zone 1, Shelf B-3"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Product' : 'Save Product'}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductFormSimple;