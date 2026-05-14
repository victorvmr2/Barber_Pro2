'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useToast } from '@/components/ui/toast-provider'
import { Product } from '@/lib/types'

interface NewProductModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewProductModal({ isOpen, onClose }: NewProductModalProps) {
  const { addProduct } = useApp()
  const { showToast } = useToast()
  
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const qty = parseInt(quantity)
    const price = parseFloat(unitPrice.replace(',', '.'))

    if (isNaN(qty) || qty < 0) {
      showToast('Digite uma quantidade válida', 'error')
      return
    }

    if (isNaN(price) || price <= 0) {
      showToast('Digite um preço válido', 'error')
      return
    }

    const newProduct: Product = {
      id: Math.random().toString(36).substring(7),
      name,
      quantity: qty,
      unitPrice: price,
      movements: qty > 0 ? [{
        id: Math.random().toString(36).substring(7),
        date: new Date().toISOString(),
        type: 'entrada',
        quantity: qty,
      }] : [],
    }

    addProduct(newProduct)
    showToast('Produto criado com sucesso', 'success')
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setQuantity('')
    setUnitPrice('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative bg-card border border-border rounded-xl max-w-md w-full mx-4 shadow-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-serif font-bold text-foreground">
            Novo Produto
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nome do Produto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pomada Modeladora"
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Initial Quantity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quantidade Inicial
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preço Unitário
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <input
                type="text"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Criar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
