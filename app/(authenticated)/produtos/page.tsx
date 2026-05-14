'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Package } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { ProductCard } from '@/components/products/product-card'
import { NewProductModal } from '@/components/products/new-product-modal'

export default function ProdutosPage() {
  const { products } = useApp()
  const [search, setSearch] = useState('')
  const [isNewProductOpen, setIsNewProductOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!search) return products
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Calculate totals
  const totals = useMemo(() => {
    return products.reduce((acc, p) => ({
      items: acc.items + p.quantity,
      value: acc.value + (p.quantity * p.unitPrice)
    }), { items: 0, value: 0 })
  }, [products])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Produtos</h2>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de estoque e vendas
          </p>
        </div>
        <button
          onClick={() => setIsNewProductOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total de Produtos</p>
          <p className="text-2xl font-bold text-foreground mt-1">{products.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Itens em Estoque</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totals.items}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-muted-foreground">Valor Total em Estoque</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(totals.value)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos..."
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            {search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </h3>
          <p className="text-muted-foreground mt-1">
            {search 
              ? 'Tente buscar com outros termos' 
              : 'Clique em "Novo Produto" para começar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* New Product Modal */}
      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
      />
    </div>
  )
}
