import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../models/context/AuthContext';
import { createProvider, getProviderByUserId } from '../../../models/services/db';
import { motion } from 'framer-motion';
import { User, Phone, DollarSign, CheckCircle } from 'lucide-react';

const services = [
    { id: 'cleaning', name: 'Home Cleaning', icon: '🧹' },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
    { id: 'electrician', name: 'Electrician', icon: '⚡' },
    { id: 'painting', name: 'Painting', icon: '🎨' },
    { id: 'moving', name: 'Moving Help', icon: '📦' },
    { id: 'appliance', name: 'Appliance Repair', icon: '📺' },
];

const VendorProfileSetup = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        services: [],
        hourlyRate: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if vendor already has a profile
        const checkProfile = async () => {
            if (currentUser) {
                const provider = await getProviderByUserId(currentUser.uid);
                if (provider) {
                    navigate('/vendor');
                }
            }
        };
        checkProfile();
    }, [currentUser, navigate]);

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(serviceId)
                ? prev.services.filter(id => id !== serviceId)
                : [...prev.services, serviceId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.phone || formData.services.length === 0 || !formData.hourlyRate) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await createProvider({
                userId: currentUser.uid,
                name: formData.name,
                phone: formData.phone,
                services: formData.services,
                hourlyRate: parseFloat(formData.hourlyRate),
                description: formData.description,
                email: currentUser.email
            });
            navigate('/vendor');
        } catch (err) {
            setError('Failed to create profile: ' + err.message);
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
                className="card glass"
                style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <CheckCircle size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ marginBottom: '0.5rem' }}>Complete Your Vendor Profile</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Tell us about your services to get started</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            <User size={16} style={{ marginRight: '0.5rem' }} />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            <Phone size={16} style={{ marginRight: '0.5rem' }} />
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Services Offered *
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {services.map(service => (
                                <label
                                    key={service.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.5rem',
                                        border: `1px solid ${formData.services.includes(service.id) ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '0.5rem',
                                        background: formData.services.includes(service.id) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.services.includes(service.id)}
                                        onChange={() => handleServiceToggle(service.id)}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{service.icon}</span>
                                    {service.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            <DollarSign size={16} style={{ marginRight: '0.5rem' }} />
                            Hourly Rate ($) *
                        </label>
                        <input
                            type="number"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                            placeholder="Enter your hourly rate"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem',
                                minHeight: '80px',
                                resize: 'vertical'
                            }}
                            placeholder="Tell customers about your experience and services..."
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#ef4444',
                            background: 'rgba(239, 68, 68, 0.1)',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Creating Profile...' : 'Complete Setup'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default VendorProfileSetup;