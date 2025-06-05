import R3fGlobe from "r3f-globe";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FlightClient } from "./flightclient";
import type { Route } from "./schemas";

// #TODO get rid of all anys bad practice

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

  const fData = useMemo(() => {
    return flights.map((state, index) => {
      return {
        lat: state[6] as number,
        lng: state[5] as number,
        color: "red",
        size: 0,
        callsign: state[1] as string | null,
        time: state[4] as number | null,
        index,
      };
    });
  }, [flights]);

  const [flightFocus, setFlightFocus] = useState<number | undefined>(undefined);
  const [route, setRoute] = useState<
    { arrival: Route; departure: Route } | undefined
  >();

  const points = flightFocus === undefined ? fData : [fData[flightFocus]];

  if (route) {
    console.log(route);
    for (const elem of ["arrival", "departure"] as const) {
      const { latitude, longitude } = route[elem].info.geoCode;
      points.push({
        lat: latitude,
        lng: longitude,
        color: "yellow",
        callsign: "",
        index: -1,
        size: 0,
        time: 0,
      });
    }
  }

  return (
    <R3fGlobe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      pointsData={points}
      pointAltitude="size"
      pointColor="color"
      pointRadius={0.1}
      onClick={(layer, data) => {
        if (layer == "point") {
          if (flightFocus === undefined) {
            setFlightFocus((data as any).index);
            const callsign = (data as any).callsign;
            const time = (data as any).time;
            if (callsign && time) {
              flightclient.getRoute(time, callsign).then((route) => {
                if (route) setRoute({ ...route });
              });
            }
          } else {
            setFlightFocus(undefined);
          }
        }
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
