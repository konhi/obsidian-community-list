import { runGeneration } from "./generator";

runGeneration().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
