'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail } from '@/lib/auth'
import { Mail, Lock, Star, ChefHat, Shield, Award } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { user, error } = await signInWithEmail(email, password)
      
      if (error) {
        setError(error.message)
      } else if (user) {
        router.push('/admin/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="modern-card-container">
        {/* Login Form Section */}
        <div className="login-form">
          <div className="header">
            <h1 className="title">login</h1>
            <p className="description">
              please enter your credentials to access the admin dashboard.SIR!!!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-600 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="input_container">
              <Mail className="icon" size={20} />
              <input
                id="email_field"
                className="input_field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
                required
              />
            </div>

            {/* Password Field */}
            <div className="input_container">
              <Lock className="icon" size={20} />
              <input
                id="password_field"
                className="input_field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              className="sign-in_btn"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'login'}</span>
            </button>
          </form>
        </div>

        {/* Testimonial Section */}
        <div className="testimonial">
          <p>
            "welcome back chefs! let see what gonna do today sir"
          </p>
          <div className="user-profile-picture">
            <ChefHat className="w-6 h-6 text-slate-600" />
          </div>
          <div className="user">
            <span className="username">Chef dashboard</span>
            <span className="occupation">Executive Chef &amp; Restaurant Manager</span>
          </div>
          

        </div>
      </div>
    </div>
  )
}
