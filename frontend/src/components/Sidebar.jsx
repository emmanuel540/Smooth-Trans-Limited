import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FaChartPie, FaTruck, FaIdCard, FaMapMarkedAlt, 
  FaClipboardList, FaMoneyBillWave, FaSignOutAlt, 
  FaFileAlt, FaHome, FaUser, FaShieldAlt, FaHeadphones,
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
      // If we are currently on the book tab, and clicking home, let's treat it as inactive unless matches book
      if (currentHash === '#book' && link.hash === '#home') return false;
      return currentHash === link.hash;
    }
    return location.pathname === link.path;
  };

  return (
    <div className="sidebar" style={{ 
      padding: '24px 20px',
      background: '#ffffff',
      borderRight: '1px solid rgba(148, 163, 184, 0.12)',
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
          color: '#1e3a8a', 
          letterSpacing: '-0.02em',
          lineHeight: '1.2'
        }}>
          Smooth Trans
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#64748b', 
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
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
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
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e3a8a', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: '#64748b',
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
                  // Dispatch hashchange event manually in case routing doesn't trigger
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: active ? '#1e3a8a' : '#64748b',
                background: active ? '#eff6ff' : 'transparent',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: active ? 700 : 500,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseOver={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#1e3a8a';
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseOut={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ 
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center',
                color: active ? '#1e3a8a' : '#94a3b8',
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
        borderTop: '1px solid rgba(148, 163, 184, 0.12)', 
        paddingTop: '20px',
        marginTop: 'auto'
      }}>
        {user.role === 'passenger' && (
          <button
            onClick={handleNewBooking}
            style={{
              width: '100%',
              background: '#1e3a8a',
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
            onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1e3a8a'}
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
            color: '#64748b',
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
            e.currentTarget.style.color = '#e11d48';
            e.currentTarget.style.background = '#fff1f2';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#64748b';
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
