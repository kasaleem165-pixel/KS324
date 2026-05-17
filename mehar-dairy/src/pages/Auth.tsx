import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/config/site'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Logged in successfully!')
        navigate('/admin')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created! Please check your email to confirm, then contact admin to grant you admin role.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-primary-900 mb-1">
            Admin Portal
          </h1>
          <p className="text-gray-500 text-sm">{siteConfig.name}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {mode === 'signup' && (
            <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
              After signing up, an existing admin must grant you admin access via:
              <br />
              <code className="text-primary-600 font-mono text-xs">INSERT INTO user_roles (user_id, role) VALUES ('uid', 'admin');</code>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
