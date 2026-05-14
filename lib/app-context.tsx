'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Appointment, Transaction, Product } from './types'

interface AppState {
  appointments: Appointment[]
  transactions: Transaction[]
  saldoDisponivel: number
  saldoPendente: number
  products: Product[]
  isAuthenticated: boolean
}

interface AppContextType extends AppState {
  setAppointments: (appointments: Appointment[]) => void
  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, updates: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void
  addTransaction: (transaction: Transaction) => void
  setSaldoDisponivel: (value: number) => void
  setSaldoPendente: (value: number) => void
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AppContext = createContext<AppContextType | null>(null)

const STORAGE_KEY = 'barber-pro-state'

// Helper function to generate default data (called only on client)
function generateDefaultData() {
  const today = new Date()
  const formatDate = (daysOffset: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() + daysOffset)
    return d.toISOString().split('T')[0]
  }
  const formatDateTime = (daysOffset: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() + daysOffset)
    return d.toISOString()
  }

  const appointments: Appointment[] = [
    // Hoje
    {
      id: 'apt1',
      clientName: 'Ricardo Silva',
      clientPhone: '11987654321',
      serviceId: 'corte-classico',
      barberId: 'joao',
      date: formatDate(0),
      time: '09:00',
      paymentMethod: 'pix',
      status: 'concluido',
      value: 45,
      duration: 30,
      paymentConfirmed: true,
    },
    {
      id: 'apt2',
      clientName: 'Fernando Costa',
      clientPhone: '11976543210',
      serviceId: 'corte-barba',
      barberId: 'carlos',
      date: formatDate(0),
      time: '10:00',
      paymentMethod: 'cartao',
      status: 'em-atendimento',
      value: 70,
      duration: 60,
      paymentConfirmed: false,
    },
    {
      id: 'apt3',
      clientName: 'Lucas Mendes',
      clientPhone: '11965432109',
      serviceId: 'barba-completa',
      barberId: 'ana',
      date: formatDate(0),
      time: '11:00',
      paymentMethod: 'dinheiro',
      status: 'aguardando',
      value: 35,
      duration: 30,
      paymentConfirmed: false,
    },
    {
      id: 'apt4',
      clientName: 'Pedro Almeida',
      clientPhone: '11954321098',
      serviceId: 'pigmentacao',
      barberId: 'joao',
      date: formatDate(0),
      time: '14:00',
      paymentMethod: 'pix',
      status: 'aguardando',
      value: 80,
      duration: 60,
      paymentConfirmed: false,
    },
    // Amanha
    {
      id: 'apt5',
      clientName: 'Gabriel Santos',
      clientPhone: '11943210987',
      serviceId: 'corte-classico',
      barberId: 'fernanda',
      date: formatDate(1),
      time: '09:30',
      paymentMethod: 'cartao',
      status: 'aguardando',
      value: 45,
      duration: 30,
      paymentConfirmed: false,
    },
    {
      id: 'apt6',
      clientName: 'Matheus Oliveira',
      clientPhone: '11932109876',
      serviceId: 'hidratacao',
      barberId: 'ana',
      date: formatDate(1),
      time: '11:00',
      paymentMethod: 'pix',
      status: 'aguardando',
      value: 50,
      duration: 45,
      paymentConfirmed: false,
    },
    // Ontem (concluidos)
    {
      id: 'apt7',
      clientName: 'Bruno Ferreira',
      clientPhone: '11921098765',
      serviceId: 'corte-barba',
      barberId: 'joao',
      date: formatDate(-1),
      time: '10:00',
      paymentMethod: 'dinheiro',
      status: 'concluido',
      value: 70,
      duration: 60,
      paymentConfirmed: true,
    },
    {
      id: 'apt8',
      clientName: 'Thiago Ribeiro',
      clientPhone: '11910987654',
      serviceId: 'relaxamento',
      barberId: 'carlos',
      date: formatDate(-1),
      time: '14:00',
      paymentMethod: 'pix',
      status: 'concluido',
      value: 90,
      duration: 90,
      paymentConfirmed: true,
    },
    // Cancelado
    {
      id: 'apt9',
      clientName: 'André Lima',
      clientPhone: '11909876543',
      serviceId: 'corte-classico',
      barberId: 'fernanda',
      date: formatDate(0),
      time: '16:00',
      paymentMethod: 'cartao',
      status: 'cancelado',
      value: 45,
      duration: 30,
      paymentConfirmed: false,
    },
  ]

  const transactions: Transaction[] = [
    {
      id: 'tr1',
      date: formatDate(-1),
      description: 'Corte + Barba - Bruno Ferreira (Dinheiro)',
      type: 'entrada',
      value: 70,
    },
    {
      id: 'tr2',
      date: formatDate(-1),
      description: 'Relaxamento - Thiago Ribeiro (PIX)',
      type: 'entrada',
      value: 90,
    },
    {
      id: 'tr3',
      date: formatDate(0),
      description: 'Corte Clássico - Ricardo Silva (PIX)',
      type: 'entrada',
      value: 45,
    },
    {
      id: 'tr4',
      date: formatDate(-2),
      description: 'Venda: Pomada Modeladora Matte (3 un)',
      type: 'entrada',
      value: 135,
    },
    {
      id: 'tr5',
      date: formatDate(-3),
      description: 'Retirada - Pagamento fornecedor',
      type: 'saida',
      value: 200,
    },
  ]

  const products: Product[] = [
    {
      id: '1',
      name: 'Pomada Modeladora Matte',
      unitPrice: 45.00,
      quantity: 12,
      movements: [
        { id: 'h1', type: 'entrada', quantity: 15, date: formatDateTime(-7) },
        { id: 'h2', type: 'venda', quantity: 3, date: formatDateTime(-2) },
      ]
    },
    {
      id: '2',
      name: 'Óleo para Barba Premium',
      unitPrice: 65.00,
      quantity: 8,
      movements: [
        { id: 'h3', type: 'entrada', quantity: 10, date: formatDateTime(-14) },
        { id: 'h4', type: 'venda', quantity: 2, date: formatDateTime(-5) },
      ]
    },
    {
      id: '3',
      name: 'Shampoo Anticaspa 300ml',
      unitPrice: 38.00,
      quantity: 2,
      movements: [
        { id: 'h5', type: 'entrada', quantity: 10, date: formatDateTime(-30) },
        { id: 'h6', type: 'venda', quantity: 8, date: formatDateTime(-3) },
      ]
    },
    {
      id: '4',
      name: 'Gel Fixação Forte 500g',
      unitPrice: 32.00,
      quantity: 18,
      movements: [
        { id: 'h7', type: 'entrada', quantity: 20, date: formatDateTime(-10) },
        { id: 'h8', type: 'venda', quantity: 2, date: formatDateTime(-1) },
      ]
    },
    {
      id: '5',
      name: 'Cera Capilar Black',
      unitPrice: 55.00,
      quantity: 6,
      movements: [
        { id: 'h9', type: 'entrada', quantity: 8, date: formatDateTime(-20) },
        { id: 'h10', type: 'venda', quantity: 2, date: formatDateTime(-4) },
      ]
    },
    {
      id: '6',
      name: 'Loção Pós-Barba 100ml',
      unitPrice: 42.00,
      quantity: 4,
      movements: [
        { id: 'h11', type: 'entrada', quantity: 6, date: formatDateTime(-15) },
        { id: 'h12', type: 'baixa', quantity: 2, date: formatDateTime(-6), reason: 'Produto vencido' },
      ]
    },
    {
      id: '7',
      name: 'Balm Hidratante Barba',
      unitPrice: 58.00,
      quantity: 10,
      movements: [
        { id: 'h13', type: 'entrada', quantity: 12, date: formatDateTime(-25) },
        { id: 'h14', type: 'venda', quantity: 2, date: formatDateTime(-2) },
      ]
    },
    {
      id: '8',
      name: 'Spray Brilho Capilar',
      unitPrice: 28.00,
      quantity: 0,
      movements: [
        { id: 'h15', type: 'entrada', quantity: 5, date: formatDateTime(-40) },
        { id: 'h16', type: 'venda', quantity: 5, date: formatDateTime(-8) },
      ]
    },
  ]

  return {
    appointments,
    transactions,
    saldoDisponivel: 140,
    saldoPendente: 70,
    products,
    isAuthenticated: false,
  }
}

// Empty initial state for SSR
const emptyState: AppState = {
  appointments: [],
  transactions: [],
  saldoDisponivel: 0,
  saldoPendente: 0,
  products: [],
  isAuthenticated: false,
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const defaultData = generateDefaultData()
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState({ ...defaultData, ...parsed })
      } catch {
        setState(defaultData)
      }
    } else {
      setState(defaultData)
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage on state change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isHydrated])

  const setAppointments = (appointments: Appointment[]) => {
    setState(prev => ({ ...prev, appointments }))
  }

  const addAppointment = (appointment: Appointment) => {
    setState(prev => ({
      ...prev,
      appointments: [...prev.appointments, appointment]
    }))
  }

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(apt =>
        apt.id === id ? { ...apt, ...updates } : apt
      )
    }))
  }

  const deleteAppointment = (id: string) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.filter(apt => apt.id !== id)
    }))
  }

  const addTransaction = (transaction: Transaction) => {
    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, transaction]
    }))
  }

  const setSaldoDisponivel = (value: number) => {
    setState(prev => ({ ...prev, saldoDisponivel: value }))
  }

  const setSaldoPendente = (value: number) => {
    setState(prev => ({ ...prev, saldoPendente: value }))
  }

  const setProducts = (products: Product[]) => {
    setState(prev => ({ ...prev, products }))
  }

  const addProduct = (product: Product) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products, product]
    }))
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(prod =>
        prod.id === id ? { ...prod, ...updates } : prod
      )
    }))
  }

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin') {
      setState(prev => ({ ...prev, isAuthenticated: true }))
      return true
    }
    return false
  }

  const logout = () => {
    setState(prev => ({ ...prev, isAuthenticated: false }))
  }

  if (!isHydrated) {
    return null // Prevent hydration mismatch
  }

  return (
    <AppContext.Provider value={{
      ...state,
      setAppointments,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addTransaction,
      setSaldoDisponivel,
      setSaldoPendente,
      setProducts,
      addProduct,
      updateProduct,
      login,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
