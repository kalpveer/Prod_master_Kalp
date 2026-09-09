/* eslint-disable */
import { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function CoreParticles({ scrollYProgress }: { scrollYProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Create particle geometry
  const count = isMobile ? 150 : 400; // Reduced from 600/1500 for smooth performance
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.5 + Math.random() * 0.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Rotate sphere
    pointsRef.current.rotation.y = time * 0.1 + scrollYProgress * 2;
    pointsRef.current.rotation.z = time * 0.05;
    
    // Scale pulse
    const scale = 1 + Math.sin(time * 2) * 0.05 + scrollYProgress * 0.5;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.025 : 0.015} // Slightly larger particles on mobile for better visibility
        color="white"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function AICore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollYProgress, setScrollYProgress] = useState(0);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const isMobile = window.innerWidth < 768;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        setScrollYProgress(self.progress);
      }
    });
    
    // Text reveal focus
    gsap.fromTo('.core-text', 
      { opacity: 0.2, filter: 'blur(4px)' },
      { 
        opacity: 1, 
        filter: 'blur(0px)',
        scrollTrigger: {
          trigger: containerRef.current,
          start: isMobile ? 'top 80%' : 'center bottom',
          end: isMobile ? 'top 20%' : 'center center',
          scrub: isMobile ? false : true,
          once: true,
          toggleActions: isMobile ? "play none none none" : undefined,
        }
      }
    );
    
    return () => st.kill();
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <section ref={containerRef} className="relative w-full h-[60vh] md:h-screen bg-black flex items-center justify-center overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-white/5 rounded-full blur-[60px] md:blur-[120px]"></div>
      </div>
      
      {/* WebGL Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, isMobile ? 12 : 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <CoreParticles scrollYProgress={scrollYProgress} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere args={[isMobile ? 1 : 1.5, 32, 32]}>
              <meshStandardMaterial 
                color="white" 
                wireframe 
                transparent 
                opacity={0.15} 
                emissive="white"
                emissiveIntensity={0.2}
              />
            </Sphere>
          </Float>
          <pointLight position={[0, 0, 0]} intensity={2} color="white" />
        </Canvas>
      </div>
      
      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <h2 className="core-text text-5xl md:text-8xl font-bold tracking-tighter text-white uppercase text-center mix-blend-difference">
          Data becomes <br />
          <span className="font-normal md:font-light italic text-white/90">Clarity.</span>
        </h2>
      </div>

    </section>
  );
}
