import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import MapTracker from '../../components/MapTracker';
import { 
  FaRoute, FaMoneyCheckAlt, FaClipboardList, 
  FaMapMarkerAlt, FaCompass, FaRegFileAlt, FaCheckCircle,
  FaPhoneAlt, FaCreditCard, FaMapPin 
} from 'react-icons/fa';

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

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('book'); // book, bookings, tracking
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Booking Form State
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [bookingType, setBookingType] = useState('General');
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null); // 'shortest', 'cheapest', 'fastest'
  const [selectedRouteData, setSelectedRouteData] = useState(null);
  const [optLoading, setOptLoading] = useState(false);

  // Payment State
  const [payingBooking, setPayingBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('MPesa');
  const [phoneNo, setPhoneNo] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Tracking State
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingIntervalId, setTrackingIntervalId] = useState(null);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/bookings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
    return () => {
      if (trackingIntervalId) clearInterval(trackingIntervalId);
    };
  }, []);

  // AI Route optimization lookup
  const handleOptimizeRoute = () => {
    if (!pickup || !dropoff) return;
    if (pickup === dropoff) {
      alert("Pickup and Destination cannot be the same!");
      return;
    }
    setOptLoading(true);
    setOptimizedRoutes([]);
    setSelectedRoute(null);
    setSelectedRouteData(null);

    const startZone = nairobiZones.find(z => z.name === pickup);
    const endZone = nairobiZones.find(z => z.name === dropoff);

    fetch('http://localhost:5000/api/ai/optimize-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup_coords: { lat: startZone.lat, lng: startZone.lng },
        dropoff_coords: { lat: endZone.lat, lng: endZone.lng }
      })
    })
      .then(res => res.json())
      .then(data => {
        setOptimizedRoutes(data.routes);
        // Default to shortest route
        const shortest = data.routes.find(r => r.id === 'shortest');
        setSelectedRoute('shortest');
        setSelectedRouteData(shortest);
        setOptLoading(false);
      })
      .catch(err => {
        console.error(err);
        setOptLoading(false);
      });
  };

  // Submit Booking
  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!selectedRouteData) return;
    setLoading(true);

    const startZone = nairobiZones.find(z => z.name === pickup);
    const endZone = nairobiZones.find(z => z.name === dropoff);

    fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        booking_type: bookingType,
        pickup_address: pickup,
        dropoff_address: dropoff,
        pickup_coords: { lat: startZone.lat, lng: startZone.lng },
        dropoff_coords: { lat: endZone.lat, lng: endZone.lng },
        payment_method: 'MPesa'
      })
    })
      .then(res => res.json())
      .then(data => {
        fetchBookings();
        setActiveTab('bookings');
        setPickup('');
        setDropoff('');
        setOptimizedRoutes([]);
        setSelectedRoute(null);
        setSelectedRouteData(null);
        alert("Booking submitted successfully! You can verify status and make payments under 'My Bookings'.");
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // Process Mock Payment
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    fetch('http://localhost:5000/api/payments/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        booking_id: payingBooking.id,
        payment_method: paymentMethod,
        phone_number: phoneNo,
        card_number: cardNo
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then(data => {
        setPaymentSuccess(true);
        setPaymentLoading(false);
        setTimeout(() => {
          setPayingBooking(null);
          setPaymentSuccess(false);
          setPhoneNo('');
          setCardNo('');
          fetchBookings();
        }, 2000);
      })
      .catch(err => {
        alert(err.message || "Payment processing failed. Please try again.");
        setPaymentLoading(false);
      });
  };

  // Live tracking fetch logic
  const startTracking = (booking) => {
    setTrackingBooking(booking);
    setActiveTab('tracking');
    
    if (trackingIntervalId) clearInterval(trackingIntervalId);

    const fetchProgress = () => {
      fetch(`http://localhost:5000/api/tracking/${booking.id}/progress`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          setTrackingData(data);
        })
        .catch(err => console.error(err));
    };

    fetchProgress(); // call once immediately
    const intId = setInterval(fetchProgress, 4000); // Poll every 4 seconds
    setTrackingIntervalId(intId);
  };

  const stopTracking = () => {
    if (trackingIntervalId) clearInterval(trackingIntervalId);
    setTrackingIntervalId(null);
    setTrackingBooking(null);
    setTrackingData(null);
  };

  // Fetch Receipt details
  const viewReceipt = (bookingId) => {
    fetch(`http://localhost:5000/api/payments/${bookingId}/receipt`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setReceiptData(data);
      })
      .catch(err => console.error(err));
  };

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
            onClick={() => { setActiveTab('book'); stopTracking(); }}
            className="btn-secondary" 
            style={{
              background: activeTab === 'book' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderColor: activeTab === 'book' ? 'var(--primary-teal)' : 'var(--border-light)',
              display: 'flex', alignContent: 'center', gap: '8px'
            }}
          >
            <FaCompass />
            <span>Book Transport</span>
          </button>
          <button 
            onClick={() => { setActiveTab('bookings'); stopTracking(); }}
            className="btn-secondary"
            style={{
              background: activeTab === 'bookings' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderColor: activeTab === 'bookings' ? 'var(--primary-teal)' : 'var(--border-light)',
              display: 'flex', alignContent: 'center', gap: '8px'
            }}
          >
            <FaClipboardList />
            <span>My Bookings & Payments</span>
          </button>
          {trackingBooking && (
            <button 
              onClick={() => setActiveTab('tracking')}
              className="btn-secondary"
              style={{
                background: activeTab === 'tracking' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                borderColor: activeTab === 'tracking' ? 'var(--primary-teal)' : 'var(--border-light)',
                display: 'flex', alignContent: 'center', gap: '8px'
              }}
            >
              <FaMapMarkedAlt />
              <span>Live Tracking #{trackingBooking.id}</span>
            </button>
          )}
        </div>

        {/* Tab CONTENT: BOOK SERVICE */}
        {activeTab === 'book' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }} className="book-layout">
            {/* Booking Form */}
            <div className="glass-card">
              <h2 className="gradient-title gradient-text" style={{ fontSize: '1.5rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaCompass />
                <span>Create Booking</span>
              </h2>

              <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Service Type</label>
                    <select className="glass-input" value={bookingType} onChange={(e) => setBookingType(e.target.value)}>
                      <option value="General">General Transport</option>
                      <option value="School">School Transport</option>
                      <option value="Delivery">Parcel Delivery</option>
                      <option value="Moving">Moving Services</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Schedule Time</label>
                    <input type="datetime-local" className="glass-input" defaultValue={new Date().toISOString().substring(0, 16)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Pickup Location</label>
                    <select className="glass-input" value={pickup} onChange={(e) => setPickup(e.target.value)} required>
                      <option value="">Choose Pickup Location</option>
                      {nairobiZones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Destination Location</label>
                    <select className="glass-input" value={dropoff} onChange={(e) => setDropoff(e.target.value)} required>
                      <option value="">Choose Dropoff Location</option>
                      {nairobiZones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleOptimizeRoute} 
                  disabled={!pickup || !dropoff || optLoading} 
                  className="btn-secondary"
                  style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                >
                  {optLoading ? <div className="loader-spinner"></div> : (
                    <>
                      <FaRoute />
                      <span>Analyze AI Route Options</span>
                    </>
                  )}
                </button>

                {/* AI optimized routes choices */}
                {optimizedRoutes.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 700 }}>Select Optimized Path:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {optimizedRoutes.map((route) => (
                        <div 
                          key={route.id}
                          onClick={() => { setSelectedRoute(route.id); setSelectedRouteData(route); }}
                          style={{
                            border: '1px solid',
                            borderColor: selectedRoute === route.id ? 'var(--primary-teal)' : 'var(--border-light)',
                            background: selectedRoute === route.id ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{route.name}</span>
                              {route.id === 'cheapest' && <span style={{ background: '#10b981', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>Eco</span>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{route.description}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Dist: {route.distance_km}km | Time: {route.duration_mins} mins | Fuel: {route.fuel_liters}L
                            </div>
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-teal)' }}>
                            KES {route.cost_kes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRouteData && (
                  <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '20px' }}>
                    {loading ? <div className="loader-spinner"></div> : `Book Service (KES ${selectedRouteData.cost_kes})`}
                  </button>
                )}
              </form>
            </div>

            {/* Static Leaflet Preview Map */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>Route Overlay View</h3>
              {pickup && dropoff ? (
                <div style={{ flex: 1, minHeight: '350px' }}>
                  <MapTracker 
                    pickup={nairobiZones.find(z => z.name === pickup)} 
                    dropoff={nairobiZones.find(z => z.name === dropoff)}
                    routePath={selectedRouteData ? selectedRouteData.path : null}
                    height="100%"
                  />
                </div>
              ) : (
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-light)',
                  borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                  color: 'var(--text-muted)', fontSize: '0.9rem', minHeight: '350px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <FaMapPin size={24} style={{ marginBottom: '10px', color: 'var(--text-muted)' }} />
                    <div>Select locations and click Analyze to preview route.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab CONTENT: MY BOOKINGS & BILLING */}
        {activeTab === 'bookings' && (
          <div className="animate-fade-in">
            <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Logistics Orders</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID</th>
                      <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Service</th>
                      <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Route</th>
                      <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fare</th>
                      <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment</th>
                      <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</th>
                      <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '16px', fontWeight: 600 }}>#{b.id}</td>
                        <td style={{ padding: '16px' }}>{b.booking_type}</td>
                        <td style={{ padding: '16px', fontSize: '0.85rem' }}>
                          <strong>{b.pickup_address}</strong> &rarr; <strong>{b.dropoff_address}</strong>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 700 }}>KES {b.fare}</td>
                        <td style={{ padding: '16px' }}>
                          {b.payment_status === 'Completed' ? (
                            <span style={{ color: 'var(--primary-teal)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                              <FaCheckCircle />
                              <span>Paid</span>
                            </span>
                          ) : (
                            <button onClick={() => setPayingBooking(b)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}>
                              Pay Now
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                        </td>
                        <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                          {(b.status === 'Active' || b.status === 'Completed') && (
                            <button onClick={() => startTracking(b)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}>
                              Track
                            </button>
                          )}
                          {b.payment_status === 'Completed' && (
                            <button onClick={() => viewReceipt(b.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}>
                              Invoice
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab CONTENT: LIVE TRACKING */}
        {activeTab === 'tracking' && trackingBooking && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="track-layout">
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Live Dispatch Tracking</h2>
                <button onClick={stopTracking} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Stop Monitoring</button>
              </div>

              {/* Live moving Leaflet map */}
              <div style={{ flex: 1, minHeight: '380px' }}>
                <MapTracker 
                  pickup={trackingBooking.pickup_coords}
                  dropoff={trackingBooking.dropoff_coords}
                  current={trackingData ? trackingData.current_location : null}
                  height="100%"
                />
              </div>
            </div>

            {/* Tracking Status Box */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Trip Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Booking ID</span>
                  <div style={{ fontWeight: 700 }}>#{trackingBooking.id} ({trackingBooking.booking_type})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned Driver</span>
                  <div style={{ fontWeight: 600 }}>{trackingBooking.driver_name || 'Locating vehicle...'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Route Summary</span>
                  <div style={{ fontSize: '0.9rem' }}>
                    <strong>{trackingBooking.pickup_address}</strong> &rarr; <strong>{trackingBooking.dropoff_address}</strong>
                  </div>
                </div>

                <hr style={{ borderColor: 'var(--border-light)' }} />

                {trackingData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Transit Progress</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ background: 'var(--primary-teal)', width: `${trackingData.progress}%`, height: '100%', borderRadius: '5px', transition: 'width 1s ease' }}></div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{trackingData.progress}%</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Speed</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-blue)' }}>{trackingData.speed} km/h</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ETA</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                          {trackingData.eta_seconds > 0 ? `${Math.ceil(trackingData.eta_seconds / 60)} mins` : 'Arrived'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                    <div className="loader-spinner" style={{ margin: '0 auto 10px auto' }}></div>
                    <span>Initializing GPS tracking beacon link...</span>
                  </div>
                )}
              </div>
            </div>
            <style>{`
              @media (max-width: 768px) {
                .track-layout { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}

        {/* MODAL: M-PESA STK PUSH & CARD PAYMENT FORM */}
        {payingBooking && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Authorize Billing</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Complete payment of **KES {payingBooking.fare}** for Booking #{payingBooking.id}.
              </p>

              {paymentSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <FaCheckCircle size={48} style={{ color: 'var(--primary-teal)', marginBottom: '15px' }} />
                  <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Transaction Successful!</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Billing invoice updated.</p>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Payment Method</label>
                    <select className="glass-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="MPesa">M-Pesa STK Push</option>
                      <option value="Card">Credit/Debit Card</option>
                    </select>
                  </div>

                  {paymentMethod === 'MPesa' ? (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>M-Pesa Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <FaPhoneAlt style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" 
                          placeholder="e.g. 0712345678" 
                          className="glass-input"
                          style={{ paddingLeft: '40px' }}
                          value={phoneNo}
                          onChange={(e) => setPhoneNo(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Card Number</label>
                      <div style={{ position: 'relative' }}>
                        <FaCreditCard style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" 
                          placeholder="4000 1234 5678 9010" 
                          className="glass-input"
                          style={{ paddingLeft: '40px' }}
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setPayingBooking(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={paymentLoading} style={{ flex: 1 }}>
                      {paymentLoading ? <div className="loader-spinner"></div> : 'Confirm Payment'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL: EXPORT INVOICE / RECEIPT GENERATOR */}
        {receiptData && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Invoice Receipt</h3>
                <button onClick={() => setReceiptData(null)} className="btn-secondary" style={{ padding: '2px 10px', fontSize: '0.8rem' }}>Close</button>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>SMOOTH TRANS LIMITED</h4>
                  <div>Mombasa Road Corporate Center, Nairobi</div>
                  <div>Tel: +254 (0) 700 123 456</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
                  <span>Invoice No:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{receiptData.invoice_no}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
                  <span>Transaction ID:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{receiptData.transaction_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
                  <span>Payment Date:</span>
                  <span>{new Date(receiptData.date).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
                  <span>Method:</span>
                  <span>{receiptData.payment_method}</span>
                </div>

                <hr style={{ borderStyle: 'dashed', borderColor: 'var(--border-light)', margin: '15px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0' }}>
                  <span>Service Type:</span>
                  <span>{receiptData.booking.booking_type}</span>
                </div>
                <div style={{ margin: '6px 0' }}>
                  <span>Pickup:</span> <span style={{ color: 'var(--text-primary)' }}>{receiptData.booking.pickup_address}</span>
                </div>
                <div style={{ margin: '6px 0' }}>
                  <span>Destination:</span> <span style={{ color: 'var(--text-primary)' }}>{receiptData.booking.dropoff_address}</span>
                </div>

                <hr style={{ borderStyle: 'dashed', borderColor: 'var(--border-light)', margin: '15px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-teal)' }}>
                  <span>TOTAL PAID:</span>
                  <span>KES {receiptData.amount}</span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-muted)' }}>
                  Thank you for choosing Smooth Trans Limited!
                </div>
              </div>

              <button 
                onClick={() => { window.print(); }} 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '20px', gap: '8px' }}
              >
                <FaRegFileAlt />
                <span>Print PDF Receipt</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDashboard;
