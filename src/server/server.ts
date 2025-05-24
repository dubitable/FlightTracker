import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/get-token", async (req, res) => {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.OPEN_SKY_CLIENT_ID!,
    client_secret: process.env.OPEN_SKY_CLIENT_SECRET!,
  });

  try {
    const response = await fetch(
      "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error("Token fetch error:", err);
    res.status(500).json({ error: "Token fetch failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
