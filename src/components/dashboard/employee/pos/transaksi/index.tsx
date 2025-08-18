"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Search, ShoppingBag } from "lucide-react";
import { POSService } from "@/backend/services/pos";
import { ProductTable } from "@/backend/tables/products";
import { CustomerTable } from "@/backend/tables/customers";
import { customersData } from "@/backend/data/customers";
import { useAuth } from "@/contexts/AuthContext";
import { CheckoutModal } from "./CheckoutModal";

interface CartItem {
  productId: string;
  product: ProductTable;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

interface POSTransactionProps {
  onBack?: () => void;
}

export function POSTransaction({ onBack }: POSTransactionProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductTable[]>([]);
  const [customers, setCustomers] = useState<CustomerTable[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("general");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(11); // PPN 11%
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "transfer" | "credit_card" | "debit_card"
  >("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.companyId) return;

    try {
      const productsData = await POSService.searchProducts("", user.companyId);
      const filteredCustomers = customersData.filter(
        (c) => c.companyId === user.companyId
      );

      setProducts(productsData);
      setCustomers(filteredCustomers);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product: ProductTable) => {
    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discount: 0,
        totalPrice: product.sellingPrice,
      };
      setCart([...cart, newItem]);
    }
    setSearchTerm(""); // Clear search after adding
  };

  // Update quantity in cart
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) => {
        if (item.productId === productId) {
          const totalPrice = item.unitPrice * newQuantity - item.discount;
          return { ...item, quantity: newQuantity, totalPrice };
        }
        return item;
      })
    );
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const globalDiscountAmount = (subtotal * discountPercent) / 100;
  const subtotalAfterDiscount = subtotal - globalDiscountAmount;
  const taxAmount = (subtotalAfterDiscount * taxPercent) / 100;
  const totalAmount = subtotalAfterDiscount + taxAmount;

  // Process transaction
  const processTransaction = async () => {
    if (!user || cart.length === 0) return;

    setIsProcessing(true);

    try {
      const transactionData = {
        companyId: user.companyId!,
        transactionNumber: `INV/${new Date().getFullYear()}/${(
          new Date().getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${Date.now().toString().slice(-6)}`,
        transactionType: "sale" as const,
        customerId:
          selectedCustomer === "general" ? undefined : selectedCustomer,
        employeeId: user.id,
        transactionDate: new Date().toISOString(),
        subtotal,
        taxAmount,
        discountAmount: globalDiscountAmount,
        totalAmount,
        paymentStatus: "paid" as const,
        paymentMethod,
        notes,
        isActive: true,
      };

      const result = await POSService.createTransaction(transactionData);

      if (result) {
        // Reset form
        setCart([]);
        setSelectedCustomer("general");
        setDiscountPercent(0);
        setAmountPaid(0);
        setNotes("");
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">POS - Transaksi</h1>
          <p className="text-sm text-muted-foreground">Sistem Point of Sale</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack} size="sm">
            Kembali
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {(searchTerm ? filteredProducts : products).map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 h-full flex flex-col">
              <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-1">
                <div className="space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                  <p className="text-xs text-muted-foreground">
                    Stok: {product.stock || 0}
                  </p>
                  <p className="font-bold text-sm text-primary">
                    Rp {product.sellingPrice.toLocaleString("id-ID")}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full h-8 text-xs mt-auto"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Tambah
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            size="lg"
            className="rounded-full shadow-lg text-xs sm:text-sm px-3 sm:px-4 h-12 sm:h-14"
            onClick={() => setIsCheckoutModalOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">{cart.length} Item</span>
            <span className="xs:hidden">{cart.length}</span>
            <Badge
              variant="secondary"
              className="ml-1 sm:ml-2 text-xs px-1.5 sm:px-2"
            >
              <span className="hidden sm:inline">Rp </span>
              {Math.round(totalAmount / 1000)}k
            </Badge>
          </Button>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        customers={customers}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        taxPercent={taxPercent}
        setTaxPercent={setTaxPercent}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
        notes={notes}
        setNotes={setNotes}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        processTransaction={processTransaction}
        isProcessing={isProcessing}
      />
    </div>
  );
}
