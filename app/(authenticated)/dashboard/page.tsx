'use client'

import Link from 'next/link'
import { Calendar, DollarSign, Package, Clock, Wallet, CreditCard } from 'lucide-react'
import { useApp } from '@/lib/app-context'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export default function DashboardPage() {
  const { appointments, saldoDisponivel, saldoPendente } = useApp()

  // Count today's appointments
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(apt => 
    apt.date === today && apt.status !== 'cancelado'
  ).length

  const summaryCards = [
    {
      title: 'Agendamentos Hoje',
      value: todayAppointments.toString(),
      icon: Calendar,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/agendamentos',
    },
    {
      title: 'Saldo Disponível',
      value: formatCurrency(saldoDisponivel),
      valueColor: 'text-green',
      icon: Wallet,
      iconColor: 'text-green',
      bgColor: 'bg-green/10',
    },
    {
      title: 'Saldo Pendente',
      value: formatCurrency(saldoPendente),
      valueColor: 'text-amber',
      icon: Clock,
      iconColor: 'text-amber',
      bgColor: 'bg-amber/10',
    },
  ]

  const quickActions = [
    {
      href: '/agendamentos',
      title: 'Agendamentos',
      description: 'Gerenciar horários e clientes',
      icon: Calendar,
    },
    {
      href: '/fluxo-de-caixa',
      title: 'Fluxo de Caixa',
      description: 'Controle financeiro completo',
      icon: DollarSign,
    },
    {
      href: '/produtos',
      title: 'Produtos',
      description: 'Estoque e vendas',
      icon: Package,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Bom dia!</h2>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo do seu dia
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="bg-card border border-border rounded-xl p-6 card-glow transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={`text-2xl font-bold mt-2 ${card.valueColor || 'text-foreground'}`}>
                  {card.value}
                </p>
              </div>
              {card.href ? (
                <Link href={card.href} className={`p-3 rounded-lg ${card.bgColor} hover:opacity-80 transition-opacity`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </Link>
              ) : (
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-card border border-border rounded-xl p-6 card-glow transition-all duration-200 hover:border-primary/30"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Appointments Preview */}
      {todayAppointments > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Próximos Agendamentos
            </h3>
            <Link 
              href="/agendamentos" 
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {appointments
                .filter(apt => apt.date === today && apt.status !== 'cancelado')
                .sort((a, b) => a.time.localeCompare(b.time))
                .slice(0, 5)
                .map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{apt.clientName}</p>
                        <p className="text-sm text-muted-foreground">{apt.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{formatCurrency(apt.value)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
