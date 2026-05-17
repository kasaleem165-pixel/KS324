/**
 * Mock Supabase client for demo/offline use.
 * Stores data in localStorage. Auth: admin@demo.com / admin123
 */
import { mockStore } from './mockData'
import type { Animal, Booking } from '@/types/database'

type Row = Record<string, unknown>

const ADMIN_EMAIL = 'admin@demo.com'
const ADMIN_PASS = 'admin123'
const SESSION_KEY = 'demo_session'

function getSession() {
  try {
    const s = localStorage.getItem(SESSION_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

function setSession(user: Row | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  else localStorage.removeItem(SESSION_KEY)
}

const authListeners: Array<(event: string, session: unknown) => void> = []

function notify(event: string, user: Row | null) {
  const session = user ? { user } : null
  authListeners.forEach((fn) => fn(event, session))
}

// ── Query builder ────────────────────────────────────────────────
class QueryBuilder {
  private _table: string
  private _filters: Array<{ col: string; val: unknown }> = []
  private _order: { col: string; asc: boolean } | null = null
  private _limitN: number | null = null
  private _single = false
  private _select = '*'
  private _operation: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private _payload: Row | null = null

  constructor(table: string) {
    this._table = table
  }

  select(cols = '*') {
    this._select = cols
    return this
  }

  eq(col: string, val: unknown) {
    this._filters.push({ col, val })
    return this
  }

  gte(col: string, val: unknown) {
    this._filters.push({ col: `__gte_${col}`, val })
    return this
  }

  lte(col: string, val: unknown) {
    this._filters.push({ col: `__lte_${col}`, val })
    return this
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this._order = { col, asc: opts?.ascending !== false }
    return this
  }

  limit(n: number) {
    this._limitN = n
    return this
  }

  single() {
    this._single = true
    return this
  }

  insert(payload: Row) {
    this._operation = 'insert'
    this._payload = payload
    return this
  }

  update(payload: Row) {
    this._operation = 'update'
    this._payload = payload
    return this
  }

  delete() {
    this._operation = 'delete'
    return this
  }

  private applyFilters(rows: Row[]): Row[] {
    return rows.filter((row) => {
      return this._filters.every(({ col, val }) => {
        if (col.startsWith('__gte_')) return Number(row[col.slice(6)]) >= Number(val)
        if (col.startsWith('__lte_')) return Number(row[col.slice(6)]) <= Number(val)
        return row[col] === val
      })
    })
  }

  private getRows(): Row[] {
    if (this._table === 'animals') return mockStore.getAnimals() as unknown as Row[]
    if (this._table === 'bookings') {
      const bookings = mockStore.getBookings() as unknown as Row[]
      // Handle join: select('*, animals(name)')
      if (this._select.includes('animals(')) {
        const animals = mockStore.getAnimals()
        return bookings.map((b) => ({
          ...b,
          animals: animals.find((a) => a.id === b.animal_id) ? { name: animals.find((a) => a.id === b.animal_id)!.name } : null,
        }))
      }
      return bookings
    }
    return []
  }

  private saveRows(rows: Row[]) {
    if (this._table === 'animals') mockStore.saveAnimals(rows as unknown as Animal[])
    if (this._table === 'bookings') mockStore.saveBookings(rows as unknown as Booking[])
  }

  // Make it a thenable so `await query` works
  then(resolve: (val: { data: unknown; error: null }) => void) {
    const result = this._execute()
    resolve(result)
  }

  private _execute(): { data: unknown; error: null } {
    if (this._operation === 'insert') {
      const rows = this.getRows()
      const newRow = { ...this._payload!, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      rows.push(newRow)
      this.saveRows(rows)
      return { data: newRow, error: null }
    }

    if (this._operation === 'update') {
      let rows = this.getRows()
      rows = rows.map((r) => {
        const matches = this._filters.every(({ col, val }) => r[col] === val)
        if (matches) return { ...r, ...this._payload!, updated_at: new Date().toISOString() }
        return r
      })
      this.saveRows(rows)
      return { data: rows, error: null }
    }

    if (this._operation === 'delete') {
      let rows = this.getRows()
      rows = rows.filter((r) => !this._filters.every(({ col, val }) => r[col] === val))
      this.saveRows(rows)
      return { data: null, error: null }
    }

    // select
    let rows = this.getRows()
    rows = this.applyFilters(rows)

    if (this._order) {
      const { col, asc } = this._order
      rows = [...rows].sort((a, b) => {
        const av = a[col] as string
        const bv = b[col] as string
        return asc ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }

    if (this._limitN !== null) rows = rows.slice(0, this._limitN)

    if (this._single) {
      return { data: rows[0] ?? null, error: null }
    }

    return { data: rows, error: null }
  }
}

// ── Storage mock ─────────────────────────────────────────────────
function storageBucket() {
  return {
    upload: async (_path: string, file: File) => {
      // Convert to object URL for local preview
      const url = URL.createObjectURL(file)
      return { data: { path: url }, error: null, url }
    },
    getPublicUrl: (path: string) => ({
      data: { publicUrl: path.startsWith('blob:') ? path : `https://placehold.co/800x600?text=Farm+Animal` },
    }),
  }
}

// ── Auth mock ────────────────────────────────────────────────────
const mockAuth = {
  getSession: async () => {
    const user = getSession()
    return { data: { session: user ? { user } : null }, error: null }
  },
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const user = { id: 'demo-admin', email, role: 'admin' }
      setSession(user)
      notify('SIGNED_IN', user)
      return { data: { user }, error: null }
    }
    return { data: null, error: { message: 'Invalid credentials. Use admin@demo.com / admin123' } }
  },
  signUp: async ({ email }: { email: string }) => {
    return { data: null, error: { message: `Demo mode: sign up disabled. Use admin@demo.com / admin123 to log in as admin.` }, email }
  },
  signOut: async () => {
    setSession(null)
    notify('SIGNED_OUT', null)
    return { error: null }
  },
  onAuthStateChange: (fn: (event: string, session: unknown) => void) => {
    authListeners.push(fn)
    return { data: { subscription: { unsubscribe: () => { const i = authListeners.indexOf(fn); if (i > -1) authListeners.splice(i, 1) } } } }
  },
}

// ── RPC mock ─────────────────────────────────────────────────────
async function mockRpc(fn: string, args: Record<string, unknown>) {
  if (fn === 'has_role') {
    const session = getSession()
    return { data: session?.id === 'demo-admin' && args._role === 'admin', error: null }
  }
  return { data: null, error: null }
}

// ── Main mock client ─────────────────────────────────────────────
export const mockSupabase = {
  from: (table: string) => new QueryBuilder(table),
  auth: mockAuth,
  storage: { from: () => storageBucket() },
  rpc: mockRpc,
}
