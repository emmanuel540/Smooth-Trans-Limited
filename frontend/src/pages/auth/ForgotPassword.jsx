import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaKey, FaTruck } from 'react-icons/fa';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [tokenSent, setTokenSent] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendToken = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then((data) => {
        setTokenSent(true);
        setMessage("A password reset token was sent to your email. (Use the demonstration token: ST-84931)");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to trigger reset");
        setLoading(false);
      });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password: newPassword })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then((data) => {
        setMessage("Password updated successfully! Redirecting to login...");
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      })
      .catch((err) => {
        setError(err.message || "Reset failed. Verify your code.");
        setLoading(false);
      });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} className="animate-fade-in">
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        {/* Brand logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-teal) 100%)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white'
          }}>
            <FaTruck size={16} />
          </div>
          <span className="gradient-text gradient-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Smooth Trans</span>
        </Link>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '10px' }}>Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
          {!tokenSent ? 'Enter your email to request a verification token.' : 'Enter the code and specify your new password.'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--accent-rose)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--primary-teal)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {message}
          </div>
        )}

        {!tokenSent ? (
          <form onSubmit={handleSendToken} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="glass-input" 
                  placeholder="registered-email@smooth.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
              {loading ? <div className="loader-spinner"></div> : 'Send Reset Token'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Reset Token Code</label>
              <div style={{ position: 'relative' }}>
                <FaKey style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="ST-84931"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required 
                />
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="glass-input" 
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
              {loading ? <div className="loader-spinner"></div> : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '25px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Back to{' '}
          <Link to="/login" style={{ color: 'var(--primary-teal)', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
