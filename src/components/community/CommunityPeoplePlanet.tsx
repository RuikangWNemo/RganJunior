import { Billboard, Html } from '@react-three/drei';
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import type { CommunityPerson } from '@/services/people';
import {
  createAvatarIdentity,
  createPlanetNodes,
  type PlanetNode,
  type PlanetVector,
} from './peoplePlanetModel';

type CommunityPeoplePlanetProps = {
  people: CommunityPerson[];
  ariaLabel: string;
  selectedPersonId: number | null;
  ownPersonId: number | null;
  autoRotate: boolean;
  reducedMotion: boolean;
  resetVersion: number;
  onSelect: (personId: number) => void;
};

const FRONT = new THREE.Vector3(0, 0, 1);
const WORLD_X = new THREE.Vector3(1, 0, 0);
const WORLD_Y = new THREE.Vector3(0, 1, 0);

function toVector3([x, y, z]: PlanetVector) {
  return new THREE.Vector3(x, y, z);
}

function createDustGeometry(count: number, innerRadius: number, spread: number) {
  const positions: number[] = [];
  const colors: number[] = [];
  const warm = new THREE.Color('#ef9a62');
  const cool = new THREE.Color('#b8e2c8');
  const moon = new THREE.Color('#f5e9c9');

  for (let index = 0; index < count; index += 1) {
    const angle = index * 2.399963229728653;
    const height = -1 + (2 * index) / Math.max(1, count - 1);
    const ring = Math.sqrt(Math.max(0, 1 - height * height));
    const radius = innerRadius + ((index * 17) % 19) * spread;
    positions.push(
      Math.cos(angle) * ring * radius,
      height * radius,
      Math.sin(angle) * ring * radius,
    );

    const color = index % 7 === 0 ? warm : index % 3 === 0 ? moon : cool;
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function createOrbitGeometry(radius: number, start: number, sweep: number, yScale: number) {
  const positions: number[] = [];
  const segments = 72;

  for (let index = 0; index < segments; index += 1) {
    const from = start + sweep * (index / segments);
    const to = start + sweep * ((index + 1) / segments);
    positions.push(
      Math.cos(from) * radius,
      Math.sin(from) * radius * yScale,
      0,
      Math.cos(to) * radius,
      Math.sin(to) * radius * yScale,
      0,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const glow = context.createRadialGradient(128, 128, 4, 128, 128, 124);
  glow.addColorStop(0, 'rgba(233, 191, 105, 0.3)');
  glow.addColorStop(0.28, 'rgba(63, 137, 96, 0.22)');
  glow.addColorStop(0.68, 'rgba(26, 78, 56, 0.09)');
  glow.addColorStop(1, 'rgba(7, 20, 15, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createAvatarTexture(personId: number, displayName: string, isOwn: boolean) {
  const identity = createAvatarIdentity(personId, displayName, isOwn);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const fill = context.createLinearGradient(34, 28, 222, 230);
  fill.addColorStop(0, identity.highlight);
  fill.addColorStop(0.46, identity.primary);
  fill.addColorStop(1, identity.secondary);

  context.beginPath();
  context.arc(128, 128, 116, 0, Math.PI * 2);
  context.fillStyle = 'rgba(247, 235, 206, 0.94)';
  context.fill();

  context.beginPath();
  context.arc(128, 128, 106, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
  context.save();
  context.clip();

  context.globalAlpha = 0.22;
  context.fillStyle = identity.accent;
  context.beginPath();
  context.ellipse(72, 70, 82, 48, -0.45, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(190, 194, 90, 54, -0.55, 0, Math.PI * 2);
  context.fill();

  context.globalAlpha = 0.16;
  context.strokeStyle = '#fff8e8';
  context.lineWidth = 12;
  context.beginPath();
  context.arc(118, 126, 74, 0.3, Math.PI * 1.42);
  context.stroke();
  context.restore();

  context.fillStyle = identity.ink;
  context.font = '700 92px "PingFang SC", "Noto Sans SC", system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(identity.initial, 128, 132);

  context.beginPath();
  context.arc(186, 72, 10, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255, 249, 232, 0.88)';
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function PersonStar({
  node,
  person,
  selected,
  isOwn,
  showAmbientLabel,
  onSelect,
}: {
  node: PlanetNode;
  person: CommunityPerson;
  selected: boolean;
  isOwn: boolean;
  showAmbientLabel: boolean;
  onSelect: (personId: number) => void;
}) {
  const anchorRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const avatarMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const rimMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const worldPositionRef = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);
  const displayName = person.nature_name || person.display_name;
  const identity = useMemo(() => createAvatarIdentity(person.id, displayName, isOwn), [displayName, isOwn, person.id]);
  const avatarTexture = useMemo(() => createAvatarTexture(person.id, displayName, isOwn), [displayName, isOwn, person.id]);
  const { invalidate } = useThree();

  useEffect(() => () => avatarTexture?.dispose(), [avatarTexture]);

  useFrame((_, delta) => {
    const anchor = anchorRef.current;
    const visual = visualRef.current;
    const material = avatarMaterialRef.current;
    const rimMaterial = rimMaterialRef.current;
    if (!anchor || !visual || !material || !rimMaterial) return;

    anchor.getWorldPosition(worldPositionRef.current);
    const depth = THREE.MathUtils.clamp((worldPositionRef.current.z + 2.7) / 5.4, 0, 1);
    const targetScale = selected ? 1.48 : isOwn ? 1.12 : 0.7 + depth * 0.38;
    const targetOpacity = selected ? 1 : isOwn ? 0.96 : 0.12 + depth * 0.88;
    const easing = 1 - Math.exp(-delta * 9);
    const nextScale = THREE.MathUtils.lerp(visual.scale.x, targetScale, easing);
    const nextOpacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, easing);

    visual.scale.setScalar(nextScale);
    material.opacity = nextOpacity;
    rimMaterial.opacity = selected ? 0.92 : isOwn ? 0.72 : nextOpacity * 0.46;

    if (labelRef.current) {
      const visible = selected || hovered || isOwn || (showAmbientLabel && depth > 0.7);
      labelRef.current.style.opacity = visible ? String(THREE.MathUtils.clamp((depth - 0.58) * 5, 0, 1)) : '0';
    }

    if (Math.abs(nextScale - targetScale) > 0.002 || Math.abs(nextOpacity - targetOpacity) > 0.01) {
      invalidate();
    }
  });

  return (
    <group ref={anchorRef} position={node.position as [number, number, number]}>
      <Billboard>
        <group ref={visualRef}>
          <mesh position={[0, 0, -0.018]} scale={selected ? 1.28 : 1.16} renderOrder={selected ? 18 : 4}>
            <ringGeometry args={[0.352, 0.382, 48]} />
            <meshBasicMaterial
              ref={rimMaterialRef}
              color={isOwn ? '#f08a4b' : identity.accent}
              opacity={0.38}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>

          {selected || isOwn ? (
            <mesh position={[0, 0, -0.03]} scale={selected ? 1.52 : 1.4} renderOrder={selected ? 17 : 3}>
              <ringGeometry args={[0.357, 0.369, 48]} />
              <meshBasicMaterial
                color={isOwn ? '#ef7336' : '#f1c36f'}
                opacity={selected ? 0.2 : 0.16}
                transparent
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ) : null}

          <mesh
            renderOrder={selected ? 20 : isOwn ? 14 : 6}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(person.id);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHovered(true);
            }}
            onPointerOut={() => setHovered(false)}
          >
            <circleGeometry args={[0.34, 48]} />
            <meshBasicMaterial
              ref={avatarMaterialRef}
              map={avatarTexture}
              opacity={1}
              transparent
              alphaTest={0.025}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>

          <Html center position={[0, -0.53, 0]} distanceFactor={8.5} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <span
              ref={labelRef}
              className={`community-people-planet__label ${selected ? 'is-selected' : ''} ${isOwn ? 'is-own' : ''}`}
            >
              {displayName}{isOwn ? <small>ME</small> : null}
            </span>
          </Html>
        </group>
      </Billboard>
    </group>
  );
}

function PlanetScene({
  people,
  selectedPersonId,
  ownPersonId,
  autoRotate,
  reducedMotion,
  resetVersion,
  active,
  isMobile,
  onSelect,
}: CommunityPeoplePlanetProps & { active: boolean; isMobile: boolean }) {
  const planetRef = useRef<THREE.Group>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const targetQuaternionRef = useRef<THREE.Quaternion | null>(null);
  const yawQuaternionRef = useRef(new THREE.Quaternion());
  const pitchQuaternionRef = useRef(new THREE.Quaternion());
  const nodes = useMemo(() => createPlanetNodes(people, 2.72), [people]);
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const dustGeometry = useMemo(() => createDustGeometry(110, 3.25, 0.055), []);
  const farDustGeometry = useMemo(() => createDustGeometry(52, 4.2, 0.08), []);
  const orbitGeometries = useMemo(() => [
    createOrbitGeometry(3.08, -0.3, Math.PI * 1.52, 0.82),
    createOrbitGeometry(3.28, 0.72, Math.PI * 1.15, 0.66),
    createOrbitGeometry(3.48, 2.1, Math.PI * 0.78, 0.74),
  ], []);
  const glowTexture = useMemo(createGlowTexture, []);
  const { invalidate } = useThree();

  useEffect(() => () => dustGeometry.dispose(), [dustGeometry]);
  useEffect(() => () => farDustGeometry.dispose(), [farDustGeometry]);
  useEffect(() => () => orbitGeometries.forEach((geometry) => geometry.dispose()), [orbitGeometries]);
  useEffect(() => () => glowTexture?.dispose(), [glowTexture]);

  useEffect(() => {
    const planet = planetRef.current;
    if (!planet) return;

    let target = new THREE.Quaternion();
    const selectedNode = nodes.find((node) => node.personId === selectedPersonId);

    if (selectedNode) {
      const currentPosition = toVector3(selectedNode.position).applyQuaternion(planet.quaternion).normalize();
      const correction = new THREE.Quaternion().setFromUnitVectors(currentPosition, FRONT);
      target = correction.multiply(planet.quaternion.clone()).normalize();
    }

    if (reducedMotion) {
      planet.quaternion.copy(target);
      targetQuaternionRef.current = null;
    } else {
      targetQuaternionRef.current = target;
    }
    velocityRef.current = { x: 0, y: 0 };
    invalidate();
  }, [invalidate, nodes, reducedMotion, resetVersion, selectedPersonId]);

  useEffect(() => {
    if (active && autoRotate && selectedPersonId === null && !reducedMotion) invalidate();
  }, [active, autoRotate, invalidate, reducedMotion, selectedPersonId]);

  const applyRotation = (x: number, y: number) => {
    const planet = planetRef.current;
    if (!planet) return;

    const yaw = yawQuaternionRef.current.setFromAxisAngle(WORLD_Y, x);
    const pitch = pitchQuaternionRef.current.setFromAxisAngle(WORLD_X, y);
    planet.quaternion.premultiply(yaw).multiply(pitch).normalize();
  };

  const capturePointer = (event: ThreeEvent<PointerEvent>) => {
    const target = event.target as unknown as { setPointerCapture?: (pointerId: number) => void };
    target.setPointerCapture?.(event.pointerId);
  };

  const releasePointer = (event: ThreeEvent<PointerEvent>) => {
    const target = event.target as unknown as { releasePointerCapture?: (pointerId: number) => void };
    target.releasePointerCapture?.(event.pointerId);
  };

  const startDrag = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    capturePointer(event);
    targetQuaternionRef.current = null;
    velocityRef.current = { x: 0, y: 0 };
    dragRef.current = { pointerId: event.pointerId, x: event.pointer.x, y: event.pointer.y };
  };

  const moveDrag = (event: ThreeEvent<PointerEvent>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || reducedMotion) return;

    event.stopPropagation();
    const deltaX = event.pointer.x - drag.x;
    const deltaY = event.pointer.y - drag.y;
    const rotationX = deltaX * 1.5;
    const rotationY = -deltaY * 1.08;
    applyRotation(rotationX, rotationY);
    velocityRef.current = { x: rotationX, y: rotationY };
    dragRef.current = { ...drag, x: event.pointer.x, y: event.pointer.y };
    invalidate();
  };

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    event.stopPropagation();
    releasePointer(event);
    dragRef.current = null;
    invalidate();
  };

  useFrame((_, delta) => {
    const planet = planetRef.current;
    if (!planet || !active) return;

    let needsAnotherFrame = false;
    const target = targetQuaternionRef.current;

    if (target) {
      const angle = planet.quaternion.angleTo(target);
      if (angle > 0.002) {
        planet.quaternion.slerp(target, 1 - Math.exp(-delta * 5.5));
        needsAnotherFrame = true;
      } else {
        planet.quaternion.copy(target);
        targetQuaternionRef.current = null;
      }
    } else if (!dragRef.current && !reducedMotion) {
      const velocity = velocityRef.current;
      if (Math.abs(velocity.x) + Math.abs(velocity.y) > 0.0002) {
        applyRotation(velocity.x * delta * 32, velocity.y * delta * 32);
        const decay = Math.exp(-delta * 5.5);
        velocityRef.current = { x: velocity.x * decay, y: velocity.y * decay };
        needsAnotherFrame = true;
      } else if (autoRotate && selectedPersonId === null) {
        applyRotation(delta * 0.062, 0);
        needsAnotherFrame = true;
      }
    }

    if (needsAnotherFrame) invalidate();
  });

  return (
    <>
      {glowTexture ? (
        <sprite position={[0, isMobile ? 0.68 : 0, -1.8]} scale={[6.6, 6.6, 1]} renderOrder={-2}>
          <spriteMaterial map={glowTexture} opacity={0.9} transparent depthWrite={false} toneMapped={false} />
        </sprite>
      ) : null}

      <group ref={planetRef} position={[0, isMobile ? 0.68 : 0, 0]}>
        {orbitGeometries.map((geometry, index) => (
          <lineSegments
            key={index}
            geometry={geometry}
            rotation={index === 0 ? [0.58, 0.15, -0.18] : index === 1 ? [-0.34, 0.62, 0.44] : [0.12, -0.7, -0.58]}
          >
            <lineBasicMaterial
              color={index === 1 ? '#e6ab72' : '#78ad91'}
              opacity={index === 1 ? 0.18 : 0.12}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </lineSegments>
        ))}

        <mesh scale={0.82} renderOrder={-1}>
          <sphereGeometry args={[2.72, 42, 30]} />
          <meshBasicMaterial color="#163d2d" opacity={0.065} transparent depthWrite={false} side={THREE.BackSide} />
        </mesh>

        {nodes.map((node, index) => {
          const person = peopleById.get(node.personId);
          if (!person) return null;
          return (
            <PersonStar
              key={node.personId}
              node={node}
              person={person}
              selected={node.personId === selectedPersonId}
              isOwn={node.personId === ownPersonId}
              showAmbientLabel={index < 9}
              onSelect={onSelect}
            />
          );
        })}

        <mesh
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={(event) => {
            if (dragRef.current) endDrag(event);
          }}
        >
          <sphereGeometry args={[2.58, 32, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>

        <points geometry={dustGeometry}>
          <pointsMaterial vertexColors opacity={0.52} size={0.026} sizeAttenuation transparent depthWrite={false} toneMapped={false} />
        </points>
      </group>

      <points geometry={farDustGeometry}>
        <pointsMaterial vertexColors opacity={0.28} size={0.018} sizeAttenuation transparent depthWrite={false} toneMapped={false} />
      </points>
    </>
  );
}

export default function CommunityPeoplePlanet(props: CommunityPeoplePlanetProps) {
  const { ariaLabel, ...sceneProps } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '120px 0px',
      threshold: 0.05,
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  const active = inView && pageVisible;

  return (
    <div ref={containerRef} className="community-people-planet__canvas" role="img" aria-label={ariaLabel}>
      <Canvas
        camera={{ position: [0, 0, isMobile ? 9.1 : 8.65], fov: isMobile ? 42 : 37 }}
        dpr={[1, isMobile ? 1.2 : 1.5]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color('#07140f'), 0)}
      >
        <PlanetScene ariaLabel={ariaLabel} {...sceneProps} active={active} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
