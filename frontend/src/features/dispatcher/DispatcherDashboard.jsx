import React, { useState, useEffect } from 'react';
import Sidebar from '../shared/Sidebar';
import MapTracker from '../shared/MapTracker';
import { FaClipboardList, FaMapMarkedAlt, FaTruck, FaIdCard, FaUserPlus, FaChevronRight, FaCompass } from 'react-icons/fa';

const DispatcherDashboard = () => {
  const [activeTab, setActiveTab] = useState('board'); // board, monitor
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Assign modal state
  const [assigningBooking, setAssigningBooking] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const fetchDispatcherData = () => {
    setLoading(true);
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    // Fetch Bookings
    fetch('/api/bookings', { headers: authHeader })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error(err));

    // Fetch Available Drivers
    fetch('/api/drivers', { headers: authHeader })
      .then(res => res.json())
      .then(data => setDrivers(data))
      .catch(err => console.error(err));

    // Fetch Fleet Vehicles
    fetch('/api/fleet', { headers: authHeader })
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDispatcherData();
  }, []);

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedVehicleId) return;

    fetch(`/api/bookings/${assigningBooking.id}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        driver_id: parseInt(selectedDriverId),
        vehicle_id: parseInt(selectedVehicleId)
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then(() => {
        setAssigningBooking(null);
        setSelectedDriverId('');
        setSelectedVehicleId('');
        fetchDispatcherData();
        alert("Booking assigned successfully!");
      })
      .catch(err => {
        alert(err.message || "Failed to assign driver. Please retry.");
      });
  };

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const activeBookings = bookings.filter(b => b.status === 'Active' || b.status === 'Assigned');

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '15px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '15px',
          marginBottom: '30px'
        }}>
          <button 
            onClick={() => setActiveTab('board')}
            className="btn-secondary" 
            style={{
              background: activeTab === 'board' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderColor: activeTab === 'board' ? 'var(--primary-teal)' : 'var(--border-light)',
              display: 'flex', alignContent: 'center', gap: '8px'
            }}
          >
            <FaClipboardList />
            <span>Dispatch Board</span>
          </button>
          <button 
            onClick={() => setActiveTab('monitor')}
            className="btn-secondary"
            style={{
              background: activeTab === 'monitor' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderColor: activeTab === 'monitor' ? 'var(--primary-teal)' : 'var(--border-light)',
              display: 'flex', alignContent: 'center', gap: '8px'
            }}
          >
            <FaMapMarkedAlt />
            <span>Live Map Monitor</span>
          </button>
        </div>

        {/* Tab 1: Dispatch Board */}
        {activeTab === 'board' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }} className="dispatch-layout">
            
            {/* Pending Requests Column */}
            <div className="glass-card">
              <h2 className="gradient-title gradient-text" style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCompass />
                <span>Pending Requests ({pendingBookings.length})</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {pendingBookings.map(b => (
                  <div 
                    key={b.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>Order #{b.id} - {b.booking_type}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {b.pickup_address} &rarr; {b.dropoff_address}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Fare: KES {b.fare} | Customer: {b.customer_name}
                      </div>
                    </div>

                    <button 
                      onClick={() => setAssigningBooking(b)}
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                    >
                      <FaUserPlus size={10} />
                      <span>Assign</span>
                    </button>
                  </div>
                ))}

                {pendingBookings.length === 0 && (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No pending requests in queue.
                  </div>
                )}
              </div>
            </div>

            {/* Active Trips Monitor Column */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkedAlt />
                <span>Active Assignments ({activeBookings.length})</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeBookings.map(b => (
                  <div 
                    key={b.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Order #{b.id} ({b.booking_type})</span>
                      <span className={`badge badge-${b.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{b.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {b.pickup_address} &rarr; {b.dropoff_address}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Driver: <strong>{b.driver_name}</strong></span>
                      <span>Vehicle ID: <strong>{b.vehicle_id}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <style>{`
              @media (max-width: 768px) {
                .dispatch-layout { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}

        {/* Tab 2: Live Map Monitor (Active Vehicles overlay) */}
        {activeTab === 'monitor' && (
          <div className="animate-fade-in monitor-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>Fleet Live Locations</h3>
              <div style={{ flex: 1, minHeight: '380px' }}>
                {/* Seed a tracking overlay of the active booking */}
                {activeBookings.length > 0 ? (
                  <MapTracker 
                    pickup={activeBookings[0].pickup_coords}
                    dropoff={activeBookings[0].dropoff_coords}
                    current={activeBookings[0].status === 'Active' ? activeBookings[0].pickup_coords : null} // Mock overlay pointer
                    height="100%"
                  />
                ) : (
                  <MapTracker height="100%" />
                )}
              </div>
            </div>

            {/* Drivers list stats */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaIdCard />
                <span>Drivers Roster ({drivers.length})</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {drivers.map(d => (
                  <div 
                    key={d.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      paddingBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Plate: {d.vehicle ? d.vehicle.plate_number : 'None'} | Rating: {d.rating} &starf;
                      </div>
                    </div>
                    <span 
                      style={{
                        padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600,
                        background: d.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        color: d.status === 'Available' ? 'var(--primary-teal)' : 'var(--accent-rose)'
                      }}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <style>{`
              @media (max-width: 768px) {
                .monitor-layout { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}

        {/* MODAL: SELECT DRIVER AND VEHICLE FOR ASSIGNMENT */}
        {assigningBooking && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '420px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Assign Fleet Resources</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Select available driver and active vehicle matching booking #{assigningBooking.id} ({assigningBooking.booking_type}).
              </p>

              <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Driver</label>
                  <select 
                    className="glass-input" 
                    value={selectedDriverId} 
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    required
                  >
                    <option value="">Choose Driver</option>
                    {drivers.map(d => (
                      <option key={d.user_id} value={d.user_id}>
                        {d.name} (Rating: {d.rating} | Status: {d.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Vehicle</label>
                  <select 
                    className="glass-input" 
                    value={selectedVehicleId} 
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    required
                  >
                    <option value="">Choose Vehicle</option>
                    {vehicles.filter(v => v.status === 'Active').map(v => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.plate_number}) - {v.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setAssigningBooking(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirm Lock</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DispatcherDashboard;
