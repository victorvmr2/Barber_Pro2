'use client'

import { useState } from 'react'
import { Package, Plus, Minus, ShoppingCart, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useToast } from '@/components/ui/toast-provider'
import { Product, ProductMovement } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { updateProduct, saldoDisponivel, setSaldoDisponivel, addTransaction } = useApp()
  const { showToast } = useToast()
  const [showHistory, setShowHistory] = useState(false)
  const [activeModal, setActiveModal] = useState<'entrada' | 'venda' | 'baixa' | null>(null)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [error, setError] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isLowStock = product.quantity < 3
  const totalValue = product.quantity * product.unitPrice

  const handleAction = () => {
    setError('')
    const qty = parseInt(quantity)

    if (isNaN(qty) || qty <= 0) {
      setError('Digite uma quantidade válida')
      return
    }

    const newMovement: ProductMovement = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      type: activeModal!,
      quantity: qty,
    }

    let newQuantity = product.quantity

    switch (activeModal) {
      case 'entrada':
        newQuantity += qty
        newMovement.type = 'entrada'
        break

      case 'venda':
        if (qty > product.quantity) {
          setError('Quantidade insuficiente em estoque')
          return
        }
        newQuantity -= qty
        const saleValue = qty * product.unitPrice
        newMovement.value = saleValue

        // Add to available balance
        setSaldoDisponivel(saldoDisponivel + saleValue)

        // Log transaction
        addTransaction({
          id: Math.random().toString(36).substring(7),
          date: new Date().toISOString(),
          description: `Venda de Produto — ${product.name}`,
          type: 'entrada',
          value: saleValue,
        })
        break

      case 'baixa':
        if (qty > product.quantity) {
          setError('Quantidade insuficiente em estoque')
          return
        }
        if (!reason.trim()) {
          setError('Digite o motivo da baixa')
          return
        }
        newQuantity -= qty
        newMovement.reason = reason

        // Atualizar preço se informado
        if (newPrice.trim()) {
          const parsedPrice = parseFloat(newPrice.replace(',', '.'))
          if (!isNaN(parsedPrice) && parsedPrice > 0) {
            updateProduct(product.id, {
              quantity: newQuantity,
              unitPrice: parsedPrice,
              movements: [...product.movements, newMovement]
            })
            showToast('Baixa registrada com sucesso', 'success')
            closeModal()
            return
          }
        }
        break
    }

    updateProduct(product.id, {
      quantity: newQuantity,
      movements: [...product.movements, newMovement]
    })

    showToast(
      activeModal === 'entrada' 
        ? 'Entrada registrada com sucesso' 
        : activeModal === 'venda'
          ? 'Venda realizada com sucesso'
          : 'Baixa registrada com sucesso',
      'success'
    )

    closeModal()
  }

  const closeModal = () => {
    setActiveModal(null)
    setQuantity('')
    setReason('')
    setNewPrice('')
    setError('')
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entrada': return 'Entrada'
      case 'venda': return 'Venda'
      case 'baixa': return 'Baixa'
      default: return type
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entrada': return 'text-green'
      case 'venda': return 'text-primary'
      case 'baixa': return 'text-red'
      default: return 'text-foreground'
    }
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden card-glow transition-all duration-200">
        {/* Header */}
        <div className="p-4 lg:p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{product.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(product.unitPrice)} / unidade
                </p>
              </div>
            </div>
            {isLowStock && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red/10 text-red">
                Estoque Baixo
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Quantidade</p>
              <p className={`text-xl font-bold ${isLowStock ? 'text-red' : 'text-foreground'}`}>
                {product.quantity}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveModal('entrada')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-green/30 text-green text-sm font-medium hover:bg-green/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Entrada
            </button>
            <button
              onClick={() => setActiveModal('venda')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Venda
            </button>
            <button
              onClick={() => setActiveModal('baixa')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red/30 text-red text-sm font-medium hover:bg-red/10 transition-colors"
            >
              <Minus className="w-4 h-4" />
              Baixa
            </button>
          </div>
        </div>

        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          {showHistory ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ocultar Histórico
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver Histórico ({product.movements.length})
            </>
          )}
        </button>

        {/* History */}
        {showHistory && (
          <div className="border-t border-border max-h-60 overflow-y-auto">
            {product.movements.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground text-sm">
                Nenhuma movimentação registrada
              </p>
            ) : (
              <div className="divide-y divide-border">
                {[...product.movements].reverse().map((mov) => (
                  <div key={mov.id} className="p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${getMovementColor(mov.type)}`}>
                        {getMovementLabel(mov.type)} — {mov.quantity} unidades
                      </span>
                      {mov.value && (
                        <span className="text-primary font-medium">
                          {formatCurrency(mov.value)}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {formatDate(mov.date)}
                      {mov.reason && ` — Motivo: ${mov.reason}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative bg-card border border-border rounded-xl max-w-sm w-full mx-4 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-serif font-bold text-foreground mb-4">
                {activeModal === 'entrada' && 'Entrada de Estoque'}
                {activeModal === 'venda' && 'Retirada por Venda'}
                {activeModal === 'baixa' && 'Baixa de Estoque'}
              </h3>

              <div className="space-y-4">
                {/* Current Stock Info */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">Estoque atual</p>
                  <p className="font-bold text-foreground">{product.quantity} unidades</p>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                </div>

                {/* Reason (for baixa only) */}
                {activeModal === 'baixa' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Motivo
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ex: Produto vencido"
                      className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}

                {/* New Price (for baixa only) */}
                {activeModal === 'baixa' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Atualizar Valor Unitário <span className="text-muted-foreground font-normal">(opcional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                      <input
                        type="text"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder={product.unitPrice.toFixed(2).replace('.', ',')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Valor atual: {formatCurrency(product.unitPrice)}</p>
                  </div>
                )}

                {/* Sale Preview */}
                {activeModal === 'venda' && quantity && parseInt(quantity) > 0 && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm text-muted-foreground">Valor da venda</p>
                    <p className="font-bold text-primary">
                      {formatCurrency(parseInt(quantity) * product.unitPrice)}
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red/10 border border-red/20">
                    <AlertTriangle className="w-5 h-5 text-red flex-shrink-0" />
                    <span className="text-red text-sm">{error}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAction}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                      activeModal === 'entrada'
                        ? 'bg-green text-white hover:bg-green/90'
                        : activeModal === 'venda'
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-red text-white hover:bg-red/90'
                    }`}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
