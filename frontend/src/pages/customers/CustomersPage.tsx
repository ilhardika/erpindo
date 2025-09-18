/**
 * CustomersPage Component
 * Main page for customer management with consistent UI patterns
 * Date: 2025-09-18
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomerList } from '../../components/modules/customers/CustomerList';
import { CustomerForm } from '../../components/modules/customers/CustomerForm';
import { useCustomerStore } from '../../stores/customerStore';
import type { Customer } from '../../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface CustomersPageProps {
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CustomersPage: React.FC<CustomersPageProps> = ({ className }) => {
  const [showForm, setShowForm] = useState(false);
  const { selectedCustomer, setSelectedCustomer, getCustomerById, loadCustomers } = useCustomerStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for edit parameter on mount
  useEffect(() => {
    const editCustomerId = searchParams.get('edit');
    if (editCustomerId) {
      // First try to find customer in current store
      let customerToEdit = getCustomerById(editCustomerId);
      
      if (customerToEdit) {
        setSelectedCustomer(customerToEdit);
        setShowForm(true);
        setSearchParams({});
      } else {
        // Customer not found, load customers and try again
        loadCustomers().then(() => {
          customerToEdit = getCustomerById(editCustomerId);
          if (customerToEdit) {
            setSelectedCustomer(customerToEdit);
            setShowForm(true);
          } else {
            console.warn(`Customer with ID ${editCustomerId} not found`);
          }
          setSearchParams({});
        });
      }
    }
  }, [searchParams, setSearchParams, getCustomerById, setSelectedCustomer, loadCustomers]);

  const handleCreateCustomer = () => {
    setSelectedCustomer(null); // Clear any selected customer
    setShowForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedCustomer(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedCustomer(null);
  };

  if (showForm) {
    return (
      <div className={`container mx-auto p-4 ${className || ''}`}>
        <CustomerForm
          customer={selectedCustomer}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 ${className || ''}`}>
      <CustomerList
        onCreateCustomer={handleCreateCustomer}
        onEditCustomer={handleEditCustomer}
        onViewCustomer={handleViewCustomer}
      />
    </div>
  );
};

export default CustomersPage;