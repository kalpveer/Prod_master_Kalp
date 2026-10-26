/* eslint-disable */
import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Defined as any to avoid strict Easing type conflicts with cubic-bezier arrays
const ease: any = [0.16, 1, 0.3, 1];

const blurUp = (delay = 0) => ({
  initial: { opacity: 0, filter: 'blur(14px)', y: 20 },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  transition: { duration: 1.3, delay, ease },
});

// --- SUB-COMPONENTS ---

// Feature 1: 3D Gravity Well Background
function GravityWell() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const geometry = useMemo(() => {
    // Balanced: 60x60 gives the flowing wave effect while being 75% cheaper than original 120x120
    const geo = new THREE.PlaneGeometry(100, 100, 60, 60);
    geo.rotateX(-Math.PI / 2);
    
    const position = geo.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      const depth = -15 * Math.exp(-Math.pow(dist / 12, 2));
      position.setY(i, depth);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  const customMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#71717a",
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      mat.userData.shader = shader;

      shader.vertexShader = `
        uniform float uTime;
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `
        vec3 transformed = vec3( position );
        float dist = sqrt(transformed.x * transformed.x + transformed.z * transformed.z);
        float wave = sin(dist * 1.5 - uTime * 2.0) * 0.4;
        transformed.y += wave;
        `
      );
    };
    return mat;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    meshRef.current.rotation.y = time * 0.03;
    
    if (customMaterial.userData.shader) {
      customMaterial.userData.shader.uniforms.uTime.value = time;
    }

    // Pulse the singularity core
    if (coreRef.current && coreMaterialRef.current) {
      const pulse = Math.sin(time * 2.5);
      const scale = 1 + pulse * 0.15;
      coreRef.current.scale.set(scale, scale, scale);
      coreMaterialRef.current.opacity = 0.7 + pulse * 0.2;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      <mesh ref={meshRef} geometry={geometry} material={customMaterial} />
      <mesh ref={coreRef} position={[0, -14.5, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial ref={coreMaterialRef} color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Feature 2: Matrix/Decode Scramble Text
const CYBER_CHARACTERS = "10!@#$%^&*()_+{}|:<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function ScrambleText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((_, index) => {
        if (index < iteration) return text[index];
        return CYBER_CHARACTERS[Math.floor(Math.random() * CYBER_CHARACTERS.length)];
      }).join(""));

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}


// --- MAIN COMPONENT ---

export default function Hero({ onVideoLoad }: { onVideoLoad?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    // Immediately resolve preloader since we replaced video with 3D canvas
    onVideoLoad?.();
  }, [onVideoLoad]);

  const contentOpacity = useTransform(scrollY, [0, 550], [1, 0]);
  const contentY = useTransform(scrollY, [0, 550], [0, 70]);

  return (
    <section
      id="reality"
      ref={containerRef}
      className="relative flex h-screen w-full flex-col items-center justify-center bg-black overflow-hidden pt-24"
    >
      {/* ── 3D Background: Gravity Well ── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-100">
        <Canvas camera={{ position: [0, 10, 28], fov: 60 }}>
          <ambientLight intensity={1.5} />
          <GravityWell />
        </Canvas>
      </div>



      {/* ── Film-grain noise texture ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* ── Hairline grid (very faint) ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff06 1px, transparent 1px), linear-gradient(to bottom, #ffffff06 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Main content ── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl w-full"
      >

        {/* Headline — weight + style contrast */}
        <h1 className="flex flex-col items-center mb-10 gap-1">
          {/* Row 1 */}
          <div className="flex flex-wrap justify-center items-baseline gap-x-4 gap-y-1">
            <motion.span
              {...blurUp(0.4)}
              className="text-[clamp(2.5rem,8vw,5.5rem)] font-light italic tracking-tight text-white leading-[1.0]"
            >
              Your Virtual
            </motion.span>
            <motion.span
              {...blurUp(0.55)}
              className="text-[clamp(2.5rem,8vw,5.5rem)] font-semibold tracking-tighter text-white leading-[1.0]"
            >
              <ScrambleText text="Partner" />
            </motion.span>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap justify-center items-baseline gap-x-4 gap-y-1">
            <motion.span
              {...blurUp(0.7)}
              className="text-[clamp(2.5rem,8vw,5.5rem)] font-semibold tracking-tighter text-white leading-[1.0]"
            >
              in Venture
            </motion.span>
            <motion.span
              {...blurUp(0.85)}
              className="text-[clamp(2.5rem,8vw,5.5rem)] font-light tracking-tight text-white/70 leading-[1.0]"
            >
              Building.
            </motion.span>
          </div>
        </h1>

        {/* Animated rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 1.05, ease }}
          className="w-16 h-px bg-white/20 mb-9 origin-center"
        />

        <motion.p
          {...blurUp(1.15)}
          className="text-sm md:text-base text-white/70 max-w-3xl leading-relaxed font-light mb-12"
        >
          Productica helps founders, incubators, and innovators transform raw ideas into market-ready ventures. We combine AI agents, GTM intelligence, and rigorous diagnostics into a unified venture infrastructure layer designed to navigate uncertainty.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4, ease }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-14"
        >
          {/* Primary Button */}
          <a
            href="/idea"
            className="group flex flex-1 items-center justify-center gap-2.5 px-8 py-3.5 bg-white text-black text-[13px] font-medium rounded-full tracking-wide hover:bg-white/90 active:scale-[0.97] transition-all duration-300 shadow-lg shadow-white/10 whitespace-nowrap cursor-pointer"
          >
            Validate Idea
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          {/* Secondary */}
          <a
            href="https://app.productica.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 text-[13px] font-medium text-white/50 hover:text-white transition-colors duration-300 tracking-wide"
          >
            Explore Productica →
          </a>
        </motion.div>

      </motion.div>

      {/* ── Scroll indicator only ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 2.4 }}
        className="absolute bottom-8 flex flex-col items-center pointer-events-none"
      >
        <div className="w-px h-11 bg-white/10 relative overflow-hidden">
          <motion.div
            animate={{ y: [-44, 44] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
            className="w-full h-full bg-white/30 absolute top-0"
          />
        </div>
      </motion.div>
    </section>
  );
}
