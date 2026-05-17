export type AppRole = 'admin' | 'user'

export interface Animal {
  id: string
  name: string
  species: string
  breed: string | null
  weight_kg: number | null
  age_months: number | null
  teeth: number | null
  color: string | null
  price: number
  description: string | null
  image_urls: string[]
  status: 'available' | 'reserved' | 'sold'
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  animal_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  message: string | null
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled'
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: AppRole
}

type AnimalInsert = Omit<Animal, 'id' | 'created_at' | 'updated_at'>
type AnimalUpdate = Partial<AnimalInsert>
type BookingInsert = Omit<Booking, 'id' | 'created_at'>
type BookingUpdate = Partial<BookingInsert>

export interface Database {
  public: {
    Tables: {
      animals: {
        Row: Animal
        Insert: AnimalInsert
        Update: AnimalUpdate
        Relationships: []
      }
      bookings: {
        Row: Booking
        Insert: BookingInsert
        Update: BookingUpdate
        Relationships: []
      }
      user_roles: {
        Row: UserRole
        Insert: Omit<UserRole, 'id'>
        Update: Partial<Omit<UserRole, 'id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: AppRole }
        Returns: boolean
      }
    }
    Enums: {
      app_role: AppRole
    }
    CompositeTypes: Record<string, never>
  }
}
