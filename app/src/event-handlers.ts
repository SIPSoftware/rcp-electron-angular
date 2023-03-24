import { IpcMainEvent } from 'electron';
import { AppConfig } from './interfaces/config.interface';
import { getConfig } from './config';

export const handleGetConfig = (event: IpcMainEvent): AppConfig => {
    const config = getConfig();
    console.log('handleGetConfig', config);
    return config;
};
