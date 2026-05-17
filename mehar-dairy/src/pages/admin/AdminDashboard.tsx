import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PawPrint, ClipboardList, DollarSign, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface Stats {
  totalAnimals: number
  availableAnimals: number
  totalBookings: number
  pendingBookings: number
  totalValue: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAnimals: 0,
    availableAnimals: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalValue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const [animalsRes, bookingsRes] = await Promise.all([
        supabase.from('animals').select('price, status'),
        supabase.from('bookings').select('status'),
      ])

      const animals: Array<{ price: number; status: string }> = animalsRes.data ?? []
      const bookings: Array<{ status: string }> = bookingsRes.data ?? []

      setStats({
        totalAnimals: animals.length,
        availableAnimals: animals.filter((a) => a.status === 'available').length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b) => b.status === 'pending').length,
        totalValue: animals.filter((a) => a.status === 'available').reduce((s, a) => s + (a.price ?? 0), 0),
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  const cards = [
    {
      label: 'Total Animals',
      value: stats.totalAnimals,
      sub: `${stats.availableAnimals} available`,
      icon: PawPrint,
      color: 'bg-primary-600',
      href: '/admin/animals',
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      sub: `${stats.pendingBookings} pending`,
      icon: ClipboardList,
      color: 'bg-gold-500',
      href: '/admin/bookings',
    },
    {
      label: 'Catalog Value',
      value: formatPrice(stats.totalValue),
      sub: 'Available animals',
      icon: DollarSign,
      color: 'bg-green-600',
      href: '/admin/animals',
    },
    {
      label: 'Season',
      value: 'Eid 2026',
      sub: 'Qurbani campaign',
      icon: TrendingUp,
      color: 'bg-purple-600',
      href: '#',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-primary-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your Qurbani catalog and bookings</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Link key={card.label} to={card.href}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-display text-2xl font-bold text-primary-900">{card.value}</div>
                <div className="text-sm font-medium text-gray-700 mt-0.5">{card.label}</div>
                <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link to="/admin/animals">
          <div className="bg-primary-900 rounded-2xl p-6 text-white hover:bg-primary-800 transition-colors">
            <PawPrint className="w-6 h-6 text-gold-400 mb-3" />
            <h3 className="font-display text-xl font-semibold mb-1">Manage Animals</h3>
            <p className="text-primary-300 text-sm">Add, edit, or remove animals from the catalog</p>
          </div>
        </Link>
        <Link to="/admin/bookings">
          <div className="bg-gold-600 rounded-2xl p-6 text-white hover:bg-gold-500 transition-colors">
            <ClipboardList className="w-6 h-6 text-white mb-3" />
            <h3 className="font-display text-xl font-semibold mb-1">Manage Bookings</h3>
            <p className="text-white/80 text-sm">View and update booking status</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
