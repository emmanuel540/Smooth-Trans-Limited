import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  FaChartPie, FaTruck, FaIdCard, FaMapMarkedAlt, 
  FaClipboardList, FaMoneyBillWave, FaSignOutAlt, 
  FaFileAlt, FaHome, FaUser 
} from 'react-icons/fa';
import smoothLogo from '../assets/smooth_trans_logo.png';

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
    <div className="sidebar" style={{ 
      padding: '20px',
      background: '#ffffff',
      borderRight: '1px solid rgba(43, 108, 176, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: '67px',
      bottom: 0,
      left: 0,
      width: '260px',
      zIndex: 100
    }}>
      {/* Profile summary */}
      <div style={{
        background: '#f5faff',
        borderRadius: '12px',
        padding: '12px',
        border: '1px solid rgba(43, 108, 176, 0.15)',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#2b6cb0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#f5faff'
          }}>
            <FaUser size={14} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#2b6cb0', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: 'rgba(43, 108, 176, 0.7)',
              textTransform: 'capitalize',
              fontWeight: 700
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
              color: '#2b6cb0',
              background: isActive ? '#f5faff' : 'transparent',
              border: '1px solid',
              borderColor: isActive ? '#2b6cb0' : 'transparent',
              textDecoration: 'none',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.2s ease'
            })}
          >
            <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(43, 108, 176, 0.15)', paddingTop: '15px' }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#2b6cb0',
          textDecoration: 'none',
          padding: '10px 16px',
          fontSize: '0.9rem',
          fontWeight: 600
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
            color: '#2b6cb0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: 700,
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
