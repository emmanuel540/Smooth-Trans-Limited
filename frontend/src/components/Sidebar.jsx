import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FaChartPie, FaTruck, FaIdCard, FaMapMarkedAlt, 
  FaClipboardList, FaMoneyBillWave, FaSignOutAlt, 
  FaFileAlt, FaHome, FaShieldAlt, FaHeadphones,
  FaCalendarCheck, FaPlus
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { role: 'passenger', name: 'User' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('driver_profile');
    navigate('/login');
  };

  const handleNewBooking = () => {
    if (user.role === 'passenger') {
      navigate('/dashboard/customer#book');
      window.location.hash = 'book';
    }
  };

  // Define links based on roles
  const getRoleLinks = () => {
    switch (user.role) {
      case 'passenger':
        return [
          { name: 'Home', path: '/dashboard/customer#home', hash: '#home', icon: <FaHome /> },
          { name: 'Bookings', path: '/dashboard/customer#bookings', hash: '#bookings', icon: <FaCalendarCheck /> },
          { name: 'Safety Protocols', path: '/dashboard/customer#safety', hash: '#safety', icon: <FaShieldAlt /> },
          { name: 'Fleet', path: '/dashboard/customer#fleet', hash: '#fleet', icon: <FaTruck /> },
          { name: 'Support', path: '/dashboard/customer#support', hash: '#support', icon: <FaHeadphones /> }
        ];
      case 'driver':
        return [
          { name: 'Assigned Trips', path: '/dashboard/driver', icon: <FaClipboardList /> },
          { name: 'Vehicle Status', path: '/dashboard/driver/vehicle', icon: <FaTruck /> },
          { name: 'My Earnings', path: '/dashboard/driver/earnings', icon: <FaMoneyBillWave /> }
        ];
      case 'dispatcher':
        return [
          { name: 'Dispatch Board', path: '/dashboard/dispatcher', icon: <FaClipboardList /> },
          { name: 'Live Map Monitor', path: '/dashboard/dispatcher/monitor', icon: <FaMapMarkedAlt /> }
        ];
      case 'admin':
        return [
          { name: 'Analytics Summary', path: '/dashboard/admin', icon: <FaChartPie /> },
          { name: 'Fleet Management', path: '/dashboard/admin/fleet', icon: <FaTruck /> },
          { name: 'Driver Profiles', path: '/dashboard/admin/drivers', icon: <FaIdCard /> },
          { name: 'Analytics Reports', path: '/dashboard/admin/reports', icon: <FaFileAlt /> }
        ];
      default:
        return [];
    }
  };

  const links = getRoleLinks();
  const currentHash = window.location.hash || '#home';

  const isLinkActive = (link) => {
    if (user.role === 'passenger' && link.hash) {
      if (currentHash === '#book' && link.hash === '#home') return false;
      return currentHash === link.hash;
    }
    return location.pathname === link.path;
  };

  return (
    <div className="sidebar" style={{ 
      padding: '24px 20px',
      background: 'var(--bg-surface-solid)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: '72px',
      bottom: 0,
      left: 0,
      width: '280px',
      zIndex: 100
    }}>
      {/* Sidebar Brand Header matching mockup */}
      <div style={{ marginBottom: '28px', padding: '0 12px' }}>
        <div style={{ 
          fontSize: '1.25rem', 
          fontWeight: 800, 
          color: 'var(--primary-blue)', 
          letterSpacing: '-0.02em',
          lineHeight: '1.2'
        }}>
          Smooth Trans
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)', 
          fontWeight: 600, 
          marginTop: '2px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Precision Logistics
        </div>
      </div>

      {/* User profile capsule */}
      <div style={{
        background: 'var(--bg-main)',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1px solid var(--border-light)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-blue) 0%, #3b82f6 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}>
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-blue)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'capitalize',
              fontWeight: 600
            }}>
              {user.role} Portal
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {links.map((link) => {
          const active = isLinkActive(link);
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => {
                if (user.role === 'passenger' && link.hash) {
                  window.location.hash = link.hash;
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: active ? 'var(--primary-blue)' : 'var(--text-secondary)',
                background: active ? 'var(--bg-active-link)' : 'transparent',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: active ? 700 : 500,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseOver={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--primary-blue)';
                  e.currentTarget.style.background = 'var(--bg-link-hover)';
                }
              }}
              onMouseOut={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ 
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center',
                color: active ? 'var(--primary-blue)' : 'var(--text-muted)',
                transition: 'color 0.2s'
              }}>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom controls & New Booking Button */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        borderTop: '1px solid var(--border-light)', 
        paddingTop: '20px',
        marginTop: 'auto'
      }}>
        {user.role === 'passenger' && (
          <button
            onClick={handleNewBooking}
            style={{
              width: '100%',
              background: 'var(--primary-blue)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 10px rgba(30, 58, 138, 0.1)',
              marginBottom: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--border-active)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-blue)'}
          >
            <FaPlus size={12} />
            <span>New Booking</span>
          </button>
        )}

        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            width: '100%',
            textAlign: 'left',
            borderRadius: '10px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = 'var(--accent-rose)';
            e.currentTarget.style.background = 'var(--bg-danger-hover)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
