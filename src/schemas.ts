import { z } from "zod";

export const AccessSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  "not-before-policy": z.number(),
  refresh_expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
});

export const FlightsSchema = z.object({
  time: z.number(),
  states: z.array(z.any()),
});

export const InfoSchema = z.object({
  type: z.string(),
  subType: z.string(),
  name: z.string(),
  detailedName: z.string(),
  id: z.string(),
  self: z.object({
    href: z.string(),
    methods: z.array(z.string()),
  }),
  timeZoneOffset: z.string(),
  iataCode: z.string(),
  geoCode: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  address: z.object({
    cityName: z.string(),
    cityCode: z.string(),
    countryName: z.string(),
    countryCode: z.string(),
    stateCode: z.string(),
    regionCode: z.string(),
  }),
  analytics: z.any(), // not using
});

export const RouteSchema = z.object({
  iataCode: z.string(),
  timings: z.array(z.object({ qualifier: z.string(), value: z.string() })),
  info: InfoSchema,
});

export type Route = z.infer<typeof RouteSchema>;
