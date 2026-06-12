import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import smoothLogo from '../../assets/smooth_trans_logo.png';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('passenger');
  
  // Driver specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = { name, email, phone, password, role };
    if (role === 'driver') {
      payload.license_number = licenseNumber;
      payload.license_expiry = licenseExpiry;
    }

    fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        return data;
      })
      .then((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#f5faff'
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(43, 108, 176, 0.15)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
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

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2b6cb0', marginBottom: '10px' }}>Create Account</h2>
        <p style={{ color: 'rgba(43, 108, 176, 0.7)', fontSize: '0.9rem', marginBottom: '25px' }}>
          Join Smooth Trans logistics management platform today.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Emmanuel Kiprotich"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email Address</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="emmanuel@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Phone Number</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="0700111222"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                className="glass-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Role</label>
              <select className="glass-input" value={role} onChange={(e) => setRole(e.target.value)} style={{ color: '#2b6cb0' }}>
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* Conditional Driver Fields */}
          {role === 'driver' && (
            <div style={{
              background: '#f5faff',
              border: '1px solid rgba(43, 108, 176, 0.15)',
              padding: '15px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '5px'
            }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Driver's License Number</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="DL-K84920A"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required={role === 'driver'} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600, display: 'block', marginBottom: '6px' }}>License Expiration Date</label>
                <input 
                  type="date" 
                  className="glass-input" 
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  required={role === 'driver'} 
                  style={{ color: '#2b6cb0' }}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '12px' }}>
            {loading ? <div className="loader-spinner" style={{ margin: '0 auto' }}></div> : 'Register Account'}
          </button>
        </form>

        <div style={{ marginTop: '25px', fontSize: '0.9rem', color: 'rgba(43, 108, 176, 0.8)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2b6cb0', textDecoration: 'underline', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
