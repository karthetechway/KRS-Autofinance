import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default demo password is 'admin' or any non-empty for this demo
    if (password === '1234') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-app)',
      padding: '24px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" 
        style={{ maxWidth: '540px', width: '100%', padding: '64px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, height: '4px', 
          background: 'linear-gradient(90deg, var(--accent-main), transparent)' 
        }}></div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ margin: '0 auto 16px', height: '120px', display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p className="label" style={{ margin: '0 0 40px' }}>Terminal Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="label">System Identity</label>
            <div style={{ position: 'relative' }}>
              <User size={16} className="text-muted" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="input-modern" 
                style={{ paddingLeft: '48px' }} 
                defaultValue="Administrator" 
                readOnly 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="label">Access Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="input-modern" 
                style={{ paddingLeft: '48px', borderColor: error ? 'var(--error)' : 'var(--border)' }} 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--error)', fontSize: '14px', fontWeight: 800 }}
            >
              <AlertCircle size={14} /> INVALID ACCESS KEY
            </motion.div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
            Authorize Entry <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SECURED BY END-TO-END ENCRYPTION
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
