/* eslint-disable no-console */
import app from "./app";
import { env } from "./app/config/env";

const bootstrap = async () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

bootstrap();