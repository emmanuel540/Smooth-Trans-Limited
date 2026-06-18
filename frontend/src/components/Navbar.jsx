import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import smoothLogo from '../assets/smooth_trans_logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('driver_profile');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    const roleLinks = {
      passenger: '/dashboard/customer',
      driver: '/dashboard/driver',
      dispatcher: '/dashboard/dispatcher',
      admin: '/dashboard/admin'
    };
    return roleLinks[user.role] || '/';
  };

  const handleBookNow = () => {
    if (token && user) {
      if (user.role === 'passenger') {
        navigate('/dashboard/customer#book');
        window.location.hash = 'book';
      } else {
        navigate(getDashboardLink());
      }
    } else {
      navigate('/login');
    }
  };

  const getLinkTarget = (tab) => {
    if (token && user) {
      if (user.role === 'passenger') {
        return `/dashboard/customer#${tab}`;
      }
    }
    return `/login`;
  };

  // Mockup nav tabs: School Bus, Corporate, Taxi, Safety, About
  const navTabs = [
    { name: 'School Bus', hash: 'book', query: 'School' },
    { name: 'Corporate', hash: 'book', query: 'Moving' },
    { name: 'Taxi', hash: 'book', query: 'General' },
    { name: 'Safety', hash: 'safety' },
    { name: 'About', path: '/about' }
  ];

  const isActive = (tab) => {
    if (tab.path && location.pathname === tab.path) return true;
    if (tab.hash && location.pathname.includes('/dashboard/customer') && window.location.hash === `#${tab.hash}`) {
      // If there's a specific service type query mapping, verify it (optional)
      return true;
    }
    return false;
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: '#ffffff',
      borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
      padding: '0 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '72px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
    }}>
      {/* Brand logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img src={smoothLogo} alt="Smooth Trans Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
        </div>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#1e3a8a',
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-sans)'
        }}>Smooth Trans</span>
      </Link>

      {/* Desktop navigation centered */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '32px',
        height: '100%' 
      }} className="desktop-menu">
        {navTabs.map((tab) => {
          const active = isActive(tab);
          const toPath = tab.path ? tab.path : getLinkTarget(tab.hash);
          
          return (
            <Link 
              key={tab.name} 
              to={toPath}
              onClick={() => {
                if (tab.hash && token && user && user.role === 'passenger') {
                  window.location.hash = tab.hash;
                  // If query parameter needs to trigger a service type
                  if (tab.query) {
                    window.dispatchEvent(new CustomEvent('changeServiceType', { detail: tab.query }));
                  }
                }
              }}
              style={{
                color: active ? '#1e3a8a' : '#64748b',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.92rem',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                borderBottom: active ? '2px solid #1e3a8a' : '2px solid transparent',
                padding: '0 4px',
                marginTop: '2px'
              }}
              onMouseOver={(e) => {
                if (!active) e.target.style.color = '#1e3a8a';
              }}
              onMouseOut={(e) => {
                if (!active) e.target.style.color = '#64748b';
              }}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Right side buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-menu">
        {token && user ? (
          <>
            <Link to={getDashboardLink()} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1e3a8a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '8px 16px',
              borderRadius: '10px',
              background: '#f1f5f9',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              <FaUserCircle size={18} />
              <span>Dashboard ({user.name.split(' ')[0]})</span>
            </Link>
            <button onClick={handleLogout} style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              borderRadius: '10px',
              background: 'transparent',
              color: '#64748b',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.color = '#e11d48';
              e.target.style.borderColor = '#e11d48';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#64748b';
              e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
            }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#1e3a8a'}
            onMouseOut={(e) => e.target.style.color = '#64748b'}
            >
              Sign In
            </Link>
          </>
        )}

        <button 
          onClick={handleBookNow}
          className="btn-primary" 
          style={{
            padding: '10px 22px',
            fontSize: '0.9rem',
            borderRadius: '8px',
            background: '#1e3a8a',
            fontWeight: 600,
            boxShadow: 'none'
          }}
        >
          Book Now
        </button>
      </div>

      {/* Mobile Burger Menu Button */}
      <div style={{ display: 'none', cursor: 'pointer', color: '#1e3a8a' }} className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </div>

      {/* Inject custom CSS for navbar responsiveness inside a style tag */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: 0,
          right: 0,
          background: '#ffffff',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          padding: '24px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 999,
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.03)'
        }}>
          {navTabs.map((tab) => {
            const toPath = tab.path ? tab.path : getLinkTarget(tab.hash);
            return (
              <Link 
                key={tab.name}
                to={toPath}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (tab.hash && token && user && user.role === 'passenger') {
                    window.location.hash = tab.hash;
                    if (tab.query) {
                      window.dispatchEvent(new CustomEvent('changeServiceType', { detail: tab.query }));
                    }
                  }
                }}
                style={{
                  color: '#1e3a8a',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.05rem'
                }}
              >
                {tab.name}
              </Link>
            );
          })}
          <hr style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />
          {token && user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', background: '#1e3a8a', color: '#ffffff', padding: '12px', borderRadius: '10px', textAlign: 'center', fontWeight: 600 }}>
                Go to Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ background: 'transparent', color: '#e11d48', border: '1px solid #e11d48', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', background: 'transparent', color: '#1e3a8a', border: '1px solid #1e3a8a', padding: '12px', borderRadius: '10px', textAlign: 'center', fontWeight: 600 }}>
                Sign In
              </Link>
              <button onClick={() => { handleBookNow(); setMobileMenuOpen(false); }} style={{ background: '#1e3a8a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                Book Now
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
