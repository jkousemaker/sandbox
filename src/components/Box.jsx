import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

const Box = (props) => {
  const boxRef = useRef();

  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    boxRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh
      ref={boxRef}
      {...props}
      onClick={(event) => setClicked(!clicked)}
      onPointerOver={(event) => setHovered(true)}
      onPointerOut={(event) => setHovered(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? "red" : "lightblue"} />
    </mesh>
  );
};

export default Box;
