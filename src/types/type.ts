export interface SnowflakeConfig {
    /** Unique ID for this machine/worker (0-1023). */
    machineId: number;
    /** Custom epoch (milliseconds). Defaults to Jan 1, 2024. */
    epoch?: number;
    /** Behavior when system clock drifts backwards. */
    clockMoveBackAction?: 'throw' | 'wait';
}

export interface SnowflakeParts {
    id: bigint;
    timestamp: Date;
    timestampMs: number;
    machineId: number;
    sequence: number;
}

export interface SnowflakePartsJSON {
    id: string;
    timestamp: string;
    timestampMs: number;
    machineId: number;
    sequence: number;
}