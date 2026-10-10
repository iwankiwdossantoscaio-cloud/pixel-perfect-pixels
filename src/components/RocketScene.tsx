import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import rocketAsset from "@/assets/foguete.glb.asset.json";
import { scrollState } from "@/lib/scroll";

const seg = (p: number, a: number, b: number) => THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);

function RocketModel() {
  const { scene } = useGLTF(rocketAsset.url);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 3 / Math.max(size.x, size.y, size.z);
    c.scale.setScalar(s);
    c.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    return c;
  }, [scene]);
  return <primitive object={obj} />;
}

function Booster({ side }: { side: 1 | -1 }) {
  return (
    <group position={[side * 0.5, 0.7, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 1.1, 20]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <coneGeometry args={[0.13, 0.28, 20]} />
        <meshStandardMaterial color="#e2342b" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Scene({ mobile }: { mobile: boolean }) {
  const p = useRef(0);
  const rocket = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Group>(null);
  const ground = useRef<THREE.Group>(null);
  const bL = useRef<THREE.Group>(null);
  const bR = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const clouds = useRef<THREE.Group>(null);
  const lines = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Points>(null);
  const { camera, viewport } = useThree();
  const scale = mobile ? 0.7 : 1;

  const N = mobile ? 120 : 300;
  const smokeData = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const life = new Float32Array(N).map(() => Math.random());
    return { pos, life };
  }, [N]);

  const cloudList = useMemo(
    () => Array.from({ length: mobile ? 6 : 10 }, (_, i) => ({
      x: (Math.random() - 0.5) * 14, y: i * 3 - 6, z: -2 - Math.random() * 4, s: 0.6 + Math.random() * 0.8,
    })),
    [mobile],
  );

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    p.current += (scrollState.progress - p.current) * (1 - Math.exp(-6 * dt));
    const t = p.current;
    const time = state.clock.elapsedTime;
    const halfH = viewport.height / 2;
    const ign = seg(t, 0.1, 0.25);
    const climb = seg(t, 0.25, 0.8);
    const top = seg(t, 0.8, 1);
    const sep = seg(t, 0.6, 0.8);

    const startY = -halfH + 0.3;
    const endY = halfH - 3.6 * scale;
    const y = THREE.MathUtils.lerp(startY, endY, ign * 0.08 + climb * 0.92);
    if (rocket.current) {
      const shake = t < 0.1 ? 0.01 : ign < 1 ? 0.03 : 0;
      rocket.current.position.set(
        (Math.random() - 0.5) * shake + Math.sin(time * 1.4) * 0.05 * top,
        y + Math.sin(time * 2) * 0.05 * top,
        0,
      );
      rocket.current.rotation.z = Math.sin(climb * Math.PI) * 0.12;
      rocket.current.rotation.y = climb * Math.PI * 2 + time * 0.15;
    }
    // camera shake on ignition
    const cs = ign > 0 && ign < 1 ? 0.04 : 0;
    camera.position.x = (Math.random() - 0.5) * cs;
    camera.position.y = (Math.random() - 0.5) * cs;

    const fI = Math.max(0, ign * (1 + climb * 0.8) - top * 0.6);
    if (flame.current) {
      flame.current.visible = fI > 0.02;
      const flick = 1 + Math.sin(time * 40) * 0.08;
      flame.current.scale.set(fI * 0.9 + 0.1, fI * flick * 1.4, fI * 0.9 + 0.1);
    }
    if (ground.current) ground.current.position.y = startY - seg(t, 0.25, 0.45) * 8;

    const fall = (g: THREE.Group | null, side: number) => {
      if (!g) return;
      g.position.set(side * sep * 2.2, -sep * sep * 7, 0);
      g.rotation.z = side * sep * 1.4;
      g.visible = sep < 0.98;
    };
    fall(bL.current, -1);
    fall(bR.current, 1);

    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = top * 0.8;
      ring.current.scale.setScalar(0.5 + top * 0.5);
      ring.current.rotation.z += dt * 0.6;
      ring.current.position.y = y + 1.5 * scale;
    }

    const speed = Math.sin(climb * Math.PI) * 14 + 0.2;
    if (clouds.current) {
      clouds.current.visible = climb > 0 && top < 1;
      clouds.current.children.forEach((c) => {
        c.position.y -= speed * dt;
        if (c.position.y < -halfH - 3) c.position.y = halfH + 3;
      });
    }
    if (lines.current) {
      lines.current.visible = climb > 0.05 && climb < 0.98;
      lines.current.children.forEach((l) => {
        l.position.y -= speed * 2 * dt;
        if (l.position.y < -halfH - 2) l.position.y = halfH + 2;
      });
    }

    if (smoke.current) {
      const { pos, life } = smokeData;
      const ry = rocket.current?.position.y ?? 0;
      for (let i = 0; i < N; i++) {
        life[i] += dt * (0.4 + Math.random() * 0.3);
        if (life[i] > 1) {
          life[i] = 0;
          pos[i * 3] = (Math.random() - 0.5) * 0.4;
          pos[i * 3 + 1] = ry - 0.2;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }
        pos[i * 3] += (Math.random() - 0.5) * dt * 2 * (1 + (t < 0.3 ? 3 : 0));
        pos[i * 3 + 1] -= dt * (top > 0 ? 0.3 : 1.5);
      }
      smoke.current.geometry.attributes.position.needsUpdate = true;
      (smoke.current.material as THREE.PointsMaterial).opacity = ign * 0.55;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#bcd8ff" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>

      <group ref={clouds}>
        {cloudList.map((c, i) => (
          <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
            {[[-0.6, 0, 0.7], [0, 0.2, 1], [0.7, 0, 0.8]].map(([x, yy, r], j) => (
              <mesh key={j} position={[x, yy, 0]}>
                <sphereGeometry args={[r, 16, 12]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.85} roughness={1} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <group ref={lines}>
        {Array.from({ length: mobile ? 8 : 16 }, (_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 12, -1]}>
            <planeGeometry args={[0.015, 1.6]} />
            <meshBasicMaterial color="#0a0a0a" transparent opacity={0.18} />
          </mesh>
        ))}
      </group>

      <group ref={ground}>
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[30, 1, 6]} />
          <meshStandardMaterial color="#e9edf1" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[1.2, 1.4, 0.2, 32]} />
          <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[1.4, 1.4, -0.3]}>
          <boxGeometry args={[0.2, 3, 0.2]} />
          <meshStandardMaterial color="#e2342b" roughness={0.6} />
        </mesh>
      </group>

      <points ref={smoke}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[smokeData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#c9ced6" size={mobile ? 0.35 : 0.45} transparent opacity={0} depthWrite={false} />
      </points>

      <mesh ref={ring} rotation-x={Math.PI / 2.4}>
        <torusGeometry args={[2.2 * scale, 0.025, 8, 120]} />
        <meshBasicMaterial color="#ff8a1f" transparent opacity={0} />
      </mesh>

      <group ref={rocket} scale={scale}>
        <Suspense fallback={null}>
          <RocketModel />
        </Suspense>
        <group ref={bL}><Booster side={-1} /></group>
        <group ref={bR}><Booster side={1} /></group>
        <group ref={flame} position={[0, 0, 0]}>
          <mesh position={[0, -0.6, 0]} rotation-x={Math.PI}>
            <coneGeometry args={[0.32, 1.2, 24]} />
            <meshBasicMaterial color="#ff7a1a" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, -0.4, 0]} rotation-x={Math.PI}>
            <coneGeometry args={[0.18, 0.8, 24]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
        </group>
      </group>
    </>
  );
}

export default function RocketScene() {
  const [mobile, setMobile] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setMobile(mq.matches);
    const on = () => setMobile(mq.matches);
    mq.addEventListener("change", on);
    const vis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => {
      mq.removeEventListener("change", on);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene mobile={mobile} />
    </Canvas>
  );
}
