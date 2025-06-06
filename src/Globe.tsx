import R3fGlobe from "r3f-globe";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FlightClient } from "./flightclient";
import type { Route } from "./schemas";
import exRoute from "./route.json";
import exFlight from "./flight.json";
import PlaneIcon from "./icons/Plane";

const convertLocal = (time: Date, offset: string) => {
  const [sign, hours, minutes] = offset
    .match(/([+-])(\d{2}):(\d{2})/)
    ?.slice(1) ?? ["", "", ""];

  const offsetMinutes =
    (Number(hours) * 60 + Number(minutes)) * (sign === "+" ? 1 : -1);

  const depTimeLocal = new Date(time.getTime() + offsetMinutes * 60 * 1000);

  return depTimeLocal.toISOString().replace("T", " ").substring(0, 16);
};

// #TODO get rid of all anys bad practice

type GlobeVizProps = {
  flightState: [number | undefined, (newVal: number | undefined) => void];
  routeState: [
    { arrival: Route; departure: Route } | undefined,
    (newVal: { arrival: Route; departure: Route } | undefined) => void
  ];
};

const GlobeViz = (props: GlobeVizProps) => {
  const { flightState, routeState } = props;
  const [flightFocus, setFlightFocus] = flightState;
  const [route, setRoute] = routeState;

  const [flights, setFlights] = useState<any[]>([]);

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

  const points = flightFocus === undefined ? fData : [exFlight];

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
  const [flightFocus, setFlightFocus] = useState<number | undefined>(1);
  const [route, setRoute] = useState<
    { arrival: Route; departure: Route } | undefined
  >(exRoute);

  const depTime = new Date(exRoute.departure.timings[0].value);
  const arrTime = new Date(exRoute.arrival.timings[0].value);

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
          />
        </Canvas>
      </div>
      <div className="fixed right-0 bottom-0 left-3/4">
        <article className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <PlaneIcon />
            </div>

            <div>
              <h3 className="text-lg font-medium text-white">
                {exFlight.callsign}
              </h3>
              <div className="flow-root">
                <ul className="-m-1 flex flex-wrap">
                  <li className="p-1 leading-none">
                    <a href="#" className="text-xs font-medium text-gray-300">
                      {exRoute.departure.iataCode}
                    </a>
                  </li>

                  <li className="p-1 leading-none">
                    <a href="#" className="text-xs font-medium text-gray-300">
                      {`->`}
                    </a>
                  </li>

                  <li className="p-1 leading-none">
                    <a href="#" className="text-xs font-medium text-gray-300">
                      {exRoute.arrival.iataCode}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            <li>
              <a className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600">
                <strong className="font-medium text-white">
                  {exRoute.departure.info.name}
                </strong>

                <p className="mt-1 text-xs font-medium text-gray-300">
                  {convertLocal(depTime, exRoute.departure.info.timeZoneOffset)}
                </p>
              </a>
            </li>

            <li>
              <a className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600">
                <strong className="font-medium text-white">
                  {exRoute.arrival.info.name}
                </strong>

                <p className="mt-1 text-xs font-medium text-gray-300">
                  {convertLocal(arrTime, exRoute.arrival.info.timeZoneOffset)}
                </p>
              </a>
            </li>
          </ul>
        </article>
      </div>
    </>
  );
};

export default Scene;
