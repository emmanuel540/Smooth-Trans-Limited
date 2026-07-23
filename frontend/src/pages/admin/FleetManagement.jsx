import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaTruck, FaWrench, FaExclamationTriangle, FaPlusCircle, FaTrash, FaPen } from 'react-icons/fa';
import apiFetch from '../../api';

const FleetManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // list, alerts
  
  // Registration Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vType, setVType] = useState('Transport');
  const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState('100');

  // Maintenance log modal state
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(null); // holds vehicle
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenanceCost, setMaintenanceCost] = useState('');

  const fetchFleetData = () => {
    setLoading(true);
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    Promise.all([
      apiFetch('/api/fleet', { headers: authHeader }).then(res => res.json()),
      apiFetch('/api/ai/predictive-maintenance', { headers: authHeader }).then(res => res.json())
    ])
      .then(([fleetData, diagData]) => {
        setVehicles(fleetData);
        setDiagnostics(diagData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  const handleRegisterVehicle = (e) => {
    e.preventDefault();
    
    apiFetch('/api/fleet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        plate_number: plate,
        make: make,
        model: model,
        year: parseInt(year),
        type: vType,
        mileage: parseFloat(mileage || 0.0),
        fuel_level: parseFloat(fuel || 100.0)
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then(() => {
        setShowAddModal(false);
        setPlate(''); setMake(''); setModel(''); setYear(''); setMileage('');
        fetchFleetData();
        alert("Vehicle registered successfully!");
      })
      .catch(err => alert(err.message || "Failed to register vehicle."));
  };

  const handleMaintenanceLogSubmit = (e) => {
    e.preventDefault();
    if (!showMaintenanceModal) return;

    apiFetch(`/api/fleet/${showMaintenanceModal.id}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        description: maintenanceDesc,
        cost: parseFloat(maintenanceCost)
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then(() => {
        setShowMaintenanceModal(null);
        setMaintenanceDesc('');
        setMaintenanceCost('');
        fetchFleetData();
        alert("Maintenance logged. Vehicle status changed to Maintenance.");
      })
      .catch(err => alert(err.message || "Failed to log maintenance."));
  };

  const criticalAlerts = diagnostics.filter(d => d.status === 'Critical');
  const serviceRecommended = diagnostics.filter(d => d.status === 'Service Recommended');

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        
        {/* Navigation Tabs & Add trigger */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '15px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => setActiveTab('list')}
              className="btn-secondary" 
              style={{
                background: activeTab === 'list' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                borderColor: activeTab === 'list' ? 'var(--primary-teal)' : 'var(--border-light)',
                display: 'flex', alignContent: 'center', gap: '8px'
              }}
            >
              <FaTruck />
              <span>Registered Fleet ({vehicles.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('alerts')}
              className="btn-secondary"
              style={{
                background: activeTab === 'alerts' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                borderColor: activeTab === 'alerts' ? 'var(--primary-teal)' : 'var(--border-light)',
                display: 'flex', alignContent: 'center', gap: '8px'
              }}
            >
              <FaWrench />
              <span>AI Diagnostics Alerts ({criticalAlerts.length + serviceRecommended.length})</span>
            </button>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ gap: '6px', fontSize: '0.9rem', padding: '8px 16px' }}>
            <FaPlusCircle />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Tab 1: FLEET LIST */}
        {activeTab === 'list' && (
          <div className="glass-card animate-fade-in" style={{ padding: '0px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Plate</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Model</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fuel</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mileage</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Driver</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>#{v.id}</td>
                      <td style={{ padding: '16px' }}>{v.plate_number}</td>
                      <td style={{ padding: '16px' }}>{v.make} {v.model} ({v.year})</td>
                      <td style={{ padding: '16px' }}>{v.type}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontWeight: 600, color: v.fuel_level < 20 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                          {v.fuel_level}%
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>{v.mileage} km</td>
                      <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{v.assigned_driver || 'Unassigned'}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge badge-${v.status.toLowerCase()}`}>{v.status}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => setShowMaintenanceModal(v)} 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                        >
                          <FaWrench size={10} />
                          <span>Schedule Service</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: AI DIAGNOSTICS & MAINTENANCE WARNINGS */}
        {activeTab === 'alerts' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Critical Alert Banner */}
            {criticalAlerts.length > 0 && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid var(--accent-rose)',
                padding: '20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '15px'
              }}>
                <FaExclamationTriangle size={24} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--accent-rose)', fontWeight: 700, marginBottom: '6px' }}>
                    Critical Diagnostic Warnings Flags ({criticalAlerts.length} Vehicles Affected)
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    The vehicles listed below display extreme failure risk parameters. High odometer values driven since the last logged services indicate brake fatigue, engine filter saturation, or hydraulic fluid pressure spikes. Schedule immediately for safety review.
                  </p>
                </div>
              </div>
            )}

            {/* List details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {diagnostics.map(diag => {
                const isCritical = diag.status === 'Critical';
                const isOptimal = diag.status === 'Optimal';

                return (
                  <div 
                    key={diag.vehicle_id}
                    className="glass-card"
                    style={{
                      borderLeft: '5px solid',
                      borderLeftColor: isCritical ? 'var(--accent-rose)' : (isOptimal ? 'var(--primary-teal)' : 'var(--accent-amber)'),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{diag.make_model} ({diag.plate_number})</h4>
                        <span 
                          style={{
                            padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700,
                            background: isCritical ? 'rgba(244, 63, 94, 0.1)' : (isOptimal ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                            color: isCritical ? 'var(--accent-rose)' : (isOptimal ? 'var(--primary-teal)' : 'var(--accent-amber)')
                          }}
                        >
                          {diag.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5', maxWidth: '600px' }}>
                        {diag.recommendation}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Odometer: {diag.mileage}km | Driven since service: **{diag.miles_since_service}km** | Calculated Breakdown Risk: **{diag.risk_percentage}%**
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated Service Charge</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-teal)' }}>KES {diag.service_cost_estimate}</div>
                      {!isOptimal && (
                        <button 
                          onClick={() => setShowMaintenanceModal({ id: diag.vehicle_id, plate_number: diag.plate_number })} 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', alignSelf: 'flex-end' }}
                        >
                          Schedule Diagnostic Work
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL: ADD VEHICLE FORM */}
        {showAddModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '450px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Register Fleet Asset</h3>

              <form onSubmit={handleRegisterVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Plate Number</label>
                    <input type="text" placeholder="KCB 123A" className="glass-input" value={plate} onChange={(e) => setPlate(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Vehicle Class</label>
                    <select className="glass-input" value={vType} onChange={(e) => setVType(e.target.value)}>
                      <option value="Transport">Transport Service</option>
                      <option value="SchoolBus">School Bus</option>
                      <option value="DeliveryVan">Delivery Van</option>
                      <option value="MovingTruck">Moving Truck</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Make (Brand)</label>
                    <input type="text" placeholder="Toyota / Isuzu" className="glass-input" value={make} onChange={(e) => setMake(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Model</label>
                    <input type="text" placeholder="Hiace / Coaster" className="glass-input" value={model} onChange={(e) => setModel(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Manufacturing Year</label>
                    <input type="number" placeholder="2018" className="glass-input" value={year} onChange={(e) => setYear(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Odometer (Mileage)</label>
                    <input type="number" placeholder="125000" className="glass-input" value={mileage} onChange={(e) => setMileage(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Initial Fuel Level (%)</label>
                  <input type="number" min="0" max="100" className="glass-input" value={fuel} onChange={(e) => setFuel(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Asset</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: LOG MAINTENANCE WORK */}
        {showMaintenanceModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '420px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Log Diagnostic Maintenance</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Schedule Vehicle **{showMaintenanceModal.plate_number}** for diagnostic check. This changes status to 'Maintenance' until complete.
              </p>

              <form onSubmit={handleMaintenanceLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Service Description</label>
                  <textarea 
                    placeholder="Describe maintenance work required (e.g. Brake pad check, spark plug swaps, etc.)" 
                    className="glass-input"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={maintenanceDesc}
                    onChange={(e) => setMaintenanceDesc(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Estimated Invoice Cost (KES)</label>
                  <input 
                    type="number" 
                    placeholder="12000" 
                    className="glass-input"
                    value={maintenanceCost}
                    onChange={(e) => setMaintenanceCost(e.target.value)}
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowMaintenanceModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Schedule Shop Job</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FleetManagement;
