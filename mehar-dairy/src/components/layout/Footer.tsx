import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-1">
              {siteConfig.name}
            </h3>
            <p className="font-urdu text-gold-300 mb-4" style={{ fontSize: '1.1rem' }}>
              {siteConfig.nameUrdu}
            </p>
            <p className="text-primary-200 text-sm leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/animals', label: 'Browse Animals' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-primary-300 hover:text-gold-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={siteConfig.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-primary-300 hover:text-green-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-2.5 text-primary-300 hover:text-gold-400 transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2.5 text-primary-300 hover:text-gold-400 transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-primary-300">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                {siteConfig.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 pt-6 text-center text-primary-400 text-xs">
          © {year} {siteConfig.name}. All rights reserved. Premium Qurbani Animals — Eid ul-Adha 2026.
        </div>
      </div>
    </footer>
  )
}
