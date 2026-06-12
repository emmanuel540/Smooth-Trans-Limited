import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

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
      background: 'rgba(7, 9, 14, 0.75)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-light)',
      padding: '15px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Brand logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-teal) 100%)',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <FaTruck size={18} />
        </div>
        <span className="gradient-text gradient-title" style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          textTransform: 'uppercase'
        }}>Smooth Trans</span>
      </Link>

      {/* Desktop navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }} className="desktop-menu">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              transition: 'color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
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
              gap: '6px'
            }}>
              <FaUserCircle size={16} />
              <span>Dashboard ({user.name.split(' ')[0]})</span>
            </Link>
            <button onClick={handleLogout} className="btn-danger" style={{
              padding: '8px 18px',
              fontSize: '0.9rem',
              borderRadius: '8px'
            }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-primary" style={{
              padding: '8px 20px',
              fontSize: '0.9rem',
              borderRadius: '8px',
              textDecoration: 'none'
            }}>
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Burger Menu Button */}
      <div style={{ display: 'none', cursor: 'pointer' }} className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
          background: 'rgba(9, 13, 24, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-light)',
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
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '1.1rem'
              }}
            >
              {link.name}
            </Link>
          ))}
          <hr style={{ borderColor: 'var(--border-light)' }} />
          {token && user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ textDecoration: 'none' }}>
                Go to Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn-danger">
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ textDecoration: 'none' }}>
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
