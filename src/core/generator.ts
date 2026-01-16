import type { SnowflakeConfig } from '../types/type';

const MAX_MACHINE_ID = 1023;
const MAX_SEQUENCE = 4095n;
const MACHINE_ID_SHIFT = 12n;
const TIMESTAMP_SHIFT = 22n;
const DEFAULT_EPOCH = 1704067200000;
const MAX_CLOCK_WAIT_MS = 50;

/**
 * Generates 64-bit, time-sortable unique IDs.
 */
export class SnowflakeGenerator {
    private readonly machineIdShifted: bigint;
    private readonly epoch: number;
    private readonly clockMoveBackAction: 'throw' | 'wait';
    private sequence = 0n;
    private lastTimestamp = -1;

    constructor(config: SnowflakeConfig) {
        const { machineId, epoch = DEFAULT_EPOCH, clockMoveBackAction = 'throw' } = config;

        if (machineId < 0 || machineId > MAX_MACHINE_ID || !Number.isInteger(machineId)) {
            throw new Error(`machineId must be integer 0-1023, got ${machineId}`);
        }

        if (epoch < 0 || epoch > Date.now()) {
            throw new Error(`epoch cannot be in the future`);
        }

        this.machineIdShifted = BigInt(machineId) << MACHINE_ID_SHIFT;
        this.epoch = epoch;
        this.clockMoveBackAction = clockMoveBackAction;
    }

    /**
     * @throws Error if the system clock drifts backwards.
     */
    nextId(): bigint {
        let ts = Date.now();

        if (ts < this.lastTimestamp) {
            const drift = this.lastTimestamp - ts;

            if (this.clockMoveBackAction === 'wait' && drift <= MAX_CLOCK_WAIT_MS) {
                while (ts <= this.lastTimestamp) {
                    ts = Date.now();
                }
            } else {
                throw new Error(`Clock moved backwards by ${drift}ms`);
            }
        }

        if (ts === this.lastTimestamp) {
            this.sequence = (this.sequence + 1n) & MAX_SEQUENCE;
            if (this.sequence === 0n) {
                while (ts <= this.lastTimestamp) {
                    ts = Date.now();
                }
            }
        } else {
            this.sequence = 0n;
        }

        this.lastTimestamp = ts;
        return (BigInt(ts - this.epoch) << TIMESTAMP_SHIFT) | this.machineIdShifted | this.sequence;
    }

    nextIdString(): string {
        return this.nextId().toString();
    }

    getMachineId(): number {
        return Number(this.machineIdShifted >> MACHINE_ID_SHIFT);
    }

    getEpoch(): number {
        return this.epoch;
    }

    getSequence(): number {
        return Number(this.sequence);
    }

    getLastTimestamp(): number {
        return this.lastTimestamp;
    }
}

export function createGenerator(config: SnowflakeConfig): SnowflakeGenerator {
    return new SnowflakeGenerator(config);
}

export {
    MAX_SEQUENCE,
    MACHINE_ID_SHIFT,
    TIMESTAMP_SHIFT,
    DEFAULT_EPOCH,
    MAX_MACHINE_ID,
};