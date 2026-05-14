'use client'

import { useState, useMemo } from 'react'
import { Plus, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useToast } from '@/components/ui/toast-provider'
import { SERVICES, BARBERS, Appointment } from '@/lib/types'
import { AppointmentModal } from '@/components/appointments/appointment-modal'
import { AppointmentCard } from '@/components/appointments/appointment-card'
import { CalendarView } from '@/components/appointments/calendar-view'

export default function AgendamentosPage() {
  const { appointments } = useApp()
  const { showToast } = useToast()
  const [view, setView] = useState<'calendar' | 'list'>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAppointment(null)
  }

  const handleNewAppointment = () => {
    setEditingAppointment(null)
    setIsModalOpen(true)
  }

  // Get week dates
  const getWeekDates = (date: Date) => {
    const week = []
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday
    
    for (let i = 0; i < 6; i++) { // Mon-Sat only
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[weekDates.length - 1]
    const startMonth = start.toLocaleDateString('pt-BR', { month: 'short' })
    const endMonth = end.toLocaleDateString('pt-BR', { month: 'short' })
    
    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth} ${start.getFullYear()}`
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${start.getFullYear()}`
  }

  // Sort appointments by date and time
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })
  }, [appointments])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Agendamentos</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os horários da barbearia
          </p>
        </div>
        <button
          onClick={handleNewAppointment}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Agendamento
        </button>
      </div>

      {/* View Toggle & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              view === 'list' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              view === 'calendar' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendário
          </button>
        </div>

        {view === 'calendar' && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-foreground font-medium min-w-[200px] text-center">
              {formatWeekRange()}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="space-y-4">
          {sortedAppointments.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Nenhum agendamento</h3>
              <p className="text-muted-foreground mt-1">
                Clique em &quot;Novo Agendamento&quot; para começar
              </p>
            </div>
          ) : (
            sortedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onEdit={() => handleEdit(appointment)}
              />
            ))
          )}
        </div>
      ) : (
        <CalendarView
          appointments={appointments}
          weekDates={weekDates}
          onEdit={handleEdit}
        />
      )}

      {/* Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        appointment={editingAppointment}
      />
    </div>
  )
}
