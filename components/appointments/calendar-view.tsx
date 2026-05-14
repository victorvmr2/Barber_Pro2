'use client'

import { useMemo } from 'react'
import { BARBERS, SERVICES, BUSINESS_HOURS, Appointment } from '@/lib/types'

interface CalendarViewProps {
  appointments: Appointment[]
  weekDates: Date[]
  onEdit: (appointment: Appointment) => void
}

const statusColors: Record<string, string> = {
  'aguardando': 'bg-primary/20 border-primary/40 text-primary',
  'em-atendimento': 'bg-amber/20 border-amber/40 text-amber',
  'concluido': 'bg-green/20 border-green/40 text-green',
  'cancelado': 'bg-red/20 border-red/40 text-red',
}

export function CalendarView({ appointments, weekDates, onEdit }: CalendarViewProps) {
  // Generate time slots from business hours
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  // Group appointments by date and barber
  const getAppointmentsForSlot = (date: Date, barberId: string) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => 
      apt.date === dateStr && 
      apt.barberId === barberId &&
      apt.status !== 'cancelado'
    )
  }

  const formatDayHeader = (date: Date) => {
    const day = date.toLocaleDateString('pt-BR', { weekday: 'short' })
    const num = date.getDate()
    return { day, num }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-7 border-b border-border">
            <div className="p-4 bg-muted/30 border-r border-border">
              <span className="text-sm font-medium text-muted-foreground">Horário</span>
            </div>
            {weekDates.map((date, i) => {
              const { day, num } = formatDayHeader(date)
              const today = isToday(date)
              return (
                <div 
                  key={i} 
                  className={`p-4 text-center border-r border-border last:border-r-0 ${
                    today ? 'bg-primary/10' : 'bg-muted/30'
                  }`}
                >
                  <span className={`text-sm capitalize ${today ? 'text-primary' : 'text-muted-foreground'}`}>
                    {day}
                  </span>
                  <p className={`text-lg font-bold mt-1 ${today ? 'text-primary' : 'text-foreground'}`}>
                    {num}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Time Slots */}
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-7 border-b border-border last:border-b-0">
              <div className="p-4 bg-muted/10 border-r border-border flex items-start">
                <span className="text-sm font-medium text-muted-foreground">{time}</span>
              </div>
              {weekDates.map((date, i) => {
                const today = isToday(date)
                const dateAppointments = appointments.filter(apt => {
                  const dateStr = date.toISOString().split('T')[0]
                  const [aptHour] = apt.time.split(':')
                  const slotHour = time.split(':')[0]
                  return apt.date === dateStr && 
                         aptHour === slotHour && 
                         apt.status !== 'cancelado'
                })

                return (
                  <div 
                    key={i} 
                    className={`min-h-[80px] p-2 border-r border-border last:border-r-0 ${
                      today ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      {dateAppointments.map((apt) => {
                        const service = SERVICES.find(s => s.id === apt.serviceId)
                        const barber = BARBERS.find(b => b.id === apt.barberId)
                        
                        return (
                          <button
                            key={apt.id}
                            onClick={() => apt.status === 'aguardando' && onEdit(apt)}
                            className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                              statusColors[apt.status]
                            } ${apt.status === 'aguardando' ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
                          >
                            <p className="font-semibold truncate">{apt.clientName}</p>
                            <p className="opacity-80 truncate">{apt.time} - {barber?.name}</p>
                            <p className="opacity-60 truncate">{service?.name}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/10">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">Legenda:</span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-primary/40"></span>
            Aguardando
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber/40"></span>
            Em Atendimento
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green/40"></span>
            Concluído
          </span>
        </div>
      </div>
    </div>
  )
}
