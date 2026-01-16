import { describe, it, expect, vi, beforeAll } from 'vitest';
import { SnowflakeGenerator } from '../src/core/generator';
import { performance } from 'node:perf_hooks';

describe('SnowflakeGenerator Benchmark', () => {
    const ROUNDS = 10;
    const DURATION_MS = 1000;

    beforeAll(() => {
        vi.useRealTimers();
    });

    it('should calculate ID generation throughput', { timeout: 30000 }, async () => {
        const generator = new SnowflakeGenerator({ machineId: 1 });
        const results: number[] = [];

        console.log(`\nStarting Benchmark: ${ROUNDS} rounds of ${DURATION_MS}ms each...`);

        for (let i = 1; i <= ROUNDS; i++) {
            const start = performance.now();
            let count = 0;
            const end = start + DURATION_MS;

            while (performance.now() < end) {
                generator.nextId();
                count++;
            }

            const actualDuration = performance.now() - start;
            const safeDuration = actualDuration > 0 ? actualDuration : 1; 
            const idsPerSec = Math.floor((count / safeDuration) * 1000);
            
            results.push(idsPerSec);
            console.log(`Round ${i}: ${count} IDs in ${actualDuration.toFixed(2)}ms (~${idsPerSec} IDs/sec)`);

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const avg = Math.floor(results.reduce((a, b) => a + b, 0) / results.length);
        console.log(`\nAverage Throughput: ${avg} IDs/sec`);
        console.log(`Max Throughput: ${Math.max(...results)} IDs/sec`);
        console.log(`Min Throughput: ${Math.min(...results)} IDs/sec\n`);

        expect(avg).toBeGreaterThan(0);
    });
});