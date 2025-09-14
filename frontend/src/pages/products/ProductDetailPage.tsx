/**
 * ProductDetailPage Component
 * Detailed view of a single product with stock movement history
 * Shows comprehensive product information and inventory tracking
 * Date: 2025-09-14
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Package,
  Barcode,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  User,
  DollarSign,
} from 'lucide-react';
import { useProductStore, useProductActions } from '../../stores/productStore';
import { useStockMovementStore } from '../../stores/stockMovementStore';
import { useAuthStore } from '../../stores/authStore';
import type { Product, StockMovement } from '../../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface ProductDetailPageProps {
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [productMovements, setProductMovements] = useState<StockMovement[]>([]);

  // Store state
  const { products, selectedProduct } = useProductStore();
  const { selectProduct } = useProductActions();
  const { movements, loadMovements } = useStockMovementStore();
  const { user } = useAuthStore();

  // Find current product
  const product = selectedProduct || products.find(p => p.id === id);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    const loadProductDetail = async () => {
      if (id && !product) {
        // Load product if not in store
        console.log('Loading product:', id);
      }
      
      if (product) {
        // Load stock movements for this product
        await loadMovements({
          product_id: product.id,
          limit: 50
        });
        
        // Filter movements for this product
        const filtered = movements.filter(m => m.product_id === product.id);
        setProductMovements(filtered);
      }
      
      setIsLoading(false);
    };

    loadProductDetail();
  }, [id, product, loadMovements, movements]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleBack = () => {
    navigate('/inventory');
  };

  const handleEdit = () => {
    if (product) {
      selectProduct(product);
      navigate('/inventory?edit=true');
    }
  };

  const handleStockAdjustment = () => {
    // Navigate to stock adjustment form
    console.log('Open stock adjustment form');
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const getStockStatus = () => {
    if (!product) return 'unknown';
    
    if (product.stock_quantity <= 0) return 'out-of-stock';
    if (product.stock_quantity <= product.minimum_stock) return 'low-stock';
    if (product.maximum_stock && product.stock_quantity >= product.maximum_stock) return 'overstock';
    return 'normal';
  };

  const getStockStatusBadge = () => {
    const status = getStockStatus();
    
    switch (status) {
      case 'out-of-stock':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Out of Stock
        </Badge>;
      case 'low-stock':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          Low Stock
        </Badge>;
      case 'overstock':
        return <Badge variant="default" className="flex items-center gap-1 bg-orange-100 text-orange-800">
          <TrendingUp className="w-3 h-3" />
          Overstock
        </Badge>;
      case 'normal':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Normal
        </Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'adjustment':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'transfer':
        return <Package className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The requested product could not be found.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className || ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-gray-600">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStockStatusBadge()}
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          </div>
        </div>

        {/* Product Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">SKU</label>
                  <p className="text-lg">{product.sku}</p>
                </div>
                {product.barcode && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Barcode</label>
                    <p className="flex items-center gap-2">
                      <Barcode className="w-4 h-4" />
                      {product.barcode}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p>{product.category || 'No category'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Brand</label>
                  <p>{product.brand || 'No brand'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Unit</label>
                  <p>{product.unit_of_measure}</p>
                </div>
                {product.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {product.location}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-800 mt-1">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock & Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Stock & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Current Stock</label>
                <p className="text-3xl font-bold text-blue-600">{product.stock_quantity}</p>
                <p className="text-sm text-gray-500">{product.unit_of_measure}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Min Stock</label>
                  <p className="text-lg font-semibold text-red-600">{product.minimum_stock}</p>
                </div>
                {product.maximum_stock && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Max Stock</label>
                    <p className="text-lg font-semibold text-green-600">{product.maximum_stock}</p>
                  </div>
                )}
              </div>

              <hr />

              <div>
                <label className="text-sm font-medium text-gray-600">Cost Price</label>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(product.cost_price)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Selling Price</label>
                <p className="text-xl font-bold text-green-600 flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {formatCurrency(product.selling_price)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Total Value</label>
                <p className="text-lg font-semibold">
                  {formatCurrency(product.stock_quantity * product.cost_price)}
                </p>
              </div>

              {(user?.role === 'owner' || user?.role === 'dev') && (
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={handleStockAdjustment}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Adjust Stock
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stock Movement History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Stock Movement History
              <Badge variant="secondary">{productMovements.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productMovements.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No stock movements found for this product.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productMovements.slice(0, 10).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <p className="font-medium capitalize">{movement.type} Movement</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(movement.created_at)}
                        </p>
                        {movement.notes && (
                          <p className="text-sm text-gray-500 mt-1">{movement.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: {movement.balance_after}
                      </p>
                    </div>
                  </div>
                ))}
                
                {productMovements.length > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">
                      View All Movements ({productMovements.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetailPage;