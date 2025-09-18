/**
 * ProductsPage Component - Fixed Version
 * Main page for product management with safe store integration
 * Date: 2025-09-14
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductList } from '../../components/modules/products/ProductList';
import { ProductForm } from '../../components/modules/products/ProductForm';
import { useProductActions } from '../../stores/productStore';
import { useProductStore } from '../../stores/productStore';
import type { Product } from '../../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface ProductsPageProps {
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductsPage: React.FC<ProductsPageProps> = ({ className }) => {
  const [showForm, setShowForm] = useState(false);
  const { selectProduct } = useProductActions();
  const { selectedProduct } = useProductStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for edit parameter on mount
  useEffect(() => {
    const isEdit = searchParams.get('edit') === 'true';
    if (isEdit) {
      setShowForm(true);
      // Remove the edit parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, selectedProduct]);

  const handleCreateProduct = () => {
    selectProduct(null); // Clear any selected product
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    selectProduct(null); // Clear selection
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    selectProduct(null); // Clear selection
    // ProductList will automatically refresh via store reactivity
  };

  const handleEditProduct = (product: Product) => {
    selectProduct(product); // Set product for editing
    setShowForm(true);
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  if (showForm) {
    return (
      <div className={`h-full ${className || ''}`}>
        <div className="p-6">
          <ProductForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </div>
      </div>
    );
  }

  // Main ProductList view - let ProductList handle its own header
  return (
    <div className={`h-full ${className || ''}`}>
      <div className="p-6">
        <ProductList 
          onCreateProduct={handleCreateProduct}
          onEditProduct={handleEditProduct}
          onViewProduct={handleViewProduct}
        />
      </div>
    </div>
  );
};

// Default export untuk App.tsx
export default ProductsPage;