import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight } from 'lucide-react';
import ServiceHero3D from '../components/ui/ServiceHero3D';

const services = [
    { id: 'cleaning', name: 'Home Cleaning', icon: '🧹', price: '$25/hr', rating: 4.8 },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧', price: '$40 fixed', rating: 4.9 },
    { id: 'electrician', name: 'Electrician', icon: '⚡', price: '$35 fixed', rating: 4.7 },
    { id: 'painting', name: 'Painting', icon: '🎨', price: '$50/room', rating: 4.6 },
    { id: 'moving', name: 'Moving Help', icon: '📦', price: '$60/hr', rating: 4.8 },
    { id: 'appliance', name: 'Appliance Repair', icon: '📺', price: '$45 fixed', rating: 4.5 },
];

const Services = () => {
    const navigate = useNavigate();

    const handleSelectService = (serviceId) => {
        navigate(`/choose-vendor/${serviceId}`);
    };

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', paddingBottom: '4rem', position: 'relative', overflow: 'hidden' }}>

            {/* 3D Moving Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.6 }}>
                <ServiceHero3D />
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ marginBottom: '1rem' }}>Select a Service</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Choose the help you need today</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                            className="card glass"
                            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                            onClick={() => handleSelectService(service.id)}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(255,255,255,0.1)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                <Star size={12} fill="gold" stroke="gold" /> {service.rating}
                            </div>

                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{service.icon}</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{service.name}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Starts at {service.price}</p>

                            <button className="btn" style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                justifyContent: 'space-between',
                                padding: '0.75rem 1rem'
                            }}>
                                Book Now <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;
