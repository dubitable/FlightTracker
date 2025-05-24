export class FlightClient {
  client: string;
  secret: string;

  ACCESS_URL =
    "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

  access: string | undefined;

  constructor(client: string, secret: string) {
    this.client = client;
    this.secret = secret;
  }

  public hasAccess() {
    return this.access !== undefined;
  }

  public async getAccess() {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.client,
      client_secret: this.secret,
    });

    const response = await fetch(this.ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body,
    });

    console.log(await response.json());
  }
}
