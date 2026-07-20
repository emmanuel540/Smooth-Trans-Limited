import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import stLogo from '../assets/st_logo.png';

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
        navigate('/dashboard/customer');
        window.location.hash = 'book';
      } else {
        navigate(getDashboardLink());
      }
    } else {
      navigate('/login');
    }
  };

  const navTabs = [
    { name: 'Transport', hash: 'book', query: 'General' },
    { name: 'School',    hash: 'book', query: 'School' },
    { name: 'Delivery',  hash: 'book', query: 'Delivery' },
    { name: 'Moving',    hash: 'book', query: 'Moving' },
  ];

  const isActive = (tab) => {
    if (tab.path && location.pathname === tab.path) return true;
    if (tab.hash && location.pathname.includes('/dashboard/customer') && window.location.hash === `#${tab.hash}`) return true;
    return false;
  };

  const getLinkTarget = (tab) => {
    if (tab.path) return tab.path;
    if (token && user && user.role === 'passenger') return `/dashboard/customer#${tab.hash}`;
    return '/login';
  };

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: '#ffffff',
    borderBottom: '1px solid #E2E8F0',
    padding: '0 36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '56px',
  };

  return (
    <nav style={navStyle}>
      {/* ── Brand ── */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{
          width: '36px', height: '36px', background: '#ffffff', borderRadius: '6px',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          overflow: 'hidden', border: '1px solid #E2E8F0'
        }}>
          <img src={stLogo} alt="Smooth Trans" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1B2D', letterSpacing: '-0.01em', fontFamily: 'var(--font-sans)' }}>
          Smooth Trans
        </span>
      </Link>

      {/* ── Desktop Nav Tabs ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '100%' }} className="desktop-menu">
        {navTabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.name}
              to={getLinkTarget(tab)}
              onClick={() => {
                if (tab.hash && token && user && user.role === 'passenger') {
                  window.location.hash = tab.hash;
                  if (tab.query) window.dispatchEvent(new CustomEvent('changeServiceType', { detail: tab.query }));
                }
              }}
              style={{
                color: active ? '#0F1B2D' : '#64748B',
                textDecoration: 'none',
                fontWeight: active ? 600 : 500,
                fontSize: '0.85rem',
                padding: '0 13px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                borderBottom: `2px solid ${active ? '#0F1B2D' : 'transparent'}`,
                transition: 'color 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={(e) => { if (!active) { e.currentTarget.style.color = '#0F1B2D'; } }}
              onMouseOut={(e)  => { if (!active) { e.currentTarget.style.color = '#64748B'; } }}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* ── Right Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-menu">
        {token && user ? (
          <>
            <Link
              to={getDashboardLink()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#475569', textDecoration: 'none',
                fontWeight: 500, fontSize: '0.85rem',
                padding: '6px 10px', borderRadius: '6px',
                transition: 'background 0.15s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F1B2D'; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
            >
              <FaUserCircle size={15} />
              <span>{user.name.split(' ')[0]}</span>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px', fontSize: '0.85rem', borderRadius: '6px',
                background: 'transparent', color: '#475569',
                border: '1.5px solid #E2E8F0', fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'var(--font-sans)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#0F1B2D'; }}
              onMouseOut={(e)  => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
            >
              Log Out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              color: '#475569', textDecoration: 'none', fontWeight: 500, fontSize: '0.85rem',
              padding: '6px 14px', border: '1.5px solid #E2E8F0', borderRadius: '6px',
              transition: 'all 0.15s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#0F1B2D'; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
          >
            Login
          </Link>
        )}
        <button
          onClick={handleBookNow}
          style={{
            padding: '7px 18px', fontSize: '0.85rem', borderRadius: '6px',
            background: '#0F1B2D', color: '#ffffff', border: 'none',
            fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
            fontFamily: 'var(--font-sans)'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.82'}
          onMouseOut={(e)  => e.currentTarget.style.opacity = '1'}
        >
          Book Now
        </button>
      </div>

      {/* ── Mobile Burger ── */}
      <div
        style={{ display: 'none', cursor: 'pointer', color: '#0F1B2D' }}
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu  { display: none !important; }
          .mobile-menu-btn { display: flex !important; align-items: center; }
        }
      `}</style>

      {/* ── Mobile Dropdown ── */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute', top: '56px', left: 0, right: 0,
          background: '#ffffff', borderBottom: '1px solid #E2E8F0',
          padding: '20px 24px', display: 'flex', flexDirection: 'column',
          gap: '14px', zIndex: 999
        }}>
          {navTabs.map((tab) => (
            <Link
              key={tab.name}
              to={getLinkTarget(tab)}
              onClick={() => {
                setMobileMenuOpen(false);
                if (tab.hash && token && user && user.role === 'passenger') {
                  window.location.hash = tab.hash;
                  if (tab.query) window.dispatchEvent(new CustomEvent('changeServiceType', { detail: tab.query }));
                }
              }}
              style={{ color: '#0F1B2D', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}
            >
              {tab.name}
            </Link>
          ))}
          <hr style={{ borderColor: '#E2E8F0', borderTop: '1px solid' }} />
          {token && user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: '#0F1B2D', color: '#fff', padding: '11px', borderRadius: '7px', textAlign: 'center', fontWeight: 600, textDecoration: 'none' }}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                style={{ background: 'transparent', color: '#E11D48', border: '1.5px solid #E11D48', padding: '11px', borderRadius: '7px', fontWeight: 600, cursor: 'pointer' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0F1B2D', border: '1.5px solid #0F1B2D', padding: '11px', borderRadius: '7px', textAlign: 'center', fontWeight: 600, textDecoration: 'none' }}>
                Login
              </Link>
              <button onClick={() => { handleBookNow(); setMobileMenuOpen(false); }} style={{ background: '#0F1B2D', color: '#fff', border: 'none', padding: '11px', borderRadius: '7px', fontWeight: 600, cursor: 'pointer' }}>
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
