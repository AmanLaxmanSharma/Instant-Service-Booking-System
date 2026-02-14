import { motion } from 'framer-motion';

const ServiceBackground = () => {
    // Floating bubbles configuration
    const bubbles = [
        { size: 200, x: -10, y: -20, color: 'rgba(56, 189, 248, 0.2)', delay: 0 },
        { size: 300, x: 90, y: 10, color: 'rgba(168, 85, 247, 0.15)', delay: 2 },
        { size: 150, x: 20, y: 80, color: 'rgba(236, 72, 153, 0.15)', delay: 4 },
        { size: 250, x: 60, y: -10, color: 'rgba(59, 130, 246, 0.2)', delay: 1 },
    ];

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
            {/* Animated Gradient Mesh */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.5) 100%)',
                zIndex: 1
            }} />

            {bubbles.map((bubble, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: bubble.size,
                        height: bubble.size,
                        borderRadius: '50%',
                        background: bubble.color,
                        left: `${bubble.x}%`,
                        top: `${bubble.y}%`,
                        filter: 'blur(40px)',
                    }}
                    animate={{
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 8 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: bubble.delay,
                    }}
                />
            ))}

            {/* Grid Pattern Overlay */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.3,
                zIndex: 1
            }} />
        </div>
    );
};

export default ServiceBackground;
