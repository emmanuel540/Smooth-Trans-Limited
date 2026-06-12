import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { 
  FaMoneyBillWave, FaClipboardList, FaTruck, 
  FaUserTie, FaRegLightbulb, FaHourglassHalf, FaChartLine 
} from 'react-icons/fa';

const COLORS = ['#2b6cb0', 'rgba(43, 108, 176, 0.7)', 'rgba(43, 108, 176, 0.5)', 'rgba(43, 108, 176, 0.3)'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [demand, setDemand] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = () => {
    setLoading(true);
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    Promise.all([
      fetch('http://localhost:5000/api/analytics/dashboard-stats', { headers: authHeader }).then(res => res.json()),
      fetch('http://localhost:5000/api/ai/demand-prediction', { headers: authHeader }).then(res => res.json())
    ])
      .then(([statsData, demandData]) => {
        setStats(statsData);
        setDemand(demandData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <div className="loader-spinner" style={{ width: '48px', height: '48px' }}></div>
        </div>
      </div>
    );
  }

  const summary = stats.summary;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        
        {/* Title */}
        <div style={{ marginBottom: '30px', textAlign: 'left' }}>
          <h1 className="gradient-title gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Analytics Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time summaries and intelligence projections.</p>
        </div>

        {/* Summary Grid Cards */}
        <div className="stats-grid">
          {/* Card 1 */}
          <div className="glass-card stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Revenue</span>
              <div className="stat-val" style={{ color: 'var(--primary-teal)' }}>KES {summary.total_revenue}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>M-Pesa: KES {summary.mpesa_revenue}</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-teal)', borderRadius: '12px' }}>
              <FaMoneyBillWave size={22} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Bookings</span>
              <div className="stat-val" style={{ color: 'var(--primary-blue)' }}>{summary.total_bookings}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed: {summary.completed_bookings}</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary-blue)', borderRadius: '12px' }}>
              <FaClipboardList size={22} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Fleet</span>
              <div className="stat-val" style={{ color: 'var(--text-primary)' }}>{summary.fleet_active} / {summary.fleet_active + summary.fleet_in_service + summary.fleet_maintenance}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>In Shop: {summary.fleet_maintenance}</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', borderRadius: '12px' }}>
              <FaTruck size={22} />
            </div>
          </div>
        </div>

        {/* Charts Layout Row 1: Historical Sales & Bookings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '30px', marginBottom: '30px' }} className="admin-charts-grid">
          
          {/* Revenue Over Time Area Chart */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartLine style={{ color: 'var(--primary-blue)' }} />
              <span>Revenue History (Last 7 Days)</span>
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenue_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-teal)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary-teal)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                  <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                  <Tooltip contentStyle={{ background: '#0d1220', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white' }} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary-teal)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (KES)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Categories Pie/Bar Chart */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Service Distribution</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.type_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '0.75rem' }} />
                  <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                  <Tooltip contentStyle={{ background: '#0d1220', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white' }} />
                  <Bar dataKey="value" fill="#8884d8" name="Bookings">
                    {stats.type_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI SECTION: DEMAND PREDICTION FOR DISPATCHERS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="admin-ai-grid">
          
          {/* AI Projected 24 Hour booking volume line */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaHourglassHalf style={{ color: 'var(--accent-amber)' }} />
              <span>AI Predicted Demand Waves (Next 24 Hours)</span>
            </h3>
            {demand && (
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demand.hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="var(--text-muted)" style={{ fontSize: '0.7rem' }} interval={2} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                    <Tooltip contentStyle={{ background: '#0d1220', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white' }} />
                    <Line type="monotone" dataKey="total_bookings" stroke="var(--accent-amber)" strokeWidth={2} activeDot={{ r: 8 }} name="Predicted Volume" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* AI Insights & Dispatch recommendations */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaRegLightbulb style={{ color: 'var(--primary-teal)' }} />
              <span>Dispatch Recommendations</span>
            </h3>
            {demand && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                {demand.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    style={{
                      background: 'rgba(16, 185, 129, 0.04)',
                      borderLeft: '4px solid var(--primary-teal)',
                      padding: '12px 16px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.85rem',
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)',
                      textAlign: 'left'
                    }}
                  >
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 992px) {
            .admin-charts-grid, .admin-ai-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminDashboard;
