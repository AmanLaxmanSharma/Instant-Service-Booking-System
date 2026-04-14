import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Users, Search, Compass } from 'lucide-react';

const vendors = [
  { id: 'v1', name: 'John Doe', phone: '+1 555-1234', rating: 4.9, services: ['cleaning', 'plumbing'], location: 'San Francisco, CA' },
  { id: 'v2', name: 'Sara Jones', phone: '+1 555-5678', rating: 4.8, services: ['electrician', 'painting'], location: 'Los Angeles, CA' },
  { id: 'v3', name: 'Amit Patel', phone: '+1 555-9876', rating: 4.7, services: ['moving', 'appliance'], location: 'New York, NY' },
  { id: 'v4', name: 'Jenny Lee', phone: '+1 555-2468', rating: 4.9, services: ['cleaning', 'moving'], location: 'Austin, TX' }
];

const ChooseVendor = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [manualAddress, setManualAddress] = useState('');
  const [geoError, setGeoError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);

  const availableVendors = useMemo(() => {
    return vendors.filter(vendor => vendor.services.includes(serviceId));
  }, [serviceId]);

  const locateUser = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser. Enter address manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      (err) => {
        setGeoError('Unable to get location. Please enter it manually.');
      },
      { timeout: 8000 }
    );
  };

  const onSelectVendor = (vendor) => {
    const query = new URLSearchParams();
    if (currentLocation) query.set('location', currentLocation);
    if (manualAddress) query.set('manualAddress', manualAddress);
    navigate(`/book/${serviceId}/${vendor.id}${query.toString() ? `?${query.toString()}` : ''}`);
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', paddingBottom: '4rem', background: '#0b1235' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <h1>Select a vendor for {serviceId}</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Choose a verified vendor, add your location (auto/manual), then confirm booking.
        </p>

        <div style={{ margin: '1.5rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={locateUser}>
            <MapPin size={16} style={{ marginRight: '0.5rem' }} /> Auto-detect location
          </button>
          <input
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Or enter address manually"
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
          />
        </div>

        {geoError && <p style={{ color: '#f87171' }}>{geoError}</p>}
        {currentLocation && <p style={{ color: '#a5f3fc' }}><Compass size={16} /> Current location: {currentLocation}</p>}

        {availableVendors.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.07)' }}>
            <h3>No vendors found for this service yet.</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try another service or check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))', gap: '1rem' }}>
            {availableVendors.map((vendor) => (
              <div key={vendor.id} className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Users size={26} />
                  <div>
                    <h3 style={{ margin: 0 }}>{vendor.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{vendor.services.join(', ')}</p>
                  </div>
                </div>
                <p style={{ marginTop: '0.75rem' }}>
                  <Phone size={14} style={{ marginRight: '0.33rem' }} /> {vendor.phone}<br/>
                  <MapPin size={14} style={{ marginRight: '0.33rem' }} /> {vendor.location}
                </p>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Rating: {vendor.rating} / 5</p>
                <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => onSelectVendor(vendor)}>
                  <Search size={16} style={{ marginRight: '0.45rem' }} /> Choose Vendor
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseVendor;
