/**
 * CustomerForm Component
 * Mobile-first responsive form for creating/editing customers
 * Uses consistent design system with reusable components
 * Date: 2025-09-18
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  DetailLayout,
  DetailHeader,
  DetailCard,
  DetailGrid,
} from '../../ui/data-detail';
import { Loader2, Save, X, User, Mail, CreditCard } from 'lucide-react';
import { useCustomerStore } from '../../../stores/customerStore';
import type { CustomerInsert, CustomerUpdate, Customer } from '../../../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  customer_type: 'regular' | 'vip' | 'wholesale';
  tax_number: string;
  credit_limit: string;
  payment_terms: string;
  is_active: boolean;
}

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'textarea' | 'email' | 'tel';
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  icon,
  className,
  error,
}) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        {type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
            rows={3}
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
          />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSuccess,
  onCancel,
  className = '',
}) => {
  const { createCustomer, updateCustomer, error, clearError } = useCustomerStore();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'regular',
    tax_number: '',
    credit_limit: '0',
    payment_terms: '30',
    is_active: true,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        customer_type: customer.customer_type || 'regular',
        tax_number: customer.tax_number || '',
        credit_limit: customer.credit_limit?.toString() || '0',
        payment_terms: customer.payment_terms?.toString() || '30',
        is_active: customer.is_active ?? true,
      });
    }
  }, [customer]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle field updates
  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama pelanggan wajib diisi';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      errors.phone = 'Format nomor telepon tidak valid';
    }

    const creditLimit = parseFloat(formData.credit_limit);
    if (isNaN(creditLimit) || creditLimit < 0) {
      errors.credit_limit = 'Limit kredit harus berupa angka positif';
    }

    const paymentTerms = parseInt(formData.payment_terms);
    if (isNaN(paymentTerms) || paymentTerms < 0 || paymentTerms > 365) {
      errors.payment_terms = 'Tenor pembayaran harus antara 0-365 hari';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation helper
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        customer_type: formData.customer_type,
        tax_number: formData.tax_number.trim() || null,
        credit_limit: parseFloat(formData.credit_limit),
        payment_terms: parseInt(formData.payment_terms),
        is_active: formData.is_active,
      };

      let success = false;

      if (customer) {
        // Update existing customer
        success = await updateCustomer(customer.id, customerData as CustomerUpdate);
      } else {
        // Create new customer
        success = await createCustomer(customerData as CustomerInsert);
      }

      if (success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    clearError();
    onCancel?.();
  };

  const isEditMode = !!customer;

  return (
    <DetailLayout className={className}>
      <DetailHeader
        title={isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
        subtitle={isEditMode ? `Mengubah data pelanggan "${customer?.name}"` : 'Tambahkan pelanggan baru ke dalam sistem'}
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button
              type="submit"
              form="customer-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditMode ? 'Update' : 'Simpan'}
            </Button>
          </div>
        }
      />

      <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <DetailCard title="Error">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearError}
              className="mt-2"
            >
              Tutup
            </Button>
          </DetailCard>
        )}

        {/* Basic Information */}
        <DetailCard 
          title="Informasi Dasar" 
          icon={<User className="w-5 h-5" />}
        >
          <DetailGrid columns={2}>
            <FormField
              label="Nama Pelanggan"
              value={formData.name}
              onChange={(value) => updateField('name', value)}
              placeholder="Masukkan nama pelanggan"
              required
              icon={<User className="w-4 h-4" />}
              error={validationErrors.name}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipe Pelanggan</label>
              <Select
                value={formData.customer_type}
                onValueChange={(value) => updateField('customer_type', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Reguler</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="wholesale">Grosir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                onValueChange={(value) => updateField('is_active', value === 'active')}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <FormField
              label="NPWP"
              value={formData.tax_number}
              onChange={(value) => updateField('tax_number', value)}
              placeholder="Nomor Pokok Wajib Pajak (opsional)"
              error={validationErrors.tax_number}
            />
          </DetailGrid>
        </DetailCard>

        {/* Contact Information */}
        <DetailCard 
          title="Informasi Kontak" 
          icon={<Mail className="w-5 h-5" />}
        >
          <DetailGrid columns={2}>
            <FormField
              label="Email"
              value={formData.email}
              onChange={(value) => updateField('email', value)}
              placeholder="email@contoh.com"
              type="email"
              icon={<Mail className="w-4 h-4" />}
              error={validationErrors.email}
            />

            <FormField
              label="Nomor Telepon"
              value={formData.phone}
              onChange={(value) => updateField('phone', value)}
              placeholder="+62 xxx xxxx xxxx"
              type="tel"
              error={validationErrors.phone}
            />

            <FormField
              label="Alamat"
              value={formData.address}
              onChange={(value) => updateField('address', value)}
              placeholder="Alamat lengkap pelanggan"
              type="textarea"
              className="md:col-span-2"
            />
          </DetailGrid>
        </DetailCard>

        {/* Financial Information */}
        <DetailCard 
          title="Informasi Keuangan" 
          icon={<CreditCard className="w-5 h-5" />}
        >
          <DetailGrid columns={2}>
            <FormField
              label="Limit Kredit (Rp)"
              value={formData.credit_limit}
              onChange={(value) => updateField('credit_limit', value)}
              placeholder="0"
              type="number"
              icon={<CreditCard className="w-4 h-4" />}
              error={validationErrors.credit_limit}
            />

            <FormField
              label="Tenor Pembayaran (Hari)"
              value={formData.payment_terms}
              onChange={(value) => updateField('payment_terms', value)}
              placeholder="30"
              type="number"
              error={validationErrors.payment_terms}
            />
          </DetailGrid>
        </DetailCard>
      </form>
    </DetailLayout>
  );
};

export default CustomerForm;