import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function SupabaseExample() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithEmail() {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: 'your-email@example.com',
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      if (error) throw error
      alert('Check your email for the login link!')
    } catch (error) {
      alert(error.message)
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Supabase Auth Example</h2>
      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          <button onClick={signInWithEmail}>Sign In with Email</button>
        </div>
      )}
    </div>
  )
}

export default SupabaseExample
