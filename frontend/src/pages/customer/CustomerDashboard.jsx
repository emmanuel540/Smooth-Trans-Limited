import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import MapTracker from '../../components/MapTracker';
import { 
  FaRoute, FaMoneyCheckAlt, FaClipboardList, 
  FaMapMarkerAlt, FaCompass, FaRegFileAlt, FaCheckCircle,
  FaPhoneAlt, FaCreditCard, FaMapPin, FaShieldAlt, 
  FaWrench, FaHeadphones, FaPlus, FaExclamationTriangle,
  FaCar, FaGasPump, FaBatteryThreeQuarters, FaCogs,
  FaLock, FaCheck, FaTimesCircle, FaEye
} from 'react-icons/fa';

import safetyBg from '../../assets/safety_bg.png';

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

const mockVehicles = [
  { id: 1, plate: 'KCD 124X', type: 'School Bus', driver: 'John Njoroge', status: 'Active', fuel: 85, battery: 98, service: '1,200 km', speed: 45, lat: -1.2921, lng: 36.8219 },
  { id: 2, plate: 'KCE 882A', type: 'Corporate Shuttle', driver: 'David Mutua', status: 'Active', fuel: 62, battery: 94, service: '2,400 km', speed: 58, lat: -1.2682, lng: 36.8055 },
  { id: 3, plate: 'KCF 405Y', type: 'Taxi Cab', driver: 'Sarah Wambui', status: 'Idle', fuel: 95, battery: 100, service: '4,800 km', speed: 0, lat: -1.2902, lng: 36.7865 },
  { id: 4, plate: 'KDA 771L', type: 'School Bus', driver: 'Peter Omondi', status: 'In Service', fuel: 40, battery: 89, service: '800 km', speed: 12, lat: -1.3323, lng: 36.7681 }
];

const CustomerDashboard = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Passenger' };

  // Parse active tab from URL hash, default to 'home'
  const getHashTab = () => {
    const hash = window.location.hash;
    const validTabs = ['home', 'bookings', 'safety', 'fleet', 'support', 'book', 'tracking'];
    if (hash && validTabs.includes(hash.substring(1))) {
      return hash.substring(1);
    }
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getHashTab());
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

  // Contact Security Modal State
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityStatus, setSecurityStatus] = useState(null); // 'sending', 'dispatched'

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

  // Synchronize component activeTab with window location hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getHashTab());
    };
    window.addEventListener('hashchange', handleHashChange);
    fetchBookings();
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (trackingIntervalId) clearInterval(trackingIntervalId);
    };
  }, []);

  // Listen for customized navbar triggers
  useEffect(() => {
    const handleServiceTypeChange = (e) => {
      setBookingType(e.detail);
      setPickup('');
      setDropoff('');
      setOptimizedRoutes([]);
      setSelectedRoute(null);
      setSelectedRouteData(null);
    };
    window.addEventListener('changeServiceType', handleServiceTypeChange);
    return () => window.removeEventListener('changeServiceType', handleServiceTypeChange);
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
        window.location.hash = '#bookings';
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
    window.location.hash = '#tracking';
    
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
    window.location.hash = '#bookings';
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

  // Handle Security Incident trigger
  const handleSecurityAction = () => {
    setSecurityStatus('sending');
    setTimeout(() => {
      setSecurityStatus('dispatched');
    }, 2000);
  };

  const getUnpaidCount = () => bookings.filter(b => b.payment_status !== 'Completed').length;
  const getActiveCount = () => bookings.filter(b => b.status === 'Active' || b.status === 'In Progress').length;
  const getCompletedCount = () => bookings.filter(b => b.status === 'Completed').length;

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">

          {/* Tab CONTENT: HOME OVERVIEW */}
          {activeTab === 'home' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 className="gradient-title gradient-text" style={{ fontSize: '2rem' }}>Welcome Back, {user.name.split(' ')[0]}!</h1>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Here is your quick logistics command panel overview.</p>
                </div>
                <button 
                  onClick={() => window.location.hash = '#book'}
                  className="btn-primary"
                  style={{ gap: '8px' }}
                >
                  <FaPlus />
                  <span>Request Transport</span>
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="stats-grid">
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--primary-blue)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active In-Transit</span>
                  <div className="stat-val">{getActiveCount()}</div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-blue)', fontWeight: 600 }}>Vehicles live tracking</span>
                </div>
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Payments</span>
                  <div className="stat-val" style={{ color: 'var(--accent-amber)' }}>{getUnpaidCount()}</div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 600 }}>Awaiting billing approval</span>
                </div>
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--primary-teal)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Completed</span>
                  <div className="stat-val" style={{ color: 'var(--primary-teal)' }}>{getCompletedCount()}</div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-teal)', fontWeight: 600 }}>Safely delivered orders</span>
                </div>
              </div>

              {/* Fare Estimator & Map side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }} className="book-layout">
                {/* Fare Estimator */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCompass style={{ color: 'var(--primary-blue)' }} />
                    <span>Fare & Route Estimator</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Pickup Location</label>
                      <select className="glass-input" value={pickup} onChange={(e) => setPickup(e.target.value)}>
                        <option value="">Select pickup zone</option>
                        {nairobiZones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Destination Location</label>
                      <select className="glass-input" value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
                        <option value="">Select destination zone</option>
                        {nairobiZones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Service Type</label>
                      <select className="glass-input" value={bookingType} onChange={(e) => setBookingType(e.target.value)}>
                        <option value="General">General Transport</option>
                        <option value="School">School Transit</option>
                        <option value="Delivery">Parcel Delivery</option>
                        <option value="Moving">Moving / Relocation</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleOptimizeRoute} 
                      disabled={!pickup || !dropoff || optLoading} 
                      className="btn-primary"
                      style={{ marginTop: '10px' }}
                    >
                      {optLoading ? <div className="loader-spinner"></div> : 'Analyze Route Options'}
                    </button>

                    {optimizedRoutes.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '8px' }}>Optimized Route:</div>
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.12)' }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{optimizedRoutes[0].name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{optimizedRoutes[0].description}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-teal)', marginTop: '8px' }}>
                            KES {optimizedRoutes[0].cost_kes}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Card */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Intelligent Fleet Platform</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    Smooth Trans uses automated path analysis to bypass high traffic corridors. 
                    Get real-time ETAs, calculate distance tariffs automatically, and track vehicle progress interactively.
                  </p>
                  <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', border: '1px solid rgba(30, 58, 138, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaShieldAlt style={{ color: 'var(--primary-blue)', fontSize: '1.5rem' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.9rem' }}>Safety Certified Transport</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>All trips are backed by our continuous operations command center.</div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.hash = '#safety'} 
                    className="btn-secondary" 
                    style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                  >
                    View Safety Protocols &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

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
                              borderColor: selectedRoute === route.id ? 'var(--border-active)' : 'rgba(148,163,184,0.2)',
                              background: selectedRoute === route.id ? '#eff6ff' : 'rgba(255,255,255,0.4)',
                              borderRadius: '12px',
                              padding: '16px',
                              cursor: 'pointer',
                              transition: 'all 0.25s ease',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a' }}>
                                <span>{route.name}</span>
                                {route.id === 'cheapest' && <span style={{ background: 'var(--primary-teal)', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>Eco</span>}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{route.description}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Dist: {route.distance_km}km | Time: {route.duration_mins} mins | Fuel: {route.fuel_liters}L
                              </div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
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
                    flex: 1, background: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(148,163,184,0.3)',
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
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>Logistics Orders</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                        <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>ID</th>
                        <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Service</th>
                        <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Route</th>
                        <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Fare</th>
                        <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Payment</th>
                        <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
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
                              <button onClick={() => setPayingBooking(b)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}>
                                Pay Now
                              </button>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                          </td>
                          <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                            {(b.status === 'Active' || b.status === 'Completed' || b.status === 'In Progress') && (
                              <button onClick={() => startTracking(b)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}>
                                <FaMapMarkerAlt />
                                <span>Track</span>
                              </button>
                            )}
                            {b.payment_status === 'Completed' && (
                              <button onClick={() => viewReceipt(b.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}>
                                <FaRegFileAlt />
                                <span>Invoice</span>
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

          {/* Tab CONTENT: SAFETY PROTOCOLS matching mockup exactly */}
          {activeTab === 'safety' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Trust cargo Hero section */}
              <div style={{
                background: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url(${safetyBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                padding: '60px 48px',
                marginBottom: '32px',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                overflow: 'hidden',
                textAlign: 'left'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '20px'
                }}>
                  <FaShieldAlt size={12} />
                  <span>Uncompromising Safety</span>
                </div>
                
                <h1 style={{
                  fontSize: '3.2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1',
                  maxWidth: '700px',
                  marginBottom: '20px'
                }}>
                  Trust is our most critical cargo.
                </h1>
                
                <p style={{
                  fontSize: '1.15rem',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.85)',
                  maxWidth: '650px',
                  fontWeight: 400
                }}>
                  At Smooth Trans Limited, logistical precision is built on a foundation of rigorous safety protocols. We engineer peace of mind into every journey.
                </p>
              </div>

              {/* Three grid cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                {/* Card 1 */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: '#eff6ff',
                    color: '#1e3a8a',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.25rem'
                  }}>
                    <FaUserCircle />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>Driver Screening & Training</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Every operator undergoes comprehensive background checks, regular health evaluations, and continuous defensive driving certification. Only the top 5% of applicants join our fleet.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: '#eff6ff',
                    color: '#1e3a8a',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.25rem'
                  }}>
                    <FaWrench />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>Maintenance Standards</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Our proactive maintenance schedules exceed industry regulations. Every vehicle is subject to a 50-point pre-trip inspection and serviced by certified master technicians.
                  </p>
                </div>

                {/* Card 3 (Primary Accent Filled) */}
                <div className="glass-card" style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px', 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(30, 58, 138, 0.15)'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.25rem'
                  }}>
                    <FaCompass />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Real-Time Telematics</h3>
                  <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6' }}>
                    Advanced GPS tracking and onboard telemetry monitor speed, routing, and driving patterns 24/7. Clients receive minute-by-minute visibility of their cargo or passengers.
                  </p>
                </div>
              </div>

              {/* Bottom command banner */}
              <div className="glass-card" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '24px',
                background: '#ffffff',
                borderLeft: '4px solid #1e3a8a'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#1e3a8a', display: 'flex', alignItems: 'center' }}>
                    <FaHeadphones />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.05rem' }}>24/7 Operations Command</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Our dedicated support team is always online. Immediate response protocols are established for every contingency.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSecurityModal(true)} 
                  className="btn-secondary"
                  style={{
                    borderColor: '#1e3a8a',
                    color: '#1e3a8a',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Contact Security
                </button>
              </div>

              {/* Page Footer */}
              <footer style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '60px',
                paddingBottom: '20px',
                borderTop: '1px solid rgba(148, 163, 184, 0.12)',
                marginTop: '60px',
                color: '#64748b',
                fontSize: '0.82rem',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <div>
                  <strong style={{ color: '#1e3a8a' }}>Smooth Trans</strong> &copy; {new Date().getFullYear()} Smooth Trans Limited. All rights reserved. Safety Certified Transport.
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
                  <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>
                  <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>Safety Standards</a>
                  <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>Partner Portal</a>
                </div>
              </footer>
            </div>
          )}

          {/* Tab CONTENT: FLEET TELEMATICS */}
          {activeTab === 'fleet' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 className="gradient-title gradient-text" style={{ fontSize: '2rem' }}>Fleet Resource Monitor</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Real-time telemetry and predictive diagnostics on assigned carrier vehicles.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {mockVehicles.map(vehicle => (
                  <div className="glass-card" key={vehicle.id} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          color: 'var(--primary-teal)',
                          textTransform: 'uppercase',
                          background: 'rgba(13, 148, 136, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {vehicle.type}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a', marginTop: '6px' }}>{vehicle.plate}</h3>
                      </div>
                      <span className={`badge ${vehicle.status === 'Active' ? 'badge-completed' : 'badge-pending'}`}>
                        {vehicle.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Assigned Operator:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{vehicle.driver}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Next Service Interval:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{vehicle.service}</strong>
                      </div>
                    </div>

                    <hr style={{ borderColor: 'rgba(148, 163, 184, 0.12)' }} />

                    {/* Gauges */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                      <div>
                        <div style={{ color: 'var(--primary-blue)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}><FaGasPump size={16} /></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fuel</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{vehicle.fuel}%</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--primary-teal)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}><FaBatteryThreeQuarters size={16} /></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Battery</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{vehicle.battery}%</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--accent-amber)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}><FaCogs size={16} /></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Speed</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{vehicle.speed} km/h</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab CONTENT: SUPPORT PANEL */}
          {activeTab === 'support' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }} className="book-layout">
              {/* Ticket Form */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '20px' }}>Submit Support Inquiry</h2>
                <form onSubmit={(e) => { e.preventDefault(); alert("Support message sent successfully!"); e.target.reset(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Topic / Subject</label>
                    <select className="glass-input" required>
                      <option value="">Choose query category</option>
                      <option value="Billing">Billing and Payments</option>
                      <option value="Safety">Safety Standards Issue</option>
                      <option value="Fleet">Transit Routing & Delays</option>
                      <option value="Account">Account Management</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Message</label>
                    <textarea placeholder="Describe your issue or feedback in detail..." className="glass-input" style={{ minHeight: '120px', resize: 'vertical' }} required></textarea>
                  </div>
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Send Inquiry</button>
                </form>
              </div>

              {/* Support Info */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e3a8a' }}>Help Desk & Safety Hub</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Our logistics operations center is online 24/7/365 to handle emergency routing reroutes, cargo safety reporting, and vehicle driver checkups.
                </p>
                <hr style={{ borderColor: 'rgba(148, 163, 184, 0.12)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Emergency Hotline:</strong>
                    <span style={{ color: 'var(--accent-rose)', fontWeight: 700, fontSize: '1.1rem' }}>+254 (0) 700 999 111</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Ops Email Support:</strong>
                    <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>ops@smooth.co.ke</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab CONTENT: LIVE TRACKING */}
          {activeTab === 'tracking' && trackingBooking && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="track-layout">
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>Live Dispatch Tracking</h2>
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '20px' }}>Trip Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Booking ID</span>
                    <div style={{ fontWeight: 700 }}>#{trackingBooking.id} ({trackingBooking.booking_type})</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Driver</span>
                    <div style={{ fontWeight: 600 }}>{trackingBooking.driver_name || 'Locating vehicle...'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Route Summary</span>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong>{trackingBooking.pickup_address}</strong> &rarr; <strong>{trackingBooking.dropoff_address}</strong>
                    </div>
                  </div>

                  <hr style={{ borderColor: 'rgba(148, 163, 184, 0.12)' }} />

                  {trackingData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Transit Progress</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                          <div style={{ flex: 1, background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ background: 'var(--primary-teal)', width: `${trackingData.progress}%`, height: '100%', borderRadius: '5px', transition: 'width 1s ease' }}></div>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{trackingData.progress}%</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Speed</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-blue)' }}>{trackingData.speed} km/h</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ETA</span>
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
              background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
              <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '400px', background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Authorize Billing</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Complete payment of <strong>KES {payingBooking.fare}</strong> for Booking #{payingBooking.id}.
                </p>

                {paymentSuccess ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <FaCheckCircle size={48} style={{ color: 'var(--primary-teal)', marginBottom: '15px' }} />
                    <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Transaction Successful!</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Billing invoice updated.</p>
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
              background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
              <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '30px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(148, 163, 184, 0.12)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>Invoice Receipt</h3>
                  <button onClick={() => setReceiptData(null)} className="btn-secondary" style={{ padding: '2px 10px', fontSize: '0.8rem' }}><FaTimesCircle /></button>
                </div>

                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e3a8a' }}>SMOOTH TRANS LIMITED</h4>
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

                  <hr style={{ borderStyle: 'dashed', borderColor: 'rgba(148, 163, 184, 0.12)', margin: '15px 0' }} />

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

                  <hr style={{ borderStyle: 'dashed', borderColor: 'rgba(148, 163, 184, 0.12)', margin: '15px 0' }} />

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

          {/* EMERGENCY CONTACT SECURITY MODAL */}
          {showSecurityModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(225, 29, 72, 0.15)', backdropFilter: 'blur(8px)', zIndex: 2500, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
              <div className="glass-card animate-slide-up" style={{ 
                width: '100%', 
                maxWidth: '440px', 
                background: '#ffffff',
                border: '2px solid var(--accent-rose)',
                boxShadow: '0 25px 50px -12px rgba(225, 29, 72, 0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(225, 29, 72, 0.1)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaExclamationTriangle className="animate-pulse" style={{ color: 'var(--accent-rose)' }} />
                    <span>Emergency Ops Command</span>
                  </h3>
                  <button onClick={() => { setShowSecurityModal(false); setSecurityStatus(null); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#64748b' }}>Close</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                    This triggers a high-priority alarm at our 24/7 security dispatch team. Use this ONLY for active safety concerns, breakdowns, or medical emergencies.
                  </p>

                  {securityStatus === 'sending' && (
                    <div style={{ textAlign: 'center', padding: '20px', background: '#fff1f2', borderRadius: '12px', border: '1px solid rgba(225,29,72,0.1)' }}>
                      <div className="loader-spinner" style={{ margin: '0 auto 10px auto', borderTopColor: 'var(--accent-rose)' }}></div>
                      <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>Securing encryption tunnel...</span>
                    </div>
                  )}

                  {securityStatus === 'dispatched' && (
                    <div style={{ textAlign: 'center', padding: '20px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <FaCheckCircle size={32} style={{ color: 'var(--primary-teal)', marginBottom: '8px' }} />
                      <h4 style={{ fontWeight: 700, color: '#064e3b' }}>Patrol Unit Dispatched</h4>
                      <p style={{ fontSize: '0.82rem', color: '#047857', marginTop: '4px' }}>GPS coordinates pinned. Stand by for operator contact.</p>
                    </div>
                  )}

                  {!securityStatus && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button 
                        onClick={handleSecurityAction}
                        className="btn-primary" 
                        style={{ 
                          background: 'linear-gradient(135deg, var(--accent-rose) 0%, #be123c 100%)',
                          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.2)',
                          width: '100%',
                          padding: '14px',
                          fontWeight: 700
                        }}
                      >
                        Signal Dispatch Desk
                      </button>
                      <button 
                        onClick={() => alert("Connecting safety hotline...")}
                        className="btn-secondary" 
                        style={{ width: '100%', borderColor: 'rgba(148,163,184,0.3)', padding: '12px' }}
                      >
                        Call Hotline (+254 700 999 111)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
