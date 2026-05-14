'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useToast } from '@/components/ui/toast-provider'
import { SERVICES, BARBERS, BUSINESS_HOURS, Appointment, PaymentMethod } from '@/lib/types'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment?: Appointment | null
}

export function AppointmentModal({ isOpen, onClose, appointment }: AppointmentModalProps) {
  const { 
    appointments, 
    addAppointment, 
    updateAppointment,
    addTransaction,
    saldoDisponivel,
    saldoPendente,
    setSaldoDisponivel,
    setSaldoPendente
  } = useApp()
  const { showToast } = useToast()

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [barberId, setBarberId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [extraServiceIds, setExtraServiceIds] = useState<string[]>([])

  // Calculate total value and duration
  const { totalValue, totalDuration } = useMemo(() => {
    let value = 0
    let duration = 0

    const mainService = SERVICES.find(s => s.id === serviceId)
    if (mainService) {
      value += mainService.price
      duration += mainService.duration
    }

    extraServiceIds.forEach(id => {
      const service = SERVICES.find(s => s.id === id)
      if (service) {
        value += service.price
        duration += service.duration
      }
    })

    return { totalValue: value, totalDuration: duration }
  }, [serviceId, extraServiceIds])

  // Check if barber is available
  const checkAvailability = (selectedDate: string, selectedTime: string, selectedBarber: string, duration: number, excludeId?: string) => {
    if (!selectedDate || !selectedTime || !selectedBarber) return { available: true, message: '' }

    const [hours, minutes] = selectedTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration

    // Check business hours
    const dayOfWeek = new Date(selectedDate + 'T12:00:00').getDay()
    if (!BUSINESS_HOURS.days.includes(dayOfWeek)) {
      return { available: false, message: 'A barbearia não funciona aos domingos' }
    }

    if (hours < BUSINESS_HOURS.start || endMinutes > BUSINESS_HOURS.end * 60) {
      return { available: false, message: `Horário fora do expediente (${BUSINESS_HOURS.start}:00 - ${BUSINESS_HOURS.end}:00)` }
    }

    // Check for conflicts with other appointments
    const conflictingAppointment = appointments.find(apt => {
      if (apt.id === excludeId) return false
      if (apt.date !== selectedDate) return false
      if (apt.barberId !== selectedBarber) return false
      if (apt.status === 'cancelado') return false

      const [aptHours, aptMinutes] = apt.time.split(':').map(Number)
      const aptStartMinutes = aptHours * 60 + aptMinutes
      const aptEndMinutes = aptStartMinutes + apt.duration

      // Check for overlap
      return (startMinutes < aptEndMinutes && endMinutes > aptStartMinutes)
    })

    if (conflictingAppointment) {
      return { available: false, message: 'Barbeiro indisponível neste horário' }
    }

    return { available: true, message: '' }
  }

  const availability = useMemo(() => {
    return checkAvailability(date, time, barberId, totalDuration, appointment?.id)
  }, [date, time, barberId, totalDuration, appointment?.id, appointments])

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Check if the slot would end within business hours
        const slotEndMinutes = hour * 60 + minute + totalDuration
        if (slotEndMinutes <= BUSINESS_HOURS.end * 60) {
          slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
        }
      }
    }
    return slots
  }, [totalDuration])

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        setClientName(appointment.clientName)
        setClientPhone(appointment.clientPhone)
        setServiceId(appointment.serviceId)
        setBarberId(appointment.barberId)
        setDate(appointment.date)
        setTime(appointment.time)
        setPaymentMethod(appointment.paymentMethod)
        setExtraServiceIds(appointment.extraServices || [])
      } else {
        setClientName('')
        setClientPhone('')
        setServiceId('')
        setBarberId('')
        setDate('')
        setTime('')
        setPaymentMethod('pix')
        setExtraServiceIds([])
      }
    }
  }, [isOpen, appointment])

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!availability.available) {
      showToast(availability.message, 'error')
      return
    }

    const service = SERVICES.find(s => s.id === serviceId)
    if (!service) return

    if (appointment) {
      // Editing existing appointment
      const oldValue = appointment.value

      // If payment was cartao/dinheiro and value changed, update saldoPendente
      if (appointment.paymentMethod === 'cartao' || appointment.paymentMethod === 'dinheiro') {
        if (!appointment.paymentConfirmed) {
          setSaldoPendente(saldoPendente - oldValue + totalValue)
        }
      }

      updateAppointment(appointment.id, {
        clientName,
        clientPhone,
        serviceId,
        barberId,
        date,
        time,
        value: totalValue,
        duration: totalDuration,
        extraServices: extraServiceIds,
      })
      showToast('Agendamento atualizado com sucesso', 'success')
    } else {
      // Creating new appointment
      const newAppointment: Appointment = {
        id: Math.random().toString(36).substring(7),
        clientName,
        clientPhone,
        serviceId,
        barberId,
        date,
        time,
        paymentMethod,
        status: 'aguardando',
        value: totalValue,
        duration: totalDuration,
        paymentConfirmed: paymentMethod === 'pix',
        extraServices: extraServiceIds,
      }

      addAppointment(newAppointment)

      // Handle payment
      if (paymentMethod === 'pix') {
        setSaldoDisponivel(saldoDisponivel + totalValue)
        addTransaction({
          id: Math.random().toString(36).substring(7),
          date: new Date().toISOString(),
          description: `Agendamento — ${clientName} — ${service.name}`,
          type: 'entrada',
          value: totalValue,
        })
      } else {
        // cartao, dinheiro e pix-salao vão para pendente
        setSaldoPendente(saldoPendente + totalValue)
      }

      showToast('Agendamento criado com sucesso', 'success')
    }

    onClose()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl max-w-lg w-full mx-4 shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-serif font-bold text-foreground">
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome completo"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Telefone
              </label>
              <input
                type="text"
                inputMode="tel"
                value={clientPhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 11) {
                    setClientPhone(value)
                  }
                }}
                placeholder="11999999999"
                maxLength={11}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Serviço Principal
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Selecione um serviço</option>
              {SERVICES.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {formatCurrency(service.price)} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Extra Services */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Serviços Extras (opcional)
            </label>
            <div className="space-y-2">
              {SERVICES.filter(s => s.id !== serviceId).map((service) => (
                <label key={service.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extraServiceIds.includes(service.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setExtraServiceIds([...extraServiceIds, service.id])
                      } else {
                        setExtraServiceIds(extraServiceIds.filter(id => id !== service.id))
                      }
                    }}
                    className="w-4 h-4 rounded border-border bg-muted text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">{service.name}</span>
                  <span className="text-muted-foreground text-sm ml-auto">
                    +{formatCurrency(service.price)} ({service.duration} min)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Barber */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Barbeiro
            </label>
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Selecione um barbeiro</option>
              {BARBERS.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Data
              </label>
              <input
                type="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Horário
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Selecione um horário</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability Warning */}
          {!availability.available && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red/10 border border-red/20">
              <AlertTriangle className="w-5 h-5 text-red flex-shrink-0" />
              <span className="text-red text-sm">{availability.message}</span>
            </div>
          )}

          {/* Payment Method - only for new appointments */}
          {!appointment && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['pix', 'pix-salao', 'cartao', 'dinheiro'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-2.5 rounded-lg border transition-colors ${
                      paymentMethod === method
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {method === 'pix' ? 'Pix' : method === 'pix-salao' ? 'Pix no Salão' : method === 'cartao' ? 'Cartão' : 'Dinheiro'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Duração Total:</span>
              <span className="font-medium text-foreground">{totalDuration} min</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(totalValue)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!availability.available}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {appointment ? 'Salvar' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
