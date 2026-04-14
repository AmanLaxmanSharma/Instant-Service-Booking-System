import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../../models/context/AuthContext';
import { format } from 'date-fns';

const History = () => {
    const { currentUser: user } = useAuth();
    const isLoaded = true;
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Data for Demo
    const mockBookings = [
        {
            id: 'BK-1001',
            service: 'House Cleaning',
            provider: 'Alice Smith',
            date: new Date(2023, 10, 15, 10, 30),
            status: 'completed',
            price: 85.00,
            address: '123 Main St, Springfield'
        },
        {
            id: 'BK-1002',
            service: 'Plumbing Repair',
            provider: 'Bob Jones',
            date: new Date(2023, 11, 2, 14, 0),
            status: 'cancelled',
            price: 120.50,
            address: '123 Main St, Springfield'
        },
        {
            id: 'BK-1003',
            service: 'Electrical Wiring',
            provider: 'Charlie Day',
            date: new Date(2024, 0, 10, 9, 15),
            status: 'pending',
            price: 200.00,
            address: '456 Oak Ave, Shelbyville'
        }
    ];

    useEffect(() => {
        // Simulate fetching data
        const fetchBookings = async () => {
            if (!isLoaded || !user) {
                setLoading(false);
                return;
            }

            try {
                // Real implementation would look like:
                // const q = query(
                //    collection(db, "bookings"),
                //    where("userId", "==", user.id),
                //    orderBy("date", "desc")
                // );
                // const querySnapshot = await getDocs(q);
                // const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // setBookings(data);

                // For demo, use mock data
                setTimeout(() => {
                    setBookings(mockBookings);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                setLoading(false);
            }
        };

        fetchBookings();
    }, [isLoaded, user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-400';
            case 'cancelled': return 'text-red-400';
            case 'pending': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={18} className="text-green-400" />;
            case 'cancelled': return <XCircle size={18} className="text-red-400" />;
            case 'pending': return <AlertCircle size={18} className="text-yellow-400" />;
            default: return <Clock size={18} className="text-gray-400" />;
        }
    };

    if (!isLoaded) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;

    if (!user) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center', minHeight: '60vh' }}>
                <h2>Please Sign In</h2>
                <p className="text-muted">You need to be logged in to view your booking history.</p>
            </div>
        );
    }

    return (
        <div className="history-page" style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Booking History</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track and manage your service requests</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}><Calendar size={48} /></div>
                        <h3>No bookings found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>You haven't made any service requests yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                className="card glass"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem',
                                    padding: '1.5rem',
                                    background: 'rgba(30, 41, 59, 0.4)'
                                }}
                            >
                                {/* Left: Main Info */}
                                <div style={{ flex: '1 1 300px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{booking.service}</h3>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px',
                                            background: 'rgba(0,0,0,0.2)',
                                            fontSize: '0.85rem',
                                            textTransform: 'capitalize'
                                        }}>
                                            {getStatusIcon(booking.status)}
                                            <span className={getStatusColor(booking.status)}>{booking.status}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} />
                                            {format(booking.date, 'MMM d, yyyy')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={16} />
                                            {format(booking.date, 'h:mm a')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={16} />
                                            {booking.address}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Provider & Price */}
                                <div style={{
                                    flex: '0 0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '0.5rem',
                                    textAlign: 'right'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                            <User size={14} color="white" />
                                        </div>
                                        <span style={{ fontSize: '0.95rem' }}>{booking.provider}</span>
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                        ${booking.price.toFixed(2)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
