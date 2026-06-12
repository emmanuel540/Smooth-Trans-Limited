import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  FaChartPie, FaTruck, FaIdCard, FaMapMarkedAlt, 
  FaClipboardList, FaMoneyBillWave, FaSignOutAlt, 
  FaFileAlt, FaHome, FaUser 
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { role: 'passenger', name: 'User' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('driver_profile');
    navigate('/login');
  };

  // Define links based on roles
  const getRoleLinks = () => {
    switch (user.role) {
      case 'passenger':
        return [
          { name: 'My Bookings', path: '/dashboard/customer', icon: <FaClipboardList /> },
          { name: 'Make Payments', path: '/dashboard/customer/payments', icon: <FaMoneyBillWave /> },
          { name: 'Live Tracking', path: '/dashboard/customer/tracking', icon: <FaMapMarkedAlt /> }
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

  return (
    <div className="sidebar" style={{ padding: '20px' }}>
      {/* Title */}
      <Link to="/" style={{ textDecoration: 'none', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-teal) 100%)',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white'
          }}>
            <FaTruck size={14} />
          </div>
          <span className="gradient-text gradient-title" style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>Smooth Trans</span>
        </div>
      </Link>

      {/* Profile summary */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '12px',
        border: '1px solid var(--border-light)',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--primary-teal)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--primary-teal)'
          }}>
            <FaUser size={14} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--primary-blue)',
              textTransform: 'capitalize',
              fontWeight: 600
            }}>
              {user.role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              border: '1px solid',
              borderColor: isActive ? 'var(--border-active)' : 'transparent',
              textDecoration: 'none',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.3s ease'
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          padding: '10px 16px',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <FaHome />
          <span>Public Home</span>
        </Link>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--accent-rose)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            width: '100%',
            textAlign: 'left'
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
