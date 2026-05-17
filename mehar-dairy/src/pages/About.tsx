import { Leaf, Heart, ShieldCheck, Users } from 'lucide-react'
import { siteConfig } from '@/config/site'

const FARM_IMG =
  'https://images.unsplash.com/photo-1500595046743-cd271d694e30?w=1200&q=80&auto=format&fit=crop'

const values = [
  {
    icon: Heart,
    title: 'Compassionate Care',
    desc: 'Every animal on our farm is treated with love and respect. We believe that animals raised with kindness yield better Qurbani.',
  },
  {
    icon: Leaf,
    title: 'Natural Farming',
    desc: 'Our animals graze on natural pastures and are fed clean, natural fodder — free from hormones and artificial supplements.',
  },
  {
    icon: ShieldCheck,
    title: 'Health & Safety',
    desc: 'Regular vet inspections, vaccinations, and hygienic living conditions ensure every animal is in peak health.',
  },
  {
    icon: Users,
    title: 'Community Trust',
    desc: 'We have served hundreds of families across Pakistan. Our reputation is built on honesty, quality, and timely service.',
  },
]

export function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-72 overflow-hidden">
        <img src={FARM_IMG} alt="Farm" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary-900/60" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-5xl font-bold text-white mb-2">Our Story</h1>
            <p className="font-urdu text-gold-300 text-xl">{siteConfig.nameUrdu}</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-display text-4xl font-bold text-primary-900 mb-6">
              A Farm Built on Tradition & Trust
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Mehar Dairy & Fattening Farm was founded with a single mission: to provide Pakistani families with the finest Qurbani animals — animals they can be proud to offer.
              </p>
              <p>
                Located in the fertile plains of Punjab, our farm spans acres of clean, open pastureland where our animals roam freely, breathe fresh air, and feed on natural fodder grown right on our land.
              </p>
              <p>
                Every year, we prepare our animals months in advance for Eid ul-Adha. Each animal is registered, weighed, and examined by our dedicated veterinarian. We believe a healthy animal gives the best Qurbani.
              </p>
              <p>
                We welcome families to visit the farm, meet the animals in person, and make their selection with full confidence. Your trust is our greatest reward.
              </p>
            </div>
          </div>
          <div className="bg-primary-50 rounded-2xl p-8 text-center">
            <p className="font-urdu text-xl text-primary-800 leading-loose mb-6">
              قربانی کے جانور خریدنے کا بہترین مقام — صحت مند، خوش، اور اسلامی معیار کے مطابق
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { num: '500+', label: 'Animals Sold' },
                { num: '200+', label: 'Happy Families' },
                { num: '10+', label: 'Years Experience' },
                { num: '4', label: 'Species Available' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-bold text-primary-700">{stat.num}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="font-display text-4xl font-bold text-primary-900 text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {values.map((v) => (
              <div key={v.title} className="flex gap-5">
                <div className="w-12 h-12 rounded-xl green-gradient flex items-center justify-center shrink-0">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-primary-900 mb-1">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
