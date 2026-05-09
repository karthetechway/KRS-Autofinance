import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, Zap, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid credentials. Please check your email and password.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-app)',
      padding: '20px'
    }}>
      <div className="animate-fade" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border)', 
        borderRadius: '32px',
        padding: '48px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="brand-icon" style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 24px', 
            borderRadius: '24px',
            background: 'linear-gradient(135deg, var(--accent-main), #ff6b81)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Lock size={32} />
          </div>
          <h1 className="h2" style={{ marginBottom: '8px' }}>KRS Control Panel</h1>
          <p className="label" style={{ margin: 0 }}>Secure access for administrators only</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="input-group" style={{ margin: 0 }}>
            <label className="label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required 
                type="email" 
                className="input-modern" 
                style={{ paddingLeft: '48px' }} 
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="label">Security Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required 
                type="password" 
                className="input-modern" 
                style={{ paddingLeft: '48px' }} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--accent-main)', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '12px' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>SIGN IN TO SYSTEM <Zap size={18} /></>}
          </button>
        </form>

        <p className="label" style={{ textAlign: 'center', marginTop: '32px', opacity: 0.5 }}>
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Login;
