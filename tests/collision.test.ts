import { describe, it, expect, vi, beforeAll } from 'vitest';
import { SnowflakeGenerator } from '../src/core/generator';

describe('SnowflakeGenerator Collision Stress Test', () => {
    const TIMEOUT = 60000;

    beforeAll(() => {
        vi.useRealTimers();
    });

    it('should generate 1,000,000 unique IDs in a single instance', { timeout: TIMEOUT }, () => {
        const generator = new SnowflakeGenerator({ machineId: 1 });
        const ids = new Set<string>();
        const COUNT = 1_000_000;

        console.log(`\nGenerating ${COUNT} IDs (Single Instance)...`);

        for (let i = 0; i < COUNT; i++) {
            const id = generator.nextIdString();
            if (ids.has(id)) {
                throw new Error(`Collision detected at index ${i}: ${id}`);
            }
            ids.add(id);
        }

        expect(ids.size).toBe(COUNT);
        console.log('Single Instance Test Passed: No collisions.');
    });

    it('should generate unique IDs across simulated multiple machines', { timeout: TIMEOUT }, () => {
        const machines = 10;
        const generators: SnowflakeGenerator[] = [];
        for (let i = 0; i < machines; i++) {
            generators.push(new SnowflakeGenerator({ machineId: i }));
        }

        const ids = new Set<string>();
        const IDS_PER_MACHINE = 100_000;
        const TOTAL = machines * IDS_PER_MACHINE;

        console.log(`\nGenerating ${TOTAL} IDs (Multi-Machine: ${machines} instances)...`);

        for (let i = 0; i < IDS_PER_MACHINE; i++) {
            for (let m = 0; m < machines; m++) {
                const id = generators[m].nextIdString();
                if (ids.has(id)) {
                    throw new Error(`Collision detected involving machine ${m}: ${id}`);
                }
                ids.add(id);
            }
        }

        expect(ids.size).toBe(TOTAL);
        console.log('Multi-Machine Test Passed: No collisions.');
    });

    it('should maintain monotonicity (always increasing) under load', { timeout: TIMEOUT }, () => {
        const generator = new SnowflakeGenerator({ machineId: 1 });
        const COUNT = 100_000;
        let lastId = -1n;

        for (let i = 0; i < COUNT; i++) {
            const id = generator.nextId();
            if (id <= lastId) {
                throw new Error(`Monotonicity broken at index ${i}. Prev: ${lastId}, Curr: ${id}`);
            }
            lastId = id;
        }
        expect(true).toBe(true);
    });
});