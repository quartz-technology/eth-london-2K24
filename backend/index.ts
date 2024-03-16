import config from "@config";

import { createApp } from "./server";

const app = createApp()

/**
 * Start server
 */
app.listen(config.port, () => {
  console.log(`Listening on port http://0.0.0.0.:${config.port}...`);
});
