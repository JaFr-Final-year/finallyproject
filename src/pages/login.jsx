import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("sign in");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (state === 'sign up') {
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

  return (
    <div className='container'>
      <h1 className='logo ' onClick={() => navigate('/')}>SpaceToAd </h1>
      <div className='login-container'>
        <h2 className='login-title'>{state === 'sign up' ? 'Sign up' : 'Login'}</h2>
        <div className='login-card'>
          <p className='login-name'>{state === 'sign up' ? 'Create Your Account' : 'Login To Your Account'}</p>
          {error && <p className='error'>{error}</p>}
          <form onSubmit={handleAuth} >
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
            <div className="show-password-container">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="show-password">Show Password</label>
            </div>


            <button className='login-button'>{state === 'sign up' ? 'Sign up' : 'Login'}</button>
            <p>{state === 'sign up' ? 'Already have an account? ' : "Don't have an account? "} </p>
            <span onClick={() => setState(state === 'sign up' ? 'sign in' : 'sign up')} > {state === 'sign up' ? 'Sign in' : 'Sign up'}</span>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login