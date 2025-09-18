/**
 * CustomerDetailPage Component
 * Detailed view of a single customer with purchase history and analytics
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
  Users,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  Building,
  Hash,
  Star,
  ShoppingCart,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Package,
} from 'lucide-react';
import { useCustomerStore } from '../../stores/customerStore';

// ============================================================================
// TYPES
// ============================================================================

interface CustomerDetailPageProps {
  className?: string;
}

interface PurchaseHistory {
  id: string;
  order_number: string;
  date: string;
  total_amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  items_count: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({
  className = '',
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { customers, loading, error, loadCustomers } = useCustomerStore();

  // Local state
  const [customer, setCustomer] = useState<any>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load customer data
  useEffect(() => {
    if (!customers.length) {
      loadCustomers();
    }
  }, [customers.length, loadCustomers]);

  // Find customer by ID
  useEffect(() => {
    if (id && customers.length > 0) {
      const foundCustomer = customers.find(p => p.id === id);
      setCustomer(foundCustomer || null);
    }
  }, [id, customers]);

  // Load purchase history (mock data for now)
  useEffect(() => {
    if (customer) {
      setHistoryLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPurchaseHistory([
          {
            id: '1',
            order_number: 'ORD-2024-001',
            date: '2024-01-15',
            total_amount: 1250000,
            status: 'completed',
            items_count: 5,
          },
          {
            id: '2',
            order_number: 'ORD-2024-002',
            date: '2024-01-20',
            total_amount: 750000,
            status: 'completed',
            items_count: 3,
          },
        ]);
        setHistoryLoading(false);
      }, 1000);
    }
  }, [customer]);

  // Event handlers
  const handleEditCustomer = () => {
    navigate(`/customers?edit=${customer.id}`);
  };

  const handleBack = () => {
    navigate('/customers');
  };

  // Loading state
  if (loading) {
    return (
      <DetailLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading customer...</p>
          </div>
        </div>
      </DetailLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DetailLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Error loading customer: {error}</p>
            <Button
              onClick={() => loadCustomers()}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DetailLayout>
    );
  }

  // Not found state
  if (!customer) {
    return (
      <DetailLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Customer not found</p>
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Back to Customers
            </Button>
          </div>
        </div>
      </DetailLayout>
    );
  }

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-yellow-100 text-yellow-800';
      case 'regular':
        return 'bg-blue-100 text-blue-800';
      case 'wholesale':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPurchaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate customer metrics
  const totalPurchases = purchaseHistory.length;
  const totalSpent = purchaseHistory.reduce((sum, purchase) => sum + purchase.total_amount, 0);
  const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

  return (
    <DetailLayout className={className}>
      {/* Header */}
      <DetailHeader
        title={customer.company_name || customer.name}
        subtitle={`Customer ID: ${customer.customer_code || customer.id}`}
        badge={
          <Badge className={getCustomerTypeColor(customer.customer_type)}>
            {customer.customer_type}
          </Badge>
        }
        backAction={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
        actions={
          <Button onClick={handleEditCustomer}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Customer
          </Button>
        }
      />

      {/* Key Metrics */}
      <DetailGrid columns={4} className="mb-6">
        <MetricCard
          label="Total Purchases"
          value={totalPurchases.toString()}
          subValue="Orders placed"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <MetricCard
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          subValue="Lifetime value"
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
        />
        <MetricCard
          label="Average Order"
          value={formatCurrency(averageOrderValue)}
          subValue="Per transaction"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          label="Credit Limit"
          value={formatCurrency(customer.credit_limit || 0)}
          subValue="Available credit"
          icon={<CreditCard className="w-5 h-5" />}
        />
      </DetailGrid>

      {/* Customer Details */}
      <DetailGrid columns={2} className="mb-6">
        <DetailCard 
          title="Basic Information"
          className="lg:col-span-2"
        >
          <DetailGrid columns={2}>
            <DetailField
              label="Customer Name"
              value={customer.name}
              variant="highlight"
            />
            <DetailField
              label="Customer Code"
              value={customer.customer_code || customer.id}
              icon={<Hash className="w-4 h-4" />}
            />
            <DetailField
              label="Company Name"
              value={customer.company_name || '-'}
              icon={<Building className="w-4 h-4" />}
            />
            <DetailField
              label="Customer Type"
              value={
                <Badge className={getCustomerTypeColor(customer.customer_type)}>
                  {customer.customer_type}
                </Badge>
              }
              icon={<Star className="w-4 h-4" />}
            />
            <DetailField
              label="Email"
              value={customer.email || '-'}
              icon={<Mail className="w-4 h-4" />}
            />
            <DetailField
              label="Phone"
              value={customer.phone || '-'}
              icon={<Phone className="w-4 h-4" />}
            />
            <DetailField
              label="Address"
              value={customer.address || '-'}
              icon={<MapPin className="w-4 h-4" />}
            />
            <DetailField
              label="Status"
              value={
                <Badge className={getStatusColor(customer.status || 'active')}>
                  {customer.status || 'active'}
                </Badge>
              }
              icon={<CheckCircle className="w-4 h-4" />}
            />
          </DetailGrid>
        </DetailCard>
      </DetailGrid>

      {/* Financial Information */}
      <DetailGrid columns={2} className="mb-6">
        <DetailCard title="Financial Settings">
          <DetailGrid columns={1}>
            <DetailField
              label="Credit Limit"
              value={formatCurrency(customer.credit_limit || 0)}
              icon={<CreditCard className="w-4 h-4" />}
            />
            <DetailField
              label="Payment Terms"
              value={`${customer.payment_terms || 0} days`}
              icon={<Calendar className="w-4 h-4" />}
            />
            <DetailField
              label="Tax Number"
              value={customer.tax_number || '-'}
              icon={<Hash className="w-4 h-4" />}
            />
          </DetailGrid>
        </DetailCard>

        <DetailCard title="System Information">
          <DetailGrid columns={1}>
            <DetailField
              label="Created Date"
              value={new Date(customer.created_at).toLocaleDateString('id-ID')}
              icon={<Calendar className="w-4 h-4" />}
            />
            <DetailField
              label="Last Updated"
              value={new Date(customer.updated_at).toLocaleDateString('id-ID')}
              icon={<Activity className="w-4 h-4" />}
            />
          </DetailGrid>
        </DetailCard>
      </DetailGrid>

      {/* Purchase History */}
      <DetailCard title="Purchase History" className="mt-6">
        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
            <span className="text-sm text-muted-foreground">Loading purchase history...</span>
          </div>
        ) : purchaseHistory.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No purchase history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-medium text-muted-foreground">Order Number</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">Items</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.map((purchase) => (
                      <tr key={purchase.id} className="border-b hover:bg-muted/50">
                        <td className="py-3">
                          <div className="font-medium">{purchase.order_number}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-sm text-muted-foreground">
                            {new Date(purchase.date).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-sm">{purchase.items_count} items</div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium">{formatCurrency(purchase.total_amount)}</div>
                        </td>
                        <td className="py-3">
                          <Badge className={getPurchaseStatusColor(purchase.status)}>
                            {purchase.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {purchaseHistory.map((purchase) => (
                <div key={purchase.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{purchase.order_number}</div>
                    <Badge className={getPurchaseStatusColor(purchase.status)}>
                      {purchase.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(purchase.date).toLocaleDateString('id-ID')}
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      {purchase.items_count} items
                    </div>
                    <div className="flex items-center font-medium text-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {formatCurrency(purchase.total_amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DetailCard>
    </DetailLayout>
  );
};

export default CustomerDetailPage;