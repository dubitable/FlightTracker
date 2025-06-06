import Scene from "./Globe";
import PlaneIcon from "./icons/Plane";
import exRoute from "./route.json";
import exFlight from "./flight.json";

function App() {
  return (
    <>
      <div id="canvas-container" className="w-full h-full">
        <Scene />
      </div>
    </>
  );
}

export default App;
