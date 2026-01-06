import React, { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import { supabase } from '../utils/supabase'

const Home = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        {!loading && user && (
          <h1>Welcome, {user.user_metadata?.name || user.email}!</h1>
        )}
        {!loading && !user && (
          <h1>Home page</h1>
        )}
        {loading && (
          <h1>Loading...</h1>
        )}
      </div>
    </div>
  );
}

export default Home