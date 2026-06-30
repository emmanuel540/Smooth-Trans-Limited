import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

import { 
  FaCalendarCheck, FaMapMarkedAlt, 
  FaWrench, FaRoute, FaArrowRight, FaShieldAlt
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import MapTracker from '../components/MapTracker';

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
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [serviceType, setServiceType] = useState('General');
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;
    setLoading(true);
    
    const startZone = nairobiZones.find(z => z.name === pickup);
    const endZone = nairobiZones.find(z => z.name === dropoff);
    setPickupCoords({ lat: startZone.lat, lng: startZone.lng });
    setDropoffCoords({ lat: endZone.lat, lng: endZone.lng });
    
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

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard/customer#home');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      <Navbar />
      
      {/* Hero Section Redesigned as Split Layout */}
      <section style={{ 
        padding: '80px 40px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '40px',
        alignItems: 'center'
      }} className="hero-split">
        
        {/* Left Column: Premium Pitch or Route Map Preview */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {pickupCoords && dropoffCoords ? (
            <div className="glass-card animate-fade-in" style={{ padding: '24px', height: '420px', display: 'flex', flexDirection: 'column', width: '100%', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '12px' }}>Interactive Route Preview</h3>
              <div style={{ flex: 1, minHeight: '280px', borderRadius: '12px', overflow: 'hidden' }}>
                <MapTracker 
                  pickup={pickupCoords} 
                  dropoff={dropoffCoords}
                  height="100%"
                />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-active-link)',
                color: 'var(--primary-blue)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                alignSelf: 'flex-start'
              }}>
                <FaShieldAlt />
                <span>Safety Certified Logistics</span>
              </div>

              <h1 className="gradient-title gradient-text" style={{ 
                fontSize: '3.6rem', 
                lineHeight: '1.1',
                fontWeight: 800
              }}>
                Logistics precision, engineered for peace of mind.
              </h1>

              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem', 
                lineHeight: '1.6',
                maxWidth: '550px' 
              }}>
                Optimize your transit corridors, pre-schedule student transportation, dispatch parcels in real-time, and monitor fleet telematics with state-of-the-art computational routing.
              </p>

              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <button 
                  onClick={handleGetStarted}
                  className="btn-primary"
                  style={{ padding: '14px 28px' }}
                >
                  <span>Get Started</span>
                  <FaArrowRight size={14} />
                </button>
                <Link 
                  to="/login"
                  className="btn-secondary"
                  style={{ padding: '14px 28px' }}
                >
                  <span>Read Safety Protocols</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Fare Estimator Card */}
        <div style={{ width: '100%' }}>
          <div className="glass-card" style={{ padding: '36px' }}>
            <h3 style={{ 
              fontSize: '1.35rem', 
              fontWeight: 800, 
              marginBottom: '24px', 
              color: 'var(--primary-blue)',
              textAlign: 'left'
            }}>
              Instant Fare Estimator
            </h3>
            <form onSubmit={handleEstimate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 700 }}>Pickup Zone</label>
                <select 
                  className="glass-input" 
                  value={pickup} 
                  onChange={(e) => {
                    setPickup(e.target.value);
                    const zone = nairobiZones.find(z => z.name === e.target.value);
                    setPickupCoords(zone ? { lat: zone.lat, lng: zone.lng } : null);
                    setEstimation(null);
                  }}
                  required
                >
                  <option value="">Select Pickup</option>
                  {nairobiZones.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 700 }}>Destination Zone</label>
                <select 
                  className="glass-input" 
                  value={dropoff} 
                  onChange={(e) => {
                    setDropoff(e.target.value);
                    const zone = nairobiZones.find(z => z.name === e.target.value);
                    setDropoffCoords(zone ? { lat: zone.lat, lng: zone.lng } : null);
                    setEstimation(null);
                  }}
                  required
                >
                  <option value="">Select Destination</option>
                  {nairobiZones.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 700 }}>Service Type</label>
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

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', width: '100%' }}>
                {loading ? <div className="loader-spinner" style={{ margin: '0 auto' }}></div> : 'Calculate Estimate'}
              </button>
            </form>

            {estimation && (
              <div className="animate-fade-in" style={{
                marginTop: '24px',
                padding: '20px',
                background: 'rgba(30, 58, 138, 0.04)',
                border: '1px solid rgba(30, 58, 138, 0.1)',
                borderRadius: '12px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estimated Distance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '12px' }}>
                  {estimation.distance_km} km
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Calculated Fare</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-teal)' }}>
                  KES {estimation.fare}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: '1.4' }}>
                  *Rates based on standard tariff profiles. Sign in to proceed to routing selection & booking.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '100px 20px', background: '#ffffff', borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="gradient-title gradient-text" style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Core Platform Features</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px auto' }}>
            Built using next-generation automation concepts to present a highly functional student project outline.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '30px'
          }}>
            {/* feature 1 */}
            <div className="glass-card" style={{ textAlign: 'left', background: 'var(--bg-main)', border: 'none' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary-blue)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff',
                fontSize: '1.3rem', marginBottom: '24px'
              }}>
                <FaCalendarCheck />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--primary-blue)' }}>Smart Bookings</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Secure on-demand rides, schedule school pickups, or order bulky parcel dispatch via localized request sheets.
              </p>
            </div>

            {/* feature 2 */}
            <div className="glass-card" style={{ textAlign: 'left', background: 'var(--bg-main)', border: 'none' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary-blue)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff',
                fontSize: '1.3rem', marginBottom: '24px'
              }}>
                <FaMapMarkedAlt />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--primary-blue)' }}>Live Map Tracking</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Interactive GIS Leaflet plotting tracks vehicle coordinate progress in real-time, matching ETA details.
              </p>
            </div>

            {/* feature 3 */}
            <div className="glass-card" style={{ textAlign: 'left', background: 'var(--bg-main)', border: 'none' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary-blue)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff',
                fontSize: '1.3rem', marginBottom: '24px'
              }}>
                <FaRoute />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--primary-blue)' }}>Route Optimizer</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Select Shortest, Fastest, or Eco-efficient paths based on fuel consumption analysis.
              </p>
            </div>

            {/* feature 4 */}
            <div className="glass-card" style={{ textAlign: 'left', background: 'var(--bg-main)', border: 'none' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary-blue)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff',
                fontSize: '1.3rem', marginBottom: '24px'
              }}>
                <FaWrench />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--primary-blue)' }}>Predictive Diagnostics</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Monitors engine fatigue metrics to trigger predictive service intervals before failures take place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '50px 20px',
        textAlign: 'center',
        background: '#0f172a',
        color: '#94a3b8',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            &copy; {new Date().getFullYear()} Smooth Trans Limited. All rights reserved. Built as a Logistics final year project.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</a>
            <span>&bull;</span>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</a>
            <span>&bull;</span>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Safety Standards</a>
          </div>
        </div>
      </footer>

      {/* Responsive layout style override */}
      <style>{`
        @media (max-width: 992px) {
          .hero-split {
            grid-template-columns: 1fr !important;
            padding: 40px 20px !important;
            text-align: center !important;
          }
          .hero-split div {
            text-align: center !important;
            align-items: center !important;
            align-self: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
