/**
 * ProductForm Component
 * Form for creating and editing products with validation
 * Uses react-hook-form with zod validation and integrates with productStore
 * Date: 2025-09-14
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/button';
import {
  Save,
  X,
  Package,
  DollarSign,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useProductStore, useProductActions } from '../../../stores/productStore';
import { useAuthStore } from '../../../stores/authStore';
import type { Product, ProductInsert, ProductUpdate } from '../../../types/database';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters'),
  
  sku: z
    .string()
    .min(1, 'SKU is required')
    .min(2, 'SKU must be at least 2 characters'),
  
  barcode: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{12,13}$/.test(val), {
      message: 'Barcode must be 12 or 13 digits',
    }),
  
  description: z
    .string()
    .optional(),
  
  category: z
    .string()
    .optional(),
  
  brand: z
    .string()
    .optional(),
    
  unit_of_measure: z
    .string()
    .min(1, 'Unit of measure is required'),
  
  selling_price: z
    .number()
    .min(0, 'Selling price cannot be negative')
    .max(999999999, 'Selling price is too large'),
  
  cost_price: z
    .number()
    .min(0, 'Cost price cannot be negative')
    .max(999999999, 'Cost price is too large')
    .optional(),
  
  stock_quantity: z
    .number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  
  minimum_stock: z
    .number()
    .int('Minimum stock must be a whole number')
    .min(0, 'Minimum stock cannot be negative'),
    
  maximum_stock: z
    .number()
    .int('Maximum stock must be a whole number')
    .min(0, 'Maximum stock cannot be negative')
    .optional(),
  
  location: z
    .string()
    .optional(),
  
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

// ============================================================================
// TYPES
// ============================================================================

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (product: Product) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COMMON_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverage',
  'Health & Beauty',
  'Home & Garden',
  'Sports & Outdoors',
  'Automotive',
  'Books',
  'Toys & Games',
  'Office Supplies',
];

const COMMON_UNITS = [
  'pcs',
  'kg',
  'g',
  'liter',
  'ml',
  'meter',
  'cm',
  'box',
  'pack',
  'set',
];

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  // Store state
  const {
    selectedProduct,
    isEditing,
    saving,
    error,
  } = useProductStore();

  const { user } = useAuthStore();

  const {
    createProduct,
    updateProduct,
    hideForm,
    clearError,
  } = useProductActions();

  // Form setup
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      description: '',
      category: '',
      brand: '',
      unit_of_measure: 'pcs',
      selling_price: 0,
      cost_price: 0,
      stock_quantity: 0,
      minimum_stock: 0,
      maximum_stock: 0,
      location: '',
      is_active: true,
    },
  });

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    if (isEditing && selectedProduct) {
      // Populate form with selected product data
      form.reset({
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        barcode: selectedProduct.barcode || '',
        description: selectedProduct.description || '',
        category: selectedProduct.category || '',
        brand: selectedProduct.brand || '',
        unit_of_measure: selectedProduct.unit_of_measure,
        selling_price: selectedProduct.selling_price,
        cost_price: selectedProduct.cost_price || 0,
        stock_quantity: selectedProduct.stock_quantity,
        minimum_stock: selectedProduct.minimum_stock,
        maximum_stock: selectedProduct.maximum_stock || 0,
        location: selectedProduct.location || '',
        is_active: selectedProduct.is_active,
      });
    } else {
      // Reset form for new product
      form.reset({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        category: '',
        brand: '',
        unit_of_measure: 'pcs',
        selling_price: 0,
        cost_price: 0,
        stock_quantity: 0,
        minimum_stock: 0,
        maximum_stock: 0,
        location: '',
        is_active: true,
      });
    }
  }, [isEditing, selectedProduct, form]);

  useEffect(() => {
    if (!open) {
      clearError();
      form.clearErrors();
    }
  }, [open, form, clearError]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleClose = () => {
    form.reset();
    hideForm();
    onClose();
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      let success = false;
      let result: Product | null = null;

      if (isEditing && selectedProduct) {
        // Update existing product
        const updateData: ProductUpdate = { ...data };
        success = await updateProduct(selectedProduct.id, updateData);
        if (success) {
          result = { ...selectedProduct, ...updateData } as Product;
        }
      } else {
        // Create new product
        const insertData: ProductInsert = {
          ...data,
          company_id: user?.tenant_id || '', // Use tenant_id from auth store
        };
        success = await createProduct(insertData);
        if (success) {
          result = { ...insertData, id: 'temp-id' } as Product; // Real ID would come from database
        }
      }

      if (success && result) {
        onSuccess?.(result);
        handleClose();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const generateSKU = () => {
    const name = form.getValues('name');
    const category = form.getValues('category');
    
    if (!name) return;

    const namePrefix = name.substring(0, 3).toUpperCase();
    const categoryPrefix = category ? category.substring(0, 2).toUpperCase() : 'GN';
    const timestamp = Date.now().toString().slice(-4);
    
    const sku = `${namePrefix}-${categoryPrefix}-${timestamp}`;
    form.setValue('sku', sku);
  };

  const calculateMargin = () => {
    const sellingPrice = form.watch('selling_price');
    const costPrice = form.watch('cost_price');
    
    if (!sellingPrice || !costPrice || costPrice === 0) return null;
    
    const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
    return margin.toFixed(1);
  };

  // Don't render if not open
  if (!open) return null;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <h2 className="text-2xl font-bold">
                {isEditing ? 'Edit Product' : 'Create New Product'}
              </h2>
            </div>
            <Button variant="ghost" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            {isEditing
              ? 'Update the product information below.'
              : 'Fill in the details to create a new product.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name *
                </label>
                <input
                  {...form.register('name')}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter product name"
                />
                {form.formState.errors.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  SKU *
                </label>
                <div className="flex gap-2">
                  <input
                    {...form.register('sku')}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Product SKU"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSKU}
                    disabled={!form.watch('name')}
                  >
                    Generate
                  </Button>
                </div>
                {form.formState.errors.sku && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.sku.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Barcode
                </label>
                <input
                  {...form.register('barcode')}
                  className="w-full p-2 border rounded-md"
                  placeholder="12 or 13 digit barcode"
                />
                {form.formState.errors.barcode && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.barcode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  {...form.register('category')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select category</option>
                  {COMMON_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Brand
                </label>
                <input
                  {...form.register('brand')}
                  className="w-full p-2 border rounded-md"
                  placeholder="Product brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit of Measure *
                </label>
                <select
                  {...form.register('unit_of_measure')}
                  className="w-full p-2 border rounded-md"
                >
                  {COMMON_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {form.formState.errors.unit_of_measure && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.unit_of_measure.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                {...form.register('description')}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Product description"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Pricing & Cost</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Selling Price *
                </label>
                <input
                  {...form.register('selling_price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="0.00"
                />
                {form.formState.errors.selling_price && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.selling_price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cost Price
                </label>
                <input
                  {...form.register('cost_price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="0.00"
                />
                {form.formState.errors.cost_price && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.cost_price.message}
                  </p>
                )}
              </div>
            </div>

            {calculateMargin() && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profit Margin:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {calculateMargin()}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Inventory</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Stock *
                </label>
                <input
                  {...form.register('stock_quantity', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="0"
                />
                {form.formState.errors.stock_quantity && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.stock_quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Stock
                </label>
                <input
                  {...form.register('minimum_stock', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="0"
                />
                {form.formState.errors.minimum_stock && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.minimum_stock.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Maximum Stock
                </label>
                <input
                  {...form.register('maximum_stock', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="0"
                />
                {form.formState.errors.maximum_stock && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.maximum_stock.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                {...form.register('location')}
                className="w-full p-2 border rounded-md"
                placeholder="Warehouse location"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                {...form.register('is_active')}
                type="checkbox"
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">
                Active Product (available for sale)
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;