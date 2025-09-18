/**
 * ProductDetailPage Component
 * Detailed view of a single product with stock movement history
 * Mobile-first responsive design using reusable detail components
 * Date: 2025-09-18
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  DetailLayout,
  DetailHeader,
  DetailCard,
  DetailField,
  DetailGrid,
  MetricCard,
} from '../../components/ui/data-detail';
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
  DollarSign,
  Tag,
  Building,
  Hash,
} from 'lucide-react';
import { useProductStore, useProductActions } from '../../stores/productStore';
import { useStockMovementStore, useStockMovementActions, type StockMovement } from '../../stores/stockMovementStore';
import { useAuthStore } from '../../stores/authStore';

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
  const { getProductMovements } = useStockMovementActions();
  const { user } = useAuthStore();

  // Find current product
  const product = selectedProduct || products.find(p => p.id === id);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    const loadProductDetail = async () => {
      setIsLoading(true);
      
      // Only load movements if we don't have any yet or very few
      if (movements.length === 0) {
        await loadMovements();
      } else {
      }
      
      setIsLoading(false);
    };

    loadProductDetail();
  }, [id]); // Only depend on id to prevent infinite loop

  // Separate effect to get filtered movements when movements or product changes
  useEffect(() => {
    if (product) {
      const filtered = getProductMovements(product.id);
      setProductMovements(filtered);
    }
  }, [product?.id, movements.length, getProductMovements]); // Use movements.length instead of movements array

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleBack = () => {
    navigate('/products');
  };

  const handleEdit = () => {
    if (product) {
      selectProduct(product);
      navigate('/products?edit=true');
    }
  };

  const handleStockAdjustment = () => {
    // Navigate to stock adjustment form
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
    <DetailLayout className={className}>
      <DetailHeader
        title={product.name}
        subtitle={`SKU: ${product.sku}`}
        badge={getStockStatusBadge()}
        backAction={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
        actions={
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        }
      />

      {/* Key Metrics */}
      <DetailGrid columns={4} className="mb-6">
        <MetricCard
          label="Current Stock"
          value={product.stock_quantity}
          subValue={product.unit_of_measure}
          icon={<Package className="w-5 h-5" />}
          variant={getStockStatus() === 'normal' ? 'success' : getStockStatus() === 'low-stock' ? 'warning' : 'danger'}
        />
        <MetricCard
          label="Selling Price"
          value={formatCurrency(product.selling_price)}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          label="Cost Price"
          value={formatCurrency(product.cost_price)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          label="Total Value"
          value={formatCurrency(product.stock_quantity * product.cost_price)}
          subValue="Stock Value"
          icon={<Activity className="w-5 h-5" />}
        />
      </DetailGrid>

      {/* Product Information Grid */}
      <DetailGrid columns={3} className="mb-6">
        {/* Basic Information */}
        <DetailCard
          title="Product Information"
          icon={<Package className="w-5 h-5" />}
          className="lg:col-span-2"
        >
          <DetailGrid columns={2}>
            <DetailField
              label="Product Name"
              value={product.name}
              variant="highlight"
            />
            <DetailField
              label="SKU"
              value={product.sku}
              icon={<Hash className="w-4 h-4" />}
            />
            {product.barcode && (
              <DetailField
                label="Barcode"
                value={product.barcode}
                icon={<Barcode className="w-4 h-4" />}
              />
            )}
            <DetailField
              label="Category"
              value={product.category || 'No category'}
              icon={<Tag className="w-4 h-4" />}
            />
            <DetailField
              label="Brand"
              value={product.brand || 'No brand'}
              icon={<Building className="w-4 h-4" />}
            />
            <DetailField
              label="Unit of Measure"
              value={product.unit_of_measure}
            />
            {product.location && (
              <DetailField
                label="Location"
                value={product.location}
                icon={<MapPin className="w-4 h-4" />}
              />
            )}
            <DetailField
              label="Status"
              value={
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              }
            />
          </DetailGrid>
          
          {product.description && (
            <div className="mt-6 pt-6 border-t">
              <DetailField
                label="Description"
                value={product.description}
              />
            </div>
          )}
        </DetailCard>

        {/* Stock & Pricing Summary */}
        <DetailCard
          title="Stock & Pricing"
          icon={<Activity className="w-5 h-5" />}
          actions={
            (user?.role === 'owner' || user?.role === 'dev') && (
              <Button 
                size="sm"
                variant="outline"
                onClick={handleStockAdjustment}
              >
                <Activity className="w-4 h-4 mr-2" />
                Adjust Stock
              </Button>
            )
          }
        >
          <div className="space-y-6">
            <DetailField
              label="Current Stock"
              value={`${product.stock_quantity} ${product.unit_of_measure}`}
              variant="highlight"
            />
            
            <DetailGrid columns={2}>
              <DetailField
                label="Min Stock"
                value={product.minimum_stock}
                variant="highlight"
              />
              {product.maximum_stock && (
                <DetailField
                  label="Max Stock"
                  value={product.maximum_stock}
                  variant="highlight"
                />
              )}
            </DetailGrid>

            <div className="pt-4 border-t space-y-4">
              <DetailField
                label="Cost Price"
                value={formatCurrency(product.cost_price)}
                icon={<DollarSign className="w-4 h-4" />}
              />
              
              <DetailField
                label="Selling Price"
                value={formatCurrency(product.selling_price)}
                icon={<DollarSign className="w-4 h-4" />}
                variant="currency"
              />

              <DetailField
                label="Total Stock Value"
                value={formatCurrency(product.stock_quantity * product.cost_price)}
                variant="highlight"
              />
            </div>
          </div>
        </DetailCard>
      </DetailGrid>

      {/* Stock Movement History */}
      <DetailCard
        title="Stock Movement History"
        icon={<Activity className="w-5 h-5" />}
        badge={<Badge variant="secondary">{productMovements.length}</Badge>}
      >
        {productMovements.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stock movements found for this product.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {productMovements.slice(0, 10).map((movement) => (
              <div key={movement.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                <div className="flex items-center gap-3">
                  {getMovementIcon(movement.movement_type)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium capitalize">{movement.movement_type} Movement</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(movement.created_at)}
                    </p>
                    {movement.notes && (
                      <p className="text-sm text-muted-foreground mt-1 break-words">{movement.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right sm:text-right flex-shrink-0">
                  <p className={`text-lg font-semibold ${
                    movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {movement.reference_type && `Ref: ${movement.reference_type}`}
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
      </DetailCard>
    </DetailLayout>
  );
};

export default ProductDetailPage;