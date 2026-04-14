// View: Home page component displaying landing content and 3D scene
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Shield, ArrowRight, Star, Quote } from 'lucide-react';
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

const topEmployees = [
    {
        name: "Arjun Mehta",
        role: "Electrician",
        rating: 4.9,
        reviews: 312,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        badge: "⚡ Expert"
    },
    {
        name: "Priya Sharma",
        role: "House Cleaner",
        rating: 4.8,
        reviews: 245,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
        badge: "🌟 Top Pick"
    },
    {
        name: "Rahul Verma",
        role: "Plumber",
        rating: 4.9,
        reviews: 189,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
        badge: "🔧 Pro"
    },
    {
        name: "Sunita Patel",
        role: "Appliance Repair",
        rating: 4.7,
        reviews: 178,
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face",
        badge: "🏆 Certified"
    },
];

const customerFeedbacks = [
    {
        name: "Kavya Reddy",
        feedback: "Absolutely fantastic service! Arjun fixed my wiring issue in under 30 minutes. Very professional and polite. Highly recommend!",
        rating: 5,
        service: "Electrical",
        avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&crop=face",
        date: "2 days ago"
    },
    {
        name: "Rohit Nair",
        feedback: "Priya did an incredible job cleaning my apartment. Everything was spotless. Will definitely book again next week!",
        rating: 5,
        service: "Cleaning",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
        date: "5 days ago"
    },
    {
        name: "Ananya Singh",
        feedback: "Rahul arrived quickly and solved a major leak issue. Saved my kitchen floor! Great experience with this platform.",
        rating: 5,
        service: "Plumbing",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face",
        date: "1 week ago"
    },
    {
        name: "Deepak Joshi",
        feedback: "Sunita repaired my AC perfectly in the summer heat. 10/10 service. The app made it so easy to book!",
        rating: 4,
        service: "Appliance",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
        date: "2 weeks ago"
    },
];

const StarRating = ({ rating, size = 16 }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={size}
                    fill={s <= fullStars ? '#f59e0b' : (s === fullStars + 1 && hasHalf ? 'url(#half)' : 'transparent')}
                    color={s <= fullStars || (s === fullStars + 1 && hasHalf) ? '#f59e0b' : '#475569'}
                />
            ))}
        </div>
    );
};

const Home = () => {
    return (
        <div className="home-page" style={{ paddingTop: '80px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

            {/* 3D Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0, opacity: 0.6 }}>
                <Scene3D />
            </div>

            {/* Hero Section */}
            <section className="hero container" style={{ textAlign: 'center', padding: '4rem 0', position: 'relative', zIndex: 10 }}>
                <motion.div initial="hidden" animate="visible" variants={homeVariants}>
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
                        Instant Services,<br /> Zero Hassle.
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Need a hand? Book verified professionals for cleaning, repairs, and maintenance.
                        Arriving at your doorstep in as fast as 15 minutes.
                    </p>
                    <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/services" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Book Now <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                        </Link>
                        <Link to="/about" className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Services Preview */}
            <section className="services container" style={{ padding: '6rem 0', position: 'relative' }}>
                <ServiceBackground />
                <div style={{
                    position: 'relative', zIndex: 10,
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem'
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

            {/* ── Top Rated Employees ── */}
            <section className="container" style={{ padding: '5rem 0', position: 'relative', zIndex: 10 }}>
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <span style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #f59e0b33, #f59e0b11)',
                        border: '1px solid #f59e0b55',
                        color: '#f59e0b',
                        padding: '0.35rem 1rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        marginBottom: '1rem'
                    }}>
                        ⭐ Hall of Fame
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.75rem'
                    }}>
                        Top Rated Employees
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                        Our best-in-class professionals, recognised for outstanding service and customer satisfaction.
                    </p>
                </motion.div>

                {/* Employee Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {topEmployees.map((emp, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.5 }}
                            whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(99,102,241,0.25)' }}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.95))',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(99,102,241,0.2)',
                                borderRadius: '20px',
                                padding: '2rem 1.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Glow accent */}
                            <div style={{
                                position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
                                width: '100px', height: '100px',
                                background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }} />

                            {/* Badge */}
                            <span style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'rgba(99,102,241,0.15)',
                                border: '1px solid rgba(99,102,241,0.3)',
                                color: '#a5b4fc',
                                fontSize: '0.7rem', fontWeight: '700',
                                padding: '0.2rem 0.6rem', borderRadius: '999px'
                            }}>
                                {emp.badge}
                            </span>

                            {/* Avatar */}
                            <div style={{
                                width: '90px', height: '90px',
                                borderRadius: '50%',
                                margin: '0 auto 1rem',
                                border: '3px solid rgba(99,102,241,0.5)',
                                boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                                overflow: 'hidden',
                                background: '#1e293b'
                            }}>
                                <img
                                    src={emp.avatar}
                                    alt={emp.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Name & Role */}
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.25rem' }}>
                                {emp.name}
                            </h3>
                            <p style={{ color: '#a5b4fc', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '500' }}>
                                {emp.role}
                            </p>

                            {/* Stars */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                <StarRating rating={emp.rating} size={18} />
                            </div>

                            {/* Rating number and reviews */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'baseline' }}>
                                <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '1.1rem' }}>{emp.rating}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({emp.reviews} reviews)</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="features container" style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem' }}>
                    <div style={{ maxWidth: '300px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}><Clock size={40} /></div>
                        <h3>Fast &amp; Reliable</h3>
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

            {/* ── Customer Feedback ── */}
            <section className="container" style={{ padding: '5rem 0 7rem', position: 'relative', zIndex: 10 }}>
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <span style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #06b6d433, #06b6d411)',
                        border: '1px solid #06b6d455',
                        color: '#22d3ee',
                        padding: '0.35rem 1rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        marginBottom: '1rem'
                    }}>
                        💬 Testimonials
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.75rem'
                    }}>
                        What Our Customers Say
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                        Real reviews from real people who've experienced the difference firsthand.
                    </p>
                </motion.div>

                {/* Feedback Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {customerFeedbacks.map((fb, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.5 }}
                            whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(6,182,212,0.15)' }}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.95))',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(6,182,212,0.15)',
                                borderRadius: '20px',
                                padding: '2rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Quote icon */}
                            <div style={{
                                position: 'absolute', top: '1.5rem', right: '1.5rem',
                                color: 'rgba(6,182,212,0.2)'
                            }}>
                                <Quote size={40} />
                            </div>

                            {/* Subtle glow */}
                            <div style={{
                                position: 'absolute', bottom: '-40px', right: '-40px',
                                width: '120px', height: '120px',
                                background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }} />

                            {/* Service Tag */}
                            <span style={{
                                display: 'inline-block',
                                background: 'rgba(6,182,212,0.1)',
                                border: '1px solid rgba(6,182,212,0.25)',
                                color: '#22d3ee',
                                fontSize: '0.72rem', fontWeight: '700',
                                padding: '0.2rem 0.7rem',
                                borderRadius: '999px',
                                marginBottom: '1rem',
                                letterSpacing: '0.5px'
                            }}>
                                {fb.service}
                            </span>

                            {/* Stars */}
                            <div style={{ marginBottom: '1rem' }}>
                                <StarRating rating={fb.rating} size={16} />
                            </div>

                            {/* Feedback text */}
                            <p style={{
                                color: '#cbd5e1',
                                fontSize: '0.95rem',
                                lineHeight: '1.7',
                                fontStyle: 'italic',
                                marginBottom: '1.5rem'
                            }}>
                                "{fb.feedback}"
                            </p>

                            {/* Customer info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                                <div style={{
                                    width: '42px', height: '42px',
                                    borderRadius: '50%',
                                    border: '2px solid rgba(6,182,212,0.4)',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: '#1e293b'
                                }}>
                                    <img src={fb.avatar} alt={fb.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>{fb.name}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>{fb.date}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Overall rating strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    style={{
                        marginTop: '3rem',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.1))',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '16px',
                        padding: '1.5rem 2rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '2rem',
                        textAlign: 'center'
                    }}
                >
                    {[
                        { label: 'Average Rating', value: '4.9 ⭐' },
                        { label: 'Happy Customers', value: '12,400+' },
                        { label: 'Jobs Completed', value: '38,000+' },
                        { label: 'Verified Pros', value: '850+' }
                    ].map((stat, i) => (
                        <div key={i}>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f1f5f9' }}>{stat.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </section>

        </div>
    );
};

export default Home;
