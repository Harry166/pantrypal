import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/Auth.css'

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        // Create default categories for new user
        if (data.user) {
          const defaultCategories = [
            { name: 'Produce', color: '#10B981' },
            { name: 'Dairy', color: '#3B82F6' },
            { name: 'Meat', color: '#EF4444' },
            { name: 'Grains', color: '#F59E0B' },
            { name: 'Canned Goods', color: '#8B5CF6' },
            { name: 'Spices', color: '#EC4899' },
            { name: 'Snacks', color: '#F97316' },
            { name: 'Beverages', color: '#06B6D4' },
            { name: 'Other', color: '#6B7280' }
          ]
          
          const { error: categoryError } = await supabase
            .from('categories')
            .insert(
              defaultCategories.map(cat => ({
                ...cat,
                user_id: data.user.id
              }))
            )
          
          if (categoryError) console.error('Error creating default categories:', categoryError)
        }
        
        setMessage('Check your email for the confirmation link!')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsSignUp(false)} className="link-button">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsSignUp(true)} className="link-button">
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth
