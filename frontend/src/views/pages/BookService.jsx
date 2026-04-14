import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, CheckCircle, Navigation, MapPin, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Earth3D from '../components/ui/Earth3D';

// Fix for default marker icon in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to recenter map when user location changes
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], 15);
    }, [lat, lng, map]);
    return null;
};

const vendors = [
    { id: 'v1', name: 'John Doe', phone: '+1 555-1234', rating: 4.9, service: 'cleaning' },
    { id: 'v2', name: 'Sara Jones', phone: '+1 555-5678', rating: 4.8, service: 'plumbing' },
    { id: 'v3', name: 'Amit Patel', phone: '+1 555-9876', rating: 4.7, service: 'electrician' },
    { id: 'v4', name: 'Jenny Lee', phone: '+1 555-2468', rating: 4.9, service: 'moving' }
];

const BookService = () => {
    const { serviceId, vendorId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle');
    const [provider, setProvider] = useState(null);
    const [eta, setEta] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Set selected provider from vendor page; fallback to random if none selected
    useEffect(() => {
        if (vendorId) {
            const matched = vendors.find((v) => v.id === vendorId);
            if (matched) {
                setProvider(matched);
                return;
            }
        }

        // Choose first available vendor for service as fallback
        const defaultVendor = vendors.find((v) => v.service === serviceId);
        if (defaultVendor) {
            setProvider(defaultVendor);
        }
    }, [vendorId, serviceId]);

    // View Mode: '3d' (Globe) or '2d' (Street Map)
    const [viewMode, setViewMode] = useState('3d');

    const [userLocation, setUserLocation] = useState(null);
    const [providerLocation, setProviderLocation] = useState(null);

    const fetchUserLocation = () => {
        setStatus('locating');
        setErrorMsg('');

        if (!navigator.geolocation) {
            setErrorMsg("Geolocation is not supported");
            setStatus('idle');
            return;
        }

        // Simulate "Fetching" time
        setTimeout(() => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });

                    // Wait for 3D zoom animation, then switch to 2D
                    setTimeout(() => {
                        setViewMode('2d');
                        setStatus('idle_located');
                    }, 2500);
                },
                (error) => {
                    console.error(error);
                    setErrorMsg("Unable to retrieve location.");
                    // Fallback
                    setUserLocation({ lat: 40.7128, lng: -74.0060 });
                    setTimeout(() => {
                        setViewMode('2d');
                        setStatus('idle_located');
                    }, 2500);
                }
            );
        }, 1500);
    };

    const handleBookNow = () => {
        setStatus('searching');

        setTimeout(() => {
            if (userLocation) {
                const latOffset = (Math.random() - 0.5) * 0.02; // Closer in 2D
                const lngOffset = (Math.random() - 0.5) * 0.02;

                setProviderLocation({
                    lat: userLocation.lat + latOffset,
                    lng: userLocation.lng + lngOffset
                });

                if (!provider) {
                    // fallback provider for service
                    const fallback = vendors.find((v) => v.service === serviceId);
                    setProvider(fallback || {
                        id: 'rand',
                        name: 'Auto Provider',
                        rating: 4.6,
                        service: serviceId,
                        phone: '+1 555-0000'
                    });
                }

                setEta('8 mins');
                setStatus('found');
            }
        }, 3000);
    };

    const handleConfirm = () => {
        // Redirect to payment page with booking details
        const params = new URLSearchParams({
            vendorId: provider?.id || vendorId || 'unknown',
            serviceType: serviceId || 'general',
            amount: '99.99',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        navigate(`/payment?${params.toString()}`);
    };

    return (
        <div style={{ paddingTop: '80px', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>

            {/* Map/Globe Container */}
            <div style={{ flex: 1, position: 'relative' }}>

                {/* 3D Globe View */}
                <AnimatePresence>
                    {viewMode === '3d' && (
                        <motion.div
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                        >
                            <Earth3D
                                userLocation={userLocation}
                                providerLocation={null} // No provider in 3D view yet
                                status={status}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2D Leaflet View */}
                {viewMode === '2d' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }}
                    >
                        {userLocation && (
                            <MapContainer
                                center={[userLocation.lat, userLocation.lng]}
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap'
                                />
                                <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

                                <Marker position={[userLocation.lat, userLocation.lng]}>
                                    <Popup>You</Popup>
                                </Marker>

                                {providerLocation && (
                                    <Marker position={[providerLocation.lat, providerLocation.lng]}>
                                        <Popup>{provider?.name}</Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        )}
                    </motion.div>
                )}

                {/* Floating UI Panel */}
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '400px',
                    zIndex: 1000
                }}>
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="card glass"
                        style={{ padding: '1.5rem', backdropFilter: 'blur(20px)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        {/* Context Header */}
                        {viewMode === '3d' && (
                            <div style={{ position: 'absolute', top: '-40px', left: 0, right: 0, textAlign: 'center', color: 'white', opacity: 0.8 }}>
                                <small>GLOBAL VIEW</small>
                            </div>
                        )}

                        {/* Status: Idle (3D View) */}
                        {(status === 'idle') && (
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>Where do you need help?</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Share your location to find {serviceId} pros nearby.
                                </p>
                                {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{errorMsg}</p>}

                                <button
                                    onClick={fetchUserLocation}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem' }}
                                >
                                    <MapPin size={18} style={{ marginRight: '0.5rem' }} /> Share Location
                                </button>
                            </div>
                        )}

                        {/* Status: Locating (Animation) */}
                        {status === 'locating' && (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <Loader2 size={32} className="spin" style={{ margin: '0 0 1rem 0', animation: 'spin 1s linear infinite' }} />
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                <h3>Flying to your location...</h3>
                            </div>
                        )}

                        {/* Status: Located (2D View, Ready to Search) */}
                        {status === 'idle_located' && (
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>Location Found</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    We're ready to search in this area.
                                </p>
                                <button
                                    onClick={handleBookNow}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem' }}
                                >
                                    <Navigation size={18} style={{ marginRight: '0.5rem' }} /> Find {serviceId}
                                </button>
                            </div>
                        )}

                        {/* Status: Searching */}
                        {status === 'searching' && (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', marginBottom: '1rem' }} />
                                <h3>Scanning Nearby...</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Checking availability...</p>
                            </div>
                        )}

                        {/* Status: Found */}
                        {(status === 'found') && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.2rem'
                                    }}>
                                        {provider.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ marginBottom: '0.25rem' }}>{provider.name}</h3>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            ⭐ {provider.rating} • {eta} away
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => { setStatus('idle_located'); setProvider(null); }}
                                        className="btn"
                                        style={{ flex: 1, border: '1px solid var(--border-color)' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Status: Confirmed */}
                        {status === 'confirmed' && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
                                    <CheckCircle size={50} />
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>Booking Confirmed!</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    {provider.name} is on the way.<br />
                                    Estimated Arrival: <strong>{eta}</strong>
                                </p>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <small style={{ color: 'var(--text-muted)' }}>BOOKING ID</small><br />
                                    <strong style={{ letterSpacing: '2px' }}>#BK-{Math.floor(Math.random() * 10000)}</strong>
                                </div>
                                <button
                                    onClick={() => navigate('/')}
                                    className="btn"
                                    style={{ width: '100%', border: '1px solid var(--border-color)' }}
                                >
                                    Back to Home
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default BookService;
