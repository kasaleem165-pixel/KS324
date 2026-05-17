import { useEffect, useState, useCallback } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Animal } from '@/types/database'
import { AnimalCard } from '@/components/ui/AnimalCard'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Filters {
  species: string
  minPrice: string
  maxPrice: string
  minWeight: string
  maxWeight: string
  status: string
}

const defaultFilters: Filters = {
  species: '',
  minPrice: '',
  maxPrice: '',
  minWeight: '',
  maxWeight: '',
  status: 'available',
}

export function Animals() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)

  const fetchAnimals = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('animals').select('*').order('created_at', { ascending: false })

    if (filters.species) q = q.eq('species', filters.species)
    if (filters.status) q = q.eq('status', filters.status)
    if (filters.minPrice) q = q.gte('price', Number(filters.minPrice))
    if (filters.maxPrice) q = q.lte('price', Number(filters.maxPrice))
    if (filters.minWeight) q = q.gte('weight_kg', Number(filters.minWeight))
    if (filters.maxWeight) q = q.lte('weight_kg', Number(filters.maxWeight))

    const { data } = await q
    setAnimals(data ?? [])
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchAnimals() }, [fetchAnimals])

  const displayed = animals.filter((a) =>
    search
      ? a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.breed?.toLowerCase().includes(search.toLowerCase()) ||
        a.species.toLowerCase().includes(search.toLowerCase())
      : true,
  )

  function resetFilters() {
    setFilters(defaultFilters)
    setSearch('')
  }

  const hasActiveFilters =
    filters.species || filters.minPrice || filters.maxPrice ||
    filters.minWeight || filters.maxWeight || filters.status !== 'available'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-5xl font-bold text-primary-900 mb-3">
          Qurbani Animals
        </h1>
        <p className="text-gray-500 text-lg">
          Browse our premium selection of healthy, vet-certified animals for Eid ul-Adha 2026.
        </p>
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, breed, species…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-gold-500" />
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={resetFilters} className="flex items-center gap-1.5">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Species"
            value={filters.species}
            onChange={(e) => setFilters({ ...filters, species: e.target.value })}
          >
            <option value="">All Species</option>
            <option value="cow">Cow</option>
            <option value="bull">Bull</option>
            <option value="goat">Goat</option>
            <option value="sheep">Sheep</option>
          </Select>
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </Select>
          <Input
            label="Min Price (PKR)"
            type="number"
            placeholder="e.g. 50000"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <Input
            label="Max Price (PKR)"
            type="number"
            placeholder="e.g. 500000"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
          <Input
            label="Min Weight (kg)"
            type="number"
            placeholder="e.g. 100"
            value={filters.minWeight}
            onChange={(e) => setFilters({ ...filters, minWeight: e.target.value })}
          />
          <Input
            label="Max Weight (kg)"
            type="number"
            placeholder="e.g. 500"
            value={filters.maxWeight}
            onChange={(e) => setFilters({ ...filters, maxWeight: e.target.value })}
          />
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-2xl font-display mb-2">No animals found</p>
          <p className="text-sm">Try adjusting your filters or search term.</p>
          <Button variant="ghost" onClick={resetFilters} className="mt-4">
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">
            Showing <span className="font-semibold text-primary-700">{displayed.length}</span> animals
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((a) => (
              <AnimalCard key={a.id} animal={a} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
