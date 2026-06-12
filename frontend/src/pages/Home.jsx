import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

import { 
  FaCalendarCheck, FaMapMarkedAlt, 
  FaWrench, FaRoute
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
    <div style={{ background: '#f5faff', minHeight: '100vh' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>

          {/* Fare Estimator Card — centred */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid rgba(43, 108, 176, 0.15)', 
            borderRadius: '24px', 
            padding: '36px', 
            boxShadow: '0 10px 25px rgba(43, 108, 176, 0.05)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px', color: '#2b6cb0' }}>Fare Estimator</h3>
            <form onSubmit={handleEstimate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#2b6cb0', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 700 }}>Pickup Zone</label>
                <select 
                  className="glass-input" 
                  value={pickup} 
                  onChange={(e) => setPickup(e.target.value)}
                  style={{ color: '#2b6cb0', border: '1px solid rgba(43, 108, 176, 0.25)' }}
                  required
                >
                  <option value="">Select Pickup</option>
                  {nairobiZones.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#2b6cb0', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 700 }}>Destination Zone</label>
                <select 
                  className="glass-input" 
                  value={dropoff} 
                  onChange={(e) => setDropoff(e.target.value)}
                  style={{ color: '#2b6cb0', border: '1px solid rgba(43, 108, 176, 0.25)' }}
                  required
                >
                  <option value="">Select Destination</option>
                  {nairobiZones.map(z => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#2b6cb0', display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 700 }}>Service Type</label>
                <select 
                  className="glass-input" 
                  value={serviceType} 
                  onChange={(e) => setServiceType(e.target.value)}
                  style={{ color: '#2b6cb0', border: '1px solid rgba(43, 108, 176, 0.25)' }}
                >
                  <option value="General">General Transport</option>
                  <option value="School">School Transit</option>
                  <option value="Delivery">Parcel Delivery</option>
                  <option value="Moving">Moving / Relocation</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', width: '100%', padding: '12px', borderRadius: '12px' }}>
                {loading ? <div className="loader-spinner" style={{ margin: '0 auto' }}></div> : 'Calculate Estimate'}
              </button>
            </form>

            {estimation && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f5faff',
                border: '1px solid #2b6cb0',
                borderRadius: '12px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#2b6cb0', opacity: 0.8 }}>Estimated Distance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b6cb0', marginBottom: '10px' }}>
                  {estimation.distance_km} km
                </div>
                <div style={{ fontSize: '0.85rem', color: '#2b6cb0', opacity: 0.8 }}>Calculated Fare</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b6cb0' }}>
                  KES {estimation.fare}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2b6cb0', opacity: 0.6, marginTop: '8px' }}>
                  *Rates based on standard tariff profiles. Sign in to proceed to routing selection & booking.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 20px', background: '#ffffff', borderTop: '1px solid rgba(43, 108, 176, 0.15)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '15px', fontWeight: 800, color: '#2b6cb0' }}>Core Platform Features</h2>
          <p style={{ color: '#2b6cb0', opacity: 0.8, marginBottom: '50px', maxWidth: '600px', margin: '0 auto 50px auto' }}>
            Built using next-generation automation concepts to present a highly functional student project outline.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {/* feature 1 */}
            <div style={{ 
              background: '#f5faff', 
              border: '1px solid rgba(43, 108, 176, 0.15)', 
              borderRadius: '20px', 
              padding: '30px',
              textAlign: 'left'
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: '#2b6cb0',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f5faff',
                fontSize: '1.5rem', marginBottom: '20px'
              }}>
                <FaCalendarCheck />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px', color: '#2b6cb0' }}>Smart Bookings</h4>
              <p style={{ fontSize: '0.95rem', color: '#2b6cb0', opacity: 0.8, lineHeight: '1.6' }}>
                Secure on-demand rides, schedule school pickups, or order bulky parcel dispatch via localized request sheets.
              </p>
            </div>

            {/* feature 2 */}
            <div style={{ 
              background: '#f5faff', 
              border: '1px solid rgba(43, 108, 176, 0.15)', 
              borderRadius: '20px', 
              padding: '30px',
              textAlign: 'left'
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: '#2b6cb0',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f5faff',
                fontSize: '1.5rem', marginBottom: '20px'
              }}>
                <FaMapMarkedAlt />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px', color: '#2b6cb0' }}>Live Map Tracking</h4>
              <p style={{ fontSize: '0.95rem', color: '#2b6cb0', opacity: 0.8, lineHeight: '1.6' }}>
                Interactive GIS Leaflet plotting tracks vehicle coordinate progress in real-time, matching ETA details.
              </p>
            </div>

            {/* feature 3 */}
            <div style={{ 
              background: '#f5faff', 
              border: '1px solid rgba(43, 108, 176, 0.15)', 
              borderRadius: '20px', 
              padding: '30px',
              textAlign: 'left'
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: '#2b6cb0',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f5faff',
                fontSize: '1.5rem', marginBottom: '20px'
              }}>
                <FaRoute />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px', color: '#2b6cb0' }}>Route Optimizer</h4>
              <p style={{ fontSize: '0.95rem', color: '#2b6cb0', opacity: 0.8, lineHeight: '1.6' }}>
                Select Shortest, Fastest, or Eco-efficient paths based on fuel consumption analysis.
              </p>
            </div>

            {/* feature 4 */}
            <div style={{ 
              background: '#f5faff', 
              border: '1px solid rgba(43, 108, 176, 0.15)', 
              borderRadius: '20px', 
              padding: '30px',
              textAlign: 'left'
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px', background: '#2b6cb0',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f5faff',
                fontSize: '1.5rem', marginBottom: '20px'
              }}>
                <FaWrench />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px', color: '#2b6cb0' }}>Predictive Diagnostics</h4>
              <p style={{ fontSize: '0.95rem', color: '#2b6cb0', opacity: 0.8, lineHeight: '1.6' }}>
                Monitors engine fatigue metrics to trigger predictive service intervals before failures take place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 20px',
        textAlign: 'center',
        background: '#2b6cb0',
        color: '#f5faff',
        borderTop: '1px solid rgba(245, 250, 255, 0.15)'
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          &copy; {new Date().getFullYear()} Smooth Trans Limited. All rights reserved. Built as a Logistics final year project.
        </div>
      </footer>


    </div>
  );
};

export default Home;
