import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaFingerprint, FaQrcode } from 'react-icons/fa';
import stLogo from '../../assets/st_logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('passenger');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
      })
      .then((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.driver_profile) localStorage.setItem('driver_profile', JSON.stringify(data.driver_profile));

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

  const selectRole = (role) => {
    setSelectedRole(role);
    setError('');
    const creds = {
      passenger: { email: 'alex@gmail.com',        password: 'password123' },
      driver:    { email: 'driver@smooth.co.ke',   password: 'password123' },
      admin:     { email: 'admin@smooth.co.ke',    password: 'password123' },
    };
    if (creds[role]) {
      setEmail(creds[role].email);
      setPassword(creds[role].password);
    }
  };

  const roles = [
    { key: 'passenger', label: 'Passenger' },
    { key: 'driver',    label: 'Driver' },
    { key: 'admin',     label: 'Admin' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      background: '#F0F4FA',
      fontFamily: 'var(--font-sans)'
    }}>

      {/* ── Logo ── */}
      <Link to="/" style={{ textDecoration: 'none', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '64px', height: '64px', background: '#ffffff', borderRadius: '12px',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <img src={stLogo} alt="Smooth Trans" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
        </div>
      </Link>

      {/* ── Heading ── */}
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0F1B2D', letterSpacing: '-0.02em', marginBottom: '6px' }}>
        Welcome Back
      </h1>
      <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '28px', textAlign: 'center', maxWidth: '340px' }}>
        Log in to your account to manage your transport services.
      </p>

      {/* ── Card ── */}
      <div style={{
        background: '#ffffff', border: '1px solid #E2E8F0',
        borderRadius: '12px', padding: '28px 28px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>

        {/* Role Selector */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '9px' }}>
            Select Your Role
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            background: '#F1F5F9', borderRadius: '8px', padding: '3px', gap: '3px'
          }}>
            {roles.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => selectRole(key)}
                style={{
                  padding: '8px 4px', borderRadius: '6px', border: 'none',
                  background: selectedRole === key ? '#ffffff' : 'transparent',
                  color: selectedRole === key ? '#0F1B2D' : '#64748B',
                  fontWeight: selectedRole === key ? 600 : 500,
                  fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: selectedRole === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEE2E2', border: '1px solid rgba(225,29,72,0.2)',
            color: '#991B1B', padding: '10px 14px', borderRadius: '7px',
            fontSize: '0.82rem', marginBottom: '16px', fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Email */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{
                position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                color: '#94A3B8', fontSize: '0.8rem', pointerEvents: 'none'
              }} />
              <input
                type="email"
                className="glass-input"
                placeholder="name@smooth-trans.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.76rem', color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <FaLock style={{
                position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                color: '#94A3B8', fontSize: '0.8rem', pointerEvents: 'none'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '36px', paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94A3B8',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0
                }}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: '#0F1B2D', color: '#ffffff',
              border: 'none', borderRadius: '7px', fontWeight: 700, fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              fontFamily: 'var(--font-sans)', letterSpacing: '0.05em',
              transition: 'opacity 0.15s', marginTop: '4px'
            }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
            onMouseOut={(e)  => { if (!loading) e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? (
              <div className="loader-spinner" />
            ) : (
              <>
                <span>SIGN IN</span>
                <span style={{
                  width: '15px', height: '15px',
                  border: '2px solid rgba(255,255,255,0.45)',
                  borderRadius: '50%', display: 'inline-block', flexShrink: 0
                }} />
              </>
            )}
          </button>
        </form>

        {/* OR divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* Alt Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Biometrics', Icon: FaFingerprint },
            { label: 'Quick Scan', Icon: FaQrcode },
          ].map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              style={{
                padding: '10px 8px', background: 'transparent',
                border: '1.5px solid #E2E8F0', borderRadius: '7px',
                color: '#475569', fontWeight: 500, fontSize: '0.82rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '7px',
                fontFamily: 'var(--font-sans)', transition: 'border-color 0.15s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#94A3B8'}
              onMouseOut={(e)  => e.currentTarget.style.borderColor = '#E2E8F0'}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Register Link ── */}
      <div style={{ marginTop: '20px', fontSize: '0.875rem', color: '#64748B', textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#0F1B2D', fontWeight: 700, textDecoration: 'none' }}>
          Register New Account
        </Link>
      </div>

      {/* ── Footer ── */}
      <div style={{
        marginTop: '36px', paddingTop: '16px',
        borderTop: '1px solid #E2E8F0', width: '100%', maxWidth: '420px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Smooth Trans</span>
        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Sophisticated Utility in Motion.</span>
      </div>
    </div>
  );
};

export default Login;
