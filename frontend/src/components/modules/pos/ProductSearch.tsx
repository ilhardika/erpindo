/**
 * Product Search Component
 * Handles product searching with barcode input and product display
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Scan, Plus, Package, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Product } from '@/types/database';
import { useProductStore } from '@/stores/productStore';
import { useProductCategoryStore } from '@/stores/productCategoryStore';
import { usePosStore } from '@/stores/posStore';

interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
  className?: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ 
  onProductSelect, 
  className = '' 
}) => {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const { products, searchProducts, getProductByBarcode, loadProducts } = useProductStore();
  const { categories, loadCategories } = useProductCategoryStore();
  const { 
    productSearchQuery, 
    setProductSearchQuery, 
    barcodeInput, 
    setBarcodeInput,
    addToCart 
  } = usePosStore();

  // Load products and categories on component mount
  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
    if (categories.length === 0) {
      loadCategories();
    }
  }, [products.length, categories.length, loadProducts, loadCategories]);

  // Filter products by category when products or selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter(product => 
        product.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        product.category_id === selectedCategory
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, selectedCategory]);

  // Search products when query changes
  useEffect(() => {
    const searchDelayed = setTimeout(async () => {
      if (productSearchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchProducts(productSearchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching products:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDelayed);
  }, [productSearchQuery, searchProducts]);

  // Handle barcode input
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setIsSearching(true);
    try {
      const product = await getProductByBarcode(barcodeInput);
      if (product) {
        addToCart(product, 1, barcodeInput);
        setBarcodeInput('');
        setShowBarcodeInput(false);
      } else {
        // Show error or suggestion to search manually
        setProductSearchQuery(barcodeInput);
        setShowBarcodeInput(false);
      }
    } catch (error) {
      console.error('Error searching by barcode:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    addToCart(product);
    onProductSelect(product);
    setProductSearchQuery('');
    setSearchResults([]);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get stock status
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { text: 'Habis', variant: 'destructive' as const };
    if (stock <= 10) return { text: 'Stok Rendah', variant: 'secondary' as const };
    return { text: 'Tersedia', variant: 'default' as const };
  };

  // Focus barcode input when shown
  useEffect(() => {
    if (showBarcodeInput && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [showBarcodeInput]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Header */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari produk berdasarkan nama, SKU, atau kategori..."
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showBarcodeInput ? "default" : "outline"}
          size="icon"
          onClick={() => setShowBarcodeInput(!showBarcodeInput)}
          title="Scan Barcode"
        >
          <Scan className="h-4 w-4" />
        </Button>
      </div>

      {/* Barcode Input */}
      {showBarcodeInput && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Barcode className="h-4 w-4" />
              Input Barcode Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <Input
                ref={barcodeInputRef}
                type="text"
                placeholder="Masukkan atau scan barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!barcodeInput.trim() || isSearching}>
                {isSearching ? 'Mencari...' : 'Cari'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {(searchResults.length > 0 || isSearching) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {isSearching ? 'Mencari...' : `Hasil Pencarian (${searchResults.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-2 p-4">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => {
                    const stockStatus = getStockStatus(product.stock_quantity);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleProductSelect(product)}
                      >
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-sm truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">
                                SKU: {product.sku}
                              </p>
                              {product.barcode && (
                                <p className="text-xs text-gray-500 truncate">
                                  Barcode: {product.barcode}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <span className="font-semibold text-sm">
                                {formatCurrency(product.selling_price)}
                              </span>
                              <Badge variant={stockStatus.variant} className="text-xs">
                                {stockStatus.text}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              Stok: {product.stock_quantity} {product.unit_of_measure}
                            </span>
                            <Button
                              size="sm"
                              className="h-6 px-2 text-xs"
                              disabled={product.stock_quantity <= 0}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Tambah
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Tidak ada produk ditemukan</p>
                    <p className="text-sm text-gray-400">
                      Coba kata kunci yang berbeda
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Categories */}
      {!productSearchQuery && searchResults.length === 0 && categories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filter Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <Button
                variant={selectedCategory === '' ? "default" : "outline"}
                size="sm"
                className="h-auto p-2 text-xs"
                onClick={() => setSelectedCategory('')}
              >
                Semua
              </Button>
              {categories.slice(0, 7).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  className="h-auto p-2 text-xs"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Products */}
      {!productSearchQuery && searchResults.length === 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {selectedCategory ? `Produk - ${selectedCategory}` : 'Semua Produk'}
              {filteredProducts.length > 0 && (
                <span className="text-gray-500 font-normal"> ({filteredProducts.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-2 p-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    {selectedCategory ? (
                      <>
                        <p className="text-sm font-medium">Tidak ada produk di kategori "{selectedCategory}"</p>
                        <p className="text-xs mb-3">Coba pilih kategori lain atau tambah produk baru</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">Belum ada produk</p>
                        <p className="text-xs mb-3">Tambahkan produk terlebih dahulu</p>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('/products', '_blank')}
                    >
                      Kelola Produk
                    </Button>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock_quantity);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-sm truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">
                                SKU: {product.sku}
                              </p>
                              {product.category && (
                                <p className="text-xs text-gray-500 truncate">
                                  Kategori: {product.category}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <span className="font-semibold text-sm">
                                {formatCurrency(product.selling_price)}
                              </span>
                              <Badge variant={stockStatus.variant} className="text-xs">
                                {stockStatus.text}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              Stok: {product.stock_quantity} {product.unit_of_measure}
                            </span>
                            <Button
                              size="sm"
                              className="h-6 px-2 text-xs"
                              disabled={product.stock_quantity <= 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductSelect(product);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Tambah
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductSearch;