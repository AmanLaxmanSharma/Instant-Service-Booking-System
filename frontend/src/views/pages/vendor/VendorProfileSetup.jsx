import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../models/context/AuthContext';
import { createProvider, getProviderByUserId } from '../../../models/services/db';
import { motion } from 'framer-motion';
import { User, Phone, DollarSign, CheckCircle, MapPin, Loader2, Navigation } from 'lucide-react';

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
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
    const [locationError, setLocationError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if vendor already has a profile
        const checkProfile = async () => {
            if (currentUser) {
                const provider = await getProviderByUserId(currentUser.id);
                if (provider) {
                    navigate('/vendor');
                }
            }
        };
        checkProfile();
    }, [currentUser, navigate]);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLocationStatus('error');
            return;
        }

        setLocationStatus('loading');
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationStatus('success');
            },
            (error) => {
                let errorMsg = 'Unable to get your location';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMsg = 'Location permission denied. Please enable it in settings.';
                }
                setLocationError(errorMsg);
                setLocationStatus('error');
            }
        );
    };

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
        
        if (!formData.name || !formData.phone || formData.services.length === 0 || !formData.hourlyRate || location.lat === null || location.lng === null) {
            setError('Please fill in all required fields and grant location permission');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await createProvider({
                businessName: formData.name,
                description: formData.description,
                serviceType: formData.services[0],
                location: {
                    address: {
                        street: formData.name,
                        city: 'Current Location',
                        state: 'Current',
                        zipCode: '00000'
                    },
                    coordinates: {
                        type: 'Point',
                        coordinates: [location.lng, location.lat]
                    }
                }
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

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={20} />
                            Your Service Location *
                        </h3>

                        {locationStatus === 'idle' && (
                            <button
                                type="button"
                                onClick={requestLocation}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    border: '2px dashed rgba(59, 130, 246, 0.5)',
                                    borderRadius: '0.5rem',
                                    background: 'rgba(59, 130, 246, 0.05)',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <Navigation size={20} />
                                Grant Location Permission
                            </button>
                        )}

                        {locationStatus === 'loading' && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: 'var(--primary)'
                            }}>
                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                Requesting your location...
                            </div>
                        )}

                        {locationStatus === 'success' && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#6ee7b7'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <CheckCircle size={20} />
                                    <strong>Location Captured</strong>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                    Latitude: {location.lat?.toFixed(4)} | Longitude: {location.lng?.toFixed(4)}
                                </p>
                            </div>
                        )}

                        {locationStatus === 'error' && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#fca5a5'
                            }}>
                                <p style={{ margin: 0, marginBottom: '0.75rem' }}>{locationError}</p>
                                <button
                                    type="button"
                                    onClick={requestLocation}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '0.25rem',
                                        color: '#fca5a5',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
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
                        disabled={loading || locationStatus !== 'success'}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: loading || locationStatus !== 'success' ? '#6b7280' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: loading || locationStatus !== 'success' ? 'not-allowed' : 'pointer',
                            opacity: loading || locationStatus !== 'success' ? 0.7 : 1,
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