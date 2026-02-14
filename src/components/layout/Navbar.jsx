import { Link } from 'react-router-dom';
import { Home, Calendar, User, LogIn, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: '1rem 2rem',
                transition: 'all 0.3s ease',
                background: scrolled ? 'var(--glass)' : 'transparent',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
                backdropFilter: scrolled ? 'blur(10px)' : 'none'
            }}
        >
            <div className="container flex-between">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                        H
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>InstaHelp</span>
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu">
                    <Link to="/" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>Home</Link>
                    <Link to="/services" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>Services</Link>
                    <Link to="/history" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>History</Link>

                    <SignedOut>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                            <LogIn size={18} style={{ marginRight: '0.5rem' }} /> Login
                        </Link>
                        <Link to="/register" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginLeft: '0.5rem', background: 'rgba(255,255,255,0.1)' }}>
                            Sign Up
                        </Link>
                    </SignedOut>

                    <SignedIn>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Welcome!</span>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>
                </div>

                {/* Mobile Toggle */}
                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-card)',
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
                            <Link to="/services" onClick={() => setIsOpen(false)}>Services</Link>
                            <Link to="/history" onClick={() => setIsOpen(false)}>History</Link>
                            <SignedOut>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <Link to="/login" onClick={() => setIsOpen(false)} style={{ color: 'var(--primary)' }}>Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)' }}>Sign Up</Link>
                                </div>
                            </SignedOut>

                            <SignedIn>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Account</span>
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </SignedIn>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
