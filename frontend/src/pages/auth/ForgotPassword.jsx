import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import smoothLogo from '../../assets/smooth_trans_logo.png';

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

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2b6cb0', marginBottom: '10px' }}>Reset Password</h2>
        <p style={{ color: 'rgba(43, 108, 176, 0.7)', fontSize: '0.9rem', marginBottom: '25px' }}>
          {!tokenSent ? 'Enter your email to request a verification token.' : 'Enter the code and specify your new password.'}
        </p>

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

        {message && (
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
            {message}
          </div>
        )}

        {!tokenSent ? (
          <form onSubmit={handleSendToken} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                className="glass-input" 
                placeholder="registered-email@smooth.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '12px' }}>
              {loading ? <div className="loader-spinner" style={{ margin: '0 auto' }}></div> : 'Send Reset Token'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Reset Token Code</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="ST-84931"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required 
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>New Password</label>
              <input 
                type="password" 
                className="glass-input" 
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '12px' }}>
              {loading ? <div className="loader-spinner" style={{ margin: '0 auto' }}></div> : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '25px', fontSize: '0.9rem', color: 'rgba(43, 108, 176, 0.8)' }}>
          Back to{' '}
          <Link to="/login" style={{ color: '#2b6cb0', textDecoration: 'underline', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
