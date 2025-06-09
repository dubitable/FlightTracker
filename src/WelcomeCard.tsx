import World from "./icons/World";

const WelcomeCard = ({ lastUpdated }: { lastUpdated: Date | undefined }) => {
  return (
    <div className="fixed left-0 bottom-0 right-3/4">
      <article className="rounded-xl border border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <World />
          </div>

          <div>
            <a target="_blank">
              <h3 className="text-lg font-medium text-white hover:underline">
                Flight Visualizer
              </h3>
            </a>
            <div className="text-white text-sm">Planes around the world</div>
          </div>
        </div>

        <div className="flow-root text-white mt-5">
          Click on any plane for route info! Works best around the US, avoid
          spamming queries to not engage rate limits. Data sourced thanks to the{" "}
          <a
            href="https://openskynetwork.github.io/opensky-api/rest.html"
            className="hover:underline"
          >
            OpenSky
          </a>{" "}
          and{" "}
          <a href="https://developers.amadeus.com/" className="hover:underline">
            Amadeus
          </a>{" "}
          APIs.
        </div>

        <div className="text-white mt-5 italic text-sm border-t-2 border-white pt-2">
          Last Updated {lastUpdated?.toString() ?? "????"}
        </div>
      </article>
    </div>
  );
};

export default WelcomeCard;
