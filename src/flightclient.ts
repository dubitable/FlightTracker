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

export class FlightClient {
  client: string;
  secret: string;

  BASE_URL = "http://localhost:3001";

  access: string | undefined;

  constructor(client: string, secret: string) {
    this.client = client;
    this.secret = secret;
  }

  public hasAccess() {
    return this.access !== undefined;
  }

  public async getStates() {
    if (!this.hasAccess()) await this.getAccess();
    const coords = "lamin=-90.0&lamax=90.0&lomin=-180.0&lomax=180.0";

    const response = await fetch(
      `${this.BASE_URL}/api/get-states/?token=${this.access}&${coords}`
    );

    if (!response.ok) return [];
    const parsed = FlightsSchema.safeParse(await response.json());
    if (!parsed.success) return [];

    return parsed.data.states;
  }

  public async getAccess() {
    const response = await fetch(`${this.BASE_URL}/api/get-token`);

    if (!response.ok) return;
    const parsed = AccessSchema.safeParse(await response.json());
    if (!parsed.success) return;

    this.access = parsed.data.access_token;
  }
}
