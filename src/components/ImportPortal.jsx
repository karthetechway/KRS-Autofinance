import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { parseCSVData } from '../utils/finance';

const ImportPortal = ({ onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [count, setCount] = useState(0);

  const handleImport = (file) => {
    if (!file) return;
    setStatus('processing');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = parseCSVData(event.target.result);
        onImport(data);
        setCount(data.length);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '64px', textAlign: 'center' }}>
        <h2 className="h2" style={{ marginBottom: '12px' }}>Excel Master Import</h2>
        <p className="label" style={{ marginBottom: '48px' }}>Batch upload customer records via CSV</p>

        {status === 'idle' && (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); handleImport(e.dataTransfer.files[0]); }}
            style={{ 
              border: '2px dashed var(--border)', 
              borderRadius: '32px', 
              padding: '80px',
              background: isDragging ? 'rgba(255,61,94,0.05)' : 'transparent',
              borderColor: isDragging ? 'var(--accent-main)' : 'var(--border)',
              transition: 'all 0.3s ease'
            }}
          >
            <Upload size={64} className="text-muted" style={{ marginBottom: '24px' }} />
            <h3 className="h3" style={{ marginBottom: '8px' }}>Drag & Drop CSV File</h3>
            <p className="text-muted" style={{ marginBottom: '32px' }}>Or click the button below to browse your files</p>
            
            <input type="file" id="fileInput" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleImport(e.target.files[0])} />
            <button 
              onClick={() => document.getElementById('fileInput').click()}
              className="btn-primary" 
              style={{ width: 'auto', padding: '0 48px', margin: '0 auto' }}
            >
              Select CSV File
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div style={{ padding: '80px' }}>
            <div className="brand-icon" style={{ margin: '0 auto 24px', width: '80px', height: '80px', background: 'rgba(255,61,94,0.1)' }}>
              <div style={{ width: '32px', height: '32px', border: '4px solid var(--accent-main)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
            <h3 className="h3">Analyzing Records...</h3>
            <p className="text-muted">Please wait while we process the data structure</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fade" style={{ padding: '80px' }}>
            <div className="brand-icon" style={{ margin: '0 auto 24px', width: '80px', height: '80px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 className="h3">Import Successful!</h3>
            <p className="text-muted" style={{ marginBottom: '32px' }}>Successfully migrated {count} customer records to the ledger.</p>
            <button onClick={() => setStatus('idle')} className="btn-primary" style={{ width: 'auto', padding: '0 48px', margin: '0 auto' }}>Upload Another</button>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade" style={{ padding: '80px' }}>
            <div className="brand-icon" style={{ margin: '0 auto 24px', width: '80px', height: '80px', background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
              <AlertCircle size={40} />
            </div>
            <h3 className="h3">Import Failed</h3>
            <p className="text-muted" style={{ marginBottom: '32px' }}>The file structure is invalid. Please ensure it's a valid CSV.</p>
            <button onClick={() => setStatus('idle')} className="btn-primary" style={{ width: 'auto', padding: '0 48px', margin: '0 auto', background: 'var(--error)', color: 'white' }}>Try Again</button>
          </div>
        )}

        <div style={{ marginTop: '64px', textAlign: 'left', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <p className="label" style={{ marginBottom: '16px' }}>CSV Requirements</p>
          <ul style={{ color: 'var(--text-muted)', fontSize: '15px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Columns must include: <b>Name, Phone, VehicleNumber, LoanAmount</b></li>
            <li>File size should be under 10MB for optimal performance</li>
            <li>Ensure dates are in YYYY-MM-DD format if provided</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImportPortal;
