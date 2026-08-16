import { Image, Sky, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import { useControls } from "leva";
import Box from "./Box";
import Lighting from "./Lighting";
import * as THREE from "three";

// Generates a spread of trees, all resting on the floor
const Trees = ({ groundY }) => {
  const { count, spreadX, minZ, maxZ, minScale, maxScale } = useControls(
    "Trees",
    {
      count: { value: 50, min: 1, max: 60, step: 1 },
      spreadX: { value: 24, min: 1, max: 40, step: 0.5 },
      minZ: { value: 4, min: -30, max: 10, step: 0.5 },
      maxZ: { value: -8, min: -30, max: 10, step: 0.5 },
      minScale: { value: 1, min: 0.1, max: 5, step: 0.1 },
      maxScale: { value: 2.5, min: 0.1, max: 5, step: 0.1 },
    },
  );

  const trees = useMemo(() => {
    const items = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spreadX;
      const z = minZ + Math.random() * (maxZ - minZ);
      const scale = minScale + Math.random() * (maxScale - minScale);
      const y = groundY + scale / 2;

      items.push({ position: [x, y, z], scale, key: i });
    }

    return items;
  }, [count, spreadX, minZ, maxZ, minScale, maxScale, groundY]);

  return (
    <>
      {trees.map(({ position, scale, key }) => (
        <Image
          key={key}
          url="/Cartoon-Tree-Transparent-PNG.png"
          position={position}
          scale={scale}
          transparent
        />
      ))}
    </>
  );
};

// Floor plane the trees sit on, behind the rock — now with a tiled texture
const Floor = ({ y, z, size }) => {
  const { repeat } = useControls("Floor", {
    repeat: { value: 10, min: 1, max: 50, step: 1 },
  });

  const texture = useTexture("/grass-texture.jpg");

  // configure wrapping/repeat whenever the texture or repeat count changes
  useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture, repeat]);

  return (
    <mesh position={[0, y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

// Rock that resizes based on viewport dimensions and always renders in front
const Rock = () => {
  const ref = useRef();
  const { viewport } = useThree();

  const widthFactor = 2;

  useFrame(() => {
    if (!ref.current) return;

    const targetScale = viewport.width * widthFactor;

    ref.current.scale.set(targetScale, targetScale, 1);
    ref.current.position.set(-viewport.width / 8, -viewport.width / 2, 0);
  });

  useEffect(() => {
    if (!ref.current) return;

    ref.current.renderOrder = 999;

    if (ref.current.material) {
      ref.current.material.depthTest = false;
      ref.current.material.depthWrite = false;
    }
  }, []);

  return <Image ref={ref} url="/Rock-PNG-File.png" transparent />;
};

// Camera rig that offsets the camera based on pointer position for a parallax effect
const CameraRig = ({ children }) => {
  const group = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    const x = (state.pointer.x * viewport.width) / 50;
    const y = (state.pointer.y * viewport.height) / 50;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      x,
      0.05,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      y,
      0.05,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return <group ref={group}>{children}</group>;
};

const Experience = () => {
  const { y, z, size } = useControls("Floor Position", {
    y: { value: -0.7, min: -10, max: 5, step: 0.1 },
    z: { value: -10, min: -30, max: 0, step: 0.5 },
    size: { value: 100, min: 5, max: 100, step: 1 },
  });

  return (
    <Canvas>
      <color args={["#fefefe"]} attach="background" />
      <CameraRig>
        <Lighting />
        <Floor y={y} z={z} size={size} />
        <Trees groundY={y} />
        <Rock />
        <Sky />
      </CameraRig>
    </Canvas>
  );
};

export default Experience;
