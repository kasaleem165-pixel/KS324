import { Link } from 'react-router-dom'
import { Weight, Calendar, Star } from 'lucide-react'
import type { Animal } from '@/types/database'
import { formatPrice, formatWeight, speciesLabel } from '@/lib/utils'
import { Badge } from './Badge'

interface AnimalCardProps {
  animal: Animal
}

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&q=80&auto=format&fit=crop'

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  available: 'success',
  reserved: 'warning',
  sold: 'danger',
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const img = animal.image_urls?.[0] ?? PLACEHOLDER

  return (
    <Link to={`/animals/${animal.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <img
            src={img}
            alt={animal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={statusVariant[animal.status] ?? 'default'}>
              {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
            </Badge>
            {animal.featured && (
              <Badge variant="gold" className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-primary-800/90 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
              {speciesLabel(animal.species)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display text-xl font-semibold text-primary-900 group-hover:text-primary-700 transition-colors mb-1 truncate">
            {animal.name}
          </h3>
          {animal.breed && (
            <p className="text-sm text-gray-500 mb-3">{animal.breed}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {animal.weight_kg && (
              <span className="flex items-center gap-1">
                <Weight className="w-4 h-4 text-primary-400" />
                {formatWeight(animal.weight_kg)}
              </span>
            )}
            {animal.age_months && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary-400" />
                {animal.age_months} mo
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="font-display text-2xl font-bold text-primary-800">
              {formatPrice(animal.price)}
            </span>
            <span className="text-sm text-gold-600 font-medium group-hover:text-gold-500 transition-colors">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
