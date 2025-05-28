import R3fGlobe from "r3f-globe";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import airports from "./assets/large-airports.json";
import { FlightClient } from "./flightclient";

const GlobeViz = () => {
  const [flights, setFlights] = useState<any[]>([]);

  const flightclient = new FlightClient(
    import.meta.env.VITE_CLIENT,
    import.meta.env.VITE_SECRET
  );

  function updateFlights() {
    flightclient.getStates().then((states) => {
      if (states) setFlights([...states]);
    });
  }

  useEffect(() => {
    addEventListener("keydown", (event) => {
      if (event.key === "w") {
        updateFlights();
      }
    });
  }, []);

  const gData = useMemo(
    () =>
      airports.map(({ latitude_deg, longitude_deg, municipality }) => {
        return {
          lat: latitude_deg,
          lng: longitude_deg,
          size: 0,
          color: "yellow",
          radius: 0.1,
          municipality,
        };
      }),
    []
  );

  const pData = useMemo(() => {
    return flights.map((state) => {
      return {
        lat: state[6],
        lng: state[5],
        size: 0,
        color: "red",
        radius: 0.1,
      };
    });
  }, [flights]);

  return (
    <R3fGlobe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      pointAltitude="size"
      pointColor="color"
      pointRadius="radius"
      pointsData={pData}
      onHover={(_, elemData) => {
        if (!elemData) return;
        const data = elemData as (typeof gData)[number];
      }}
    />
  );
};

const Scene = () => {
  return (
    <>
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
    </>
  );
};

export default Scene;
