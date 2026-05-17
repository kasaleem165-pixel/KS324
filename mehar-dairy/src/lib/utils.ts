import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatWeight(kg: number) {
  return `${kg} kg`
}

export function speciesLabel(species: string) {
  const map: Record<string, string> = {
    cow: 'Cow',
    bull: 'Bull',
    goat: 'Goat',
    sheep: 'Sheep',
  }
  return map[species] ?? species
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}
