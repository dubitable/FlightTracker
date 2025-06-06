import {
  AccessSchema,
  FlightsSchema,
  RouteSchema,
  type Route,
} from "./schemas";
export class FlightClient {
  BASE_URL = "http://localhost:3001";

  access: string | undefined;

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

  private parseRoute(route: any): Route | undefined {
    const parsed = RouteSchema.safeParse(route);
    if (!parsed.success) return undefined;
    return parsed.data;
  }

  public async getRoute(time: number, callsign: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/api/get-route/?time=${time}&callsign=${callsign}`
      );

      if (response.status != 200) {
        console.log(await response.text());
        return;
      }

      const data = await response.json();

      const departure = this.parseRoute(data?.departure);
      const arrival = this.parseRoute(data?.arrival);

      if (!departure || !arrival) return;

      return { departure, arrival };
    } catch (error: any) {
      console.log(error);
    }
  }
}
