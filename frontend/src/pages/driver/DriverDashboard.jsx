import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import MapTracker from '../../components/MapTracker';
import { 
  FaClipboardList, FaTruck, FaMoneyBillWave, 
  FaPlay, FaCheckCircle, FaExclamationTriangle 
} from 'react-icons/fa';

const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState('trips'); // trips, vehicle, earnings
  const [trips, setTrips] = useState([]);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMapTrip, setActiveMapTrip] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingIntervalId, setTrackingIntervalId] = useState(null);

  const fetchTripsAndProfile = () => {
    setLoading(true);
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    // Fetch Trips
    fetch('/api/bookings', { headers: authHeader })
      .then(res => res.json())
      .then(data => {
        setTrips(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch Profile details
    fetch('/api/auth/profile', { headers: authHeader })
      .then(res => res.json())
      .then(data => {
        setDriverProfile(data.driver_profile);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTripsAndProfile();
    return () => {
      if (trackingIntervalId) clearInterval(trackingIntervalId);
    };
  }, []);

  const handleUpdateStatus = (bookingId, newStatus) => {
    fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => {
        fetchTripsAndProfile();
        if (newStatus === 'Active') {
          // Find the trip and show map tracking immediately
          const trip = trips.find(t => t.id === bookingId);
          startMapMonitoring(trip);
        } else {
          stopMapMonitoring();
        }
        alert(`Trip status successfully updated to: ${newStatus}`);
      })
      .catch(err => console.error(err));
  };

  const startMapMonitoring = (trip) => {
    setActiveMapTrip(trip);
    
    if (trackingIntervalId) clearInterval(trackingIntervalId);

    const fetchProgress = () => {
      fetch(`/api/tracking/${trip.id}/progress`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          setTrackingData(data);
        })
        .catch(err => console.error(err));
    };

    fetchProgress();
    const intId = setInterval(fetchProgress, 4000);
    setTrackingIntervalId(intId);
  };

  const stopMapMonitoring = () => {
    if (trackingIntervalId) clearInterval(trackingIntervalId);
    setTrackingIntervalId(null);
    setActiveMapTrip(null);
    setTrackingData(null);
  };

  // Calculations
  const completedTrips = trips.filter(t => t.status === 'Completed');
  // Commission: Driver keeps 60%, 40% goes to platform
  const totalEarnings = completedTrips.reduce((sum, t) => sum + (t.fare * 0.6), 0);

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
            onClick={() => { setActiveTab('trips'); stopMapMonitoring(); }}
            className="btn-secondary" 
            style={{
              background: activeTab === 'trips' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderColor: activeTab === 'trips' ? 'var(--primary-teal)' : 'var(--border-light)',
              display: 'flex', alignContent: 'center', gap: '8px'
            }}
          >
            <FaClipboardList />
            <span>Assigned Trips</span>
          </button>
          <button 
            onClick={() => { setActiveTab('vehicle'); stopMapMonitoring(); }}
            className="btn-secondary"
            style={{
              background: activeTab === 'vehicle' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderColor: activeTab === 'vehicle' ? 'var(--primary-teal)' : 'var(--border-light)',
              display: 'flex', alignContent: 'center', gap: '8px'
            }}
          >
            <FaTruck />
            <span>Vehicle Log</span>
          </button>
          <button 
            onClick={() => { setActiveTab('earnings'); stopMapMonitoring(); }}
            className="btn-secondary"
            style={{
              background: activeTab === 'earnings' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderColor: activeTab === 'earnings' ? 'var(--primary-teal)' : 'var(--border-light)',
              display: 'flex', alignContent: 'center', gap: '8px'
            }}
          >
            <FaMoneyBillWave />
            <span>My Earnings</span>
          </button>
        </div>

        {/* Tab 1: Assigned Trips */}
        {activeTab === 'trips' && (
          <div style={{ display: 'grid', gridTemplateColumns: activeMapTrip ? '1fr 1fr' : '1fr', gap: '30px' }} className="trips-layout">
            <div className="glass-card">
              <h2 className="gradient-title gradient-text" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Duty Manifest</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {trips.map(t => (
                  <div 
                    key={t.id}
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
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>Trip #{t.id}</span>
                        <span className={`badge badge-${t.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{t.status}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        <strong>From:</strong> {t.pickup_address} <br />
                        <strong>To:</strong> {t.dropoff_address}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Service: {t.booking_type} | Fare: KES {t.fare}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {t.status === 'Assigned' && (
                        <button 
                          onClick={() => handleUpdateStatus(t.id, 'Active')}
                          className="btn-primary" 
                          style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px' }}
                        >
                          <FaPlay size={10} />
                          <span>Start Trip</span>
                        </button>
                      )}
                      
                      {t.status === 'Active' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(t.id, 'Completed')}
                            className="btn-primary" 
                            style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px' }}
                          >
                            <FaCheckCircle size={10} />
                            <span>Complete Job</span>
                          </button>
                          {!activeMapTrip && (
                            <button 
                              onClick={() => startMapMonitoring(t)}
                              className="btn-secondary" 
                              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                            >
                              Open Map
                            </button>
                          )}
                        </>
                      )}

                      {t.status === 'Completed' && (
                        <span style={{ color: 'var(--primary-teal)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaCheckCircle />
                          <span>Finished</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {trips.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    No trips currently assigned. Check in with the Dispatcher.
                  </div>
                )}
              </div>
            </div>

            {/* Live active trip map panel */}
            {activeMapTrip && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>In-Transit GPS Plot</h3>
                  <button onClick={stopMapMonitoring} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>Close Map</button>
                </div>
                <div style={{ flex: 1, minHeight: '300px', marginBottom: '15px' }}>
                  <MapTracker 
                    pickup={activeMapTrip.pickup_coords}
                    dropoff={activeMapTrip.dropoff_coords}
                    current={trackingData ? trackingData.current_location : null}
                    height="100%"
                  />
                </div>
                {trackingData && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Speed: <strong>{trackingData.speed} km/h</strong></span>
                    <span>ETA: <strong>{trackingData.eta_seconds > 0 ? `${Math.ceil(trackingData.eta_seconds / 60)} mins` : 'Arrived'}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Vehicle Status Log */}
        {activeTab === 'vehicle' && driverProfile && driverProfile.vehicle && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="vehicle-layout">
            <div className="glass-card">
              <h2 className="gradient-title gradient-text" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Vehicle Specifications</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Plate Number</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{driverProfile.vehicle.plate_number}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Make & Model</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{driverProfile.vehicle.make} {driverProfile.vehicle.model}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vehicle Class</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{driverProfile.vehicle.type}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Odometer (Mileage)</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{driverProfile.vehicle.mileage} km</div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fuel Level</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ 
                        background: driverProfile.vehicle.fuel_level < 20 ? 'var(--accent-rose)' : 'var(--primary-teal)', 
                        width: `${driverProfile.vehicle.fuel_level}%`, 
                        height: '100%' 
                      }}></div>
                    </div>
                    <span style={{ fontWeight: 700 }}>{driverProfile.vehicle.fuel_level}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Maintenance Diagnostics Warnings */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaExclamationTriangle style={{ color: 'var(--accent-amber)' }} />
                <span>Predictive Diagnostics</span>
              </h3>

              {/* Maintenance check math */}
              {(() => {
                const limit = 5000;
                const driven = driverProfile.vehicle.mileage - driverProfile.vehicle.last_service_mileage;
                const critical = driven > limit;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                      background: critical ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid',
                      borderColor: critical ? 'var(--accent-rose)' : 'var(--primary-teal)',
                      padding: '16px',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontWeight: 700, color: critical ? 'var(--accent-rose)' : 'var(--primary-teal)', fontSize: '1.05rem' }}>
                        {critical ? 'Service Recommended' : 'Diagnostics Clear'}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {critical 
                          ? `This vehicle has driven ${Math.round(driven)} km since the last service (Limit: 5000 km). Fuel injection and filter cleaning is requested.`
                          : `Vehicle has driven ${Math.round(driven)} km since the last service. Maintenance is estimated due in ${Math.round(limit - driven)} km.`
                        }
                      </p>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Average Fuel Economy:</strong> {driverProfile.vehicle.avg_fuel_consumption} L/100km <br />
                      <strong>Next Scheduled Service Check:</strong> {Math.round(driverProfile.vehicle.last_service_mileage + limit)} km
                    </div>
                  </div>
                );
              })()}
            </div>
            <style>{`
              @media (max-width: 768px) {
                .vehicle-layout { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}

        {/* Tab 3: Earnings */}
        {activeTab === 'earnings' && (
          <div className="animate-fade-in">
            <div className="stats-grid">
              <div className="glass-card stat-card">
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Completed Trips</div>
                <div className="stat-val gradient-text">{completedTrips.length}</div>
              </div>
              <div className="glass-card stat-card">
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>My Share (60% Payout)</div>
                <div className="stat-val" style={{ color: 'var(--primary-teal)' }}>KES {totalEarnings}</div>
              </div>
              <div className="glass-card stat-card">
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Platform Commission (40%)</div>
                <div className="stat-val" style={{ color: 'var(--primary-blue)' }}>KES {completedTrips.reduce((sum, t) => sum + (t.fare * 0.4), 0)}</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Payout List</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Customer</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Service Type</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Fare</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>My Share</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTrips.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{t.id}</td>
                        <td style={{ padding: '12px 16px' }}>{t.customer_name}</td>
                        <td style={{ padding: '12px 16px' }}>{t.booking_type}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>KES {t.fare}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--primary-teal)', fontWeight: 700 }}>KES {t.fare * 0.6}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {completedTrips.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No completed jobs recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DriverDashboard;
