import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import cardGLB from '@/assets/lanyard/card.glb';
import lanyard from '@/assets/lanyard/lanyard.png';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

type VectorTuple = [number, number, number];
type DrawableImage = CanvasImageSource & { width: number; height: number };
type LanyardRigidBody = RapierRigidBody & { lerped?: THREE.Vector3 };
type LanyardBandMesh = THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>;
type LanyardTexture = THREE.Texture & { image: DrawableImage };
type LanyardGLTF = {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshPhysicalMaterial & { map: LanyardTexture };
    metal: THREE.MeshStandardMaterial;
  };
};

interface LanyardProps {
  position?: VectorTuple;
  gravity?: VectorTuple;
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  imageZoom?: number;
  cardTitle?: string | null;
  cardSubtitle?: string | null;
  cardScale?: number;
  lanyardImage?: string | null;
  lanyardWidth?: number;
  bandColor?: string;
  showHardware?: boolean;
  draggable?: boolean;
  layout?: 'reactBits' | 'vertical';
  className?: string;
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  imageZoom?: number;
  cardTitle?: string | null;
  cardSubtitle?: string | null;
  cardScale?: number;
  lanyardImage?: string | null;
  lanyardWidth?: number;
  bandColor?: string;
  showHardware?: boolean;
  draggable?: boolean;
  layout?: 'reactBits' | 'vertical';
}

const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

function isDrawableImage(image: unknown): image is DrawableImage {
  return (
    typeof image === 'object' &&
    image !== null &&
    typeof (image as { width?: unknown }).width === 'number' &&
    typeof (image as { height?: unknown }).height === 'number'
  );
}

function getClassName(className?: string) {
  return ['lanyard-wrapper', className].filter(Boolean).join(' ');
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  imageZoom = 1,
  cardTitle = null,
  cardSubtitle = null,
  cardScale = 2.25,
  lanyardImage = null,
  lanyardWidth = 1,
  bandColor = 'white',
  showHardware = true,
  draggable = true,
  layout = 'reactBits',
  className,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={getClassName(className)}>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.35 : 2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            imageZoom={imageZoom}
            cardTitle={cardTitle}
            cardSubtitle={cardSubtitle}
            cardScale={cardScale}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            bandColor={bandColor}
            showHardware={showHardware}
            draggable={draggable}
            layout={layout}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  imageZoom = 1,
  cardTitle = null,
  cardSubtitle = null,
  cardScale = 2.25,
  lanyardImage = null,
  lanyardWidth = 1,
  bandColor = 'white',
  showHardware = true,
  draggable = true,
  layout = 'reactBits',
}: BandProps) {
  const band = useRef<LanyardBandMesh>(null!);
  const fixed = useRef<LanyardRigidBody>(null!);
  const j1 = useRef<LanyardRigidBody>(null!);
  const j2 = useRef<LanyardRigidBody>(null!);
  const j3 = useRef<LanyardRigidBody>(null!);
  const card = useRef<LanyardRigidBody>(null!);
  const cardVisual = useRef<THREE.Group>(null!);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const cardAnchorWorld = useMemo(() => new THREE.Vector3(), []);
  const cardAnchorLocal = useMemo(() => new THREE.Vector3(), []);
  const cardQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const cardTranslation = useMemo(() => new THREE.Vector3(), []);
  const draggedRef = useRef<THREE.Vector3 | false>(false);
  const hoveredRef = useRef(false);
  const { camera, gl, raycaster, viewport } = useThree();
  const segmentProps = { type: 'dynamic' as const, canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB) as unknown as LanyardGLTF;
  const texture = useTexture(lanyardImage || lanyard);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);
  const verticalJ3Y = -1.92;
  const verticalCardHoleY = 1.72;
  const verticalCardVisualX = 0.04;
  const groupPosition = useMemo<VectorTuple>(() => {
    if (layout !== 'vertical') return [0, 4, 0];

    const x = Math.max(0, viewport.width / 2 - (isMobile ? 0.62 : 1.35));
    return [x, 4, 0];
  }, [isMobile, layout, viewport.width]);
  const fixedPosition: VectorTuple = layout === 'vertical' ? [0, 0, 0] : [0, 0, 0];
  const j1Position: VectorTuple = layout === 'vertical' ? [0, -0.7, 0] : [0.5, 0, 0];
  const j2Position: VectorTuple = layout === 'vertical' ? [0, -1.4, 0] : [1, 0, 0];
  const j3Position: VectorTuple = layout === 'vertical' ? [0, verticalJ3Y, 0] : [1.5, 0, 0];
  const cardPosition: VectorTuple = layout === 'vertical' ? [0, verticalJ3Y - verticalCardHoleY, 0] : [2, 0, 0];
  const cardJointAnchor: VectorTuple = layout === 'vertical' ? [0, verticalCardHoleY, 0] : [0, 1.5, 0];
  const cardVisualPosition: VectorTuple = layout === 'vertical' ? [verticalCardVisualX, -0.95, -0.05] : [0, -1.2, -0.05];

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image;
    const width = baseImg.width;
    const height = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff7e9';
    ctx.fillRect(0, 0, width, height);

    const drawFitted = (
      img: CanvasImageSource & { width: number; height: number },
      areaX: number,
      areaY: number,
      areaW: number,
      areaH: number
    ) => {
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(areaW / img.width, areaH / img.height) * imageZoom;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = areaX + (areaW - drawW) / 2;
      const drawY = areaY + (areaH - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };

    const drawCardFace = (img: LanyardTexture['image'] | null, rect: typeof FRONT_UV_RECT) => {
      const rectX = rect.x * width;
      const rectY = rect.y * height;
      const rectW = rect.w * width;
      const rectH = rect.h * height;
      const cardGradient = ctx.createLinearGradient(rectX, rectY, rectX + rectW, rectY + rectH);
      cardGradient.addColorStop(0, '#fffaf1');
      cardGradient.addColorStop(0.62, '#fff4df');
      cardGradient.addColorStop(1, '#f8ead2');

      ctx.save();
      ctx.beginPath();
      ctx.rect(rectX, rectY, rectW, rectH);
      ctx.clip();

      ctx.fillStyle = cardGradient;
      ctx.fillRect(rectX, rectY, rectW, rectH);
      ctx.fillStyle = 'rgba(88, 126, 102, 0.08)';
      ctx.beginPath();
      ctx.ellipse(rectX + rectW * 0.22, rectY + rectH * 0.22, rectW * 0.28, rectH * 0.18, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 138, 43, 0.09)';
      ctx.beginPath();
      ctx.ellipse(rectX + rectW * 0.74, rectY + rectH * 0.58, rectW * 0.34, rectH * 0.22, 0.4, 0, Math.PI * 2);
      ctx.fill();

      const holeX = rectX + rectW * 0.5;
      const holeY = rectY + rectH * 0.07;

      ctx.fillStyle = 'rgba(78, 68, 51, 0.18)';
      ctx.beginPath();
      ctx.ellipse(holeX, holeY, rectW * 0.056, rectW * 0.056, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 249, 237, 0.98)';
      ctx.beginPath();
      ctx.ellipse(holeX, holeY, rectW * 0.031, rectW * 0.031, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(78, 68, 51, 0.2)';
      ctx.lineWidth = Math.max(1, rectW * 0.005);
      ctx.beginPath();
      ctx.ellipse(holeX, holeY, rectW * 0.056, rectW * 0.056, 0, 0, Math.PI * 2);
      ctx.stroke();

      if (img) {
        drawFitted(
          img,
          rectX + rectW * 0.08,
          rectY + rectH * 0.16,
          rectW * 0.84,
          rectH * (cardTitle ? 0.48 : 0.62)
        );
      }

      if (cardTitle) {
        ctx.fillStyle = '#35453d';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${Math.round(rectH * 0.06)}px "Noto Serif SC", "Songti SC", serif`;
        ctx.fillText(cardTitle, rectX + rectW * 0.5, rectY + rectH * 0.72, rectW * 0.82);
      }

      if (cardSubtitle) {
        ctx.fillStyle = 'rgba(67, 96, 80, 0.78)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `500 ${Math.round(rectH * 0.033)}px "Noto Sans SC", system-ui, sans-serif`;
        ctx.fillText(cardSubtitle, rectX + rectW * 0.5, rectY + rectH * 0.79, rectW * 0.78);
      }

      ctx.restore();
    };

    drawCardFace(frontImage && isDrawableImage(frontTex.image) ? frontTex.image : null, FRONT_UV_RECT);
    drawCardFace(backImage && isDrawableImage(backTex.image) ? backTex.image : null, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, imageZoom, cardTitle, cardSubtitle, frontTex, backTex, materials.base.map]);

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  const setHoverState = (value: boolean) => {
    if (hoveredRef.current === value) return;
    hoveredRef.current = value;
    hover(value);
  };

  useRopeJoint(fixed, j1, [
    [0, 0, 0],
    [0, 0, 0],
    layout === 'vertical' ? 0.72 : 1,
  ]);
  useRopeJoint(j1, j2, [
    [0, 0, 0],
    [0, 0, 0],
    layout === 'vertical' ? 0.72 : 1,
  ]);
  useRopeJoint(j2, j3, [
    [0, 0, 0],
    [0, 0, 0],
    layout === 'vertical' ? 0.72 : 1,
  ]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    cardJointAnchor,
  ]);

  useEffect(() => {
    if (!hovered) return undefined;

    document.body.style.cursor = dragged ? 'grabbing' : 'grab';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, dragged]);

  useEffect(() => {
    if (!draggable) return undefined;

    const updatePointer = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
    };

    const hitCard = () => {
      if (!cardVisual.current) return null;

      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObject(cardVisual.current, true)[0] ?? null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      updatePointer(event);
      const hit = hitCard();
      if (!hit || !card.current) return;

      const nextDragged = new THREE.Vector3().copy(hit.point).sub(vec.copy(card.current.translation()));
      draggedRef.current = nextDragged;
      drag(nextDragged);
      setHoverState(true);
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      event.preventDefault();
      event.stopPropagation();
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event);

      if (draggedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      setHoverState(Boolean(hitCard()));
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!draggedRef.current) {
        updatePointer(event);
        setHoverState(Boolean(hitCard()));
        return;
      }

      updatePointer(event);
      draggedRef.current = false;
      drag(false);
      setHoverState(Boolean(hitCard()));
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);

    return () => {
      draggedRef.current = false;
      setHoverState(false);
      document.body.style.cursor = 'auto';
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
    };
  }, [camera, draggable, gl.domElement, pointer, raycaster, vec]);

  useFrame((state, delta) => {
    const activeDrag = draggedRef.current || dragged;

    if (draggable && activeDrag && card.current) {
      vec.set(pointer.x, pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      const nextX =
        layout === 'vertical'
          ? THREE.MathUtils.clamp(vec.x - activeDrag.x, -viewport.width / 2 - 1.2, viewport.width / 2 + 0.8)
          : vec.x - activeDrag.x;
      const nextY =
        layout === 'vertical'
          ? THREE.MathUtils.clamp(vec.y - activeDrag.y, -viewport.height / 2 - 1.2, viewport.height / 2 + 0.45)
          : vec.y - activeDrag.y;
      const nextZ = layout === 'vertical' ? THREE.MathUtils.clamp(vec.z - activeDrag.z, -0.7, 0.7) : vec.z - activeDrag.z;
      card.current.setNextKinematicTranslation({
        x: nextX,
        y: nextY,
        z: nextZ,
      });
    }

    if (!fixed.current || !j1.current || !j2.current || !j3.current || !card.current || !band.current) return;

    [j1, j2].forEach((ref) => {
      if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
      const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
      ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
    });

    if (layout === 'vertical') {
      const translation = card.current.translation();
      const rotation = card.current.rotation();
      cardQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
      cardTranslation.set(translation.x, translation.y, translation.z);
      cardAnchorLocal.set(cardJointAnchor[0], cardJointAnchor[1], cardJointAnchor[2]);
      cardAnchorWorld.copy(cardAnchorLocal).applyQuaternion(cardQuaternion).add(cardTranslation);
      curve.points[0].copy(cardAnchorWorld);
    } else {
      curve.points[0].copy(j3.current.translation());
    }
    curve.points[1].copy(j2.current.lerped);
    curve.points[2].copy(j1.current.lerped);
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const shouldUseBandMap = Boolean(lanyardImage);

  return (
    <>
      <group position={groupPosition}>
        <RigidBody position={fixedPosition} ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={j1Position} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={j2Position} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={j3Position} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={cardPosition} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            ref={cardVisual}
            scale={cardScale}
            position={cardVisualPosition}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            {showHardware && (
              <>
                <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
                <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
              </>
            )}
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color={bandColor}
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={shouldUseBandMap}
          map={shouldUseBandMap ? texture : null}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(cardGLB);
