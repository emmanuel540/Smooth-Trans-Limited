import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaTh, FaCalendarAlt, FaCreditCard, FaVideo, FaCog,
  FaSignOutAlt, FaQuestionCircle, FaTruck, FaIdCard,
  FaMapMarkedAlt, FaClipboardList, FaMoneyBillWave, FaFileAlt, FaChartPie
} from 'react-icons/fa';
import stLogo from '../../assets/st_logo.png';

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

  const getRoleLinks = () => {
    switch (user.role) {
      case 'passenger':
        return [
          { name: 'Dashboard',     path: '/dashboard/customer#home',     hash: '#home',     icon: <FaTh /> },
          { name: 'My Bookings',   path: '/dashboard/customer#bookings', hash: '#bookings', icon: <FaCalendarAlt /> },
          { name: 'Payments',      path: '/dashboard/customer#bookings', hash: '#bookings', icon: <FaCreditCard />, noActiveMatch: true },
          { name: 'Live Tracking', path: '/dashboard/customer#tracking', hash: '#tracking', icon: <FaVideo /> },
          { name: 'Settings',      path: '/dashboard/customer#support',  hash: '#support',  icon: <FaCog /> },
        ];
      case 'driver':
        return [
          { name: 'Assigned Trips', path: '/dashboard/driver#trips',    hash: '#trips',    icon: <FaClipboardList /> },
          { name: 'Vehicle Status', path: '/dashboard/driver#vehicle',  hash: '#vehicle',  icon: <FaTruck /> },
          { name: 'My Earnings',    path: '/dashboard/driver#earnings', hash: '#earnings', icon: <FaMoneyBillWave /> },
        ];
      case 'dispatcher':
        return [
          { name: 'Dispatch Board',   path: '/dashboard/dispatcher#board',   hash: '#board',   icon: <FaClipboardList /> },
          { name: 'Live Map Monitor', path: '/dashboard/dispatcher#monitor', hash: '#monitor', icon: <FaMapMarkedAlt /> },
        ];
      case 'admin':
        return [
          { name: 'Analytics',          path: '/dashboard/admin',          icon: <FaChartPie /> },
          { name: 'Fleet Management',   path: '/dashboard/admin/fleet',    icon: <FaTruck /> },
          { name: 'Driver Profiles',    path: '/dashboard/admin/drivers',  icon: <FaIdCard /> },
          { name: 'Analytics Reports',  path: '/dashboard/admin/reports',  icon: <FaFileAlt /> },
        ];
      default:
        return [];
    }
  };

  const links = getRoleLinks();
  const currentHash = window.location.hash || '#home';

  const isLinkActive = (link) => {
    if (link.noActiveMatch) return false;
    if (link.hash) return currentHash === link.hash;
    return location.pathname === link.path;
  };

  const getRoleLabel = () => {
    const labels = { passenger: 'Customer Portal', driver: 'Driver Portal', dispatcher: 'Dispatcher Office', admin: 'Admin Panel' };
    return labels[user.role] || 'Portal';
  };

  return (
    <div className="sidebar">

      {/* ── Brand Header ── */}
      <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', background: '#ffffff', borderRadius: '6px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
            overflow: 'hidden', border: '1px solid #E2E8F0'
          }}>
            <img src={stLogo} alt="ST" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: '1' }}>
              {getRoleLabel()}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0F1B2D', marginTop: '1px', whiteSpace: 'nowrap' }}>
              Smooth Trans Ltd
            </div>
          </div>
        </div>
      </div>

      {/* ── User Capsule ── */}
      <div style={{
        background: 'rgba(255,255,255,0.75)', borderRadius: '8px', padding: '9px 11px',
        border: '1px solid rgba(0,0,0,0.06)', marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0F1B2D 0%, #334155 100%)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#0F1B2D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 500, textTransform: 'capitalize' }}>
              {user.role}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {links.map((link) => {
          const active = isLinkActive(link);
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => {
                if (link.hash) {
                  window.location.hash = link.hash;
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                color: active ? '#ffffff' : '#475569',
                background: active ? '#0F1B2D' : 'transparent',
                textDecoration: 'none', padding: '8px 11px', borderRadius: '8px',
                fontSize: '0.8rem', fontWeight: active ? 600 : 500,
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(15,27,45,0.07)'; e.currentTarget.style.color = '#0F1B2D'; } }}
              onMouseOut={(e)  => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; } }}
            >
              <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', opacity: active ? 1 : 0.65 }}>
                {link.icon}
              </span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Bottom Section ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '12px', marginTop: 'auto' }}>

        {/* New Booking shortcut (passengers only) */}
        {user.role === 'passenger' && (
          <Link
            to="/dashboard/customer#book"
            onClick={() => { window.location.hash = '#book'; window.dispatchEvent(new HashChangeEvent('hashchange')); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: '#0F1B2D', color: '#ffffff', textDecoration: 'none',
              padding: '8px 11px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
              marginBottom: '6px', transition: 'opacity 0.15s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.82'}
            onMouseOut={(e)  => e.currentTarget.style.opacity = '1'}
          >
            + New Booking
          </Link>
        )}

        {/* Support */}
        <button
          onClick={() => {
            if (user.role === 'passenger') {
              window.location.hash = '#support';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '9px', color: '#475569',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '8px 11px', fontSize: '0.8rem', fontWeight: 500,
            width: '100%', textAlign: 'left', borderRadius: '8px',
            transition: 'all 0.15s', fontFamily: 'var(--font-sans)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(15,27,45,0.07)'; e.currentTarget.style.color = '#0F1B2D'; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
        >
          <FaQuestionCircle style={{ fontSize: '0.875rem', opacity: 0.65 }} />
          <span>Support</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '9px', color: '#475569',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '8px 11px', fontSize: '0.8rem', fontWeight: 500,
            width: '100%', textAlign: 'left', borderRadius: '8px',
            transition: 'all 0.15s', fontFamily: 'var(--font-sans)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#E11D48'; e.currentTarget.style.background = 'rgba(225,29,72,0.05)'; }}
          onMouseOut={(e)  => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
        >
          <FaSignOutAlt style={{ fontSize: '0.875rem', opacity: 0.65 }} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
