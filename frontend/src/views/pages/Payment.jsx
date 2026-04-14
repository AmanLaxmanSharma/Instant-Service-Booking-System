import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../models/context/AuthContext';
import { processPayment } from '../../models/services/api';

const Payment = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    
    // Get booking details from URL params
    const vendorId = searchParams.get('vendorId');
    const serviceType = searchParams.get('serviceType');
    const amount = parseFloat(searchParams.get('amount') || '0');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    useEffect(() => {
        if (!vendorId || !serviceType || !amount) {
            setError('Invalid booking details');
        }
    }, [vendorId, serviceType, amount]);

    const handlePayment = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Frontend only sends payment details to backend
            // Backend handles: payment processing + booking creation (atomic operation)
            const response = await processPayment({
                vendorId,
                serviceType,
                amount,
                scheduledDate: date,
                scheduledTime: time,
                paymentMethod
            });
            
            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate(`/history`, { replace: true });
                }, 2000);
            } else {
                setError(response.message || 'Payment failed');
            }
        } catch (err) {
            setError(err.message || 'Payment processing failed');
            console.error('Payment error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card glass"
                    style={{ padding: '2rem' }}
                >
                    {!success ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                <CreditCard size={32} color="var(--primary)" />
                                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Complete Payment</h1>
                            </div>

                            {/* Booking Summary */}
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Booking Summary</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span>Service:</span>
                                    <strong>{serviceType}</strong>
                                </div>
                                {date && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span>Date:</span>
                                        <strong>{date}</strong>
                                    </div>
                                )}
                                {time && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span>Time:</span>
                                        <strong>{time}</strong>
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                }}>
                                    <span>Total Amount:</span>
                                    <span style={{ color: 'var(--primary)' }}>${amount.toFixed(2)}</span>
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1.5rem',
                                    color: '#fca5a5'
                                }}>
                                    <AlertCircle size={20} style={{ flexShrink: 0 }} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Payment Methods */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Select Payment Method</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {['card', 'wallet', 'upi'].map((method) => (
                                        <label key={method} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            border: paymentMethod === method ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={method}
                                                checked={paymentMethod === method}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                                            />
                                            <span style={{ textTransform: 'uppercase', fontWeight: '500' }}>
                                                {method === 'card' && 'Credit/Debit Card'}
                                                {method === 'wallet' && 'Digital Wallet'}
                                                {method === 'upi' && 'UPI'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={loading || !vendorId}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        Pay ${amount.toFixed(2)}
                                    </>
                                )}
                            </button>

                            <p style={{
                                marginTop: '1rem',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem'
                            }}>
                                Your payment information is secure and encrypted
                            </p>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem'
                                }}
                            >
                                <Check size={40} color="white" />
                            </motion.div>
                            <h2 style={{ marginBottom: '0.5rem' }}>Payment Successful!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                Your booking has been confirmed. Redirecting...
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Payment;
