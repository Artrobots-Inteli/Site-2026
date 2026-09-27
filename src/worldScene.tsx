import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  BoxGeometry, BufferGeometry, CanvasTexture, CatmullRomCurve3, CylinderGeometry, ExtrudeGeometry,
  Group, LineBasicMaterial, LineLoop, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PMREMGenerator,
  Shape, TorusGeometry, TubeGeometry, Vector3,
  type Material, type MeshStandardMaterialParameters
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type SceneArea = 'PROJECT' | 'COMPETITION' | 'KNOWLEDGE' | 'MEMBERS' | 'PARTNERSHIP' | 'EVENT';
export type SceneNodeLayout = { area: SceneArea; x: number; y: number };
export type WorldSceneProps = {
  activeArea: SceneArea | null;
  onNavigate: (area: SceneArea) => void;
  paused: boolean;
  reducedMotion?: boolean;
  onReady?: () => void;
  onFallback?: () => void;
  onLayout?: (nodes: SceneNodeLayout[]) => void;
  stage?: 'portal' | 'hub' | 'area';
};
type Connector = { area: SceneArea; position: Vector3; material: MeshStandardMaterial; halo: MeshBasicMaterial };
type WorldModel = { root: Group; spider: Group; connectors: Connector[]; hitGeometry: BufferGeometry; hitMaterial: MeshBasicMaterial; dispose: () => void };
const AREAS: SceneArea[] = ['PROJECT', 'COMPETITION', 'KNOWLEDGE', 'MEMBERS', 'PARTNERSHIP', 'EVENT'];
const ZERO_POINTER = { x: 0, y: 0 };

function roundedPlate(width: number, depth: number, radius: number) {
  const x = -width / 2, y = -depth / 2, shape = new Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

// The board and connectors are a knowledge map. The robot is a visual assembly
// of Kaian Moura's supplied printing exports, not a hardware simulation.
function createWorld(compact: boolean): WorldModel {
  const root = new Group(), spider = new Group();
  const geometries = new Set<BufferGeometry>(), materials = new Set<Material>(), textures = new Set<CanvasTexture>();
  const keepGeometry = <T extends BufferGeometry>(geometry: T): T => { geometries.add(geometry); return geometry; };
  const keepMaterial = <T extends Material>(material: T): T => { materials.add(material); return material; };
  const standard = (parameters: MeshStandardMaterialParameters) => keepMaterial(new MeshStandardMaterial(parameters));
  const box = keepGeometry(new BoxGeometry(1, 1, 1));
  const joints = standard({ color: 0x30314f, metalness: .78, roughness: .24 });
  const contact = standard({ color: 0xd5c59b, metalness: .8, roughness: .28 });
  const traces = keepMaterial(new MeshBasicMaterial({ color: 0xd8eeff }));
  const boardTrace = keepMaterial(new MeshBasicMaterial({ color: 0x9686e0, transparent: true, opacity: .7 }));
  function trail(parent: Group, points: Vector3[], material: Material, radius = .025) {
    const geometry = keepGeometry(new TubeGeometry(new CatmullRomCurve3(points, false, 'centripetal'), Math.max(12, points.length * 8), radius, 6, false));
    parent.add(new Mesh(geometry, material));
  }
  const boardWidth = compact ? 6.1 : 11.1, boardDepth = compact ? 10.2 : 8.4;
  const shape = roundedPlate(boardWidth, boardDepth, .65);
  const plateMaterial = keepMaterial(new MeshPhysicalMaterial({ color: 0x95a2e4, metalness: .32, roughness: .38, clearcoat: .7, transparent: true, opacity: .23, depthWrite: false }));
  const plate = new Mesh(keepGeometry(new ExtrudeGeometry(shape, { depth: .1, bevelEnabled: true, bevelSegments: 2, bevelSize: .035, bevelThickness: .035, curveSegments: 12 })), plateMaterial);
  plate.rotation.x = -Math.PI / 2; plate.position.y = -.78; root.add(plate);
  const perimeter = shape.getPoints(32).map(point => new Vector3(point.x, -.66, -point.y));
  const perimeterGeometry = keepGeometry(new BufferGeometry());
  perimeterGeometry.setFromPoints(perimeter);
  root.add(new LineLoop(perimeterGeometry, keepMaterial(new LineBasicMaterial({ color: 0xbeb0ee, transparent: true, opacity: .54 }))));

  // The rig receives the four actual STL-derived pieces, credited to Kaian Moura.
  root.add(spider); spider.scale.setScalar(compact ? .44 : .68); spider.position.y = -.58;
  const hubRing = new Mesh(keepGeometry(new TorusGeometry(compact ? 1.75 : 2.65, .025, 8, 80)), boardTrace);
  hubRing.rotation.x = Math.PI / 2; hubRing.position.y = -.61; root.add(hubRing);

  const positions = compact ? [[-1.75, -3.55], [1.75, -3.55], [2.24, -.2], [1.75, 3.6], [-1.75, 3.6], [-2.24, -.2]]
    : [[-3.92, -2.58], [3.92, -2.58], [4.61, .34], [3.33, 2.91], [-3.33, 2.91], [-4.61, .34]];
  const connectors = AREAS.map((area, i): Connector => {
    const [x, z] = positions[i], node = new Group(); node.position.set(x, -.35, z); root.add(node);
    const material = standard({ color: 0x7b50c6, emissive: 0x725bd2, emissiveIntensity: .36, metalness: .64, roughness: .3 });
    const halo = keepMaterial(new MeshBasicMaterial({ color: 0xbda1f8, transparent: true, opacity: .12, depthWrite: false }));
    const base = new Mesh(keepGeometry(new CylinderGeometry(.53, .64, .16, 6)), joints); node.add(base);
    const glass = new Mesh(keepGeometry(new CylinderGeometry(.48, .48, .11, 6)), material); glass.position.y = .15; node.add(glass);
    const ring = new Mesh(keepGeometry(new TorusGeometry(.55, .025, 8, 48)), traces); ring.rotation.x = Math.PI / 2; ring.position.y = .05; node.add(ring);
    const glow = new Mesh(keepGeometry(new CylinderGeometry(.82, .82, .01, 6)), halo); glow.position.y = -.24; node.add(glow);
    for (const side of [-1, 1]) for (let pin = 0; pin < 3; pin++) {
      const lead = new Mesh(box, contact); lead.scale.set(.12, .035, .11); lead.position.set(side * .58, -.05, (pin - 1) * .22); node.add(lead);
    }
    const glyph = new Mesh(box, traces); glyph.scale.set(.18, .025, .18); glyph.position.y = .218; glyph.rotation.y = Math.PI / 4; node.add(glyph);
    const inner = new Mesh(keepGeometry(new TorusGeometry(.31, .012, 5, 28)), traces); inner.rotation.x = Math.PI / 2; inner.position.y = .22; node.add(inner);
    const sign = Math.sign(x), beginX = sign * (compact ? .48 : .95), beginZ = z * .22;
    trail(root, [new Vector3(beginX, -.55, beginZ), new Vector3(sign * (compact ? 1.1 : 2.1), -.55, beginZ),
      new Vector3(x * .86, -.55, z * .8), new Vector3(x, -.36, z)], boardTrace, .022);
    trail(root, [new Vector3(beginX + sign * .12, -.55, beginZ + .14), new Vector3(sign * (compact ? 1.22 : 2.25), -.55, beginZ + .14),
      new Vector3(x * .86 + sign * .1, -.55, z * .8 + .13), new Vector3(x + sign * .12, -.36, z)], traces, .009);
    return { area, position: new Vector3(x, -.17, z), material, halo };
  });
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const pad = new Mesh(box, contact); pad.scale.set(.13, .018, .065); pad.position.set(side * (boardWidth / 2 - .45), -.65, (i - 2) * .29); root.add(pad);
  }
  const shade = document.createElement('canvas'); shade.width = shade.height = 128;
  const painter = shade.getContext('2d');
  if (painter) {
    const fade = painter.createRadialGradient(64, 64, 12, 64, 64, 63); fade.addColorStop(0, '#51449055'); fade.addColorStop(1, '#51449000');
    painter.fillStyle = fade; painter.fillRect(0, 0, 128, 128);
    const texture = new CanvasTexture(shade); textures.add(texture);
    const shadow = new Mesh(keepGeometry(new PlaneGeometry(compact ? 5.8 : 10.5, compact ? 9 : 8)), keepMaterial(new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.91; root.add(shadow);
  }
  const hitGeometry = keepGeometry(new CylinderGeometry(.8, .8, .6, 8));
  const hitMaterial = keepMaterial(new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
  return { root, spider, connectors, hitGeometry, hitMaterial, dispose: () => {
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose());
  } };
}

function ReflectionEnvironment() {
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl), room = new RoomEnvironment();
    const reflection = generator.fromScene(room, .05);
    const previous = scene.environment; scene.environment = reflection.texture; scene.environmentIntensity = .25;
    room.dispose(); generator.dispose(); invalidate();
    return () => { scene.environment = previous; reflection.dispose(); };
  }, [gl, scene, invalidate]);
  return null;
}

function RobotFromKaian({ rig, legs, onReady }: { rig: Group; legs: { current: Mesh[] }; onReady?: () => void }) {
  const invalidate = useThree(state => state.invalidate);
  const source = useLoader(GLTFLoader, '/assets/artrobots-robot-kaian.glb');
  const instance = useMemo(() => {
    const robot = source.scene.clone(true), owned: Material[] = [], articulated: Mesh[] = [];
    robot.traverse(object => {
      if (!(object instanceof Mesh)) return;
      const shell = object.name === 'shell', base = object.name === 'base';
      const material = new MeshStandardMaterial({ color: shell ? 0x7542af : base ? 0x292732 : 0x573085,
        metalness: base ? .05 : .02, roughness: shell ? .8 : base ? .88 : .76 });
      owned.push(material); object.material = material;
      if (object.name.startsWith('legs-')) articulated.push(object);
    });
    return { robot, owned, articulated };
  }, [source, rig]);
  const ready = useRef(onReady); ready.current = onReady;
  useEffect(() => {
    rig.add(instance.robot); legs.current = instance.articulated; invalidate(); ready.current?.();
    return () => { rig.remove(instance.robot); legs.current = []; instance.owned.forEach(material => material.dispose()); invalidate(); };
  }, [instance, rig, legs, invalidate]);
  return null;
}

// Bounded, varied editorial choreography. It deliberately does not reproduce
// the robot's actual gait, controller, dynamics, or measured performance.
const ROUTES = [[.9,.45],[-.72,.86],[-.9,-.56],[.62,-.8],[.08,.78],[.76,-.18],[-.56,.08],[0,0]];
type MotionState = { mode: 'ARRIVE' | 'WALK' | 'OBSERVE' | 'TUMBLE' | 'RECOVER'; elapsed: number; duration: number;
  x: number; z: number; fromX: number; fromZ: number; toX: number; toZ: number; heading: number; route: number; segments: number; phase: number };

function WorldContents(props: WorldSceneProps & { running: boolean }) {
  const { camera, size, invalidate, setDpr, gl } = useThree();
  const compact = size.width < 680;
  const model = useMemo(() => createWorld(compact), [compact]);
  const stage = props.stage || (props.activeArea ? 'area' : 'hub');
  const legs = useRef<Mesh[]>([]);
  const motion = useRef<MotionState>({ mode: 'ARRIVE', elapsed: 0, duration: 1.35, x: 0, z: 0, fromX: 0, fromZ: 0, toX: 0, toZ: 0, heading: -.3, route: -1, segments: 0, phase: 0 });
  const pose = useRef({ drop: 0, roll: 0, pitch: 0 });
  const hovered = useRef<SceneArea | null>(null);
  const focus = useRef(new Vector3()), cameraGoal = useRef(new Vector3()), focusGoal = useRef(new Vector3()), projection = useRef(new Vector3());
  const robotHome = useRef(new Vector3()), cameraRight = useRef(new Vector3()), cameraUp = useRef(new Vector3()), cameraForward = useRef(new Vector3());
  const lastLayout = useRef(0), layout = useRef<SceneNodeLayout[]>(AREAS.map(area => ({ area, x: .5, y: .5 })));
  const previousPositions = useRef(AREAS.map(() => ({ x: -1, y: -1 })));
  useEffect(() => () => model.dispose(), [model]);
  useEffect(() => {
    for (const child of model.root.children) child.visible = stage !== 'portal' || child === model.spider;
    const choreography = motion.current; choreography.mode = 'ARRIVE'; choreography.elapsed = 0;
    choreography.x = choreography.z = choreography.fromX = choreography.fromZ = 0;
    pose.current.drop = pose.current.roll = pose.current.pitch = 0;
    model.spider.rotation.set(0, -.3, 0);
    lastLayout.current = 0; invalidate();
  }, [invalidate, model, stage]);
  useEffect(() => { setDpr(Math.min(window.devicePixelRatio || 1, compact ? 1.15 : 1.5)); }, [compact, setDpr]);
  useEffect(() => {
    if (!props.running) {
      const active = model.connectors.find(node => node.area === props.activeArea);
      focus.current.set(active && !compact ? 2.1 + active.position.x * .12 : 0, 0, active ? active.position.z * .07 : 0);
      camera.position.set(focus.current.x, compact ? 12.2 : 8.3, (compact ? 17.2 : 11.7) + focus.current.z);
      camera.lookAt(focus.current); camera.updateProjectionMatrix();
    }
    lastLayout.current = 0; invalidate();
  }, [camera, compact, invalidate, model, props.activeArea, props.running]);
  useEffect(() => {
    if (!props.running) return;
    const timer = window.setInterval(invalidate, compact ? 34 : 17);
    return () => window.clearInterval(timer);
  }, [compact, invalidate, props.running]);
  useFrame((state, delta) => {
    const active = model.connectors.find(node => node.area === props.activeArea);
    const pointer = props.running ? state.pointer : ZERO_POINTER;
    focusGoal.current.set(stage !== 'portal' && active && !compact ? 2.1 + active.position.x * .12 : 0, 0, stage !== 'portal' && active ? active.position.z * .07 : 0);
    cameraGoal.current.set(focusGoal.current.x + (compact ? 0 : pointer.x * .26), compact ? 12.2 : 8.3 + pointer.y * .25, (compact ? 17.2 : 11.7) + focusGoal.current.z);
    const damping = props.running ? 1 - Math.exp(-Math.min(delta, .1) * 5.5) : 1;
    camera.position.lerp(cameraGoal.current, damping); focus.current.lerp(focusGoal.current, damping); camera.lookAt(focus.current);
    if (camera instanceof PerspectiveCamera) {
      const goalFov = stage !== 'portal' && active && !compact ? 34 : 36;
      if (Math.abs(goalFov - camera.fov) > .001) {
        camera.fov += (goalFov - camera.fov) * damping; camera.updateProjectionMatrix();
      }
    }
    const choreography = motion.current;
    const autonomous = props.running && !active && model.spider.children.length > 0;
    let drop = pose.current.drop, roll = pose.current.roll, pitch = pose.current.pitch;
    if (autonomous) {
      drop = roll = pitch = 0;
      const dt = Math.min(delta, .045); choreography.elapsed += dt; choreography.phase += dt;
      const progress = Math.min(1, choreography.elapsed / choreography.duration);
      if (choreography.mode === 'ARRIVE') {
        drop = (1 - progress) ** 2 * (stage === 'portal' ? 2 : 3.8);
        pitch = Math.sin(progress * Math.PI * 2) * (1 - progress) * .3;
      } else if (choreography.mode === 'WALK') {
        const travel = progress * progress * (3 - 2 * progress);
        const bend = Math.sin(progress * Math.PI) * .19 * (choreography.route % 2 ? 1 : -1);
        choreography.x = choreography.fromX + (choreography.toX - choreography.fromX) * travel + bend;
        choreography.z = choreography.fromZ + (choreography.toZ - choreography.fromZ) * travel;
        choreography.heading = Math.atan2(choreography.toX - choreography.fromX, choreography.toZ - choreography.fromZ);
        drop = Math.sin(choreography.phase * 12) * .032;
      } else if (choreography.mode === 'OBSERVE') {
        choreography.heading += Math.sin(choreography.phase * 3) * dt * .22;
      } else if (choreography.mode === 'TUMBLE') {
        roll = Math.sin(progress * Math.PI) * .83;
        pitch = Math.sin(progress * Math.PI) * -.33;
        drop = -Math.sin(progress * Math.PI) * .08;
      } else {
        pitch = Math.sin(progress * Math.PI * 2) * (1 - progress) * .11;
      }
      if (progress === 1) {
        choreography.elapsed = 0;
        if (choreography.mode === 'ARRIVE' || choreography.mode === 'OBSERVE' || choreography.mode === 'RECOVER') {
          let route = Math.floor(Math.random() * ROUTES.length); if (route === choreography.route) route = (route + 3) % ROUTES.length;
          choreography.route = route; choreography.fromX = choreography.x; choreography.fromZ = choreography.z;
          choreography.toX = ROUTES[route][0]; choreography.toZ = ROUTES[route][1];
          choreography.mode = 'WALK'; choreography.duration = 3.2 + Math.random() * 2.4;
        } else if (choreography.mode === 'WALK') {
          choreography.segments++; choreography.mode = choreography.segments % 5 === 0 ? 'TUMBLE' : 'OBSERVE';
          choreography.duration = choreography.mode === 'TUMBLE' ? 1.8 : 1.1 + Math.random() * .9;
        } else { choreography.mode = 'RECOVER'; choreography.duration = 1.3; }
      }
      pose.current.drop = drop; pose.current.roll = roll; pose.current.pitch = pitch;
    }
    let robotScale = compact ? .44 : .68;
    robotHome.current.set(0, -.58, 0);
    if (stage === 'portal' && camera instanceof PerspectiveCamera) {
      // Position from screen fractions, so one renderer fits both photo layouts.
      const distance = camera.position.distanceTo(focus.current), halfHeight = Math.tan(camera.fov * Math.PI / 360) * distance;
      const halfWidth = halfHeight * size.width / size.height;
      cameraForward.current.set(0, 0, -1).applyQuaternion(camera.quaternion);
      cameraRight.current.set(1, 0, 0).applyQuaternion(camera.quaternion);
      cameraUp.current.set(0, 1, 0).applyQuaternion(camera.quaternion);
      const portraitPortal = size.width < 768 && !(size.width > size.height && size.height < 480);
      const shortPortrait = portraitPortal && size.height <= 680;
      robotScale = halfHeight * 2 * (portraitPortal ? shortPortrait ? 120 : 150 : compact ? 150 : 220) / size.height / 6;
      robotHome.current.copy(camera.position).addScaledVector(cameraForward.current, distance)
        .addScaledVector(cameraRight.current, (portraitPortal ? 0 : .68) * halfWidth)
        .addScaledVector(cameraUp.current, (portraitPortal ? shortPortrait ? -.2 : -.06 : -.54) * halfHeight);
      robotHome.current.y -= robotScale * .79;
    }
    model.spider.scale.setScalar(robotScale);
    const pathScale = stage === 'portal' ? .14 : compact ? .36 : 1;
    const reading = !!active;
    const x = reading ? 0 : choreography.x * pathScale, z = reading ? 0 : choreography.z * pathScale;
    model.spider.position.set(robotHome.current.x + x, robotHome.current.y + (reading ? 0 : drop), robotHome.current.z + z);
    const heading = reading ? -.3 : choreography.heading;
    const robotDamping = props.running ? damping : reading ? 1 : 0;
    model.spider.rotation.y += Math.atan2(Math.sin(heading - model.spider.rotation.y), Math.cos(heading - model.spider.rotation.y)) * robotDamping;
    model.spider.rotation.z += ((reading ? 0 : roll) - model.spider.rotation.z) * robotDamping;
    model.spider.rotation.x += ((reading ? 0 : pitch) - model.spider.rotation.x) * robotDamping;
    for (let i = 0; i < legs.current.length; i++) {
      const swing = !reading && choreography.mode === 'WALK' ? Math.sin(choreography.phase * 9 + i * Math.PI) : 0;
      legs.current[i].rotation.z = swing * .02; legs.current[i].rotation.x = swing * .016;
    }
    for (const connector of model.connectors) {
      const selected = connector.area === props.activeArea, hover = connector.area === hovered.current;
      connector.material.emissiveIntensity += ((selected ? 1.7 : hover ? 1.1 : .36) - connector.material.emissiveIntensity) * damping;
      connector.halo.opacity += ((selected ? .4 : hover ? .28 : .12) - connector.halo.opacity) * damping;
    }
    camera.updateMatrixWorld();
    if (stage !== 'portal' && props.onLayout && (performance.now() - lastLayout.current > 120 || !props.running)) {
      let changed = lastLayout.current === 0;
      model.connectors.forEach((node, i) => {
        projection.current.copy(node.position).project(camera);
        const x = projection.current.x * .5 + .5, y = -projection.current.y * .5 + .5;
        if (Math.abs(previousPositions.current[i].x - x) > .002 || Math.abs(previousPositions.current[i].y - y) > .002) changed = true;
        layout.current[i].x = x; layout.current[i].y = y;
        previousPositions.current[i].x = x; previousPositions.current[i].y = y;
      });
      if (changed) props.onLayout(layout.current);
      lastLayout.current = performance.now();
    }
  });
  function hover(area: SceneArea | null) { hovered.current = area; gl.domElement.style.cursor = area ? 'pointer' : ''; invalidate(); }
  function navigate(event: ThreeEvent<MouseEvent>, area: SceneArea) { event.stopPropagation(); props.onNavigate(area); }
  return <>
    <hemisphereLight args={[0xe9eef6, 0x373241, 1.15]} />
    <directionalLight color={0xf0f3ff} intensity={1.9} position={[4, 8, 6]} />
    <directionalLight color={0xb5bae6} intensity={.8} position={[-5, 4, -5]} />
    <directionalLight color={0xffffff} intensity={.65} position={[-3, 2, 7]} />
    <ReflectionEnvironment />
    <primitive object={model.root} dispose={null} />
    <Suspense fallback={null}><RobotFromKaian rig={model.spider} legs={legs} onReady={props.onReady} /></Suspense>
    {stage !== 'portal' && model.connectors.map(node => <mesh key={node.area} position={node.position} geometry={model.hitGeometry} material={model.hitMaterial}
      onClick={event => navigate(event, node.area)} onPointerOver={event => { event.stopPropagation(); hover(node.area); }} onPointerOut={() => hover(null)} />)}
  </>;
}

class SceneBoundary extends Component<{ children: ReactNode; onFallback?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFallback?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function WorldScene(props: WorldSceneProps) {
  const holder = useRef<HTMLDivElement>(null);
  const contextCleanup = useRef<(() => void) | null>(null);
  const [visible, setVisible] = useState(true), [tabVisible, setTabVisible] = useState(() => !document.hidden), [contextLost, setContextLost] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const callbacks = useRef(props); callbacks.current = props;
  const running = !props.paused && !props.reducedMotion && !systemReducedMotion && visible && tabVisible && !contextLost;
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const visibility = () => setTabVisible(!document.hidden), reduction = () => setSystemReducedMotion(motion.matches);
    document.addEventListener('visibilitychange', visibility); motion.addEventListener('change', reduction);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 });
    if (holder.current) observer.observe(holder.current);
    return () => { document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', reduction); observer.disconnect(); };
  }, []);
  useEffect(() => () => contextCleanup.current?.(), []);
  return <div ref={holder} className="world-scene" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
    <SceneBoundary onFallback={props.onFallback}>
      <Canvas aria-hidden="true" frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 8.3, 11.7], fov: 36, near: .1, far: 70 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} fallback={null}
        onCreated={state => {
          state.gl.setClearColor(0, 0); state.gl.toneMappingExposure = .97;
          const lost = (event: Event) => { event.preventDefault(); setContextLost(true); callbacks.current.onFallback?.(); };
          const restored = () => { setContextLost(false); callbacks.current.onReady?.(); state.invalidate(); };
          state.gl.domElement.addEventListener('webglcontextlost', lost);
          state.gl.domElement.addEventListener('webglcontextrestored', restored);
          contextCleanup.current = () => {
            state.gl.domElement.removeEventListener('webglcontextlost', lost);
            state.gl.domElement.removeEventListener('webglcontextrestored', restored);
          };
        }}>
        <WorldContents {...props} running={running} />
      </Canvas>
    </SceneBoundary>
  </div>;
}
