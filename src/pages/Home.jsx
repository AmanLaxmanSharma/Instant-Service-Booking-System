import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Shield, ArrowRight } from 'lucide-react';
import Scene3D from '../components/ui/Scene3D';
import ServiceBackground from '../components/ui/ServiceBackground';

const homeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const serviceCards = [
    { title: "Cleaning", icon: "🧹", desc: "Expert home cleaning services." },
    { title: "Plumbing", icon: "🔧", desc: "Fast pipe and leak repairs." },
    { title: "Electrical", icon: "⚡", desc: "Safe wiring and installation." },
    { title: "Appliance", icon: "📺", desc: "Repair for AC, Fridge, etc." },
];

const Home = () => {
    return (
        <div className="home-page" style={{ paddingTop: '80px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

            {/* 3D Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0, opacity: 0.6 }}>
                <Scene3D />
            </div>

            {/* Hero Section */}
            <section className="hero container" style={{ textAlign: 'center', padding: '4rem 0', position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={homeVariants}
                >
                    <span style={{
                        color: 'var(--accent)',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        display: 'block'
                    }}>
                        Premium House Help
                    </span>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '1.5rem'
                    }}>
                        Instant Services,<br />Zero Hassle.
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1.1rem',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem'
                    }}>
                        Need a hand? Book verified professionals for cleaning, repairs, and maintenance.
                        Arriving at your doorstep in as fast as 15 minutes.
                    </p>

                    <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/services" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Book Now <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                        </Link>
                        <Link to="/about" className="btn" style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Services Preview */}
            <section className="services container" style={{ padding: '6rem 0', position: 'relative' }}>
                <ServiceBackground />
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {serviceCards.map((service, index) => (
                        <motion.div
                            key={index}
                            className="card glass"
                            whileHover={{ y: -5, borderColor: 'var(--primary)' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{ textAlign: 'center', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)' }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{service.icon}</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{service.title}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{service.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="features container" style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem' }}>
                    <div style={{ maxWidth: '300px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}><Clock size={40} /></div>
                        <h3>Fast & Reliable</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Service within 15 minutes guaranteed.</p>
                    </div>
                    <div style={{ maxWidth: '300px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}><Shield size={40} /></div>
                        <h3>Verified Pros</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Background checked and rated experts.</p>
                    </div>
                    <div style={{ maxWidth: '300px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><Sparkles size={40} /></div>
                        <h3>Top Quality</h3>
                        <p style={{ color: 'var(--text-muted)' }}>100% satisfaction or money back.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
