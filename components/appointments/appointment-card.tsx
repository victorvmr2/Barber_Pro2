'use client'

import { useState } from 'react'
import { Phone, Clock, User, CreditCard, Edit, X, Trash2, CheckCircle, Play } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useToast } from '@/components/ui/toast-provider'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SERVICES, BARBERS, Appointment, AppointmentStatus } from '@/lib/types'

interface AppointmentCardProps {
  appointment: Appointment
  onEdit: () => void
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bgColor: string }> = {
  'aguardando': { label: 'Aguardando', color: 'text-primary', bgColor: 'bg-primary/10' },
  'em-atendimento': { label: 'Em Atendimento', color: 'text-amber', bgColor: 'bg-amber/10' },
  'concluido': { label: 'Concluído', color: 'text-green', bgColor: 'bg-green/10' },
  'cancelado': { label: 'Cancelado', color: 'text-red', bgColor: 'bg-red/10' },
}

export function AppointmentCard({ appointment, onEdit }: AppointmentCardProps) {
  const { 
    updateAppointment, 
    deleteAppointment,
    addTransaction,
    saldoDisponivel,
    saldoPendente,
    setSaldoDisponivel,
    setSaldoPendente
  } = useApp()
  const { showToast } = useToast()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const service = SERVICES.find(s => s.id === appointment.serviceId)
  const barber = BARBERS.find(b => b.id === appointment.barberId)
  const status = statusConfig[appointment.status]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    })
  }

  const handleAdvanceStatus = () => {
    if (appointment.status === 'aguardando') {
      updateAppointment(appointment.id, { status: 'em-atendimento' })
      showToast('Atendimento iniciado', 'success')
    } else if (appointment.status === 'em-atendimento') {
      updateAppointment(appointment.id, { status: 'concluido' })
      showToast('Atendimento concluído', 'success')
    }
  }

  const handleConfirmPayment = () => {
    // Move from pending to available
    setSaldoPendente(saldoPendente - appointment.value)
    setSaldoDisponivel(saldoDisponivel + appointment.value)
    
    addTransaction({
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      description: `Pagamento confirmado — ${appointment.clientName} — ${service?.name}`,
      type: 'entrada',
      value: appointment.value,
    })

    updateAppointment(appointment.id, { paymentConfirmed: true })
    showToast('Pagamento confirmado', 'success')
  }

  const handleCancel = () => {
    // Handle refund logic
    if (appointment.paymentMethod === 'pix') {
      // Deduct from saldoDisponivel
      setSaldoDisponivel(saldoDisponivel - appointment.value)
      addTransaction({
        id: Math.random().toString(36).substring(7),
        date: new Date().toISOString(),
        description: `Estorno — ${appointment.clientName}`,
        type: 'saida',
        value: appointment.value,
      })
    } else if (!appointment.paymentConfirmed) {
      // Remove from pending
      setSaldoPendente(saldoPendente - appointment.value)
    }

    updateAppointment(appointment.id, { status: 'cancelado' })
    setShowCancelDialog(false)
    showToast('Agendamento cancelado', 'success')
  }

  const handleDelete = () => {
    deleteAppointment(appointment.id)
    setShowDeleteDialog(false)
    showToast('Agendamento excluído', 'success')
  }

  const canEdit = appointment.status === 'aguardando'
  const canCancel = appointment.status === 'aguardando'
  const canDelete = appointment.status === 'cancelado'
  const showPaymentConfirm = appointment.status === 'concluido' && 
    !appointment.paymentConfirmed && 
    (appointment.paymentMethod === 'cartao' || appointment.paymentMethod === 'dinheiro' || appointment.paymentMethod === 'pix-salao')

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4 lg:p-6 card-glow transition-all duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-lg font-semibold text-foreground">{appointment.clientName}</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                {status.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {appointment.clientPhone}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {barber?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatDate(appointment.date)} às {appointment.time}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span className="text-foreground font-medium">{service?.name}</span>
              {appointment.extraServices && appointment.extraServices.length > 0 && (
                <span className="text-muted-foreground text-sm">
                  + {appointment.extraServices.length} serviço(s) extra(s)
                </span>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{appointment.duration} min</span>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                {appointment.paymentMethod === 'pix' ? 'Pix' : 
                 appointment.paymentMethod === 'pix-salao' ? 'Pix no Salão' :
                 appointment.paymentMethod === 'cartao' ? 'Cartão' : 'Dinheiro'}
              </span>
            </div>
          </div>

          {/* Value & Actions */}
          <div className="flex flex-col items-end gap-3">
            <span className="text-xl font-bold text-primary">
              {formatCurrency(appointment.value)}
            </span>

            <div className="flex items-center gap-2">
              {/* Status advance button */}
              {(appointment.status === 'aguardando' || appointment.status === 'em-atendimento') && (
                <button
                  onClick={handleAdvanceStatus}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {appointment.status === 'aguardando' ? (
                    <>
                      <Play className="w-4 h-4" />
                      Iniciar
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Concluir
                    </>
                  )}
                </button>
              )}

              {/* Payment confirmation button */}
              {showPaymentConfirm && (
                <button
                  onClick={handleConfirmPayment}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green text-white text-sm font-medium hover:bg-green/90 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Pagamento
                </button>
              )}

              {/* Edit button */}
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {/* Cancel button */}
              {canCancel && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red hover:bg-red/10 hover:border-red/30 transition-colors"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Delete button */}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red hover:bg-red/10 hover:border-red/30 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancelar Agendamento"
        message={`Tem certeza que deseja cancelar o agendamento de ${appointment.clientName}? ${
          appointment.paymentMethod === 'pix' 
            ? 'O valor será estornado do saldo disponível.' 
            : !appointment.paymentConfirmed 
              ? 'O valor será removido do saldo pendente.'
              : ''
        }`}
        confirmLabel="Cancelar Agendamento"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir permanentemente o agendamento de ${appointment.clientName}?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  )
}
