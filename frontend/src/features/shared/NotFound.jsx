import React from 'react';
import { Link } from 'react-router-dom';
import stLogo from '../../assets/st_logo.png';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      background: '#F0F4FA',
      fontFamily: 'var(--font-sans)',
      textAlign: 'center'
    }}>
      <Link to="/" style={{ textDecoration: 'none', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '64px', height: '64px', background: '#ffffff', borderRadius: '12px',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <img src={stLogo} alt="Smooth Trans" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
        </div>
      </Link>

      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#0F1B2D', letterSpacing: '-0.03em', margin: '0 0 8px 0' }}>
        404
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#64748B', marginBottom: '28px', maxWidth: '360px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/"
        style={{
          padding: '12px 28px', background: '#0F1B2D', color: '#ffffff',
          borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem',
          textDecoration: 'none', letterSpacing: '0.04em',
          transition: 'opacity 0.15s'
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
        onMouseOut={(e)  => e.currentTarget.style.opacity = '1'}
      >
        Back to Home
      </Link>

      <div style={{
        marginTop: '48px', paddingTop: '16px',
        borderTop: '1px solid #E2E8F0', width: '100%', maxWidth: '360px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Smooth Trans</span>
        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Sophisticated Utility in Motion.</span>
      </div>
    </div>
  );
};

export default NotFound;
