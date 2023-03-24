import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { SerialPort } from 'serialport';
import { getConfig, loadConfig } from './config';
import { handleGetConfig } from './event-handlers';
import * as args_parser from 'args-parser';

let win: BrowserWindow = null;

// get all optional args
const args = args_parser(process.argv);
const serve = args.serve ? true : false;
const configFile = args.config;

console.log('Command line arguments: ', args, process.argv);

// load config file
loadConfig(configFile);

const loadUrl = () => {
    if (serve) {
        const debug = require('electron-debug');
        debug();

        require('electron-reloader')(module);
        win.loadURL('http://localhost:4200');
    } else {
        // Path when running electron executable
        let pathIndex = './index.html';

        if (fs.existsSync(path.join(__dirname, '../../dist/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../../dist/index.html';
        }
        if (fs.existsSync(path.join(__dirname, '../index.html'))) {
            // Path when running electron on deployed app
            pathIndex = '../index.html';
        }

        const url = new URL(path.join('file:', __dirname, pathIndex));
        win.loadURL(url.href);
    }
};
// uruchomienie portu COM
const port = new SerialPort({
    path: 'COM5',
    baudRate: 9600,
    autoOpen: false,
});

console.log(port.isOpen);
if (!port.isOpen) {
    port.open(function (err) {
        if (err) {
            return console.log('Error opening port: ', err.message);
        }

        // Because there's no callback to write, write errors will be emitted on the port:
    });
}

port.on('data', function (data) {
    console.log('Data:', data.toString());
    win.webContents.send('serialport', data.toString());
});

ipcMain.handle('get-config', handleGetConfig);

function createWindow(): BrowserWindow {
    const size = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    win = new BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: serve,
            contextIsolation: false, // false if you want to run e2e test with Spectron
        },
    });
    console.log('__dirname', __dirname);

    loadUrl();
    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    const contents = win.webContents.on('did-finish-load', () => {
        loadConfig(configFile);
        console.log('did-finish-load', getConfig);

        // contents.send('new-config', config);
    });

    win.webContents.on('did-fail-load', () => {
        console.log('did-fail-load');
        loadUrl();
    });

    return win;
}

try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    app.on('ready', () => {
        setTimeout(createWindow, 400);
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
} catch (e) {
    // Catch Error
    // throw e;
}
