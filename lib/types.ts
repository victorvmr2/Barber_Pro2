export type AppointmentStatus = 'aguardando' | 'em-atendimento' | 'concluido' | 'cancelado'
export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro' | 'pix-salao'
export type TransactionType = 'entrada' | 'saida'

export interface Service {
  id: string
  name: string
  price: number
  duration: number // in minutes
}

export interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  serviceId: string
  barberId: string
  date: string // ISO date string
  time: string // HH:mm format
  paymentMethod: PaymentMethod
  status: AppointmentStatus
  value: number
  duration: number
  paymentConfirmed: boolean
  extraServices?: string[]
}

export interface Transaction {
  id: string
  date: string // ISO date string
  description: string
  type: TransactionType
  value: number
}

export interface Product {
  id: string
  name: string
  quantity: number
  unitPrice: number
  movements: ProductMovement[]
}

export interface ProductMovement {
  id: string
  date: string
  type: 'entrada' | 'venda' | 'baixa'
  quantity: number
  value?: number
  reason?: string
}

export const SERVICES: Service[] = [
  { id: 'corte-classico', name: 'Corte Clássico', price: 45, duration: 30 },
  { id: 'barba-completa', name: 'Barba Completa', price: 35, duration: 30 },
  { id: 'corte-barba', name: 'Corte + Barba', price: 70, duration: 60 },
  { id: 'pigmentacao', name: 'Pigmentação', price: 80, duration: 60 },
  { id: 'hidratacao', name: 'Hidratação Capilar', price: 50, duration: 45 },
  { id: 'relaxamento', name: 'Relaxamento', price: 90, duration: 90 },
]

export const BARBERS = [
  { id: 'joao', name: 'João' },
  { id: 'carlos', name: 'Carlos' },
  { id: 'ana', name: 'Ana' },
  { id: 'fernanda', name: 'Fernanda' },
]

export const BUSINESS_HOURS = {
  start: 9, // 09:00
  end: 20,  // 20:00
  days: [1, 2, 3, 4, 5, 6], // Monday to Saturday
}
