import { motion } from 'framer-motion';
import { useAuth } from '../../../models/context/AuthContext';
import { Shield, Users, CalendarDays, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    
    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Shield size={32} color="var(--primary)" />
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Admin Dashboard</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, administrator {currentUser.email}. Manage all platform operations here.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { title: 'Total Users', value: '1,245', icon: <Users size={24} />, color: 'var(--primary)' },
                        { title: 'Active Vendors', value: '48', icon: <Activity size={24} />, color: 'var(--secondary)' },
                        { title: 'Appointments Today', value: '24', icon: <CalendarDays size={24} />, color: 'var(--accent)' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className="card glass"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                        >
                            <div style={{ padding: '1rem', background: `rgba(255,255,255,0.05)`, borderRadius: '1rem', color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{stat.value}</h3>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>{stat.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
