import { buildContainer } from "./di/container";
import { buildApp } from "./app";

const container = buildContainer();
const config = container.resolve<{ port: number }>("config");
const app = buildApp(container);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`scorm-player listening on port ${config.port}`);
});
