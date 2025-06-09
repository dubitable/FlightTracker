import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { Console } from "console";

// @ts-ignore
import Amadeus from "amadeus";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const prod = process.env.PROD == "TRUE";

const testSetup = {
  logger: new Console(process.stdout, process.stderr),
};

const prodSetup = {
  clientId: process.env.AMADEUS_PROD_CLIENT_ID,
  clientSecret: process.env.AMADEUS_PROD_CLIENT_SECRET,
  hostname: "production",
  logger: new Console(process.stdout, process.stderr),
};

const amadeus = new Amadeus(prod ? prodSetup : testSetup);

app.get("/api/get-route", async (req, res) => {
  const callsign = req.query.callsign as string | undefined;
  const time = req.query.time as number | undefined;

  if (!callsign || !time) return;

  const matches = [...callsign.matchAll(/([a-zA-Z].+?)([0-9].+)/gm)][0];

  const icaoCode = matches[1];
  const flightNumber = matches[2];

  const airline = await amadeus.referenceData.airlines
    .get({
      airlineCodes: icaoCode,
    })
    .catch((e: any) => console.log(e));

  if (!airline || airline.result.meta.count != 1) {
    res.status(202).send("airline");
    return;
  }

  const carrierCode = airline.data[0].iataCode;

  const body = {
    carrierCode,
    flightNumber,
    scheduledDepartureDate: new Date(Date.now()).toISOString().split("T")[0],
  };

  const response = await amadeus.schedule.flights
    .get(body)
    .catch((e: any) => console.log(e));

  if (!response || response.result.meta.count != 1) {
    res.status(202).send("flights");
    return;
  }

  const getAirportInfo = async (keyword: string) => {
    const loc = await amadeus.referenceData.locations
      .get({ subType: "AIRPORT", keyword })
      .catch((e: any) => console.log(e));

    if (!loc) return undefined;

    return loc.data.find(
      (location: { iataCode: string }) => location.iataCode === keyword
    );
  };

  const points = response.data[0]?.flightPoints;

  console.log(response.data[0].segments);

  const dInfo = await getAirportInfo(points[0].iataCode);
  const aInfo = await getAirportInfo(points[1].iataCode);

  const data = {
    departure: {
      iataCode: points[0].iataCode,
      info: dInfo,
      timings: points[0].departure.timings,
    },
    arrival: {
      iataCode: points[1].iataCode,
      info: aInfo,
      timings: points[1].arrival.timings,
    },
  };

  res.status(200).json(data);
  return;
});

app.get("/api/get-states", async (req, res) => {
  const response = await fetch("https://opensky-network.org/api/states/all", {
    headers: { Authorization: `Bearer ${req.query.token}` },
  });

  if (!response.ok) {
    res.status(201).send("nostate");
    return;
  }

  const data = await response.json();
  res.status(200).json(data);
  return;
});

app.get("/api/get-token", async (_, res) => {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.OPEN_SKY_CLIENT_ID!,
    client_secret: process.env.OPEN_SKY_CLIENT_SECRET!,
  });

  const response = await fetch(
    "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  if (!response.ok) {
    res.status(201).send("noaccess");
    return;
  }

  const data = await response.json();
  res.status(200).json(data);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT} in PROD=${prod}`);
});
