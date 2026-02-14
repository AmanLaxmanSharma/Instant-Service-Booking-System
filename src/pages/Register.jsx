import { SignUp, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const Register = () => {
    const { isSignedIn } = useUser();

    if (isSignedIn) {
        return <Navigate to="/" />;
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
            padding: '20px'
        }}>
            <SignUp
                path="/register"
                routing="path"
                signInUrl="/login"
                forceRedirectUrl="/services"
                appearance={{
                    elements: {
                        rootBox: {
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        },
                        card: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }
                    }
                }}
            />
        </div>
    );
};

export default Register;
