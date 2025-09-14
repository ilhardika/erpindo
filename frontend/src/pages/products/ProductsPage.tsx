/**
 * ProductsPage Component - Fixed Version
 * Main page for product management with safe store integration
 * Date: 2025-09-14
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductList } from '../../components/modules/products/ProductList';
import { ProductFormSimple } from '../../components/modules/products/ProductFormSimple';
import { useProductActions } from '../../stores/productStore';
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
  const navigate = useNavigate();

  const handleCreateProduct = () => {
    selectProduct(null); // Clear any selected product
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    selectProduct(null); // Clear selection
  };

  const handleFormSuccess = () => {
    console.log('Product created, closing form and refreshing list');
    setShowForm(false);
    selectProduct(null); // Clear selection
    // ProductList will automatically refresh via store reactivity
  };

  const handleEditProduct = (product: Product) => {
    console.log('ProductsPage: handleEditProduct called with:', product);
    selectProduct(product); // Set product for editing
    console.log('ProductsPage: selectProduct called, showing form');
    setShowForm(true);
  };

  const handleViewProduct = (product: Product) => {
    console.log('ProductsPage: handleViewProduct called with:', product);
    navigate(`/products/${product.id}`);
  };

  if (showForm) {
    return (
      <div className={`h-full ${className || ''}`}>
        <div className="p-6">
          <ProductFormSimple
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