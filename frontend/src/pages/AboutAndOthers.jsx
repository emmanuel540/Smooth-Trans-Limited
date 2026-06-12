import React from 'react';
import Navbar from '../components/Navbar';

export const About = () => {
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }} className="animate-fade-in">
        <h1 className="gradient-title gradient-text" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>About Smooth Trans</h1>
        <div className="glass-card" style={{ lineHeight: '1.8', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '15px' }}>
            Smooth Trans Limited was founded to address critical inefficiencies in standard logistics and passenger transit corridors. Our system integrates state-of-the-art computational algorithms to optimize routing choices, estimate fares accurately, and warn operators about vehicle component exhaustion risks.
          </p>
          <p style={{ marginBottom: '15px' }}>
            We serve the general population through on-demand transport dispatch, school kids through secure weekly scheduling registers, companies through swift delivery tracking panels, and families looking for structured moving coordination.
          </p>
          <h4 style={{ color: 'var(--text-primary)', marginTop: '25px', marginBottom: '10px', fontWeight: 700 }}>Our Academic Vision</h4>
          <p>
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
    <div>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }} className="animate-fade-in">
        <h1 className="gradient-title gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>Our Services</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>Tailored logistics and transit solutions driven by AI route optimization.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="services-grid">
          {list.map((s, idx) => (
            <div key={idx} className="glass-card">
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{s.desc}</p>
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
    <div>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px' }} className="contact-grid animate-fade-in">
        <div style={{ textAlign: 'left' }}>
          <h1 className="gradient-title gradient-text" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Contact Us</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '30px' }}>
            Have questions about our smart route optimization algorithms, fleet assignments, or licensing protocols? Get in touch with our operations center.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>HQ Location</strong>
              <span style={{ color: 'var(--text-secondary)' }}>Mombasa Road Corporate Center, Nairobi, Kenya</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Email Support</strong>
              <span style={{ color: 'var(--text-secondary)' }}>ops@smooth.co.ke</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Hotline</strong>
              <span style={{ color: 'var(--text-secondary)' }}>+254 (0) 700 123 456</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Send a Message</h3>
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
            <button type="submit" className="btn-primary">Submit Query</button>
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
