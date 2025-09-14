/**
 * StockMovementDetailPage Component
 * Detailed view of a specific stock movement with full context
 * Shows comprehensive movement information and related data
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
  Package,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  FileText,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { useStockMovementStore } from '../../stores/stockMovementStore';
import { useAuthStore } from '../../stores/authStore';
import type { StockMovement } from '../../stores/stockMovementStore';

// ============================================================================
// TYPES
// ============================================================================

interface StockMovementDetailPageProps {
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const StockMovementDetailPage: React.FC<StockMovementDetailPageProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [movement, setMovement] = useState<StockMovement | null>(null);

  // Store state
  const { movements, loadMovements } = useStockMovementStore();
  const { user } = useAuthStore();

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    const loadMovementDetail = async () => {
      await loadMovements();
      
      if (id) {
        const foundMovement = movements.find(m => m.id === id);
        if (foundMovement) {
          setMovement(foundMovement);
        }
      }
      
      setIsLoading(false);
    };

    loadMovementDetail();
  }, [id, loadMovements, movements]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleBack = () => {
    navigate('/inventory?tab=movements');
  };

  const handleViewProduct = () => {
    if (movement?.product_id) {
      navigate(`/products/${movement.product_id}`);
    }
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'out':
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      case 'adjustment':
        return <Activity className="w-6 h-6 text-blue-600" />;
      case 'transfer':
        return <Package className="w-6 h-6 text-purple-600" />;
      default:
        return <Activity className="w-6 h-6 text-gray-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge className="bg-green-100 text-green-800">Stock In</Badge>;
      case 'out':
        return <Badge className="bg-red-100 text-red-800">Stock Out</Badge>;
      case 'adjustment':
        return <Badge className="bg-blue-100 text-blue-800">Adjustment</Badge>;
      case 'transfer':
        return <Badge className="bg-purple-100 text-purple-800">Transfer</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'text-green-600';
      case 'out':
        return 'text-red-600';
      case 'adjustment':
        return 'text-blue-600';
      case 'transfer':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading movement details...</p>
        </div>
      </div>
    );
  }

  if (!movement) {
    return (
      <div className={`h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Movement Not Found</h2>
          <p className="text-gray-600 mb-4">The requested stock movement could not be found.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Movements
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
            <div className="flex items-center gap-3">
              {getMovementIcon(movement.type)}
              <div>
                <h1 className="text-3xl font-bold capitalize">{movement.type} Movement</h1>
                <p className="text-gray-600">Movement ID: {movement.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getMovementBadge(movement.type)}
            <Button variant="outline" onClick={handleViewProduct}>
              <Package className="w-4 h-4 mr-2" />
              View Product
            </Button>
          </div>
        </div>

        {/* Movement Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Movement Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Product</label>
                  <p className="text-lg font-semibold">{movement.product?.name || 'Unknown Product'}</p>
                  <p className="text-sm text-gray-600">SKU: {movement.product?.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Movement Type</label>
                  <div className="mt-1">{getMovementBadge(movement.type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Quantity</label>
                  <p className={`text-2xl font-bold ${getMovementColor(movement.type)}`}>
                    {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity}
                  </p>
                  <p className="text-sm text-gray-600">{movement.product?.unit_of_measure || 'units'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Balance After</label>
                  <p className="text-xl font-semibold text-blue-600">{movement.balance_after}</p>
                  <p className="text-sm text-gray-600">{movement.product?.unit_of_measure || 'units'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Movement Date</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(movement.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created By</label>
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {movement.created_by || user?.email || 'System'}
                  </p>
                </div>
                {movement.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {movement.location}
                    </p>
                  </div>
                )}
                {movement.reference_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reference Number</label>
                    <p className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {movement.reference_number}
                    </p>
                  </div>
                )}
              </div>
              
              {movement.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg">{movement.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary & Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Impact Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Stock Change</label>
                <p className={`text-3xl font-bold ${getMovementColor(movement.type)}`}>
                  {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Balance After</label>
                <p className="text-2xl font-semibold text-blue-600">{movement.balance_after}</p>
              </div>

              {movement.product?.cost_price && (
                <>
                  <hr />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unit Cost</label>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(movement.product.cost_price)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Value Impact</label>
                    <p className={`text-xl font-bold flex items-center gap-1 ${getMovementColor(movement.type)}`}>
                      <DollarSign className="w-5 h-5" />
                      {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}
                      {formatCurrency(movement.quantity * movement.product.cost_price)}
                    </p>
                  </div>
                </>
              )}

              <hr />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Movement Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <p className="text-xs text-gray-500">
                  This movement has been successfully processed and the stock balance has been updated.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {movement.product ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Name:</span>
                    <span className="font-medium">{movement.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{movement.product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="font-medium text-blue-600">{movement.product.current_stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{movement.product.unit_of_measure}</span>
                  </div>
                  {movement.product.cost_price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost Price:</span>
                      <span className="font-medium">{formatCurrency(movement.product.cost_price)}</span>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={handleViewProduct}
                  >
                    View Full Product Details
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Product information not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Movement Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Movement Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Movement Created</p>
                    <p className="text-sm text-gray-600">{formatDate(movement.created_at)}</p>
                    <p className="text-xs text-gray-500">Stock movement was initiated</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Stock Updated</p>
                    <p className="text-sm text-gray-600">{formatDate(movement.created_at)}</p>
                    <p className="text-xs text-gray-500">Inventory balance was updated</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-600">Current Status</p>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xs text-gray-500">Movement has been processed successfully</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Only Section */}
        {(user?.role === 'owner' || user?.role === 'dev') && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Admin Information</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Movement ID:</span>
                  <span className="font-mono text-blue-800">{movement.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Product ID:</span>
                  <span className="font-mono text-blue-800">{movement.product_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Company ID:</span>
                  <span className="font-mono text-blue-800">{movement.company_id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockMovementDetailPage;