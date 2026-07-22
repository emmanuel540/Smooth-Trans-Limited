import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaFileCsv, FaFilePdf, FaFolderOpen, FaArrowCircleDown, FaClipboardList, FaTruck, FaMoneyBillWave } from 'react-icons/fa';

const AnalyticsReports = () => {
  const [downloading, setDownloading] = useState(null);

  const triggerCsvDownload = (reportType) => {
    setDownloading(reportType);
    
    fetch(`http://localhost:5000/api/analytics/export/csv?type=${reportType}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setDownloading(null);
      })
      .catch(err => {
        alert("Failed to export report: " + err.message);
        setDownloading(null);
      });
  };

  const reports = [
    {
      id: 'bookings',
      name: 'Order Booking Reports',
      desc: 'Export listing details of all passenger, school, parcel and moving bookings.',
      icon: <FaClipboardList size={24} style={{ color: 'var(--primary-blue)' }} />,
      btnText: 'Export Booking List'
    },
    {
      id: 'fleet',
      name: 'Fleet Logistics Reports',
      desc: 'Export specifications, plates, mileage details and maintenance history logs.',
      icon: <FaTruck size={24} style={{ color: 'var(--primary-teal)' }} />,
      btnText: 'Export Fleet Logs'
    },
    {
      id: 'revenue',
      name: 'Revenue Financial Audit',
      desc: 'Export completed transaction values, invoice receipts, and M-Pesa channels.',
      icon: <FaMoneyBillWave size={24} style={{ color: 'var(--accent-amber)' }} />,
      btnText: 'Export Revenue Sheet'
    }
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        
        {/* Title */}
        <div style={{ marginBottom: '30px', textAlign: 'left' }}>
          <h1 className="gradient-title gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Audit & Reports Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Download structured spreadsheets for presentation to audit boards.</p>
        </div>

        {/* Reports Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reports.map(rep => (
            <div 
              key={rep.id} 
              className="glass-card" 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid var(--border-light)'
                }}>
                  {rep.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rep.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '500px' }}>{rep.desc}</p>
                </div>
              </div>

              <button 
                onClick={() => triggerCsvDownload(rep.id)}
                disabled={downloading === rep.id}
                className="btn-primary" 
                style={{ gap: '8px', fontSize: '0.9rem', minWidth: '180px' }}
              >
                {downloading === rep.id ? (
                  <div className="loader-spinner"></div>
                ) : (
                  <>
                    <FaFileCsv />
                    <span>{rep.btnText}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Note on Academic Audit */}
        <div className="glass-card" style={{ marginTop: '40px', background: 'rgba(14, 165, 233, 0.03)', border: '1px dashed var(--border-light)', textAlign: 'left' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaFolderOpen />
            <span>Academic Capstone Deliverables</span>
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Spreadsheets compiled by this reports module export headers matching database schemas exactly. They are fully compatible with Microsoft Excel and Google Sheets to present statistical data verification sheets to grading panels during demonstrations.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsReports;
