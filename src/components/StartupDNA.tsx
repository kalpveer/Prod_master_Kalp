/* eslint-disable */
/**
 * StartupDNA — Premium interactive DNA helix visualization
 *
 * Sphere-and-rung DNA design inspired by the reference image.
 * Two intertwining strands made of prominent spheres connected
 * by horizontal rungs, with thin thread curves linking the spheres.
 *
 * Features connect physically to specific spheres on the helix
 * using dynamic 3D bezier curves.
 */
import {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
  Suspense,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './StartupDNA.css';

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

interface DNACard {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
}

interface StartupDNAProps {
  title: string;
  cards: DNACard[];
}

interface DNASceneProps {
  hoveredIndex: number | null;
  dnaHovered: boolean;
  reducedMotion: boolean;
  isMobile?: boolean;
  onHoverStart?: (index: number) => void;
  onHoverEnd?: () => void;
}

/* ═══════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════ */

const HELIX = {
  TURNS: 2.8,
  HEIGHT: 5.8,
  RADIUS: 0.6,
  STRAND_THICKNESS: 0.018,
  SPHERES_PER_STRAND: 16,
  SPHERE_RADIUS: 0.08,
  RUNG_THICKNESS: 0.016,
  SEGMENTS: 200,
} as const;

const LEFT_INDICES = [0, 1, 3];
const RIGHT_INDICES = [2, 4, 5];
const TOTAL_SPHERES = HELIX.SPHERES_PER_STRAND * 2;

/**
 * Anchor configurations for dynamic 3D connector lines.
 * Maps feature indices to specific spheres on the DNA helix.
 */
const ANCHORS = [
  // Left Side Features
  { cardIndex: 0, side: -1, strand: 0, index: 11, htmlY: 0.74 },
  { cardIndex: 1, side: -1, strand: 1, index: 7, htmlY: 0 },
  { cardIndex: 3, side: -1, strand: 0, index: 3, htmlY: -0.74 },
  // Right Side Features
  { cardIndex: 2, side: 1, strand: 1, index: 11, htmlY: 0.74 },
  { cardIndex: 4, side: 1, strand: 0, index: 7, htmlY: 0 },
  { cardIndex: 5, side: 1, strand: 1, index: 3, htmlY: -0.74 },
];

/* ═══════════════════════════════════════════════════════════
   Geometry & Position Helpers
   ═══════════════════════════════════════════════════════════ */

/** Thin thread tube connecting the spheres along each strand */
function createHelixGeometry(offset: number): THREE.TubeGeometry {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= HELIX.SEGMENTS; i++) {
    const t = i / HELIX.SEGMENTS;
    const angle = t * Math.PI * 2 * HELIX.TURNS + offset;
    const y = t * HELIX.HEIGHT - HELIX.HEIGHT / 2;
    points.push(
      new THREE.Vector3(
        HELIX.RADIUS * Math.cos(angle),
        y,
        HELIX.RADIUS * Math.sin(angle),
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(
    curve,
    HELIX.SEGMENTS,
    HELIX.STRAND_THICKNESS,
    8,
    false,
  );
}

/** Sphere centre positions for both strands */
function createSpherePositions(): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];

  // Strand A (offset 0)
  for (let i = 0; i < HELIX.SPHERES_PER_STRAND; i++) {
    const t = i / (HELIX.SPHERES_PER_STRAND - 1);
    const angle = t * Math.PI * 2 * HELIX.TURNS;
    const y = t * HELIX.HEIGHT - HELIX.HEIGHT / 2;
    positions.push(
      new THREE.Vector3(
        HELIX.RADIUS * Math.cos(angle),
        y,
        HELIX.RADIUS * Math.sin(angle),
      ),
    );
  }

  // Strand B (offset π)
  for (let i = 0; i < HELIX.SPHERES_PER_STRAND; i++) {
    const t = i / (HELIX.SPHERES_PER_STRAND - 1);
    const angle = t * Math.PI * 2 * HELIX.TURNS + Math.PI;
    const y = t * HELIX.HEIGHT - HELIX.HEIGHT / 2;
    positions.push(
      new THREE.Vector3(
        HELIX.RADIUS * Math.cos(angle),
        y,
        HELIX.RADIUS * Math.sin(angle),
      ),
    );
  }

  return positions;
}

const SPHERE_POSITIONS = createSpherePositions();

interface RungDatum {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

/** Horizontal rungs connecting strand A ↔ B at each sphere height */
function createRungData(): RungDatum[] {
  const data: RungDatum[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < HELIX.SPHERES_PER_STRAND; i++) {
    const t = i / (HELIX.SPHERES_PER_STRAND - 1);
    const angle = t * Math.PI * 2 * HELIX.TURNS;
    const y = t * HELIX.HEIGHT - HELIX.HEIGHT / 2;

    const dir = new THREE.Vector3(
      -Math.cos(angle),
      0,
      -Math.sin(angle),
    ).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir);

    data.push({ position: new THREE.Vector3(0, y, 0), quaternion: q });
  }
  return data;
}

/* ═══════════════════════════════════════════════════════════
   Three.js — Helix Spheres (InstancedMesh)
   ═══════════════════════════════════════════════════════════ */

function HelixSpheres({
  dnaHovered,
  reducedMotion,
  hoveredIndex,
  onHoverStart,
  onHoverEnd,
}: {
  dnaHovered: boolean;
  reducedMotion: boolean;
  hoveredIndex: number | null;
  onHoverStart?: (index: number) => void;
  onHoverEnd?: () => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const activeAnchor = useMemo(
    () => ANCHORS.find((a) => a.cardIndex === hoveredIndex),
    [hoveredIndex],
  );
  const activeSphereId = activeAnchor
    ? activeAnchor.strand * HELIX.SPHERES_PER_STRAND + activeAnchor.index
    : null;

  const baseColor = useMemo(() => new THREE.Color('#9a9a9c'), []);
  const activeColor = useMemo(() => new THREE.Color('#ffffff'), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Initial placement and colors
  useEffect(() => {
    if (!meshRef.current) return;
    SPHERE_POSITIONS.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(HELIX.SPHERE_RADIUS);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, baseColor);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  }, [dummy, baseColor]);

  // Subtle wave-pulse along helix + hover glow
  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    const hoverMul = dnaHovered ? 1.08 : 1;

    SPHERE_POSITIONS.forEach((pos, i) => {
      dummy.position.copy(pos);
      const isHovered = i === activeSphereId;
      const wave = 1 + Math.sin(t * 0.9 + (i % HELIX.SPHERES_PER_STRAND) * 0.42) * 0.09;
      const targetScale = isHovered ? 2.0 : 1.0;

      dummy.scale.setScalar(HELIX.SPHERE_RADIUS * wave * hoverMul * targetScale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Lerp color instantly on hover
      tempColor.copy(isHovered ? activeColor : baseColor);
      meshRef.current!.setColorAt(i, tempColor);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, TOTAL_SPHERES]}
      onPointerMove={(e) => {
        if (e.instanceId !== undefined && onHoverStart) {
          const anchor = ANCHORS.find(
            (a) => a.strand * HELIX.SPHERES_PER_STRAND + a.index === e.instanceId
          );
          if (anchor) {
            onHoverStart(anchor.cardIndex);
            e.stopPropagation();
          }
        }
      }}
      onPointerOut={() => {
        if (onHoverEnd) onHoverEnd();
      }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.4}
        roughness={0.15}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        transparent
        opacity={0.92}
        emissive="#ffffff"
        emissiveIntensity={0.2}
        side={THREE.FrontSide}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   Three.js — Dynamic Connectors (Bezier Curves)
   ═══════════════════════════════════════════════════════════ */

function DynamicConnectors({
  groupRef,
  hoveredIndex,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  hoveredIndex: number | null;
}) {
  const linesRef = useRef<(THREE.Line | null)[]>([]);

  useFrame(() => {
    if (!groupRef.current) return;
    // Ensure the rotating group's world matrix is current
    groupRef.current.updateMatrixWorld();

    ANCHORS.forEach((anchor, i) => {
      const line = linesRef.current[i];
      if (!line) return;

      const sphereId =
        anchor.strand * HELIX.SPHERES_PER_STRAND + anchor.index;
      const localPos = SPHERE_POSITIONS[sphereId].clone();

      // Convert local sphere pos inside rotating group to world space
      const worldPos = localPos.applyMatrix4(groupRef.current!.matrixWorld);

      // Edge of the visible 3D canvas mapping to the HTML feature text
      const edgePos = new THREE.Vector3(anchor.side * 1.8, anchor.htmlY, 0);

      // Control points for a smooth organic S-curve
      const cp1 = worldPos.clone().add(new THREE.Vector3(anchor.side * 0.7, 0, 0));
      const cp2 = edgePos.clone().add(new THREE.Vector3(-anchor.side * 0.7, 0, 0));

      const curve = new THREE.CubicBezierCurve3(worldPos, cp1, cp2, edgePos);
      line.geometry.setFromPoints(curve.getPoints(24));

      // Style line depending on hover state
      const isActive = hoveredIndex === anchor.cardIndex;
      const mat = line.material as THREE.LineBasicMaterial;
      mat.color.set(isActive ? '#ffffff' : '#333336');
      mat.opacity = isActive ? 0.95 : 0.0;
    });
  });

  return (
    <group>
      {ANCHORS.map((_, i) => (
        <line key={i} ref={(el: any) => (linesRef.current[i] = el)}>
          <bufferGeometry />
          <lineBasicMaterial transparent opacity={0.0} color="#333336" />
        </line>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Three.js — Complete DNA Scene
   ═══════════════════════════════════════════════════════════ */

function DNAScene({ hoveredIndex, dnaHovered, reducedMotion, isMobile = false, onHoverStart, onHoverEnd }: DNASceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // ── Geometries ──
  const strand1Geo = useMemo(() => createHelixGeometry(0), []);
  const strand2Geo = useMemo(() => createHelixGeometry(Math.PI), []);
  const rungs = useMemo(() => createRungData(), []);
  const rungGeo = useMemo(
    () =>
      new THREE.CylinderGeometry(
        HELIX.RUNG_THICKNESS,
        HELIX.RUNG_THICKNESS,
        HELIX.RADIUS * 2,
        6,
      ),
    [],
  );

  // ── Materials ──
  /** Strand A thread — brighter, subtle */
  const threadMatA = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#b8b8bc'),
        metalness: 0.35,
        roughness: 0.15,
        transparent: true,
        opacity: 0.45,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.03,
        side: THREE.DoubleSide,
      }),
    [],
  );

  /** Strand B thread — darker, subtle */
  const threadMatB = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#8a8a90'),
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: 0.35,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.02,
        side: THREE.DoubleSide,
      }),
    [],
  );

  /** Rung material */
  const rungMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#a0a0a6'),
        metalness: 0.2,
        roughness: 0.3,
        transparent: true,
        opacity: 0.5,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0,
      }),
    [],
  );

  // ── Animation loop ──
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (!reducedMotion) {
      // Slow continuous rotation
      groupRef.current.rotation.y +=
        delta * (dnaHovered ? 0.35 : 0.12);

      // Gentle float (removed Y float so spheres perfectly align with UI text)
      // groupRef.current.position.y = Math.sin(t * 0.35) * 0.06;

      // Breathing scale
      const s = 1 + Math.sin(t * 0.22) * 0.01;
      groupRef.current.scale.setScalar(s);
    }

    // Tilt toward hovered side
    const tiltTarget =
      hoveredIndex !== null
        ? LEFT_INDICES.includes(hoveredIndex)
          ? 0.055
          : -0.055
        : 0;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      tiltTarget,
      reducedMotion ? 0.2 : 0.04,
    );

    // ── Thread material animation ──
    const threadOpA = dnaHovered ? 0.55 : hoveredIndex !== null ? 0.5 : 0.45;
    threadMatA.opacity = THREE.MathUtils.lerp(threadMatA.opacity, threadOpA, 0.06);
    const threadEmA = hoveredIndex !== null ? 0.08 : dnaHovered ? 0.06 : 0.03;
    threadMatA.emissiveIntensity = THREE.MathUtils.lerp(
      threadMatA.emissiveIntensity,
      threadEmA,
      0.06,
    );

    const threadOpB = dnaHovered ? 0.45 : hoveredIndex !== null ? 0.4 : 0.35;
    threadMatB.opacity = THREE.MathUtils.lerp(threadMatB.opacity, threadOpB, 0.06);
    const threadEmB = hoveredIndex !== null ? 0.06 : dnaHovered ? 0.04 : 0.02;
    threadMatB.emissiveIntensity = THREE.MathUtils.lerp(
      threadMatB.emissiveIntensity,
      threadEmB,
      0.06,
    );

    // Rung animation
    const rungEmTarget = hoveredIndex !== null ? 0.06 : dnaHovered ? 0.03 : 0;
    rungMat.emissiveIntensity = THREE.MathUtils.lerp(
      rungMat.emissiveIntensity,
      rungEmTarget,
      0.06,
    );
    const rungOpTarget = dnaHovered ? 0.6 : hoveredIndex !== null ? 0.55 : 0.5;
    rungMat.opacity = THREE.MathUtils.lerp(rungMat.opacity, rungOpTarget, 0.06);
  });

  // Cleanup
  useEffect(() => {
    return () => {
      strand1Geo.dispose();
      strand2Geo.dispose();
      rungGeo.dispose();
      threadMatA.dispose();
      threadMatB.dispose();
      rungMat.dispose();
    };
  }, [strand1Geo, strand2Geo, rungGeo, threadMatA, threadMatB, rungMat]);

  return (
    <group>
      {/* ── Rotating DNA Helix ── */}
      <group ref={groupRef}>
        {/* Thin connecting threads */}
        <mesh geometry={strand1Geo} material={threadMatA} />
        <mesh geometry={strand2Geo} material={threadMatB} />

        {/* Horizontal rungs */}
        {rungs.map((r, i) => (
          <mesh
            key={i}
            position={r.position}
            quaternion={r.quaternion}
            geometry={rungGeo}
            material={rungMat}
          />
        ))}

        {/* Large prominent spheres */}
        <HelixSpheres
          dnaHovered={dnaHovered}
          reducedMotion={reducedMotion}
          hoveredIndex={hoveredIndex}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      </group>

      {/* ── Static Scene-Space Dynamic Connectors ── */}
      {/* (they track the rotating spheres and draw bezier curves to the text) */}
      {!isMobile && (
        <DynamicConnectors groupRef={groupRef} hoveredIndex={hoveredIndex} />
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Feature Item (HTML)
   ═══════════════════════════════════════════════════════════ */

interface FeatureItemProps {
  card: DNACard;
  side: 'left' | 'right';
  isActive: boolean;
  isDimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onTap: () => void;
}

function FeatureItem({
  card,
  side,
  isActive,
  isDimmed,
  onHoverStart,
  onHoverEnd,
  onTap,
}: FeatureItemProps) {
  const cn = [
    'startup-dna__feature',
    `startup-dna__feature--${side}`,
    isActive && 'startup-dna__feature--active',
    isDimmed && 'startup-dna__feature--dimmed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cn}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTap();
        }
      }}
    >
      <div className="startup-dna__feature-content">
        <h3 className="startup-dna__feature-title">{card.title}</h3>
        <p className="startup-dna__feature-desc">{card.desc}</p>
      </div>
      <div className="startup-dna__connector">
        <div className="startup-dna__connector-line" />
      </div>
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════
   Mobile DNA Experience — Scroll-Track Storytelling
   ═══════════════════════════════════════════════════════════ */

function MobileDNAExperience({
  title,
  cards,
  reducedMotion,
}: {
  title: string;
  cards: DNACard[];
  reducedMotion: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver for active detection
  useEffect(() => {
    const activeObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-index'));
          if (isNaN(idx)) return;
          if (entry.isIntersecting) {
            setActiveIndex(idx);
          }
        });
      },
      // When a trigger crosses the middle of the viewport, it becomes active
      { threshold: 0.5, rootMargin: '0px' },
    );

    trackRefs.current.forEach((el) => {
      if (el) activeObs.observe(el);
    });

    return () => activeObs.disconnect();
  }, [cards.length]);

  return (
    <div className="sdna-m">
      <div className="sdna-m__container">
        
        {/* Sticky viewport content */}
        <div className="sdna-m__sticky">
          <h2 className="startup-dna__title" style={{ marginBottom: '3rem' }}>{title}</h2>

          {/* Top half: DNA */}
          <div className="sdna-m__dna">
            <div className="sdna-m__canvas-wrapper">
              <Suspense fallback={null}>
                <Canvas
                  camera={{ position: [0, 0, 5.5], fov: 42 }}
                  dpr={[1, 1.5]}
                  gl={{ antialias: true, alpha: true }}
                  style={{ background: 'transparent' }}
                >
                  <ambientLight intensity={0.5} />
                  <directionalLight
                    position={[5, 8, 5]}
                    intensity={1.1}
                    color="#ffffff"
                  />
                  <directionalLight
                    position={[-4, -3, 3]}
                    intensity={0.3}
                    color="#e0e0e0"
                  />
                  <pointLight
                    position={[0, 0, 4]}
                    intensity={0.3}
                    color="#ffffff"
                  />
                  <DNAScene
                    hoveredIndex={activeIndex}
                    dnaHovered={true}
                    reducedMotion={reducedMotion}
                    isMobile={true}
                  />
                </Canvas>
              </Suspense>
            </div>
          </div>

          {/* Bottom half: Cards */}
          <div className="sdna-m__cards">
            {cards.map((card, idx) => {
              const isActive = activeIndex === idx;
              
              const cn = [
                'sdna-m__card',
                isActive && 'sdna-m__card--active',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={idx} className={cn}>
                  <div className="sdna-m__index">
                    {String(idx + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
                  </div>
                  <div className="sdna-m__icon">
                    {(() => {
                      const Icon = card.icon;
                      return <Icon />;
                    })()}
                  </div>
                  <h3 className="sdna-m__title">{card.title}</h3>
                  <p className="sdna-m__desc">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invisible scroll track to drive the InteractionObserver */}
        <div className="sdna-m__track">
          {cards.map((_, idx) => (
            <div 
              key={idx} 
              className="sdna-m__trigger" 
              data-index={idx}
              ref={(el) => { trackRefs.current[idx] = el; }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Export
   ═══════════════════════════════════════════════════════════ */

export default function StartupDNA({ title, cards }: StartupDNAProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dnaHovered, setDnaHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Media query for reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onMotionChange = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);
    mq.addEventListener('change', onMotionChange);

    // Touch device detection
    setIsTouchDevice(
      'ontouchstart' in window || navigator.maxTouchPoints > 0,
    );

    // Mobile viewport detection for conditional rendering
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      mq.removeEventListener('change', onMotionChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleHoverStart = useCallback(
    (index: number) => {
      if (!isTouchDevice) setHoveredIndex(index);
    },
    [isTouchDevice],
  );

  const handleHoverEnd = useCallback(() => {
    if (!isTouchDevice) setHoveredIndex(null);
  }, [isTouchDevice]);

  const handleTap = useCallback(
    (index: number) => {
      if (isTouchDevice) {
        setHoveredIndex((prev) => (prev === index ? null : index));
      }
    },
    [isTouchDevice],
  );

  const handleSectionClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isTouchDevice) return;
      const target = e.target as HTMLElement;
      if (!target.closest('.startup-dna__feature')) {
        setHoveredIndex(null);
      }
    },
    [isTouchDevice],
  );

  const renderFeature = (cardIndex: number, side: 'left' | 'right') => (
    <FeatureItem
      key={cardIndex}
      card={cards[cardIndex]}
      side={side}
      isActive={hoveredIndex === cardIndex}
      isDimmed={hoveredIndex !== null && hoveredIndex !== cardIndex}
      onHoverStart={() => handleHoverStart(cardIndex)}
      onHoverEnd={handleHoverEnd}
      onTap={() => handleTap(cardIndex)}
    />
  );

  return (
    <section className="startup-dna" onClick={handleSectionClick}>
      {!isMobile && <h2 className="startup-dna__title">{title}</h2>}

      {isMobile ? (
        <MobileDNAExperience title={title} cards={cards} reducedMotion={reducedMotion} />
      ) : (<div className="startup-dna__layout">
        <div className="startup-dna__features startup-dna__features--left">
          {LEFT_INDICES.map((i) => renderFeature(i, 'left'))}
        </div>

        <div
          className="startup-dna__canvas-wrapper"
          onMouseEnter={() => setDnaHovered(true)}
          onMouseLeave={() => setDnaHovered(false)}
        >
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: [0, 0, 5.5], fov: 42 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[5, 8, 5]}
                intensity={1.1}
                color="#ffffff"
              />
              <directionalLight
                position={[-4, -3, 3]}
                intensity={0.3}
                color="#e0e0e0"
              />
              <pointLight
                position={[0, 0, 4]}
                intensity={0.3}
                color="#ffffff"
              />
              <DNAScene
                hoveredIndex={hoveredIndex}
                dnaHovered={dnaHovered}
                reducedMotion={reducedMotion}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            </Canvas>
          </Suspense>
        </div>

        <div className="startup-dna__features startup-dna__features--right">
          {RIGHT_INDICES.map((i) => renderFeature(i, 'right'))}
        </div>
        </div>
      )}
    </section>
  );
}

