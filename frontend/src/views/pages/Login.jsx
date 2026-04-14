import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../models/context/AuthContext';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const { currentUser, userRole, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (currentUser) {
        if (userRole === 'admin') return <Navigate to="/admin" />;
        if (userRole === 'vendor') return <Navigate to="/vendor" />;
        return <Navigate to="/services" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
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
            background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '2.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    width: '100%',
                    maxWidth: '400px',
                    color: 'white'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'white'
                    }}>
                        <LogIn size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Sign in to continue</p>
                </div>

                {error && <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem'
                }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.border = '1px solid var(--primary)'}
                            onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'}
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.border = '1px solid var(--primary)'}
                            onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <button 
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ 
                            width: '100%', 
                            padding: '0.875rem', 
                            marginTop: '0.5rem',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
                        <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign up</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
