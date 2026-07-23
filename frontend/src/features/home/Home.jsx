import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight, FaMapMarkerAlt, FaBus, FaTruck, FaBox,
  FaShieldAlt, FaStar, FaCheckCircle, FaPhone, FaEnvelope,
  FaTwitter, FaLinkedin, FaInstagram, FaChevronDown, FaClock, FaRoute
} from 'react-icons/fa';
import Navbar from '../shared/Navbar';
import MapTracker from '../shared/MapTracker';
import stLogo from '../../assets/st_logo.png';
import heroVan from '../../assets/hero_van.png';

const nairobiZones = [
  { name: 'Nairobi CBD', lat: -1.2921, lng: 36.8219 },
  { name: 'Kinoo / Kikuyu', lat: -1.2543, lng: 36.6817 },
  { name: 'Kahawa West / Roysambu', lat: -1.2185, lng: 36.8885 },
  { name: 'Ngong / Kabiria', lat: -1.3614, lng: 36.6565 },
  { name: 'Juja', lat: -1.1833, lng: 37.0167 },
  { name: 'Thika', lat: -1.0333, lng: 37.0692 },
  { name: 'Makongeni', lat: -1.0455, lng: 37.0910 },
  { name: 'Kibera', lat: -1.3130, lng: 36.7880 },
  { name: 'Rongai', lat: -1.3962, lng: 36.7601 },
];

const services = [
  {
    icon: <FaMapMarkerAlt />,
    title: 'General Transport',
    desc: 'On-demand rides and scheduled transfers across Nairobi and greater Kenya.',
    tag: 'Most Popular',
    color: '#0F1B2D',
  },
  {
    icon: <FaBus />,
    title: 'School Transit',
    desc: 'Safe, reliable student pick-up and drop-off with GPS monitoring for parents.',
    tag: 'Trusted',
    color: '#10B981',
  },
  {
    icon: <FaBox />,
    title: 'Parcel Delivery',
    desc: 'Same-day delivery solutions for businesses and individuals across the city.',
    tag: 'Fast',
    color: '#F59E0B',
  },
  {
    icon: <FaTruck />,
    title: 'Moving & Relocation',
    desc: 'Full-service moving with professional loading, transit and unloading teams.',
    tag: 'Complete',
    color: '#8B5CF6',
  },
];

const stats = [
  { value: '2,400+', label: 'Trips Completed' },
  { value: '98%',    label: 'On-Time Rate' },
  { value: '150+',   label: 'Active Drivers' },
  { value: '4.9★',   label: 'Customer Rating' },
];

const testimonials = [
  {
    name: 'Amina Wanjiku',
    role: 'Parent, Westlands',
    quote: "The school transit service is incredibly reliable. I track my children's journey every morning with full peace of mind.",
    stars: 5,
  },
  {
    name: 'Brian Ochieng',
    role: 'E-commerce Seller',
    quote: "Smooth Trans handles all my deliveries. Fast, professional and the drivers are always on time. Highly recommended.",
    stars: 5,
  },
  {
    name: 'Sandra Muthoni',
    role: 'Corporate Client',
    quote: "We relocated our entire office with Smooth Trans. The team was organized, careful and finished ahead of schedule.",
    stars: 5,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [pickup, setPickup]           = useState('');
  const [dropoff, setDropoff]         = useState('');
  const [pickupCoords, setPickupCoords]   = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [serviceType, setServiceType] = useState('General');
  const [estimation, setEstimation]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroCount, setHeroCount]     = useState(0);

  /* Animate hero counter */
  useEffect(() => {
    const target = 2400;
    const step   = Math.ceil(target / 60);
    const timer  = setInterval(() => {
      setHeroCount(c => { if (c + step >= target) { clearInterval(timer); return target; } return c + step; });
    }, 24);
    return () => clearInterval(timer);
  }, []);

  /* Auto-rotate testimonials */
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleEstimate = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;
    setLoading(true);
    const s = nairobiZones.find(z => z.name === pickup);
    const d = nairobiZones.find(z => z.name === dropoff);
    setPickupCoords({ lat: s.lat, lng: s.lng });
    setDropoffCoords({ lat: d.lat, lng: d.lng });
    fetch('/api/bookings/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup_coords:   { lat: s.lat, lng: s.lng },
        dropoff_coords:  { lat: d.lat, lng: d.lng },
        pickup_address:  pickup,
        dropoff_address: dropoff,
        booking_type:    serviceType,
      }),
    })
      .then(r => r.json())
      .then(data => { setEstimation(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/dashboard/customer' : '/register');
  };

  /* ─── STYLE HELPERS ─── */
  const section = (extra = {}) => ({
    padding: '100px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    ...extra,
  });

  return (
    <div style={{ background: '#EEF2F8', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      <Navbar />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section style={{
        background: '#0F1B2D',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '80px 36px',
          display: 'grid', gridTemplateColumns: '1fr 440px',
          gap: '60px', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1,
        }} className="hero-grid">

          {/* ── Left: Copy ── */}
          <div>
            {/* Logo mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
              <div style={{
                width: '52px', height: '52px', background: '#ffffff',
                borderRadius: '10px', display: 'flex', justifyContent: 'center',
                alignItems: 'center', overflow: 'hidden',
              }}>
                <img src={stLogo} alt="Smooth Trans" style={{ width: '46px', height: '46px', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>Smooth Trans</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Sophisticated Utility in Motion</div>
              </div>
            </div>

            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(16,185,129,0.12)', color: '#10B981',
              padding: '6px 14px', borderRadius: '20px',
              fontSize: '0.76rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '24px', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <FaShieldAlt size={10} />
              Kenya's Trusted Logistics Platform
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2.6rem, 5vw, 4rem)',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'var(--font-serif)',
              lineHeight: '1.15',
              marginBottom: '22px',
              letterSpacing: '-0.02em',
            }}>
              Your Journey,{' '}
              <em style={{ color: '#10B981', fontStyle: 'italic' }}>Simplified.</em>
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.62)',
              fontSize: '1.05rem',
              lineHeight: '1.7',
              marginBottom: '36px',
              maxWidth: '500px',
            }}>
              From daily commutes to school runs, deliveries and full relocations — Smooth Trans gives you real-time tracking, instant fare estimates and professional drivers, all in one platform.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '52px' }}>
              <button
                onClick={handleGetStarted}
                style={{
                  background: '#10B981', color: '#ffffff', border: 'none',
                  borderRadius: '8px', padding: '14px 28px', fontWeight: 700,
                  fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.15s',
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={(e)  => e.currentTarget.style.opacity = '1'}
              >
                Book a Ride <FaArrowRight size={13} />
              </button>
              <Link
                to="/login"
                style={{
                  background: 'transparent', color: '#ffffff',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  borderRadius: '8px', padding: '14px 28px', fontWeight: 600,
                  fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  textDecoration: 'none', transition: 'border-color 0.15s',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'}
                onMouseOut={(e)  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
              >
                Sign In
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginTop: '2px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Fare Estimator Card ── */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F1B2D', marginBottom: '6px' }}>
              Instant Fare Estimate
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '22px' }}>
              Select your route to get an instant quote
            </p>

            <form onSubmit={handleEstimate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  📍 Pickup Zone
                </label>
                <select
                  className="glass-input"
                  value={pickup}
                  onChange={(e) => {
                    setPickup(e.target.value);
                    const z = nairobiZones.find(z => z.name === e.target.value);
                    setPickupCoords(z ? { lat: z.lat, lng: z.lng } : null);
                    setEstimation(null);
                  }}
                  required
                >
                  <option value="">Select pickup location</option>
                  {nairobiZones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  🏁 Destination Zone
                </label>
                <select
                  className="glass-input"
                  value={dropoff}
                  onChange={(e) => {
                    setDropoff(e.target.value);
                    const z = nairobiZones.find(z => z.name === e.target.value);
                    setDropoffCoords(z ? { lat: z.lat, lng: z.lng } : null);
                    setEstimation(null);
                  }}
                  required
                >
                  <option value="">Select destination</option>
                  {nairobiZones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  🚌 Service Type
                </label>
                <select className="glass-input" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                  <option value="General">General Transport</option>
                  <option value="School">School Transit</option>
                  <option value="Delivery">Parcel Delivery</option>
                  <option value="Moving">Moving / Relocation</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !pickup || !dropoff}
                style={{
                  background: '#0F1B2D', color: '#ffffff', border: 'none',
                  borderRadius: '8px', padding: '12px', fontWeight: 700,
                  fontSize: '0.9rem', cursor: (loading || !pickup || !dropoff) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !pickup || !dropoff) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'var(--font-sans)', transition: 'opacity 0.15s', marginTop: '4px',
                }}
              >
                {loading ? <div className="loader-spinner" /> : <><FaRoute size={13} /> Calculate Fare</>}
              </button>
            </form>

            {estimation && (
              <div className="animate-fade-in" style={{
                marginTop: '20px', padding: '16px 18px',
                background: '#F0F9FF', border: '1px solid #BAE6FD',
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Distance</span>
                  <span style={{ fontWeight: 700, color: '#0F1B2D' }}>{estimation.distance_km} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estimated Fare</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10B981', letterSpacing: '-0.02em' }}>KES {estimation.fare}</span>
                </div>
                <button
                  onClick={handleGetStarted}
                  style={{
                    width: '100%', marginTop: '14px', background: '#10B981', color: 'white',
                    border: 'none', borderRadius: '7px', padding: '10px', fontWeight: 700,
                    fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}
                >
                  Book This Route →
                </button>
                <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '8px', textAlign: 'center' }}>
                  *Standard tariff estimate. Sign in to confirm & book.
                </p>
              </div>
            )}

            {/* Map Preview */}
            {pickupCoords && dropoffCoords && !estimation && (
              <div className="animate-fade-in" style={{ marginTop: '16px', height: '160px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <MapTracker pickup={pickupCoords} dropoff={dropoffCoords} height="100%" />
              </div>
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '6px', fontSize: '0.7rem', letterSpacing: '0.1em',
          textTransform: 'uppercase', animation: 'pulse 2s ease infinite',
        }}>
          <FaChevronDown />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SERVICES
      ══════════════════════════════════════ */}
      <section style={{ background: '#EEF2F8' }}>
        <div style={section()}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: '#E8EDF6', color: '#0F1B2D',
              padding: '6px 14px', borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '18px', border: '1px solid #E2E8F0',
            }}>
              Our Services
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700,
              color: '#0F1B2D', fontFamily: 'var(--font-serif)',
              letterSpacing: '-0.02em', marginBottom: '14px',
            }}>
              Everything you need to move
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
              Four specialised services built around Nairobi's unique transport landscape.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            {services.map((svc) => (
              <div
                key={svc.title}
                style={{
                  background: '#ffffff', borderRadius: '14px',
                  border: '1px solid #E2E8F0', padding: '28px',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default',
                }}
                onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseOut={(e)  => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '10px',
                    background: svc.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontSize: '1.2rem',
                  }}>
                    {svc.icon}
                  </div>
                  <span style={{
                    background: '#F1F5F9', color: '#475569', padding: '3px 10px',
                    borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{svc.tag}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F1B2D' }}>{svc.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6', flex: 1 }}>{svc.desc}</p>
                <button
                  onClick={handleGetStarted}
                  style={{
                    background: 'transparent', border: 'none', color: svc.color,
                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    padding: 0, display: 'flex', alignItems: 'center', gap: '5px',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Book Now <FaArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRACK TRIP BAND
      ══════════════════════════════════════ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F1B2D', marginBottom: '4px' }}>
              Already have a booking?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Track your ride in real-time — no sign-in required.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              className="glass-input"
              placeholder="Enter Booking ID or Plate Number"
              style={{ width: '260px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/login'); }}
            />
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#0F1B2D', color: '#ffffff', border: 'none',
                borderRadius: '7px', padding: '10px 20px', fontWeight: 600,
                fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                display: 'flex', alignItems: 'center', gap: '7px',
              }}
            >
              Track Now <FaMapMarkerAlt size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY SMOOTH TRANS
      ══════════════════════════════════════ */}
      <section style={{ background: '#EEF2F8' }}>
        <div style={section()}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '80px', alignItems: 'center',
          }} className="feature-grid">

            {/* Left: Dark card with image */}
            <div style={{
              background: '#0F1B2D', borderRadius: '20px',
              padding: '40px', position: 'relative', overflow: 'hidden',
              minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}>
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.08,
                backgroundImage: 'radial-gradient(circle at 70% 30%, #10B981 0%, transparent 60%)',
              }} />
              <img
                src={heroVan}
                alt="Smooth Trans Vehicle"
                style={{
                  position: 'absolute', right: 0, bottom: 0, height: '75%',
                  objectFit: 'cover', borderBottomRightRadius: '20px', opacity: 0.9,
                  maxWidth: '65%',
                }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulse 2s ease infinite' }} />
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Live Fleet
                  </span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-serif)' }}>
                  {heroCount.toLocaleString()}+
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                  Trips completed this year
                </div>
              </div>
            </div>

            {/* Right: Feature list */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: '#E8EDF6', color: '#0F1B2D',
                padding: '6px 14px', borderRadius: '20px',
                fontSize: '0.72rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '20px', border: '1px solid #E2E8F0',
              }}>
                Why Choose Us
              </div>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700,
                color: '#0F1B2D', fontFamily: 'var(--font-serif)',
                letterSpacing: '-0.02em', lineHeight: '1.25', marginBottom: '16px',
              }}>
                Built for reliability, designed for you.
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '32px' }}>
                Every detail of Smooth Trans is engineered to give you confidence — before, during and after your journey.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[
                  { icon: <FaClock />,      title: 'Real-Time GPS Tracking',   desc: 'Track every vehicle live on an interactive map. Know exactly where your driver is.' },
                  { icon: <FaShieldAlt />,  title: 'Safety Certified Drivers', desc: 'All drivers pass background checks, vehicle inspections and safety training.' },
                  { icon: <FaCheckCircle />,title: 'Instant Fare Transparency', desc: 'No surprise charges. Get exact fare estimates before you book, every time.' },
                  { icon: <FaPhone />,      title: '24/7 Support Line',        desc: 'Our dispatch team is always available. Call us any time, day or night.' },
                ].map((f) => (
                  <div key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '9px',
                      background: '#E8EDF6', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: '#0F1B2D', fontSize: '0.95rem', flexShrink: 0,
                    }}>
                      {f.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F1B2D', marginBottom: '3px' }}>{f.title}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #E2E8F0' }}>
        <div style={section({ textAlign: 'center' })}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: '#F1F5F9', color: '#475569',
            padding: '6px 14px', borderRadius: '20px',
            fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '18px',
          }}>
            What Our Customers Say
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700,
            color: '#0F1B2D', fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.02em', marginBottom: '52px',
          }}>
            Trusted by thousands across Nairobi
          </h2>

          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={i === activeTestimonial ? 'animate-fade-in' : ''}
                style={{ display: i === activeTestimonial ? 'block' : 'none' }}
              >
                <div style={{
                  background: '#F8FAFC', borderRadius: '16px', padding: '36px 40px',
                  border: '1px solid #E2E8F0', position: 'relative',
                }}>
                  {/* Quote mark */}
                  <div style={{
                    position: 'absolute', top: '24px', left: '32px',
                    fontSize: '4rem', color: '#E2E8F0', lineHeight: 1, fontFamily: 'Georgia, serif',
                    fontWeight: 700, userSelect: 'none',
                  }}>"</div>
                  <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginBottom: '20px' }}>
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <FaStar key={j} style={{ color: '#F59E0B', fontSize: '0.9rem' }} />
                    ))}
                  </div>
                  <p style={{
                    fontSize: '1.05rem', color: '#334155', lineHeight: '1.75',
                    fontStyle: 'italic', marginBottom: '24px',
                  }}>
                    "{t.quote}"
                  </p>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F1B2D', fontSize: '0.9rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  style={{
                    width: i === activeTestimonial ? '24px' : '8px',
                    height: '8px', borderRadius: '4px',
                    background: i === activeTestimonial ? '#0F1B2D' : '#E2E8F0',
                    border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section style={{ background: '#0F1B2D', padding: '80px 36px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700,
            color: '#ffffff', fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.02em', marginBottom: '16px',
          }}>
            Ready to ride with <em style={{ color: '#10B981', fontStyle: 'italic' }}>confidence?</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '36px' }}>
            Join thousands of Nairobi commuters, parents, and businesses who trust Smooth Trans every day.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleGetStarted}
              style={{
                background: '#10B981', color: '#ffffff', border: 'none',
                borderRadius: '8px', padding: '14px 32px', fontWeight: 700,
                fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              Create Free Account <FaArrowRight size={13} />
            </button>
            <Link
              to="/login"
              style={{
                background: 'transparent', color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: '8px', padding: '14px 32px', fontWeight: 600,
                fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                textDecoration: 'none', display: 'flex', alignItems: 'center',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{ background: '#060D18', padding: '60px 36px 32px', color: '#94A3B8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '48px', marginBottom: '52px',
          }} className="footer-grid">

            {/* Brand col */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', background: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={stLogo} alt="Smooth Trans" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>Smooth Trans</div>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>Limited</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.7', color: '#64748B', maxWidth: '260px' }}>
                Sophisticated Utility in Motion. Providing safe, reliable, and transparent transport solutions across Kenya.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                {[FaTwitter, FaLinkedin, FaInstagram].map((Icon, i) => (
                  <a key={i} href="#" style={{
                    width: '34px', height: '34px', borderRadius: '7px',
                    background: '#0F1B2D', border: '1px solid #1E293B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseOut={(e)  => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>Services</div>
              {['General Transport', 'School Transit', 'Parcel Delivery', 'Moving & Relocation'].map(l => (
                <a key={l} href="#" style={{ display: 'block', color: '#64748B', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '10px', transition: 'color 0.15s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseOut={(e)  => e.currentTarget.style.color = '#64748B'}
                >{l}</a>
              ))}
            </div>

            {/* Company */}
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>Company</div>
              {['About Us', 'Safety Standards', 'Fleet Specs', 'Driver Partners'].map(l => (
                <a key={l} href="#" style={{ display: 'block', color: '#64748B', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '10px', transition: 'color 0.15s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseOut={(e)  => e.currentTarget.style.color = '#64748B'}
                >{l}</a>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>Contact</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <FaPhone size={12} style={{ color: '#10B981', marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>+254 700 000 000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <FaEnvelope size={12} style={{ color: '#10B981', marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>support@smoothtrans.co.ke</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <FaMapMarkerAlt size={12} style={{ color: '#10B981', marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #0F1B2D', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#334155' }}>
              © {new Date().getFullYear()} Smooth Trans Limited. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy Policy', 'Terms of Service', 'Safety Standards'].map(l => (
                <a key={l} href="#" style={{ fontSize: '0.78rem', color: '#334155', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#94A3B8'}
                  onMouseOut={(e)  => e.currentTarget.style.color = '#334155'}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 992px) {
          .hero-grid       { grid-template-columns: 1fr !important; }
          .feature-grid    { grid-template-columns: 1fr !important; }
          .footer-grid     { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .footer-grid     { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
