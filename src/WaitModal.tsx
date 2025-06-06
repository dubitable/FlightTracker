import PlaneIcon from "./icons/Plane";

type WaitModalProps = {
  flight: {
    lat: number;
    lng: number;
    color: string;
    size: number;
    callsign: string | null;
    time: number | null;
    index: number;
  };
};

const WaitModal = ({ flight }: WaitModalProps) => {
  return (
    <div className="fixed right-0 bottom-0 left-3/4">
      <article className="rounded-xl border border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <PlaneIcon />
          </div>

          <div>
            <a
              href={
                "https://www.flightaware.com/live/flight/" + flight.callsign
              }
              target="_blank"
            >
              <h3 className="text-lg font-medium text-white hover:underline">
                {flight.callsign}
              </h3>
            </a>

            <div className="flow-root">
              <ul className="-m-1 flex flex-wrap">
                <li className="p-1 leading-none">
                  <a href="#" className="text-xs font-medium text-gray-300">
                    ???????
                  </a>
                </li>

                <li className="p-1 leading-none">
                  <a href="#" className="text-xs font-medium text-gray-300">
                    {`->`}
                  </a>
                </li>

                <li className="p-1 leading-none">
                  <a href="#" className="text-xs font-medium text-gray-300">
                    ???????
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          <li>
            <a className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600">
              <strong className="font-medium text-white">???????</strong>

              <p className="mt-1 text-xs font-medium text-gray-300">???????</p>
            </a>
          </li>

          <li>
            <a className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600">
              <strong className="font-medium text-white">???????</strong>

              <p className="mt-1 text-xs font-medium text-gray-300">???????</p>
            </a>
          </li>
        </ul>
      </article>
    </div>
  );
};

export default WaitModal;
