'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  User,
  DollarSign,
  LogOut,
  LogIn,
  Search,
  Plus,
  Minus,
  X,
  Check,
  ChevronsUpDown,
  History,
  Percent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClientSupabase } from '@/lib/supabase/client'
import {
  getCurrentShift,
  openShift,
  createTransaction,
  getTransactionById,
} from '@/lib/pos/api'
import { getProducts } from '@/lib/inventory/api'
import { getPromotions } from '@/lib/promotions/api'
import { getCustomers } from '@/lib/customers/api'
import { printReceiptInNewTab } from '@/lib/pos/print-utils'
import { PaymentDialog } from '@/components/pos/payment-dialog'
import { CloseShiftDialog } from '@/components/pos/close-shift-dialog'
import { OpenShiftDialog } from '@/components/pos/open-shift-dialog'
import type {
  PosShift,
  CreateTransactionInput,
  PosTransactionWithRelations,
} from '@/types/pos'
import type { Product } from '@/types/inventory'
import type { Promotion } from '@/types/promotions'
import type { Customer } from '@/types/customers'
import type { CartItem } from '@/types/pos'

export default function POSPage() {
  const [currentShift, setCurrentShift] = useState<PosShift | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [openShiftDialogOpen, setOpenShiftDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [closeShiftDialogOpen, setCloseShiftDialogOpen] = useState(false)
  const [completedTransaction, setCompletedTransaction] =
    useState<PosTransactionWithRelations | null>(null)
  const [discountItemIndex, setDiscountItemIndex] = useState<number | null>(
    null
  )
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>(
    'percentage'
  )
  const [discountValue, setDiscountValue] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Get current user ID
      const supabase = createClientSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Not authenticated')
        setLoading(false)
        return
      }

      const [shiftData, productsData, promotionsData, customersResponse] =
        await Promise.all([
          getCurrentShift(user.id),
          getProducts(),
          getPromotions({ status: 'active' }),
          getCustomers({ status: 'active' }, { limit: 100 }),
        ])
      setCurrentShift(shiftData)
      setProducts(productsData)
      setPromotions(promotionsData)
      setCustomers(customersResponse.data)
    } catch (error) {
      console.error('Error loading POS data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShiftOpened = (shift: PosShift) => {
    setCurrentShift(shift)
    loadData() // Reload data to get fresh shift info
  }

  const handlePayment = async (
    payments: Array<{
      method: 'cash' | 'card' | 'transfer' | 'e-wallet' | 'credit' | 'split'
      amount: number
      reference?: string
    }>,
    shouldPrint: boolean = false
  ) => {
    if (!currentShift) {
      toast.error('No active shift')
      return
    }

    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    try {
      setProcessingPayment(true)

      // Determine payment method
      const paymentMethod = payments.length > 1 ? 'split' : payments[0].method

      // Prepare transaction input
      const transactionInput: CreateTransactionInput = {
        shift_id: currentShift.id,
        customer_id: selectedCustomer?.id,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          promotion_id: item.promotion_id || undefined,
        })),
        payments: payments.map(payment => ({
          payment_method: payment.method,
          amount: payment.amount,
          reference_number: payment.reference,
        })),
      }

      // Create transaction
      const transaction = await createTransaction(transactionInput)

      // Fetch full transaction details with relations for receipt
      const transactionWithRelations = await getTransactionById(transaction.id)

      // Success!
      toast.success(
        `Transaction ${transaction.transaction_number} completed successfully`
      )

      // Clear cart and close payment dialog
      setCart([])
      setPaymentDialogOpen(false)

      // If shouldPrint, open print in new tab (no modal)
      if (shouldPrint && transactionWithRelations) {
        printReceiptInNewTab(transactionWithRelations, {
          name: 'ERPINDO COMPANY',
          address: 'Jl. Bisnis No. 123, Jakarta',
          phone: '+62 21 1234 5678',
        })
      }
      // No else - modal dihapus karena print langsung ke tab baru

      // Optionally refresh shift data to update transaction count
      const supabase = createClientSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const updatedShift = await getCurrentShift(user.id)
        setCurrentShift(updatedShift)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Failed to process payment')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleCloseShift = () => {
    setCloseShiftDialogOpen(true)
  }

  const handleAddToCart = (product: Product) => {
    if (!product.selling_price) {
      toast.error('Product has no selling price')
      return
    }

    const existingItem = cart.find(item => item.product_id === product.id)

    if (existingItem) {
      // Update quantity if already in cart
      setCart(
        cart.map(item =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item
        )
      )
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: 1,
        unit_price: product.selling_price,
        subtotal: product.selling_price,
        discount_amount: 0,
        promotion_id: null,
      }
      setCart([...cart, newItem])
    }
    toast.success(`${product.name} added to cart`)
  }

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(index)
      return
    }
    setCart(
      cart.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.unit_price,
            }
          : item
      )
    )
  }

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
    toast.success('Item removed from cart')
  }

  const handleApplyDiscount = (
    index: number,
    discountType: 'amount' | 'percentage',
    discountValue: number
  ) => {
    setCart(
      cart.map((item, i) => {
        if (i === index) {
          const maxDiscount = item.subtotal
          let discountAmount = 0

          if (discountType === 'amount') {
            discountAmount = Math.min(discountValue, maxDiscount)
          } else {
            // percentage
            const percentage = Math.min(Math.max(discountValue, 0), 100)
            discountAmount = (item.subtotal * percentage) / 100
          }

          return {
            ...item,
            discount_amount: discountAmount,
          }
        }
        return item
      })
    )
    toast.success('Discount applied')
  }

  const handleOpenDiscountDialog = (index: number) => {
    const item = cart[index]
    setDiscountItemIndex(index)
    // Pre-fill existing discount if any
    if (item.discount_amount > 0) {
      // Check if it's percentage or amount
      const percentage = (item.discount_amount / item.subtotal) * 100
      if (Number.isInteger(percentage) && percentage <= 100) {
        setDiscountType('percentage')
        setDiscountValue(percentage.toString())
      } else {
        setDiscountType('amount')
        setDiscountValue(item.discount_amount.toString())
      }
    } else {
      setDiscountType('percentage')
      setDiscountValue('')
    }
  }

  const handleConfirmDiscount = () => {
    if (discountItemIndex === null) return

    const value = parseFloat(discountValue) || 0
    if (value <= 0) {
      toast.error('Please enter a valid discount value')
      return
    }

    handleApplyDiscount(discountItemIndex, discountType, value)
    setDiscountItemIndex(null)
    setDiscountValue('')
  }

  const handleRemoveDiscount = (index: number) => {
    setCart(
      cart.map((item, i) =>
        i === index ? { ...item, discount_amount: 0 } : item
      )
    )
    toast.success('Discount removed')
  }

  // Filter products based on search
  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode &&
        product.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = cart.reduce(
    (sum, item) => sum + item.discount_amount,
    0
  )
  const taxAmount = (subtotal - discountAmount) * 0.1 // 10% tax
  const total = subtotal - discountAmount + taxAmount

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading POS...</p>
        </div>
      </div>
    )
  }

  // If no active shift, show shift start screen
  if (!currentShift) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Start Your Shift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-muted-foreground">
              <LogIn className="mx-auto mb-2 h-12 w-12" />
              <p>You need to open a shift before starting POS operations.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setOpenShiftDialogOpen(true)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Open Shift
              </Button>
              <Link href="/erp/pos/transactions" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  <History className="mr-2 h-4 w-4" />
                  View Transactions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Open Shift Dialog */}
        <OpenShiftDialog
          open={openShiftDialogOpen}
          onOpenChange={setOpenShiftDialogOpen}
          onShiftOpened={handleShiftOpened}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Title & Badge */}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold sm:text-2xl">Point of Sale</h1>
            <Badge variant="secondary" className="text-xs">
              Shift #{currentShift.id.slice(0, 8)}
            </Badge>
          </div>

          {/* Right: Cashier info & Buttons */}
          <div className="flex items-center justify-between gap-2 sm:space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">Cashier</p>
              <p className="font-medium">Current User</p>
            </div>
            <div className="flex gap-2">
              <Link href="/erp/pos/transactions">
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Transactions</span>
                  <span className="sm:hidden">History</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleCloseShift}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Close Shift</span>
                <span className="sm:hidden">Close</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Side - Product Search & Cart */}
        <div className="flex w-full flex-col border-b lg:w-3/5 lg:border-b-0 lg:border-r">
          {/* Product Search Section */}
          <div className="border-b p-4">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Products Grid */}
              <div className="max-h-[300px] overflow-auto lg:max-h-[400px]">
                {filteredProducts.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No products found</p>
                    <p className="text-sm">
                      {products.length === 0
                        ? 'Add products in Inventory Management first'
                        : 'Try a different search term'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map(product => (
                      <Card
                        key={product.id}
                        className="cursor-pointer transition-colors hover:bg-accent"
                        onClick={() => handleAddToCart(product)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.sku}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 shrink-0"
                              onClick={e => {
                                e.stopPropagation()
                                handleAddToCart(product)
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-primary">
                            Rp{' '}
                            {(product.selling_price || 0).toLocaleString(
                              'id-ID'
                            )}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shopping Cart Section */}
          <div className="flex-1 overflow-auto p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shopping Cart ({cart.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <ShoppingCart className="mx-auto mb-4 h-16 w-16 opacity-20" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Search and add products to start</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 rounded-lg border p-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.product_sku}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Rp {item.unit_price.toLocaleString('id-ID')} /
                              item
                            </p>
                            {item.discount_amount > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-green-100 text-green-700"
                                >
                                  <Percent className="mr-1 h-3 w-3" />
                                  Discount: -Rp{' '}
                                  {item.discount_amount.toLocaleString('id-ID')}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveDiscount(index)}
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:justify-end">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  handleUpdateQuantity(index, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  handleUpdateQuantity(index, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Subtotal & Remove */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="font-semibold text-sm min-w-[80px]">
                                  Rp{' '}
                                  {(
                                    item.subtotal - item.discount_amount
                                  ).toLocaleString('id-ID')}
                                </p>
                                {item.discount_amount > 0 && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    Rp {item.subtotal.toLocaleString('id-ID')}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveFromCart(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Discount Button */}
                        <div className="flex justify-start pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleOpenDiscountDialog(index)}
                          >
                            <Percent className="mr-1 h-3 w-3" />
                            {item.discount_amount > 0
                              ? 'Change Discount'
                              : 'Add Discount'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Payment & Summary */}
        <div className="flex w-full flex-col lg:w-2/5">
          {/* Customer Section */}
          <div className="border-b p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Customer
                  </div>
                  {selectedCustomer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Clear
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover
                  open={customerSearchOpen}
                  onOpenChange={setCustomerSearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedCustomer ? (
                        <span className="truncate">
                          {selectedCustomer.name}
                        </span>
                      ) : (
                        'Select Customer (Optional)'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search customer..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers.map(customer => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setSelectedCustomer(customer)
                                setCustomerSearchOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedCustomer?.id === customer.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {customer.email || customer.phone}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedCustomer && (
                  <div className="mt-3 text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Phone: {selectedCustomer.phone}
                    </p>
                    {selectedCustomer.email && (
                      <p className="text-muted-foreground">
                        Email: {selectedCustomer.email}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="flex-1 overflow-auto p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-red-600">
                      - Rp {discountAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>Rp {taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={cart.length === 0}
                    onClick={() => setPaymentDialogOpen(true)}
                  >
                    Process Payment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={cart.length === 0}
                    onClick={() => setCart([])}
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        totalAmount={total}
        onConfirm={handlePayment}
        loading={processingPayment}
      />

      {/* Close Shift Dialog */}
      <CloseShiftDialog
        open={closeShiftDialogOpen}
        onOpenChange={setCloseShiftDialogOpen}
        shift={currentShift}
        onShiftClosed={loadData}
      />

      {/* Discount Dialog */}
      <Dialog
        open={discountItemIndex !== null}
        onOpenChange={open => {
          if (!open) {
            setDiscountItemIndex(null)
            setDiscountValue('')
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              {discountItemIndex !== null &&
                `Add discount to ${cart[discountItemIndex]?.product_name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="discount-type">Discount Type</Label>
              <Select
                value={discountType}
                onValueChange={(value: 'amount' | 'percentage') =>
                  setDiscountType(value)
                }
              >
                <SelectTrigger id="discount-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="amount">Fixed Amount (Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount-value">
                {discountType === 'percentage'
                  ? 'Discount Percentage'
                  : 'Discount Amount'}
              </Label>
              <Input
                id="discount-value"
                type="number"
                min="0"
                max={
                  discountType === 'percentage'
                    ? '100'
                    : discountItemIndex !== null
                      ? cart[discountItemIndex]?.subtotal.toString()
                      : '0'
                }
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                placeholder={
                  discountType === 'percentage'
                    ? 'Enter percentage (0-100)'
                    : 'Enter amount'
                }
              />
              {discountItemIndex !== null && (
                <p className="text-xs text-muted-foreground">
                  Max discount:{' '}
                  {discountType === 'percentage'
                    ? '100%'
                    : `Rp ${cart[discountItemIndex]?.subtotal.toLocaleString('id-ID')}`}
                </p>
              )}
            </div>

            {/* Preview */}
            {discountItemIndex !== null && discountValue && (
              <div className="rounded-lg bg-muted p-3 space-y-1">
                <p className="text-sm font-medium">Preview:</p>
                <div className="flex justify-between text-sm">
                  <span>Original Price:</span>
                  <span>
                    Rp{' '}
                    {cart[discountItemIndex]?.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount:</span>
                  <span>
                    -{' '}
                    {discountType === 'percentage'
                      ? `${discountValue}%`
                      : `Rp ${parseFloat(discountValue || '0').toLocaleString('id-ID')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                  <span>Final Price:</span>
                  <span>
                    Rp{' '}
                    {(
                      cart[discountItemIndex]?.subtotal -
                      (discountType === 'percentage'
                        ? (cart[discountItemIndex]?.subtotal *
                            parseFloat(discountValue || '0')) /
                          100
                        : parseFloat(discountValue || '0'))
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDiscountItemIndex(null)
                setDiscountValue('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmDiscount}>Apply Discount</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
