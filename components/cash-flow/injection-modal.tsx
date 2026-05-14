'use client'

import { useState } from 'react'
import { X, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useToast } from '@/components/ui/toast-provider'

interface InjectionModalProps {
  isOpen: boolean
  onClose: () => void
}

const INJECTION_PASSWORD = '132652'

export function InjectionModal({ isOpen, onClose }: InjectionModalProps) {
  const { saldoDisponivel, setSaldoDisponivel, addTransaction } = useApp()
  const { showToast } = useToast()

  const [motivo, setMotivo] = useState('')
  const [valor, setValor] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'password'>('form')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const valorNum = parseFloat(valor.replace(',', '.'))

    if (isNaN(valorNum) || valorNum <= 0) {
      setError('Digite um valor válido')
      return
    }

    if (!motivo.trim()) {
      setError('Digite o motivo da injeção')
      return
    }

    setStep('password')
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== INJECTION_PASSWORD) {
      setError('Senha incorreta')
      return
    }

    const valorNum = parseFloat(valor.replace(',', '.'))

    setSaldoDisponivel(saldoDisponivel + valorNum)

    addTransaction({
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      description: `Injeção de Caixa — ${motivo}`,
      type: 'entrada',
      value: valorNum,
    })

    showToast('Injeção realizada com sucesso', 'success')
    handleClose()
  }

  const handleClose = () => {
    setMotivo('')
    setValor('')
    setPassword('')
    setError('')
    setStep('form')
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
            Injeção de Caixa
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleContinue} className="p-6 space-y-4">
            {/* Available Balance Info */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">Saldo Disponível Atual</p>
              <p className="text-2xl font-bold text-green">{formatCurrency(saldoDisponivel)}</p>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Motivo
              </label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Aporte inicial, reposição de caixa"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <input
                  type="text"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

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
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Continuar
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="p-6 space-y-4">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motivo:</span>
                <span className="text-foreground font-medium">{motivo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="text-green font-bold">
                  +{formatCurrency(parseFloat(valor.replace(',', '.')))}
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Senha do Responsável
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

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
                onClick={() => setStep('form')}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg bg-green text-white font-semibold hover:bg-green/90 transition-colors"
              >
                Confirmar Injeção
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
