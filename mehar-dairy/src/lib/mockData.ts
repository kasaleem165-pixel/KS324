import type { Animal, Booking } from '@/types/database'

const SAMPLE_ANIMALS: Animal[] = [
  {
    id: '1',
    name: 'Raja Sahib',
    species: 'bull',
    breed: 'Sahiwal',
    weight_kg: 420,
    age_months: 36,
    teeth: 4,
    color: 'Reddish Brown',
    price: 280000,
    description: 'Magnificent Sahiwal bull, hand-raised for 3 years on our farm. Vet-verified excellent health, calm temperament, ideal for Qurbani.',
    image_urls: ['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&q=80&auto=format&fit=crop'],
    status: 'available',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Noor Bibi',
    species: 'cow',
    breed: 'Nagri',
    weight_kg: 280,
    age_months: 24,
    teeth: 2,
    color: 'Black & White',
    price: 150000,
    description: 'Young, healthy Nagri cow. First-season Qurbani. Calm and well-fed on natural pasture fodder.',
    image_urls: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&q=80&auto=format&fit=crop'],
    status: 'available',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Bahadur Khan',
    species: 'bull',
    breed: 'Cholistani',
    weight_kg: 510,
    age_months: 48,
    teeth: 6,
    color: 'Grey & White',
    price: 380000,
    description: 'Premium Cholistani bull, heavyweight champion of our farm. Perfect for a large family or shared Qurbani.',
    image_urls: ['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&q=80&auto=format&fit=crop&crop=right'],
    status: 'available',
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Moti',
    species: 'goat',
    breed: 'Beetal',
    weight_kg: 45,
    age_months: 18,
    teeth: 4,
    color: 'Brown & Black',
    price: 35000,
    description: 'Premium Beetal goat. Fully vaccinated and vet-checked. Excellent Qurbani choice for a single household.',
    image_urls: ['https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=800&q=80&auto=format&fit=crop'],
    status: 'available',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Sufaid Pari',
    species: 'sheep',
    breed: 'Kajli',
    weight_kg: 38,
    age_months: 15,
    teeth: 2,
    color: 'White',
    price: 28000,
    description: 'Beautiful white Kajli sheep. Well-fed and healthy. Ideal for Qurbani with very calm nature.',
    image_urls: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80&auto=format&fit=crop'],
    status: 'available',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Lal Badshah',
    species: 'cow',
    breed: 'Sahiwal',
    weight_kg: 320,
    age_months: 30,
    teeth: 4,
    color: 'Deep Red',
    price: 195000,
    description: 'Pure Sahiwal bloodline, deep red coat, prime Qurbani age. One of our most sought-after animals this season.',
    image_urls: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&q=80&auto=format&fit=crop&crop=left'],
    status: 'reserved',
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    animal_id: '1',
    customer_name: 'Ahmed Raza',
    customer_phone: '+92 300 1234567',
    customer_email: 'ahmed@example.com',
    message: 'Please confirm availability for Raja Sahib.',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b2',
    animal_id: '4',
    customer_name: 'Fatima Zahra',
    customer_phone: '+92 321 9876543',
    customer_email: null,
    message: null,
    status: 'contacted',
    created_at: new Date().toISOString(),
  },
]

const STORAGE_KEY_ANIMALS = 'demo_animals'
const STORAGE_KEY_BOOKINGS = 'demo_bookings'

function loadAnimals(): Animal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ANIMALS)
    return stored ? JSON.parse(stored) : SAMPLE_ANIMALS
  } catch {
    return SAMPLE_ANIMALS
  }
}

function saveAnimals(animals: Animal[]) {
  localStorage.setItem(STORAGE_KEY_ANIMALS, JSON.stringify(animals))
}

function loadBookings(): Booking[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BOOKINGS)
    return stored ? JSON.parse(stored) : SAMPLE_BOOKINGS
  } catch {
    return SAMPLE_BOOKINGS
  }
}

function saveBookings(bookings: Booking[]) {
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings))
}

export const mockStore = {
  getAnimals: loadAnimals,
  saveAnimals,
  getBookings: loadBookings,
  saveBookings,
}
