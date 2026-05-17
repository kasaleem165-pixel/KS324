import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react'
import { siteConfig, getWhatsAppUrl } from '@/config/site'

const contactCards = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    subtitle: 'Fastest response',
    value: siteConfig.phone,
    href: getWhatsAppUrl('Assalamu Alaikum! I have a query about Qurbani animals.'),
    color: 'bg-green-500',
    external: true,
  },
  {
    icon: Phone,
    title: 'Phone Call',
    subtitle: 'Call us directly',
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone}`,
    color: 'bg-blue-500',
    external: false,
  },
  {
    icon: Mail,
    title: 'Email',
    subtitle: 'For formal inquiries',
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    color: 'bg-primary-600',
    external: false,
  },
  {
    icon: MapPin,
    title: 'Location',
    subtitle: 'Visit the farm',
    value: siteConfig.address,
    href: '#',
    color: 'bg-gold-500',
    external: false,
  },
]

export function Contact() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h1 className="font-display text-5xl font-bold text-primary-900 mb-3">
          Get in Touch
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          We're here to help you find the perfect Qurbani animal. Reach out via WhatsApp for the fastest response.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
        {contactCards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            target={card.external ? '_blank' : undefined}
            rel={card.external ? 'noopener noreferrer' : undefined}
            className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-5 shadow-sm card-hover group"
          >
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-900 mb-0.5">{card.title}</h3>
              <p className="text-xs text-gray-400 mb-1.5">{card.subtitle}</p>
              <p className="text-sm text-gray-700 font-medium">{card.value}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Hours */}
      <div className="bg-primary-50 rounded-2xl p-8 text-center">
        <Clock className="w-8 h-8 text-primary-600 mx-auto mb-3" />
        <h2 className="font-display text-2xl font-bold text-primary-900 mb-2">Business Hours</h2>
        <div className="text-gray-600 space-y-1">
          <p>Saturday – Thursday: <span className="font-semibold">8:00 AM – 8:00 PM</span></p>
          <p>Friday: <span className="font-semibold">8:00 AM – 1:00 PM, 4:00 PM – 8:00 PM</span></p>
          <p className="text-primary-600 font-medium mt-3">WhatsApp available anytime for urgent queries</p>
        </div>
      </div>
    </div>
  )
}
