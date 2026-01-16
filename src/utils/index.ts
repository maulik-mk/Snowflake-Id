import type { SnowflakeParts, SnowflakePartsJSON } from '../types/type';
import {
    MACHINE_ID_SHIFT,
    TIMESTAMP_SHIFT,
    DEFAULT_EPOCH,
    MAX_SEQUENCE,
    MAX_MACHINE_ID
} from '../core/generator';

const SEQUENCE_MASK = MAX_SEQUENCE;
const MACHINE_ID_MASK = BigInt(MAX_MACHINE_ID);

export function parseSnowflake(id: bigint | string, epoch = DEFAULT_EPOCH): SnowflakeParts {
    if (typeof id === 'string' && !/^\d+$/.test(id)) {
        throw new Error(`Invalid Snowflake ID: "${id}"`);
    }

    const sfId = typeof id === 'string' ? BigInt(id) : id;
    const timestampMs = Number(sfId >> TIMESTAMP_SHIFT) + epoch;

    return {
        id: sfId,
        timestamp: new Date(timestampMs),
        timestampMs,
        machineId: Number((sfId >> MACHINE_ID_SHIFT) & MACHINE_ID_MASK),
        sequence: Number(sfId & SEQUENCE_MASK),
    };
}

export function stringifySnowflakeParts(parts: SnowflakeParts): SnowflakePartsJSON {
    return {
        id: parts.id.toString(),
        timestamp: parts.timestamp.toISOString(),
        timestampMs: parts.timestampMs,
        machineId: parts.machineId,
        sequence: parts.sequence,
    };
}

export function getTimestamp(id: bigint | string, epoch = DEFAULT_EPOCH): Date {
    const sfId = typeof id === 'string' ? BigInt(id) : id;
    return new Date(Number(sfId >> TIMESTAMP_SHIFT) + epoch);
}

export function getMachineId(id: bigint | string): number {
    const sfId = typeof id === 'string' ? BigInt(id) : id;
    return Number((sfId >> MACHINE_ID_SHIFT) & MACHINE_ID_MASK);
}

export function getSequence(id: bigint | string): number {
    const sfId = typeof id === 'string' ? BigInt(id) : id;
    return Number(sfId & SEQUENCE_MASK);
}

/**
 * @param relaxed - Skip timestamp range check.
 */
export function isValidSnowflake(id: unknown, epoch = DEFAULT_EPOCH, relaxed = false): boolean {
    if (typeof id === 'string') {
        if (!/^\d+$/.test(id)) return false;
        try {
            id = BigInt(id);
        } catch {
            return false;
        }
    }

    if (typeof id !== 'bigint' || id < 0n) return false;
    if (relaxed) return true;

    const ts = Number(id >> TIMESTAMP_SHIFT) + epoch;
    return ts >= epoch && ts <= Date.now() + 1000;
}

export function snowflakeToString(id: bigint): string {
    return id.toString();
}

export function stringToSnowflake(str: string): bigint {
    if (!/^\d+$/.test(str)) {
        throw new Error(`Invalid Snowflake ID string: "${str}"`);
    }
    return BigInt(str);
}

export function compareSnowflakes(a: bigint | string, b: bigint | string): -1 | 0 | 1 {
    const idA = typeof a === 'string' ? BigInt(a) : a;
    const idB = typeof b === 'string' ? BigInt(b) : b;
    return idA < idB ? -1 : idA > idB ? 1 : 0;
}

export function snowflakeFromTimestamp(
    date: Date | number,
    machineId = 0,
    sequence = 0,
    epoch = DEFAULT_EPOCH
): bigint {
    const ts = typeof date === 'number' ? date : date.getTime();
    return (BigInt(ts - epoch) << TIMESTAMP_SHIFT) | (BigInt(machineId) << MACHINE_ID_SHIFT) | BigInt(sequence);
}