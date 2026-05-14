'use client'

import { useState, useMemo } from 'react'
import { Wallet, Clock, TrendingUp, TrendingDown, ChevronDown, ChevronRight, ArrowDownCircle, Filter } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useToast } from '@/components/ui/toast-provider'
import { WithdrawalModal } from '@/components/cash-flow/withdrawal-modal'
import { InjectionModal } from '@/components/cash-flow/injection-modal'

export default function FluxoDeCaixaPage() {
  const { transactions, saldoDisponivel, saldoPendente } = useApp()
  const { showToast } = useToast()
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false)
  const [isInjectionOpen, setIsInjectionOpen] = useState(false)
  const [expandedDates, setExpandedDates] = useState<string[]>([])
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, typeof transactions> = {}
    
    transactions.forEach(tx => {
      const date = tx.date.split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(tx)
    })

    // Sort by date descending
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, txs]) => ({
        date,
        transactions: txs.sort((a, b) => b.date.localeCompare(a.date)),
        total: txs.reduce((sum, tx) => sum + (tx.type === 'entrada' ? tx.value : -tx.value), 0)
      }))
  }, [transactions])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        if (filterType !== 'all' && tx.type !== filterType) return false
        
        const txDate = tx.date.split('T')[0]
        if (dateFrom && txDate < dateFrom) return false
        if (dateTo && txDate > dateTo) return false
        
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, filterType, dateFrom, dateTo])

  const toggleDate = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Fluxo de Caixa</h2>
          <p className="text-muted-foreground mt-1">
            Controle financeiro da barbearia
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsInjectionOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green text-green font-semibold hover:bg-green/10 transition-colors"
          >
            <ArrowDownCircle className="w-5 h-5 rotate-180" />
            Injeção de Caixa
          </button>
          <button
            onClick={() => setIsWithdrawalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors"
          >
            <ArrowDownCircle className="w-5 h-5" />
            Retirada de Caixa
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-card border border-border rounded-xl p-6 card-glow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Disponível</p>
              <p className="text-3xl font-bold mt-2 text-green">
                {formatCurrency(saldoDisponivel)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green/10">
              <Wallet className="w-6 h-6 text-green" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 card-glow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Pendente</p>
              <p className="text-3xl font-bold mt-2 text-amber">
                {formatCurrency(saldoPendente)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber/10">
              <Clock className="w-6 h-6 text-amber" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Revenue */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-border">
          <h3 className="text-lg font-serif font-semibold text-foreground">
            Faturamento por Dia
          </h3>
        </div>

        {transactionsByDate.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma transação registrada</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactionsByDate.map(({ date, transactions: dayTxs, total }) => (
              <div key={date}>
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedDates.includes(date) ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium text-foreground">
                      {formatDate(date + 'T12:00:00')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({dayTxs.length} transaç{dayTxs.length === 1 ? 'ão' : 'ões'})
                    </span>
                  </div>
                  <span className={`font-bold ${total >= 0 ? 'text-green' : 'text-red'}`}>
                    {total >= 0 ? '+' : ''}{formatCurrency(total)}
                  </span>
                </button>

                {expandedDates.includes(date) && (
                  <div className="bg-muted/10 border-t border-border">
                    {dayTxs.map((tx) => (
                      <div 
                        key={tx.id}
                        className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-b-0 ml-8"
                      >
                        <div className="flex items-center gap-3">
                          {tx.type === 'entrada' ? (
                            <TrendingUp className="w-4 h-4 text-green" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red" />
                          )}
                          <span className="text-foreground">{tx.description}</span>
                        </div>
                        <span className={`font-medium ${tx.type === 'entrada' ? 'text-green' : 'text-red'}`}>
                          {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Transaction History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Histórico Completo de Transações
            </h3>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'entrada' | 'saida')}
                  className="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todos</option>
                  <option value="entrada">Entradas</option>
                  <option value="saida">Saídas</option>
                </select>
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="De"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Até"
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data/Hora</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Descrição</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20">
                    <td className="p-4 text-foreground whitespace-nowrap">
                      {formatDateTime(tx.date)}
                    </td>
                    <td className="p-4 text-foreground">{tx.description}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'entrada' 
                          ? 'bg-green/10 text-green' 
                          : 'bg-red/10 text-red'
                      }`}>
                        {tx.type === 'entrada' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {tx.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-medium ${
                      tx.type === 'entrada' ? 'text-green' : 'text-red'
                    }`}>
                      {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
      />

      {/* Injection Modal */}
      <InjectionModal
        isOpen={isInjectionOpen}
        onClose={() => setIsInjectionOpen(false)}
      />
    </div>
  )
}
