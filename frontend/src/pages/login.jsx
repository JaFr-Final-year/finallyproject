import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

/**
 * Login component that handles both sign-in and sign-up functionality.
 * Uses Supabase authentication service.
 */
const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("sign in"); // Toggles between 'sign in' and 'sign up'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles the authentication process (sign-up or sign-in) based on the current state.
   * @param {Object} e - Form event object 
   */
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (state === 'sign up') {
        // Sign up logic with additional user metadata (name)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            }
          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        // Sign in logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        alert('Logged in successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Authentication Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google OAuth sign-in.
   */
  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google Auth Error:', error);
      setError(error.message);
    }
  };

  return (
    <div className='container' style={{ paddingTop: 0 }}>
      {/* Clickable logo to return to home */}
      <h1 className='logo ' onClick={() => navigate('/')}>SpaceToAd </h1>

      <div className='login-container'>
        <h2 className='login-title'>{state === 'sign up' ? 'Sign up' : 'Login'}</h2>

        <div className='login-card'>
          <p className='login-name'>{state === 'sign up' ? 'Create Your Account' : 'Login To Your Account'}</p>

          {/* Display authentication errors if any */}
          {error && <p className='error'>{error}</p>}

          <form onSubmit={handleAuth} >
            {/* Optional Name field only for Sign Up */}
            {state === 'sign up' && (
              <div className='input-container'  >
                <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}

            <div className='input-container'  >
              <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className='input-container'>
              <input
                type={showPassword ? "text" : "password"}
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Password visibility toggle */}
            <div className="show-password-container">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="show-password">Show Password</label>
            </div>

            <button className='login-button' disabled={loading}>
              {loading ? 'Processing...' : (state === 'sign up' ? 'Sign up' : 'Login')}
            </button>

            {/* Toggle between Sign In and Sign Up */}
            <p>{state === 'sign up' ? 'Already have an account? ' : "Don't have an account? "} </p>
            <span onClick={() => setState(state === 'sign up' ? 'sign in' : 'sign up')} >
              {state === 'sign up' ? 'Sign in' : 'Sign up'}
            </span>
            <br />
            <button type="button" className='google-button' onClick={handleGoogleAuth}>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" fillRule="evenodd" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.716H1.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" fillRule="evenodd" />
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H1.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" fillRule="evenodd" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 1.957 4.958L4.964 7.29C5.672 5.158 7.656 3.58 9 3.58z" fill="#EA4335" fillRule="evenodd" />
              </svg>
              {state === 'sign up' ? 'Sign up' : 'Sign in'} with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login