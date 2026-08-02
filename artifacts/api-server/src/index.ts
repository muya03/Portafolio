import app from "./app";
import { logger } from "./lib/logger";

// PORT is injected by Replit. Outside Replit (macOS, Windows, a plain Linux
// checkout) it is not set, so we fall back to a default and only validate the
// value when one is actually provided. On macOS port 5000 is taken by the
// AirPlay Receiver, so it must not be used as the fallback here.
const DEFAULT_PORT = 3001;

const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : DEFAULT_PORT;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
