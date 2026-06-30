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
      setPassword('password123');
    } else if (role === 'passenger') {
      setEmail('alex@gmail.com');
      setPassword('password123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-main)'
    }}>
      <div style={{
        background: 'var(--bg-surface-solid)',
        border: '1px solid var(--border-light)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Brand logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
          <div style={{
            background: 'var(--primary-blue)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ffffff'
          }}>
            <img src={smoothLogo} alt="Logo" style={{ width: '26px', height: '26px' }} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase' }}>Smooth Trans</span>
        </Link>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '25px' }}>Sign In</h2>

        {error && (
          <div style={{
            background: 'var(--bg-danger-hover)',
            border: '1px solid var(--accent-rose)',
            color: 'var(--accent-rose)',
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
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? <div className="loader-spinner" style={{ margin: '0 auto' }}></div> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quick access shortcuts:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => fillCredentials('passenger')}
              style={{
                background: 'var(--bg-active-link)',
                border: '1px solid var(--primary-blue)',
                color: 'var(--primary-blue)',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Fill Passenger
            </button>
            <button 
              type="button" 
              onClick={() => fillCredentials('admin')}
              style={{
                background: 'var(--bg-active-link)',
                border: '1px solid var(--primary-blue)',
                color: 'var(--primary-blue)',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Fill Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '30px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-blue)', textDecoration: 'underline', fontWeight: 600 }}>Sign up</Link>
        </div>

        <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Learn user licence agreement</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
