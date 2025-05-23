import R3fGlobe from "r3f-globe";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const GlobeViz = () => {
  return (
    <R3fGlobe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      pointAltitude="size"
      pointColor="color"
    />
  );
};

const Scene = () => {
  return (
    <div style={{ height: window.innerHeight }}>
      <Canvas
        flat
        camera={useMemo(() => ({ fov: 50, position: [0, 0, 350] }), [])}
      >
        <OrbitControls
          minDistance={101}
          maxDistance={1e4}
          dampingFactor={0.1}
          zoomSpeed={0.3}
          rotateSpeed={0.3}
        />
        <color attach="background" args={[0, 0, 0]} />
        <ambientLight color={0xcccccc} intensity={Math.PI} />
        <directionalLight intensity={0.6 * Math.PI} />
        <GlobeViz />
      </Canvas>
    </div>
  );
};

export default Scene;
