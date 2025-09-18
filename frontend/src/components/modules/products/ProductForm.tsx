/**
 * ProductForm Component
 * Mobile-first responsive form for creating/editing products
 * Uses consistent design system with reusable components
 * Date: 2025-09-18
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import {
  DetailLayout,
  DetailHeader,
  DetailCard,
  DetailGrid,
} from '../../ui/data-detail';
import { Loader2, Save, X, Package, DollarSign, Hash, MapPin } from 'lucide-react';
import { useProductActions } from '../../../stores/productStore';
import { useProductStore } from '../../../stores/productStore';
import { useAuthStore } from '../../../stores/authStore';
import { CategoryDropdown } from '../../ui/crud-dropdown';
import type { ProductInsert, ProductUpdate } from '../../../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  category_id: string | null;
  cost_price: string;
  selling_price: string;
  stock_quantity: string;
  minimum_stock: string;
  maximum_stock: string;
  location: string;
  barcode: string;
  brand: string;
  unit_of_measure: string;
}

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'textarea';
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  icon,
  className,
}) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        {type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={icon ? 'pl-10' : ''}
            rows={3}
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={icon ? 'pl-10' : ''}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProductForm: React.FC<ProductFormProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const { user } = useAuthStore();
  const { createProduct, updateProduct } = useProductActions();
  const { selectedProduct } = useProductStore();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(selectedProduct);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    description: '',
    category: '',
    category_id: null,
    cost_price: '',
    selling_price: '',
    stock_quantity: '',
    minimum_stock: '',
    maximum_stock: '',
    location: '',
    barcode: '',
    brand: '',
    unit_of_measure: 'pcs',
  });

  // Populate form when selectedProduct changes (for editing)
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || '',
        sku: selectedProduct.sku || '',
        description: selectedProduct.description || '',
        category: selectedProduct.category || '',
        category_id: selectedProduct.category_id || null,
        cost_price: selectedProduct.cost_price?.toString() || '',
        selling_price: selectedProduct.selling_price?.toString() || '',
        stock_quantity: selectedProduct.stock_quantity?.toString() || '',
        minimum_stock: selectedProduct.minimum_stock?.toString() || '',
        maximum_stock: selectedProduct.maximum_stock?.toString() || '',
        location: selectedProduct.location || '',
        barcode: selectedProduct.barcode || '',
        brand: selectedProduct.brand || '',
        unit_of_measure: selectedProduct.unit_of_measure || 'pcs',
      });
    }
  }, [selectedProduct]);

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
      newErrors.selling_price = 'Valid selling price is required';
    }
    if (!formData.cost_price || parseFloat(formData.cost_price) <= 0) {
      newErrors.cost_price = 'Valid cost price is required';
    }
    if (parseFloat(formData.selling_price) < parseFloat(formData.cost_price)) {
      newErrors.selling_price = 'Selling price should be higher than cost price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.tenant_id) {
      console.error('No tenant ID found');
      return;
    }

    setLoading(true);
    
    try {
      if (isEditing && selectedProduct) {
        // Update existing product
        const productUpdate: ProductUpdate = {
          name: formData.name,
          sku: formData.sku,
          description: formData.description || null,
          category: formData.category || null,
          category_id: formData.category_id,
          cost_price: parseFloat(formData.cost_price),
          selling_price: parseFloat(formData.selling_price),
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          minimum_stock: parseInt(formData.minimum_stock) || 0,
          maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock) : null,
          location: formData.location || null,
          barcode: formData.barcode || null,
          brand: formData.brand || null,
          unit_of_measure: formData.unit_of_measure,
          is_active: true,
        };

        const success = await updateProduct(selectedProduct.id, productUpdate);
        if (success) {
          onSuccess?.();
        }
      } else {
        // Create new product
        const productInsert: ProductInsert = {
          company_id: user.tenant_id,
          name: formData.name,
          sku: formData.sku,
          description: formData.description || null,
          category: formData.category || null,
          category_id: formData.category_id,
          cost_price: parseFloat(formData.cost_price),
          selling_price: parseFloat(formData.selling_price),
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          minimum_stock: parseInt(formData.minimum_stock) || 0,
          maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock) : null,
          location: formData.location || null,
          barcode: formData.barcode || null,
          brand: formData.brand || null,
          unit_of_measure: formData.unit_of_measure,
          is_active: true,
        };

        const success = await createProduct(productInsert);
        if (success) {
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <DetailLayout className={className} maxWidth="lg">
      <DetailHeader
        title={isEditing ? 'Edit Product' : 'Add New Product'}
        subtitle={isEditing ? `Editing: ${selectedProduct?.name}` : 'Create a new product for your inventory'}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-form"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        }
      />

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <DetailCard
          title="Basic Information"
          icon={<Package className="w-5 h-5" />}
        >
          <DetailGrid columns={2}>
            <FormField
              label="Product Name"
              value={formData.name}
              onChange={(value) => updateField('name', value)}
              placeholder="Enter product name"
              required
              icon={<Package className="w-4 h-4" />}
            />
            <FormField
              label="SKU"
              value={formData.sku}
              onChange={(value) => updateField('sku', value)}
              placeholder="Enter SKU"
              required
              icon={<Hash className="w-4 h-4" />}
            />
            <FormField
              label="Barcode"
              value={formData.barcode}
              onChange={(value) => updateField('barcode', value)}
              placeholder="Enter barcode (optional)"
            />
            <FormField
              label="Brand"
              value={formData.brand}
              onChange={(value) => updateField('brand', value)}
              placeholder="Enter brand (optional)"
            />
          </DetailGrid>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <CategoryDropdown
                value={formData.category}
                onValueChange={(value) => updateField('category', value || '')}
                placeholder="Select category"
                className="w-full"
              />
            </div>
            <FormField
              label="Unit of Measure"
              value={formData.unit_of_measure}
              onChange={(value) => updateField('unit_of_measure', value)}
              placeholder="e.g., pcs, kg, liter"
            />
          </div>

          <FormField
            label="Description"
            value={formData.description}
            onChange={(value) => updateField('description', value)}
            placeholder="Enter product description (optional)"
            type="textarea"
            className="mt-4"
          />
        </DetailCard>

        {/* Pricing Information */}
        <DetailCard
          title="Pricing Information"
          icon={<DollarSign className="w-5 h-5" />}
        >
          <DetailGrid columns={2}>
            <FormField
              label="Cost Price"
              value={formData.cost_price}
              onChange={(value) => updateField('cost_price', value)}
              placeholder="0"
              type="number"
              required
              icon={<DollarSign className="w-4 h-4" />}
            />
            <FormField
              label="Selling Price"
              value={formData.selling_price}
              onChange={(value) => updateField('selling_price', value)}
              placeholder="0"
              type="number"
              required
              icon={<DollarSign className="w-4 h-4" />}
            />
          </DetailGrid>
          {errors.selling_price && (
            <p className="text-sm text-red-500 mt-2">{errors.selling_price}</p>
          )}
        </DetailCard>

        {/* Stock Information */}
        <DetailCard
          title="Stock Information"
          icon={<Package className="w-5 h-5" />}
        >
          <DetailGrid columns={3}>
            <FormField
              label="Initial Stock"
              value={formData.stock_quantity}
              onChange={(value) => updateField('stock_quantity', value)}
              placeholder="0"
              type="number"
            />
            <FormField
              label="Minimum Stock"
              value={formData.minimum_stock}
              onChange={(value) => updateField('minimum_stock', value)}
              placeholder="0"
              type="number"
            />
            <FormField
              label="Maximum Stock"
              value={formData.maximum_stock}
              onChange={(value) => updateField('maximum_stock', value)}
              placeholder="Optional"
              type="number"
            />
          </DetailGrid>
          
          <FormField
            label="Location"
            value={formData.location}
            onChange={(value) => updateField('location', value)}
            placeholder="e.g., Warehouse A, Shelf 1"
            icon={<MapPin className="w-4 h-4" />}
            className="mt-4"
          />
        </DetailCard>

        {/* Show validation errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </DetailLayout>
  );
};

export default ProductForm;