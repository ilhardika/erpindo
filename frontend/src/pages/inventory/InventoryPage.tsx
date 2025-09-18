/**
 * InventoryPage Component
 * Main inventory management page with tabs for different inventory features
 * Integrates products, stock movements, and stock opname
 * Date: 2025-09-14
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Package,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  Warehouse,
  Activity,
} from 'lucide-react';
import { ProductList } from '../../components/modules/products/ProductList';
import { ProductForm } from '../../components/modules/products/ProductForm';
import { StockMovementHistory } from '../../components/modules/inventory/StockMovementHistory';
import { StockOpnameList } from '../../components/modules/inventory/StockOpnameList';
import { useProductStore, useProductActions } from '../../stores/productStore';
import { useStockMovementStore } from '../../stores/stockMovementStore';
import { useStockOpnameStore } from '../../stores/stockOpnameStore';
import { useAuthStore } from '../../stores/authStore';
import type { Product } from '../../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface InventoryPageProps {
  className?: string;
}

interface Opname {
  id: string;
  status: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const InventoryPage: React.FC<InventoryPageProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const navigate = useNavigate();

  // Store state
  const { products } = useProductStore();
  const { movements } = useStockMovementStore();
  const { opnames } = useStockOpnameStore();
  const { user } = useAuthStore();
  const { selectProduct } = useProductActions();

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    // Load initial data
    // Each component will handle its own loading
  }, []);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleCreateProduct = () => {
    selectProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    selectProduct(product);
    setShowProductForm(true);
  };

  const handleViewProduct = (product: Product) => {
    // Navigate to product detail page
    navigate(`/products/${product.id}`);
  };

  const handleProductFormClose = () => {
    setShowProductForm(false);
    selectProduct(null);
  };

  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    selectProduct(null);
  };

  const handleCreateOpname = () => {
    // setShowOpnameForm(true);
  };

  const handleEditOpname = (opnameId: string) => {
    // Navigate to opname detail page
    navigate(`/inventory/opname/${opnameId}`);
  };

  const handleViewOpname = (opnameId: string) => {
    // Navigate to opname detail page in view mode
    navigate(`/inventory/opname/${opnameId}`);
  };

  const handleViewMovement = (movementId: string) => {
    // Navigate to movement detail page  
    navigate(`/inventory/movements/${movementId}`);
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const lowStockProducts = products.filter((product: Product) => 
    product.stock_quantity <= (product.minimum_stock || 0)
  );

  const totalProducts = products.length;
  const activeProducts = products.filter((p: Product) => p.is_active).length;
  const totalMovements = movements.length;
  const activeOpnames = opnames.filter((o: Opname) => o.status === 'in_progress').length;

  // ========================================================================
  // RENDER
  // ========================================================================

  if (showProductForm) {
    return (
      <div className={`h-full ${className || ''}`}>
        <div className="p-6">
          <ProductForm
            onSuccess={handleProductFormSuccess}
            onCancel={handleProductFormClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className || ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Warehouse className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Inventory Management</h1>
          </div>
          <p className="text-gray-600">
            Manage products, track stock movements, and perform physical counts
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                  <p className="text-xs text-gray-500">{activeProducts} active</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
                  <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
                  <p className="text-xs text-gray-500">Need attention</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Movements</p>
                  <p className="text-2xl font-bold">{totalMovements}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Counts</p>
                  <p className="text-2xl font-bold text-orange-600">{activeOpnames}</p>
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
                <ClipboardList className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-gray-600 ml-2">({product.sku})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {product.stock_quantity} / {product.minimum_stock} min
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                      >
                        Adjust Stock
                      </Button>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-gray-600">
                    +{lowStockProducts.length - 5} more products need attention
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
              <Badge variant="secondary">{totalProducts}</Badge>
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Stock Movements
              <Badge variant="secondary">{totalMovements}</Badge>
            </TabsTrigger>
            <TabsTrigger value="opname" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Stock Count
              <Badge variant="secondary">{opnames.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <ProductList 
              onCreateProduct={handleCreateProduct}
              onEditProduct={handleEditProduct}
              onViewProduct={handleViewProduct}
            />
          </TabsContent>

          <TabsContent value="movements" className="mt-6">
            <StockMovementHistory 
              onViewMovement={handleViewMovement}
            />
          </TabsContent>

          <TabsContent value="opname" className="mt-6">
            <StockOpnameList 
              onCreateOpname={handleCreateOpname}
              onEditOpname={handleEditOpname}
              onViewOpname={handleViewOpname}
            />
          </TabsContent>
        </Tabs>

        {/* Role-Based Information */}
        {user?.role === 'owner' && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Owner Access</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                You have full access to inventory reports, stock adjustments, and all inventory management features.
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role === 'employee' && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Staff Access</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You can manage products, view stock movements, and perform stock counts as assigned.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;