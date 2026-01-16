import { performance } from "node:perf_hooks";
// Need dist folder for this test
import { SnowflakeGenerator } from "../dist/index.cjs";

const generator = new SnowflakeGenerator({ machineId: 1 });

const DURATION_MS = 1000.00000;

let count = 0;
const start = performance.now();
let now = start;

while ((now = performance.now()) - start < DURATION_MS) {
  generator.nextIdString();
  count++;
}

const elapsed = now - start;

process.stdout.write(
  `Elapsed: ${elapsed.toFixed(3)} ms\n` +
  `IDs: ${count}\n` +
  `IDs/sec: ${Math.floor(count * (1000 / elapsed))}\n`
);

process.exit(0);
