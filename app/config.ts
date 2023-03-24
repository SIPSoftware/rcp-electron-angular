import * as path from 'path';
import { readIniFileSync } from 'read-ini-file';
import { AppConfig } from './interfaces/config.interface';

let config: AppConfig;
loadConfig(undefined);

export function loadConfig(filename: string): void {
    const buf = readIniFileSync(
        filename || path.join(__dirname, 'app.config.ini')
    );
    const lower = JSON.stringify(buf).toLowerCase();
    config = JSON.parse(lower);
}

export function getConfig(): AppConfig {
    return config;
}
