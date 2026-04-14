import { motion } from 'framer-motion';
import { useAuth } from '../../../models/context/AuthContext';
import { Briefcase, CalendarClock, DollarSign, Star, Power, PowerOff, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProviderByUserId, setProviderAvailability, getVendorBookings, updateBookingStatus } from '../../../models/services/db';
import { Navigate } from 'react-router-dom';

const VendorDashboard = () => {
    const { currentUser } = useAuth();
    const [provider, setProvider] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (currentUser) {
                const providerData = await getProviderByUserId(currentUser.id);
                if (!providerData) {
                    // Redirect to setup if no profile
                    return;
                }
                setProvider(providerData);
                setIsLive(providerData.status === 'available');

                const vendorBookings = await getVendorBookings(currentUser.id);
                setBookings(vendorBookings);
            }
            setLoading(false);
        };
        loadData();
    }, [currentUser]);

    const handleAcceptBooking = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, 'accepted');
            // Refresh bookings
            const vendorBookings = await getVendorBookings(currentUser.id);
            setBookings(vendorBookings);
        } catch (error) {
            console.error('Error accepting booking:', error);
        }
    };

    const handleRejectBooking = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, 'rejected');
            // Refresh bookings
            const vendorBookings = await getVendorBookings(currentUser.id);
            setBookings(vendorBookings);
        } catch (error) {
            console.error('Error rejecting booking:', error);
        }
    };

    const handleToggleLive = async () => {
        if (!provider) return;
        
        try {
            const newStatus = !isLive;
            await setProviderAvailability(provider.id, newStatus);
            setIsLive(newStatus);
            // Update provider status
            setProvider(prev => ({ ...prev, status: newStatus ? 'available' : 'unavailable' }));
        } catch (error) {
            console.error('Error updating availability:', error);
        }
    };

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    if (!provider) {
        return <Navigate to="/vendor/setup" replace />;
    }

    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 0), 0);
    const averageRating = 4.8; // Placeholder

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Briefcase size={32} color="var(--primary)" />
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Vendor Portal</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {provider.name}. Manage your service requests and earnings.</p>
                </div>

                {/* Go Live Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card glass"
                    style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}
                >
                    <h3 style={{ marginBottom: '1rem' }}>Service Status</h3>
                    <button
                        onClick={handleToggleLive}
                        style={{
                            padding: '1rem 2rem',
                            background: isLive ? '#10b981' : '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2rem',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        {isLive ? <Power size={20} /> : <PowerOff size={20} />}
                        {isLive ? 'You are Live - Receiving Requests' : 'Go Live to Receive Requests'}
                    </button>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {isLive ? 'Customers can now book your services' : 'Toggle to start receiving customer requests'}
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { title: 'Pending Jobs', value: pendingBookings, icon: <CalendarClock size={24} />, color: '#f59e0b' },
                        { title: 'Total Earnings', value: `$${totalEarnings}`, icon: <DollarSign size={24} />, color: '#10b981' },
                        { title: 'Average Rating', value: averageRating, icon: <Star size={24} />, color: '#3b82f6' }
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

                {/* Recent Bookings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card glass"
                    style={{ padding: '1.5rem' }}
                >
                    <h3 style={{ marginBottom: '1rem' }}>Recent Bookings</h3>
                    {bookings.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No bookings yet. Go live to start receiving requests!</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {bookings.slice(0, 5).map(booking => (
                                <div key={booking.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{booking.serviceType}</p>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Status: <strong style={{ 
                                                color: booking.status === 'pending' ? '#f59e0b' : 
                                                       booking.status === 'accepted' ? '#10b981' : 
                                                       booking.status === 'completed' ? '#3b82f6' : '#ef4444'
                                            }}>{booking.status}</strong>
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontWeight: '500' }}>${booking.price || 'TBD'}</p>
                                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {new Date(booking.timestamp?.toDate?.() || booking.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {booking.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleAcceptBooking(booking.id)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: '#10b981',
                                                        border: 'none',
                                                        borderRadius: '0.25rem',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <CheckCircle size={16} />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectBooking(booking.id)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: '#ef4444',
                                                        border: 'none',
                                                        borderRadius: '0.25rem',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <XCircle size={16} />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default VendorDashboard;
