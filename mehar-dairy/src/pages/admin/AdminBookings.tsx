import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Booking } from '@/types/database'
import { statusColor } from '@/lib/utils'
import { getWhatsAppUrl } from '@/config/site'
import { Select } from '@/components/ui/Input'

type BookingWithAnimal = Booking & { animal_name?: string }

const STATUS_OPTIONS: Booking['status'][] = ['pending', 'contacted', 'confirmed', 'cancelled']

export function AdminBookings() {
  const [bookings, setBookings] = useState<BookingWithAnimal[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  async function loadBookings() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*, animals(name)')
      .order('created_at', { ascending: false })

    const mapped = (data ?? []).map((b: BookingWithAnimal & { animals?: { name: string } | null }) => ({
      ...b,
      animal_name: b.animals?.name ?? '—',
    }))
    setBookings(mapped)
    setLoading(false)
  }

  useEffect(() => { loadBookings() }, [])

  async function updateStatus(id: string, status: Booking['status']) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Status updated')
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    }
  }

  const displayed = filterStatus
    ? bookings.filter((b) => b.status === filterStatus)
    : bookings

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer booking requests</p>
        </div>
        <div className="w-48">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Animal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary-900">{b.customer_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{b.customer_phone}</div>
                      {b.customer_email && (
                        <div className="text-xs text-gray-400">{b.customer_email}</div>
                      )}
                      {b.message && (
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{b.message}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{b.animal_name}</td>
                    <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString('en-PK')}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value as Booking['status'])}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColor(b.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={getWhatsAppUrl(
                          `Assalamu Alaikum ${b.customer_name}! Your booking request for ${b.animal_name} has been received.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
