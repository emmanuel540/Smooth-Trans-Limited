import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarCheck, FaMapMarkedAlt, FaWrench, 
  FaMoneyBillWave, FaArrowRight, FaRoute, FaBolt 
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const nairobiZones = [
  { name: 'Nairobi CBD', lat: -1.2921, lng: 36.8219 },
  { name: 'Westlands', lat: -1.2682, lng: 36.8055 },
  { name: 'Kilimani', lat: -1.2902, lng: 36.7865 },
  { name: 'Karen', lat: -1.3201, lng: 36.7050 },
  { name: 'Langata', lat: -1.3323, lng: 36.7681 },
  { name: 'Eastleigh', lat: -1.2789, lng: 36.8489 },
  { name: 'South C', lat: -1.3175, lng: 36.8290 },
  { name: 'Industrial Area', lat: -1.3115, lng: 36.8520 }
];

const Home = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [serviceType, setServiceType] = useState('General');
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;
    setLoading(true);
    
    const startZone = nairobiZones.find(z => z.name === pickup);
    const endZone = nairobiZones.find(z => z.name === dropoff);
    
    // Call estimation API
    fetch('http://localhost:5000/api/bookings/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup_coords: { lat: startZone.lat, lng: startZone.lng },
        dropoff_coords: { lat: endZone.lat, lng: endZone.lng },
        booking_type: serviceType
      })
    })
      .then(res => res.json())
      .then(data => {
        setEstimation(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section animate-fade-in" style={{ padding: '80px 20px', position: 'relative' }}>
        <div style={{ maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }} className="hero-grid">
          <div style={{ textAlign: 'left' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--border-active)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--primary-teal)',
              marginBottom: '20px'
            }}>
              <FaBolt />
              <span>AI-POWERED LOGISTICS FLEET SYSTEM</span>
            </div>
            
            <h1 className="gradient-title" style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '20px' }}>
              Intelligent <br />
              <span className="gradient-text">Logistics & Transit</span> <br />
              For Smooth Operations
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '500px', lineHeight: '1.6' }}>
              Smooth Trans Limited provides smart booking systems, live fleet tracking, AI route optimization, predictive maintenance, and M-Pesa integrations.
            </p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
                <span>Get Started Now</span>
                <FaArrowRight size={14} />
              </Link>
              <Link to="/services" className="btn-secondary" style={{ textDecoration: 'none' }}>
                Explore Services
              </Link>
            </div>
          </div>

          {/* Quick Calculator Panel */}
          <div className="glass-card animate-slide-up" style={{ width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Fare Estimator</h3>
            <form onSubmit={handleEstimate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 600 }}>Pickup Zone</label>
                <select 
                  className="glass-input" 
                  value={pickup} 
                  onChange={(e) => setPickup(e.target.value)}
                  required
                >
                  <option value="">Select Pickup</option>
                  {nairobiZones.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 600 }}>Destination Zone</label>
                <select 
                  className="glass-input" 
                  value={dropoff} 
                  onChange={(e) => setDropoff(e.target.value)}
                  required
                >
                  <option value="">Select Destination</option>
                  {nairobiZones.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 600 }}>Service Type</label>
                <select 
                  className="glass-input" 
                  value={serviceType} 
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="General">General Transport</option>
                  <option value="School">School Transit</option>
                  <option value="Delivery">Parcel Delivery</option>
                  <option value="Moving">Moving / Relocation</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? <div className="loader-spinner"></div> : 'Calculate Estimate'}
              </button>
            </form>

            {estimation && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px dashed var(--border-active)',
                borderRadius: '10px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated Distance</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {estimation.distance_km} km
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calculated Fare</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-teal)' }}>
                  KES {estimation.fare}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  *Rates based on standard tariff profiles. Sign in to proceed to routing selection & booking.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 20px', background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="gradient-title" style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Core Platform Features</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '50px', maxWidth: '600px', margin: '0 auto 50px auto' }}>
            Built using next-generation automation concepts to present a highly functional student project outline.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {/* feature 1 */}
            <div className="glass-card">
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-blue)',
                fontSize: '1.5rem', marginBottom: '20px'
              }}>
                <FaCalendarCheck />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', textAlign: 'left' }}>Smart Bookings</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'left', lineHeight: '1.6' }}>
                Secure on-demand rides, schedule school pickups, or order bulky parcel dispatch via localized request sheets.
              </p>
            </div>

            {/* feature 2 */}
            <div className="glass-card">
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-teal)',
                fontSize: '1.5rem', marginBottom: '20px'
              }}>
                <FaMapMarkedAlt />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', textAlign: 'left' }}>Live Map Tracking</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'left', lineHeight: '1.6' }}>
                Interactive GIS Leaflet plotting tracks vehicle coordinate progress in real-time, matching ETA details.
              </p>
            </div>

            {/* feature 3 */}
            <div className="glass-card">
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-amber)',
                fontSize: '1.5rem', marginBottom: '20px'
              }}>
                <FaRoute />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', textAlign: 'left' }}>Route AI Optimizer</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'left', lineHeight: '1.6' }}>
                Select Shortest, Fastest, or Eco-efficient paths based on fuel consumption analysis.
              </p>
            </div>

            {/* feature 4 */}
            <div className="glass-card">
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-rose)',
                fontSize: '1.5rem', marginBottom: '20px'
              }}>
                <FaWrench />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', textAlign: 'left' }}>Predictive Fleet Diagnostics</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'left', lineHeight: '1.6' }}>
                Monitors engine fatigue metrics to trigger predictive service intervals before failures take place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 20px',
        borderTop: '1px solid var(--border-light)',
        textAlign: 'center',
        background: '#04060a'
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} Smooth Trans Limited. All rights reserved. Built as a Logistics final year project.
        </div>
      </footer>

      {/* Inline styles for hero grid layout */}
      <style>{`
        .hero-grid {
          width: 100%;
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid div:first-child {
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
