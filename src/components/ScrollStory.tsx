/* eslint-disable */
import { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- WebGL COMPONENTS ---

// 1. Full-screen Starfield (The Universe)
function UniverseStars({ scrollYProgress }: { scrollYProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 2500; // Dense starfield

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread vastly across X, Y, and Z axes
      pos[i * 3] = (Math.random() - 0.5) * 40;     // X spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // Y spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5; // Z depth
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    // Very slow cosmic rotation + parallax scroll lifting
    pointsRef.current.rotation.y = time * 0.02 + scrollYProgress * 0.5;
    pointsRef.current.position.y = scrollYProgress * 5;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#a1a1aa" // Softer grey for background stars
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

// 2. The "Clarity" Structure (Left side, perfect wireframe)
function ClaritySphere({ scrollYProgress }: { scrollYProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * -0.1 + scrollYProgress * -1.5;
    meshRef.current.rotation.z = time * 0.05;
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5} position={[-4, -2, -2]}>
      <Sphere ref={meshRef} args={[1.8, 32, 32]}>
        <meshStandardMaterial
          color="#18181b"
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>
    </Float>
  );
}

// 3. The "Saturn" Planet (Right side, next to first line)
function SaturnSphere({ scrollYProgress }: { scrollYProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    // Slowly rotate and wobble the planet
    groupRef.current.rotation.y = time * 0.15 + scrollYProgress * 1.5;
    groupRef.current.rotation.x = Math.PI / 6 + Math.sin(time * 0.5) * 0.05; // Classic planetary tilt
  });

  return (
    <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5} position={[4.5, 1.2, -2]}>
      <group ref={groupRef}>
        {/* Planet Body */}
        <Sphere args={[1.0, 32, 32]}>
          <meshStandardMaterial color="#18181b" wireframe transparent opacity={0.15} />
        </Sphere>
        {/* Inner Ring */}
        <Torus args={[1.6, 0.015, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#3f3f46" transparent opacity={0.4} />
        </Torus>
        {/* Outer Ring */}
        <Torus args={[1.8, 0.008, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#a1a1aa" transparent opacity={0.2} />
        </Torus>
      </group>
    </Float>
  );
}

// --- MAIN COMPONENT ---

const content = [
  {
    text: "We help you check if your idea is worth the build.",
    sub: "before you spend your time and money"
  },
  {
    text: "We show you if your idea makes sense",
    sub: "and how to improve it so you can build what people actually want"
  }
];

export default function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollYProgress, setScrollYProgress] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Global scroll progress for 3D elements
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => setScrollYProgress(self.progress)
      });

      const lineContainers = gsap.utils.toArray<HTMLElement>('.line-container');

      lineContainers.forEach((container) => {
        const words = container.querySelectorAll('.word');
        const sub = container.querySelector('.sub-text');

        // Word-by-word fill animation
        gsap.to(words, {
          color: '#000',
          stagger: 0.1,
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            end: "top 30%",
            scrub: true,
          }
        });

        // Subtext reveal
        gsap.fromTo(sub,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: container,
              start: "top 75%",
              end: "top 45%",
              scrub: true,
            }
          }
        );
      });

      // Animate the Canvas container for parallax effect
      gsap.fromTo('.canvas-container',
        { y: '10%' },
        {
          y: '-10%',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full bg-white py-32 md:py-48 z-10 overflow-hidden">

      {/* 3D Background Layer */}
      <div className="canvas-container absolute inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={1} />
          <UniverseStars scrollYProgress={scrollYProgress} />
          <SaturnSphere scrollYProgress={scrollYProgress} />
          <ClaritySphere scrollYProgress={scrollYProgress} />
        </Canvas>
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12 flex flex-col gap-y-48 md:gap-y-[40vh]">
        {content.map((item, idx) => (
          <div
            key={idx}
            className={`line-container flex flex-col gap-6 max-w-5xl ${idx % 2 === 1 ? 'self-end text-right items-end' : 'self-start text-left items-start'}`}
          >
            <h2
              className={`fill-text text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1] select-none flex flex-wrap gap-x-[0.3em] ${idx % 2 === 1 ? 'justify-end' : 'justify-start'}`}
              style={{
                color: '#e5e7eb',
                paddingBottom: '0.1em'
              }}
            >
              {item.text.split(' ').map((word, wIdx) => {
                const hasDot = word.endsWith('.');
                const cleanWord = hasDot ? word.slice(0, -1) : word;
                const isBuild = cleanWord.toLowerCase() === 'build';

                let translateY = 0;
                if (idx === 0) {
                  if (wIdx >= 5 && wIdx <= 9) {
                    translateY = 0.12;
                  } else if (isBuild) {
                    translateY = 0.27;
                  }
                } else if (isBuild) {
                  translateY = 0.15;
                }

                return (
                  <span
                    key={wIdx}
                    className="inline-block"
                    style={translateY ? { transform: `translateY(${translateY}em)` } : undefined}
                  >
                    <span className="word inline-block">{cleanWord}</span>
                    {hasDot && <span className="word inline-block">.</span>}
                  </span>
                );
              })}
            </h2>

            <p className="sub-text text-zinc-400 text-lg md:text-2xl max-w-2xl font-medium leading-relaxed will-change-[opacity,transform]">
              {item.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
