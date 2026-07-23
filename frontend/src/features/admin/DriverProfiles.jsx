import React, { useState, useEffect } from 'react';
import Sidebar from '../shared/Sidebar';
import { FaIdCard, FaStar, FaUserPlus, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import apiFetch from '../../api';

const DriverProfiles = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = () => {
    setLoading(true);
    apiFetch('/api/drivers', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setDrivers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        
        {/* Title */}
        <div style={{ marginBottom: '30px', textAlign: 'left' }}>
          <h1 className="gradient-title gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Driver Roster</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verify driver licenses, availability status, and performance ratings.</p>
        </div>

        {/* Drivers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }} className="drivers-grid">
          {drivers.map(d => (
            <div key={d.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{d.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.email}</span>
                </div>
                <span 
                  style={{
                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                    background: d.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    color: d.status === 'Available' ? 'var(--primary-teal)' : 'var(--accent-rose)'
                  }}
                >
                  {d.status}
                </span>
              </div>

              <hr style={{ borderColor: 'var(--border-light)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyItems: 'center', gap: '6px' }}>
                  <FaIdCard style={{ marginTop: '2px' }} />
                  <span>License: <strong>{d.license_number}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyItems: 'center', gap: '6px' }}>
                  <FaCalendarAlt style={{ marginTop: '2px' }} />
                  <span>Expiry: <strong>{new Date(d.license_expiry).toLocaleDateString()}</strong></span>
                </div>
                <div>
                  Assigned Vehicle: <strong>{d.vehicle ? `${d.vehicle.make} ${d.vehicle.model} (${d.vehicle.plate_number})` : 'Unassigned'}</strong>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-light)' }} />

              {/* Driver Rating & Feedback summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaStar style={{ color: 'var(--accent-amber)' }} />
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.rating}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Score)</span>
                </div>
                
                {/* Simulated review prompt */}
                <button 
                  onClick={() => {
                    const stars = prompt("Enter mock feedback rating (1 to 5 stars) for " + d.name + ":");
                    if (stars && parseFloat(stars) >= 1 && parseFloat(stars) <= 5) {
                      apiFetch(`/api/drivers/${d.user_id}/rating`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ rating: parseFloat(stars) })
                      })
                        .then(() => {
                          fetchDrivers();
                          alert("Rating submitted successfully!");
                        })
                        .catch(err => console.error(err));
                    } else if (stars) {
                      alert("Invalid rating scale.");
                    }
                  }}
                  className="btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Rate Driver
                </button>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .drivers-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DriverProfiles;
