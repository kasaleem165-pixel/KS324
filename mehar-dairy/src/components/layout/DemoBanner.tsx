import { IS_DEMO_MODE } from '@/lib/supabase'

export function DemoBanner() {
  if (!IS_DEMO_MODE) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs sm:text-sm text-center px-4 py-2 leading-relaxed">
      <strong>Demo Mode</strong> — Running with sample data. No account needed.
      &nbsp;Admin login: <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">admin@demo.com</code>
      &nbsp;/&nbsp;
      <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">admin123</code>
    </div>
  )
}
