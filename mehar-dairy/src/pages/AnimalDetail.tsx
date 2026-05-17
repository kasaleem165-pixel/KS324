import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Weight, Calendar, Dna, Palette, Award, MessageCircle, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import type { Animal } from '@/types/database'
import { formatPrice, formatWeight, speciesLabel } from '@/lib/utils'
import { getWhatsAppUrl, siteConfig } from '@/config/site'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Textarea } from '@/components/ui/Input'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&q=80&auto=format&fit=crop'

const bookingSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  customer_phone: z.string().min(10, 'Valid phone number required'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  message: z.string().optional(),
})

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  available: 'success',
  reserved: 'warning',
  sold: 'danger',
}

export function AnimalDetail() {
  const { id } = useParams<{ id: string }>()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('animals').select('*').eq('id', id).single().then(({ data }: { data: Animal | null }) => {
      setAnimal(data)
      setLoading(false)
    })
  }, [id])

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    const result = bookingSchema.safeParse(form)
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[String(issue.path[0])] = issue.message
      })
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    const { error } = await supabase.from('bookings').insert({
      animal_id: id!,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email || null,
      message: form.message || null,
    })
    setSubmitting(false)
    if (error) {
      toast.error('Failed to submit booking. Please try WhatsApp.')
    } else {
      toast.success('Booking request submitted! We will contact you shortly.')
      setForm({ customer_name: '', customer_phone: '', customer_email: '', message: '' })
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-display text-gray-500 mb-4">Animal not found</p>
        <Link to="/animals"><Button>Back to Catalog</Button></Link>
      </div>
    )
  }

  const images = animal.image_urls?.length ? animal.image_urls : [PLACEHOLDER]

  const whatsappMsg = `Assalamu Alaikum! I am interested in "${animal.name}" (ID: ${animal.id.slice(0, 8)}). Price: ${formatPrice(animal.price)}. Please confirm availability.`

  const specs = [
    { icon: Dna, label: 'Breed', value: animal.breed },
    { icon: Weight, label: 'Weight', value: animal.weight_kg ? formatWeight(animal.weight_kg) : null },
    { icon: Calendar, label: 'Age', value: animal.age_months ? `${animal.age_months} months` : null },
    { icon: Award, label: 'Teeth', value: animal.teeth ? `${animal.teeth} teeth` : null },
    { icon: Palette, label: 'Color', value: animal.color },
  ].filter((s) => s.value)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/animals"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-700 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3">
            <img
              src={images[activeImg]}
              alt={animal.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-none w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImg ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                {speciesLabel(animal.species)}
              </span>
              <h1 className="font-display text-4xl font-bold text-primary-900">{animal.name}</h1>
            </div>
            <Badge variant={statusVariant[animal.status] ?? 'default'} className="mt-1">
              {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
            </Badge>
          </div>

          <p className="font-display text-4xl font-bold text-primary-700 mb-6">
            {formatPrice(animal.price)}
          </p>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <spec.icon className="w-5 h-5 text-primary-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">{spec.label}</p>
                    <p className="text-sm font-semibold text-primary-900">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {animal.description && (
            <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed">
              <p>{animal.description}</p>
            </div>
          )}

          {/* WhatsApp CTA */}
          <a
            href={getWhatsAppUrl(whatsappMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-semibold text-white mb-3 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
          <a href={`tel:${siteConfig.phone}`} className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl border-2 border-primary-700 text-primary-700 font-semibold hover:bg-primary-50 transition-colors">
            <Phone className="w-5 h-5" />
            Call {siteConfig.phone}
          </a>
        </div>
      </div>

      {/* Booking form */}
      {animal.status === 'available' && (
        <div className="mt-14 max-w-xl">
          <h2 className="font-display text-3xl font-bold text-primary-900 mb-2">
            Request a Booking
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Fill in your details and we will contact you to confirm.
          </p>
          <form onSubmit={handleBooking} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <Input
              id="name"
              label="Full Name *"
              placeholder="Your name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              error={errors.customer_name}
            />
            <Input
              id="phone"
              label="Phone / WhatsApp *"
              placeholder="+92 3XX XXXXXXX"
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              error={errors.customer_phone}
            />
            <Input
              id="email"
              label="Email (optional)"
              type="email"
              placeholder="you@example.com"
              value={form.customer_email}
              onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              error={errors.customer_email}
            />
            <Textarea
              id="message"
              label="Message (optional)"
              placeholder="Any questions or special requirements…"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <Button type="submit" variant="gold" size="lg" loading={submitting} className="w-full">
              Submit Booking Request
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
