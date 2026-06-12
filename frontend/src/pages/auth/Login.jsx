import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaCheck } from 'react-icons/fa';
import smoothLogo from '../../assets/smooth_trans_logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Login failed');
        }
        return data;
      })
      .then((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.driver_profile) {
          localStorage.setItem('driver_profile', JSON.stringify(data.driver_profile));
        }

        // Redirect based on role
        const roleRedirects = {
          passenger: '/dashboard/customer',
          driver: '/dashboard/driver',
          dispatcher: '/dashboard/dispatcher',
          admin: '/dashboard/admin'
        };
        
        navigate(roleRedirects[data.user.role] || '/');
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@smooth.co.ke');
      setPassword('admin123');
    } else if (role === 'passenger') {
      setEmail('passenger@smooth.co.ke');
      setPassword('passenger123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#f5faff'
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(43, 108, 176, 0.15)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(43, 108, 176, 0.05)'
      }}>
        {/* Brand logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
          <div style={{
            background: '#2b6cb0',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#f5faff'
          }}>
            <img src={smoothLogo} alt="Logo" style={{ width: '26px', height: '26px' }} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2b6cb0', textTransform: 'uppercase' }}>Smooth Trans</span>
        </Link>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2b6cb0', marginBottom: '25px' }}>Sign In</h2>

        {error && (
          <div style={{
            background: '#f5faff',
            border: '1px solid #2b6cb0',
            color: '#2b6cb0',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'left',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(43, 108, 176, 0.25)',
                color: '#2b6cb0'
              }}
              required 
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(43, 108, 176, 0.25)',
                color: '#2b6cb0'
              }}
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#2b6cb0', textDecoration: 'none', fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', background: '#2b6cb0', color: '#f5faff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? <div className="loader-spinner" style={{ margin: '0 auto' }}></div> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(43, 108, 176, 0.6)' }}>Quick Administrator access:</div>
          <button 
            type="button" 
            onClick={() => fillCredentials('admin')}
            style={{
              background: '#f5faff',
              border: '1px solid #2b6cb0',
              color: '#2b6cb0',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Fill Admin Credentials (admin@smooth.co.ke / admin123)
          </button>
        </div>

        <div style={{ marginTop: '30px', fontSize: '0.9rem', color: 'rgba(43, 108, 176, 0.8)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2b6cb0', textDecoration: 'underline', fontWeight: 600 }}>Sign up</Link>
        </div>

        <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'rgba(43, 108, 176, 0.5)' }}>
          <a href="#" style={{ color: 'rgba(43, 108, 176, 0.5)', textDecoration: 'underline' }}>Learn user licence agreement</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
