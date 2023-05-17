import * as path from 'path';
import { readIniFileSync } from 'read-ini-file';
import { AppConfig } from './interfaces/config.interface';

let config: AppConfig = {
    api: {
        server: 'http://localhost:3000',
    },
    stanowisko: {
        numer: 0,
    },
    rfid: {
        port: 'COM5',
    },
};

loadConfig(undefined);

export function loadConfig(filename: string): void {
    const buf = readIniFileSync(
        filename || path.join(__dirname, 'app.config.ini')
    );
    const lower = JSON.stringify(buf).toLowerCase();

    config = { ...config, ...JSON.parse(lower) };
}

export function getConfig(): AppConfig {
    return config;
}
