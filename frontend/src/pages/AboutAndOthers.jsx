import React from 'react';
import Navbar from '../components/Navbar';

export const About = () => {
  return (
    <div style={{ background: '#f5faff', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: 800, color: '#2b6cb0' }}>About Smooth Trans</h1>
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(43, 108, 176, 0.15)',
          borderRadius: '20px',
          padding: '30px',
          lineHeight: '1.8',
          fontSize: '1.05rem',
          color: '#2b6cb0',
          boxShadow: '0 8px 20px rgba(43, 108, 176, 0.03)'
        }}>
          <p style={{ marginBottom: '15px' }}>
            Smooth Trans Limited was founded to address critical inefficiencies in standard logistics and passenger transit corridors. Our system integrates state-of-the-art computational algorithms to optimize routing choices, estimate fares accurately, and warn operators about vehicle component exhaustion risks.
          </p>
          <p style={{ marginBottom: '15px' }}>
            We serve the general population through on-demand transport dispatch, school kids through secure weekly scheduling registers, companies through swift delivery tracking panels, and families looking for structured moving coordination.
          </p>
          <h4 style={{ color: '#2b6cb0', marginTop: '25px', marginBottom: '10px', fontWeight: 800 }}>Our Academic Vision</h4>
          <p style={{ opacity: 0.9 }}>
            Designed as a high-fidelity final-year capstone project, this platform maps out mock integrations for M-Pesa mobile transaction triggers, GPS tracking loops, and predictive regression analytics, displaying operational modules to impress academic panels.
          </p>
        </div>
      </div>
    </div>
  );
};

export const Services = () => {
  const list = [
    { title: 'General Ride Hailing', desc: 'Secure passenger transit on demand, offering optimized paths to bypass traffic hot zones.' },
    { title: 'School Transit Register', desc: 'Pre-scheduled student tracking pickups, linking schools directly with available high-capacity buses.' },
    { title: 'Parcel & Cargo Delivery', desc: 'Express courier delivery dispatch with live GPS tracking coordinates from load-in to customer signature.' },
    { title: 'Moving & Relocation Services', desc: 'Heavy moving truck reservation templates, providing transparent flat-rate estimations based on cargo distance.' }
  ];

  return (
    <div style={{ background: '#f5faff', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center', fontWeight: 800, color: '#2b6cb0' }}>Our Services</h1>
        <p style={{ textAlign: 'center', color: '#2b6cb0', opacity: 0.8, marginBottom: '40px' }}>Tailored logistics and transit solutions driven by AI route optimization.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="services-grid">
          {list.map((s, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid rgba(43, 108, 176, 0.15)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 8px 20px rgba(43, 108, 176, 0.03)'
            }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px', color: '#2b6cb0' }}>{s.title}</h3>
              <p style={{ color: '#2b6cb0', opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 768px) {
            .services-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export const Contact = () => {
  return (
    <div style={{ background: '#f5faff', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px' }} className="contact-grid animate-fade-in">
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: 800, color: '#2b6cb0' }}>Contact Us</h1>
          <p style={{ color: '#2b6cb0', opacity: 0.9, lineHeight: '1.7', marginBottom: '30px' }}>
            Have questions about our smart route optimization algorithms, fleet assignments, or licensing protocols? Get in touch with our operations center.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <strong style={{ color: '#2b6cb0', display: 'block', fontWeight: 800 }}>HQ Location</strong>
              <span style={{ color: '#2b6cb0', opacity: 0.8 }}>Mombasa Road Corporate Center, Nairobi, Kenya</span>
            </div>
            <div>
              <strong style={{ color: '#2b6cb0', display: 'block', fontWeight: 800 }}>Email Support</strong>
              <span style={{ color: '#2b6cb0', opacity: 0.8 }}>ops@smooth.co.ke</span>
            </div>
            <div>
              <strong style={{ color: '#2b6cb0', display: 'block', fontWeight: 800 }}>Hotline</strong>
              <span style={{ color: '#2b6cb0', opacity: 0.8 }}>+254 (0) 700 123 456</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(43, 108, 176, 0.15)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 8px 20px rgba(43, 108, 176, 0.03)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b6cb0', marginBottom: '20px' }}>Send a Message</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert("Mock inquiry submitted successfully!"); e.target.reset(); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <input type="text" placeholder="Your Name" className="glass-input" required />
            </div>
            <div>
              <input type="email" placeholder="Email Address" className="glass-input" required />
            </div>
            <div>
              <textarea placeholder="Message content..." className="glass-input" style={{ minHeight: '120px', resize: 'vertical' }} required></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '12px' }}>Submit Query</button>
          </form>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
};
