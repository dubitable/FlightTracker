import R3fGlobe from "r3f-globe";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FlightClient } from "./flightclient";
import type { Route } from "./schemas";
import PlaneModal from "./PlaneModal";

// #TODO get rid of all anys bad practice

type GlobeVizProps = {
  flightState: [number | undefined, (newVal: number | undefined) => void];
  routeState: [
    { arrival: Route; departure: Route } | undefined,
    (newVal: { arrival: Route; departure: Route } | undefined) => void
  ];
  flightsStates: [any[], (newVal: any[]) => void];
  fData: {
    lat: number;
    lng: number;
    color: string;
    size: number;
    callsign: string | null;
    time: number | null;
    index: number;
  }[];
};

const GlobeViz = ({
  flightState,
  flightsStates,
  routeState,
  fData,
}: GlobeVizProps) => {
  const [flightFocus, setFlightFocus] = flightState;
  const [route, setRoute] = routeState;
  const [flights, setFlights] = flightsStates;

  const flightclient = new FlightClient();

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

  const points = flightFocus === undefined ? fData : [fData[flightFocus]];

  const gData = useMemo(() => {
    if (!route) return;

    return [
      {
        startLat: route.departure.info.geoCode.latitude,
        startLng: route.departure.info.geoCode.longitude,
        endLat: route.arrival.info.geoCode.latitude,
        endLng: route.arrival.info.geoCode.longitude,
        color: "red",
      },
    ];
  }, [route]);

  const arcLayer = {
    arcsData: gData,
    arcColor: "color",
    arcDashLength: 0.4,
    arcDashGap: 4,
    arcDashAnimateTime: 2000,
    arcAltitude: 0.2,
    arcStroke: 0.6,
  };

  return (
    <R3fGlobe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      pointsData={points}
      pointAltitude="size"
      pointColor="color"
      pointRadius={0.1}
      {...arcLayer}
      onClick={(layer, data) => {
        if (layer == "point") {
          if (flightFocus === undefined) {
            setFlightFocus((data as any).index);
            const callsign = (data as any).callsign;
            const time = (data as any).time;

            console.log(data);
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
  const [flightFocus, setFlightFocus] = useState<number | undefined>();
  const [route, setRoute] = useState<
    { arrival: Route; departure: Route } | undefined
  >();

  const [flights, setFlights] = useState<any[]>([]);

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
          <GlobeViz
            flightState={[flightFocus, setFlightFocus]}
            routeState={[route, setRoute]}
            flightsStates={[flights, setFlights]}
            fData={fData}
          />
        </Canvas>
      </div>
      {flightFocus && route ? (
        <PlaneModal flight={fData[flightFocus]} route={route} />
      ) : undefined}
    </>
  );
};

export default Scene;
