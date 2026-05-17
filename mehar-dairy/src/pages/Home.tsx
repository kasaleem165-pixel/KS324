import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Heart, Stethoscope, Leaf, ArrowRight, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Animal } from '@/types/database'
import { siteConfig, getWhatsAppUrl } from '@/config/site'
import { AnimalCard } from '@/components/ui/AnimalCard'
import { Button } from '@/components/ui/Button'

const HERO_IMG =
  'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1600&q=85&auto=format&fit=crop'

const valueProps = [
  {
    icon: Heart,
    title: 'Hand-Raised with Love',
    desc: 'Every animal is individually cared for from birth, ensuring exceptional health and temperament.',
  },
  {
    icon: Stethoscope,
    title: 'Vet-Checked & Certified',
    desc: 'All animals undergo thorough veterinary inspections and are certified healthy before listing.',
  },
  {
    icon: Leaf,
    title: 'Natural Diet & Clean Pastures',
    desc: 'Fed on natural feed with access to open pastures — no growth hormones, no shortcuts.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Since Years',
    desc: 'Hundreds of satisfied families choose Mehar Dairy for Qurbani every year. Your trust is our pride.',
  },
]

export function Home() {
  const [featured, setFeatured] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('animals')
      .select('*')
      .eq('featured', true)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setFeatured(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/40 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-3.5 h-3.5 text-gold-300" />
              <span className="text-gold-200 text-sm font-medium">Qurbani 2026 — Booking Open</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
              Premium Animals<br />
              <span className="text-gold-400">for Qurbani</span>
            </h1>
            <p className="font-urdu text-2xl text-gold-200 mb-6">
              {siteConfig.nameUrdu}
            </p>
            <p className="text-primary-100 text-lg leading-relaxed mb-8 max-w-lg">
              Ethically raised, vet-certified cattle and small animals for Eid ul-Adha 2026.
              Hand-picked for your peace of mind.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/animals">
                <Button variant="gold" size="lg" className="font-semibold">
                  Browse Animals
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a
                href={getWhatsAppUrl('Assalamu Alaikum! I am interested in Qurbani animals for 2026.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 font-semibold"
                >
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-0.5 h-8 bg-white/40 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>
      </section>

      {/* Value props */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-primary-900 mb-3">
              Why Choose Mehar Dairy?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              We uphold the highest standards of animal care so your Qurbani is accepted with confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((vp) => (
              <div key={vp.title} className="text-center group">
                <div className="w-16 h-16 rounded-2xl green-gradient flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <vp.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold text-primary-900 mb-2">
                  {vp.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{vp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured animals */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="font-display text-4xl font-bold text-primary-900 mb-2">
                Featured Animals
              </h2>
              <p className="text-gray-500">Hand-picked premium selection for Qurbani 2026</p>
            </div>
            <Link to="/animals">
              <Button variant="outline" className="shrink-0">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">Featured animals coming soon. Check back shortly!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((a) => (
                <AnimalCard key={a.id} animal={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 green-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to Book Your Qurbani Animal?
          </h2>
          <p className="text-primary-200 text-lg mb-8 max-w-xl mx-auto">
            Contact us today to reserve your animal before it's taken. Limited stock available for Eid ul-Adha 2026.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/animals">
              <Button variant="gold" size="lg" className="font-semibold">
                Browse Catalog
              </Button>
            </Link>
            <a
              href={getWhatsAppUrl(`Assalamu Alaikum! I want to book a Qurbani animal for Eid 2026. Please share available animals.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-white text-primary-800 hover:bg-gray-50 font-semibold"
              >
                WhatsApp Us Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
