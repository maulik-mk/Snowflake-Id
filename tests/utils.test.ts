import { describe, it, expect } from 'vitest';
import {
    parseSnowflake,
    stringifySnowflakeParts,
    getTimestamp,
    getMachineId,
    getSequence,
    isValidSnowflake,
    snowflakeToString,
    stringToSnowflake,
    compareSnowflakes,
    snowflakeFromTimestamp
} from '../src/utils/index';
import { DEFAULT_EPOCH, TIMESTAMP_SHIFT, MACHINE_ID_SHIFT } from '../src/core/generator';

describe('Snowflake Utils', () => {
    const knownTimestamp = 1704067201000;
    const knownMachineId = 512;
    const knownSequence = 123;
    const knownId = (BigInt(knownTimestamp - DEFAULT_EPOCH) << TIMESTAMP_SHIFT) | (BigInt(knownMachineId) << MACHINE_ID_SHIFT) | BigInt(knownSequence);

    describe('parseSnowflake', () => {
        it('should correctly parse a valid bigint ID', () => {
            const parts = parseSnowflake(knownId);
            expect(parts.id).toBe(knownId);
            expect(parts.timestampMs).toBe(knownTimestamp);
            expect(parts.timestamp).toEqual(new Date(knownTimestamp));
            expect(parts.machineId).toBe(knownMachineId);
            expect(parts.sequence).toBe(knownSequence);
        });

        it('should correctly parse a valid string ID', () => {
            const parts = parseSnowflake(knownId.toString());
            expect(parts.id).toBe(knownId);
            expect(parts.timestampMs).toBe(knownTimestamp);
            expect(parts.machineId).toBe(knownMachineId);
        });

        it('should throw error for invalid string format', () => {
            expect(() => parseSnowflake('abc')).toThrow(/Invalid Snowflake ID/);
        });
    });

    describe('stringifySnowflakeParts', () => {
        it('should convert parts back to JSON structure', () => {
            const parts = parseSnowflake(knownId);
            const json = stringifySnowflakeParts(parts);

            expect(json.id).toBe(knownId.toString());
            expect(json.timestampMs).toBe(knownTimestamp);
            expect(json.machineId).toBe(knownMachineId);
            expect(json.sequence).toBe(knownSequence);
        });
    });

    describe('Getters', () => {
        it('getTimestamp should return correct date', () => {
            const date = getTimestamp(knownId);
            expect(date.getTime()).toBe(knownTimestamp);
        });

        it('getMachineId should return correct machine ID', () => {
            expect(getMachineId(knownId)).toBe(knownMachineId);
        });

        it('getSequence should return correct sequence', () => {
            expect(getSequence(knownId)).toBe(knownSequence);
        });

        it('getters should handle string input', () => {
            expect(getMachineId(knownId.toString())).toBe(knownMachineId);
        });
    });

    describe('isValidSnowflake', () => {
        it('should return true for valid bigint', () => {
            expect(isValidSnowflake(knownId)).toBe(true);
        });

        it('should return true for valid string number', () => {
            expect(isValidSnowflake(knownId.toString())).toBe(true);
        });

        it('should return false for non-numeric string', () => {
            expect(isValidSnowflake('abc')).toBe(false);
        });

        it('should return false for negative bigint', () => {
            expect(isValidSnowflake(-1n)).toBe(false);
        });

        it('should validate timestamp range (future check)', () => {
            const futureId = (BigInt(Date.now() + 1000000 - DEFAULT_EPOCH) << TIMESTAMP_SHIFT);
            expect(isValidSnowflake(futureId)).toBe(false);
        });

        it('should return true if relaxed is true regardless of timestamp', () => {
            const futureId = (BigInt(Date.now() + 1000000 - DEFAULT_EPOCH) << TIMESTAMP_SHIFT);
            expect(isValidSnowflake(futureId, DEFAULT_EPOCH, true)).toBe(true);
        });
    });

    describe('Helpers', () => {
        it('snowflakeToString should convert bigint to string', () => {
            expect(snowflakeToString(123n)).toBe('123');
        });

        it('stringToSnowflake should convert string to bigint', () => {
            expect(stringToSnowflake('123')).toBe(123n);
        });

        it('stringToSnowflake should throw on invalid string', () => {
            expect(() => stringToSnowflake('abc')).toThrow(/Invalid Snowflake ID/);
        });

        it('compareSnowflakes should compare correctly', () => {
            expect(compareSnowflakes(10n, 20n)).toBe(-1);
            expect(compareSnowflakes(20n, 10n)).toBe(1);
            expect(compareSnowflakes(10n, 10n)).toBe(0);
            expect(compareSnowflakes('10', '20')).toBe(-1);
        });

        it('snowflakeFromTimestamp should create correct ID from timestamp', () => {
            const id = snowflakeFromTimestamp(knownTimestamp, knownMachineId, knownSequence);
            expect(id).toBe(knownId);
        });

        it('snowflakeFromTimestamp should handle Date object', () => {
            const id = snowflakeFromTimestamp(new Date(knownTimestamp), knownMachineId, knownSequence);
            expect(id).toBe(knownId);
        });
    });
});
