import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import smoothLogo from '../assets/smooth_trans_logo.png';

const Navbar = () => {
  const navigate = useNavigate();
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
    if (!user) return '/';
    const roleLinks = {
      passenger: '/dashboard/customer',
      driver: '/dashboard/driver',
      dispatcher: '/dashboard/dispatcher',
      admin: '/dashboard/admin'
    };
    return roleLinks[user.role] || '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: '#2b6cb0',
      borderBottom: '1px solid rgba(245, 250, 255, 0.15)',
      padding: '15px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '67px'
    }}>
      {/* Brand logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: '#f5faff',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img src={smoothLogo} alt="Smooth Trans Logo" style={{ width: '26px', height: '26px' }} />
        </div>
        <span style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          color: '#f5faff',
          letterSpacing: '-0.02em'
        }}>Smooth Trans</span>
      </Link>

      {/* Desktop navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }} className="desktop-menu">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            style={{
              color: '#f5faff',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#ffffff'}
            onMouseOut={(e) => e.target.style.color = '#f5faff'}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} className="desktop-menu">
        {token && user ? (
          <>
            <Link to={getDashboardLink()} className="btn-secondary" style={{
              padding: '8px 18px',
              fontSize: '0.9rem',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f5faff',
              color: '#2b6cb0',
              border: 'none',
              fontWeight: 600
            }}>
              <FaUserCircle size={16} />
              <span>Dashboard ({user.name.split(' ')[0]})</span>
            </Link>
            <button onClick={handleLogout} style={{
              padding: '8px 18px',
              fontSize: '0.9rem',
              borderRadius: '8px',
              background: 'transparent',
              color: '#f5faff',
              border: '1px solid #f5faff',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: '#f5faff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
            onMouseOver={(e) => e.target.style.color = '#ffffff'}
            onMouseOut={(e) => e.target.style.color = '#f5faff'}
            >
              Sign In
            </Link>
            <Link to="/register" style={{
              padding: '8px 20px',
              fontSize: '0.9rem',
              borderRadius: '8px',
              textDecoration: 'none',
              background: '#f5faff',
              color: '#2b6cb0',
              fontWeight: 600,
              border: 'none'
            }}
            onMouseOver={(e) => e.target.style.background = '#ffffff'}
            onMouseOut={(e) => e.target.style.background = '#f5faff'}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Burger Menu Button */}
      <div style={{ display: 'none', cursor: 'pointer', color: '#f5faff' }} className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
          top: '67px',
          left: 0,
          right: 0,
          background: '#ffffff',
          borderBottom: '1px solid rgba(43, 108, 176, 0.15)',
          padding: '20px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 999
        }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#2b6cb0',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              {link.name}
            </Link>
          ))}
          <hr style={{ borderColor: 'rgba(43, 108, 176, 0.1)' }} />
          {token && user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', background: '#2b6cb0', color: '#f5faff', padding: '10px 18px', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                Go to Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ background: 'transparent', color: '#2b6cb0', border: '1px solid #2b6cb0', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', background: 'transparent', color: '#2b6cb0', border: '1px solid #2b6cb0', padding: '10px 18px', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', background: '#2b6cb0', color: '#f5faff', padding: '10px 20px', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
