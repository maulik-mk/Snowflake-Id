import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SnowflakeGenerator, MAX_MACHINE_ID, createGenerator, DEFAULT_EPOCH, TIMESTAMP_SHIFT, MACHINE_ID_SHIFT } from '../src/core/generator';

describe('SnowflakeGenerator', () => {
    describe('Initialization', () => {
        it('should create an instance with valid configuration', () => {
            const generator = new SnowflakeGenerator({ machineId: 1 });
            expect(generator).toBeInstanceOf(SnowflakeGenerator);
            expect(generator.getMachineId()).toBe(1);
        });

        it('should throw error for invalid machineId (< 0)', () => {
            expect(() => new SnowflakeGenerator({ machineId: -1 })).toThrow(/machineId must be integer/);
        });

        it('should throw error for invalid machineId (> MAX_MACHINE_ID)', () => {
            expect(() => new SnowflakeGenerator({ machineId: MAX_MACHINE_ID + 1 })).toThrow(/machineId must be integer/);
        });

        it('should throw error for non-integer machineId', () => {
            expect(() => new SnowflakeGenerator({ machineId: 1.5 })).toThrow(/machineId must be integer/);
        });

        it('should throw error if epoch is in the future', () => {
            const futureEpoch = Date.now() + 10000;
            expect(() => new SnowflakeGenerator({ machineId: 1, epoch: futureEpoch })).toThrow(/epoch cannot be in the future/);
        });

        it('should use default epoch if not provided', () => {
            const generator = new SnowflakeGenerator({ machineId: 1 });
            expect(generator.getEpoch()).toBe(DEFAULT_EPOCH);
        });
    });

    describe('ID Generation', () => {
        let generator: SnowflakeGenerator;

        beforeEach(() => {
            generator = new SnowflakeGenerator({ machineId: 1 });
        });

        it('should generate a valid bigint ID', () => {
            const id = generator.nextId();
            expect(typeof id).toBe('bigint');
        });

        it('should generate a valid string ID', () => {
            const idStr = generator.nextIdString();
            expect(typeof idStr).toBe('string');
            expect(idStr).toMatch(/^\d+$/);
        });

        it('should generate unique IDs', () => {
            const id1 = generator.nextId();
            const id2 = generator.nextId();
            expect(id1).not.toBe(id2);
        });

        it('should generate time-sortable IDs', () => {
            const id1 = generator.nextId();
            const id2 = generator.nextId();
            expect(id2 > id1).toBe(true);
        });

        it('should verify ID structure correctness', () => {
            vi.useFakeTimers();
            const machineId = 10;
            const customEpoch = Date.now() - 100000;
            const gen = new SnowflakeGenerator({ machineId, epoch: customEpoch });

            const now = Date.now();
            vi.setSystemTime(now);

            const id = gen.nextId();

            const expectedTimestamp = BigInt(now - customEpoch);
            const extractedTimestamp = id >> TIMESTAMP_SHIFT;
            const extractedMachineId = (id >> MACHINE_ID_SHIFT) & BigInt(MAX_MACHINE_ID);
            const sequence = id & 4095n;

            expect(extractedTimestamp).toBe(expectedTimestamp);
            expect(extractedMachineId).toBe(BigInt(machineId));
            expect(sequence).toBe(0n);

            vi.useRealTimers();
        });
    });

    describe('Sequence Handling', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should increment sequence for same millisecond', () => {
            const generator = new SnowflakeGenerator({ machineId: 1 });
            const now = Date.now();
            vi.setSystemTime(now);

            const id1 = generator.nextId();
            const id2 = generator.nextId();

            const seq1 = id1 & 4095n;
            const seq2 = id2 & 4095n;

            expect(seq1).toBe(0n);
            expect(seq2).toBe(1n);
        });

        it('should reset sequence when time moves forward', () => {
            const generator = new SnowflakeGenerator({ machineId: 1 });
            const now = Date.now();
            vi.setSystemTime(now);

            generator.nextId();

            vi.setSystemTime(now + 1);
            const id = generator.nextId();
            const seq = id & 4095n;

            expect(seq).toBe(0n);
        });

        it('should wait for next millisecond if sequence overflows', () => {
            vi.useRealTimers();
            const now = 1000000;
            let currentTime = now;

            const dateSpy = vi.spyOn(Date, 'now').mockImplementation(() => currentTime);
            const gen = new SnowflakeGenerator({ machineId: 1, epoch: 0 });

            gen.nextId();

            for (let i = 0; i < 4095; i++) {
                gen.nextId();
            }

            let callCountInWait = 0;
            dateSpy.mockImplementation(() => {
                callCountInWait++;
                if (callCountInWait > 5) {
                    return now + 1;
                }
                return now;
            });

            const idAfterOverflow = gen.nextId();
            const seq = idAfterOverflow & 4095n;
            const ts = Number(idAfterOverflow >> TIMESTAMP_SHIFT);

            expect(seq).toBe(0n);
            expect(ts).toBe(now + 1);

            dateSpy.mockRestore();
        });
    });

    describe('Clock Regression Handling', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should throw error by default when clock moves backwards', () => {
            const generator = new SnowflakeGenerator({ machineId: 1, clockMoveBackAction: 'throw' });
            const now = Date.now();
            vi.setSystemTime(now);

            generator.nextId();
            vi.setSystemTime(now - 100);

            expect(() => generator.nextId()).toThrow(/Clock moved backwards/);
        });

        it('should wait when clockMoveBackAction is "wait" and drift is small', () => {
            vi.useRealTimers();
            const generator = new SnowflakeGenerator({ machineId: 1, clockMoveBackAction: 'wait' });
            const now = 2000000;

            let callCount = 0;
            const dateSpy = vi.spyOn(Date, 'now').mockImplementation(() => {
                callCount++;
                if (callCount === 1) return now;
                if (callCount === 2) return now - 10;

                if (callCount === 3) return now;
                return now + 1;
            });

            generator.nextId();
            const id = generator.nextId();

            const ts = Number(id >> TIMESTAMP_SHIFT) + DEFAULT_EPOCH;
            expect(ts).toBe(now + 1);

            dateSpy.mockRestore();
        });

        it('should throw even if "wait" is set but drift is too large', () => {
            const generator = new SnowflakeGenerator({ machineId: 1, clockMoveBackAction: 'wait' });
            const now = Date.now();
            vi.setSystemTime(now);
            generator.nextId();

            vi.setSystemTime(now - 1000);

            expect(() => generator.nextId()).toThrow(/Clock moved backwards/);
        });
    });

    describe('Factory Function', () => {
        it('should create generator via createGenerator', () => {
            const gen = createGenerator({ machineId: 5 });
            expect(gen).toBeInstanceOf(SnowflakeGenerator);
            expect(gen.getMachineId()).toBe(5);
        });
    });
});
