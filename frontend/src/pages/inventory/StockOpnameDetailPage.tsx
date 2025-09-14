/**
 * StockOpnameDetailPage Component
 * Detailed view of a stock opname with all items and variance analysis
 * Shows comprehensive opname information and allows item management
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
  ClipboardList,
  Package,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  StopCircle,
  X,
} from 'lucide-react';
import { useStockOpnameStore } from '../../stores/stockOpnameStore';
import { useAuthStore } from '../../stores/authStore';
import type { StockOpname, StockOpnameItem } from '../../stores/stockOpnameStore';

// ============================================================================
// TYPES
// ============================================================================

interface StockOpnameDetailPageProps {
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const StockOpnameDetailPage: React.FC<StockOpnameDetailPageProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [opnameDetail, setOpnameDetail] = useState<StockOpname | null>(null);
  const [opnameItems, setOpnameItems] = useState<StockOpnameItem[]>([]);

  // Store state
  const { 
    opnames, 
    loadOpnames, 
    startOpname, 
    completeOpname, 
    cancelOpname
  } = useStockOpnameStore();
  const { user } = useAuthStore();

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    const loadOpnameDetail = async () => {
      await loadOpnames();
      
      if (id) {
        const opname = opnames.find(o => o.id === id);
        if (opname) {
          setOpnameDetail(opname);
          // Load opname items (this would be from the store in real implementation)
          // For now, we'll simulate some items
          setOpnameItems([]);
        }
      }
      
      setIsLoading(false);
    };

    loadOpnameDetail();
  }, [id, loadOpnames, opnames]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleBack = () => {
    navigate('/inventory?tab=opname');
  };

  const handleEdit = () => {
    // Navigate to edit mode
    console.log('Edit opname');
  };

  const handleStart = async () => {
    if (opnameDetail && opnameDetail.status === 'draft') {
      await startOpname(opnameDetail.id);
      // Refresh data
      await loadOpnames();
      const updated = opnames.find(o => o.id === opnameDetail.id);
      if (updated) setOpnameDetail(updated);
    }
  };

  const handleComplete = async () => {
    if (opnameDetail && opnameDetail.status === 'in_progress') {
      await completeOpname(opnameDetail.id);
      // Refresh data
      await loadOpnames();
      const updated = opnames.find(o => o.id === opnameDetail.id);
      if (updated) setOpnameDetail(updated);
    }
  };

  const handleCancel = async () => {
    if (opnameDetail && opnameDetail.status !== 'completed') {
      await cancelOpname(opnameDetail.id);
      // Refresh data
      await loadOpnames();
      const updated = opnames.find(o => o.id === opnameDetail.id);
      if (updated) setOpnameDetail(updated);
    }
  };

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Edit className="w-3 h-3" />
          Draft
        </Badge>;
      case 'in_progress':
        return <Badge variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-800">
          <PlayCircle className="w-3 h-3" />
          In Progress
        </Badge>;
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Completed
        </Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <X className="w-3 h-3" />
          Cancelled
        </Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (variance < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <CheckCircle className="w-4 h-4 text-gray-600" />;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canStart = opnameDetail?.status === 'draft';
  const canComplete = opnameDetail?.status === 'in_progress';
  const canCancel = opnameDetail?.status && ['draft', 'in_progress'].includes(opnameDetail.status);
  const canEdit = opnameDetail?.status === 'draft';

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading stock opname details...</p>
        </div>
      </div>
    );
  }

  if (!opnameDetail) {
    return (
      <div className={`h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Stock Opname Not Found</h2>
          <p className="text-gray-600 mb-4">The requested stock opname could not be found.</p>
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
              <h1 className="text-3xl font-bold">Stock Opname #{opnameDetail.opname_number}</h1>
              <p className="text-gray-600">{opnameDetail.description || 'Physical stock count'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(opnameDetail.status)}
            
            {/* Action Buttons */}
            {canStart && (
              <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Count
              </Button>
            )}
            
            {canComplete && (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
            
            {canEdit && (
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            
            {canCancel && (
              <Button variant="destructive" onClick={handleCancel}>
                <StopCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Opname Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Opname Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Opname Number</label>
                  <p className="text-lg font-semibold">{opnameDetail.opname_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(opnameDetail.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created Date</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(opnameDetail.created_at)}
                  </p>
                </div>
                {opnameDetail.completed_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Completed Date</label>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {formatDate(opnameDetail.completed_at)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Created By</label>
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user?.email || 'System'}
                  </p>
                </div>
              </div>
              
              {opnameDetail.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-800 mt-1">{opnameDetail.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Total Items</label>
                <p className="text-3xl font-bold text-blue-600">{opnameItems.length}</p>
              </div>
              
                <div>
                  <label className="text-sm font-medium text-gray-600">Items Counted</label>
                  <p className="text-2xl font-semibold text-green-600">
                    {opnameItems.filter(item => item.physical_stock !== null && item.physical_stock !== undefined).length}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Remaining</label>
                  <p className="text-2xl font-semibold text-orange-600">
                    {opnameItems.filter(item => item.physical_stock === null || item.physical_stock === undefined).length}
                  </p>
                </div>              <hr />

              <div>
                <label className="text-sm font-medium text-gray-600">Total Variance</label>
                <p className="text-lg font-semibold text-red-600">
                  {opnameItems.reduce((sum, item) => sum + (item.variance || 0), 0)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Progress</label>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${opnameItems.length > 0 
                          ? (opnameItems.filter(item => item.physical_stock !== null && item.physical_stock !== undefined).length / opnameItems.length) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {opnameItems.length > 0 
                      ? Math.round((opnameItems.filter(item => item.physical_stock !== null && item.physical_stock !== undefined).length / opnameItems.length) * 100)
                      : 0}% Complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opname Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Opname Items
              <Badge variant="secondary">{opnameItems.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {opnameItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No items found for this stock opname.</p>
                {opnameDetail.status === 'draft' && (
                  <Button className="mt-4" onClick={handleEdit}>
                    <Package className="w-4 h-4 mr-2" />
                    Add Items
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 py-2 px-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-600">
                  <div className="col-span-3">Product</div>
                  <div className="col-span-2">SKU</div>
                  <div className="col-span-2">System Count</div>
                  <div className="col-span-2">Physical Count</div>
                  <div className="col-span-2">Variance</div>
                  <div className="col-span-1">Status</div>
                </div>
                
                {opnameItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="col-span-3">
                      <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-600">Unit: {item.product?.unit_of_measure}</p>
                    </div>
                    <div className="col-span-2">
                      <p>{item.product?.sku}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-lg font-semibold">{item.system_stock}</p>
                    </div>
                    <div className="col-span-2">
                      {item.physical_stock !== null && item.physical_stock !== undefined ? (
                        <p className="text-lg font-semibold text-blue-600">{item.physical_stock}</p>
                      ) : (
                        <p className="text-gray-400">Not counted</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      {item.variance !== null ? (
                        <p className={`text-lg font-semibold flex items-center gap-1 ${getVarianceColor(item.variance)}`}>
                          {getVarianceIcon(item.variance)}
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </p>
                      ) : (
                        <p className="text-gray-400">-</p>
                      )}
                    </div>
                    <div className="col-span-1">
                      {item.physical_stock !== null && item.physical_stock !== undefined ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StockOpnameDetailPage;